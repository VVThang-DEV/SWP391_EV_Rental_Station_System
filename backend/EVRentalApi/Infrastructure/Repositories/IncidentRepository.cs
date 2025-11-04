using Microsoft.Data.SqlClient;
using System.Data;
using EVRentalApi.Models;
using Microsoft.Extensions.Configuration;

namespace EVRentalApi.Infrastructure.Repositories;

public class IncidentRepository : IIncidentRepository
{
    private readonly string _connectionString;

    public IncidentRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("EVRentalDB") 
            ?? throw new InvalidOperationException("EVRentalDB connection string not found");
    }

    private static async Task<List<string>> GetAllowedSeverityValuesAsync(SqlConnection connection)
    {
        try
        {
            using var cmd = new SqlCommand(@"SELECT definition 
                                             FROM sys.check_constraints 
                                             WHERE name = 'CK_incidents_severity' 
                                               AND parent_object_id = OBJECT_ID('dbo.incidents')", connection);
            var defObj = await cmd.ExecuteScalarAsync();
            var definition = defObj?.ToString() ?? string.Empty;
            if (string.IsNullOrWhiteSpace(definition)) return new List<string>();

            // Extract quoted strings in the constraint (e.g., ('low','medium','high'))
            var values = new List<string>();
            int i = 0;
            while (i < definition.Length)
            {
                var start = definition.IndexOf('\'', i);
                if (start < 0) break;
                var end = definition.IndexOf('\'', start + 1);
                if (end < 0) break;
                var val = definition.Substring(start + 1, end - start - 1);
                if (!string.IsNullOrWhiteSpace(val)) values.Add(val.Trim());
                i = end + 1;
            }
            // Normalize to lower-case for comparisons
            return values.Select(v => v.ToLowerInvariant()).Distinct().ToList();
        }
        catch
        {
            return new List<string>();
        }
    }

    public async Task<IncidentDto?> CreateIncidentAsync(CreateIncidentRequest request, int userId)
    {
        try
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            // Ensure table and required columns exist (self-healing for dev/test)
            await EnsureIncidentTableAsync(connection);

            // Validate provided reservation id (frontend may send mock/non-existing id)
            if (request.ReservationId.HasValue)
            {
                try
                {
                    using var chkCmd = new SqlCommand("SELECT COUNT(1) FROM reservations WHERE reservation_id = @ReservationId", connection);
                    chkCmd.Parameters.AddWithValue("@ReservationId", request.ReservationId.Value);
                    var exists = Convert.ToInt32(await chkCmd.ExecuteScalarAsync()) > 0;
                    if (!exists)
                    {
                        // Reset to null so we don't violate FK
                        request.ReservationId = null;
                    }
                }
                catch
                {
                    // If check fails for any reason, avoid FK by nulling
                    request.ReservationId = null;
                }
            }

            // Resolve vehicle_id and station_id if missing (from reservation)
            int? vehicleId = request.VehicleId;
            int? stationId = request.StationId;

            if ((!vehicleId.HasValue || vehicleId.Value <= 0 || !stationId.HasValue || stationId.Value <= 0)
                && request.ReservationId.HasValue)
            {
                var resolveSql = @"SELECT vehicle_id, station_id FROM reservations WHERE reservation_id = @ReservationId";
                using var resolveCmd = new SqlCommand(resolveSql, connection);
                resolveCmd.Parameters.AddWithValue("@ReservationId", request.ReservationId.Value);
                using var resolveReader = await resolveCmd.ExecuteReaderAsync();
                if (await resolveReader.ReadAsync())
                {
                    vehicleId ??= resolveReader.GetInt32(resolveReader.GetOrdinal("vehicle_id"));
                    stationId ??= resolveReader.GetInt32(resolveReader.GetOrdinal("station_id"));
                }
            }

            if (!vehicleId.HasValue || !stationId.HasValue)
            {
                // Fallback: find user's latest active/pending reservation
                var latestSql = @"
                    SELECT TOP 1 reservation_id, vehicle_id, station_id
                    FROM reservations
                    WHERE user_id = @UserId AND LOWER(ISNULL(status,'')) NOT IN ('completed','cancelled','finished')
                    ORDER BY created_at DESC";
                using var latestCmd = new SqlCommand(latestSql, connection);
                latestCmd.Parameters.AddWithValue("@UserId", userId);
                using var latestReader = await latestCmd.ExecuteReaderAsync();
                if (await latestReader.ReadAsync())
                {
                    vehicleId ??= latestReader.GetInt32(latestReader.GetOrdinal("vehicle_id"));
                    stationId ??= latestReader.GetInt32(latestReader.GetOrdinal("station_id"));
                    if (!request.ReservationId.HasValue)
                    {
                        // Populate reservation id for record linkage
                        request.ReservationId = latestReader.GetInt32(latestReader.GetOrdinal("reservation_id"));
                    }
                }
            }

            if (!vehicleId.HasValue || !stationId.HasValue)
            {
                // Fallback 2: use user's assigned station and pick first vehicle there
                int? userStationId = null;
                var userStationSql = "SELECT station_id FROM users WHERE user_id = @UserId";
                using (var userStationCmd = new SqlCommand(userStationSql, connection))
                {
                    userStationCmd.Parameters.AddWithValue("@UserId", userId);
                    var obj = await userStationCmd.ExecuteScalarAsync();
                    if (obj != null && obj != DBNull.Value)
                    {
                        userStationId = Convert.ToInt32(obj);
                    }
                }

                if (userStationId.HasValue)
                {
                    var anyVehicleAtStationSql = @"SELECT TOP 1 vehicle_id FROM vehicles WHERE station_id = @StationId ORDER BY vehicle_id ASC";
                    using var anyVehCmd = new SqlCommand(anyVehicleAtStationSql, connection);
                    anyVehCmd.Parameters.AddWithValue("@StationId", userStationId.Value);
                    var vehObj = await anyVehCmd.ExecuteScalarAsync();
                    if (vehObj != null && vehObj != DBNull.Value)
                    {
                        stationId ??= userStationId.Value;
                        vehicleId ??= Convert.ToInt32(vehObj);
                    }
                }

                // Fallback 3: pick any vehicle and derive its station
                if (!vehicleId.HasValue || !stationId.HasValue)
                {
                    var anyVehicleSql = @"SELECT TOP 1 vehicle_id, ISNULL(station_id, 0) AS station_id FROM vehicles ORDER BY vehicle_id ASC";
                    using var anyCmd = new SqlCommand(anyVehicleSql, connection);
                    using var anyReader = await anyCmd.ExecuteReaderAsync();
                    if (await anyReader.ReadAsync())
                    {
                        vehicleId ??= anyReader.GetInt32(anyReader.GetOrdinal("vehicle_id"));
                        var stId = anyReader.GetInt32(anyReader.GetOrdinal("station_id"));
                        if (stId > 0)
                        {
                            stationId ??= stId;
                        }
                    }
                }

                if (!vehicleId.HasValue || !stationId.HasValue)
                {
                    throw new InvalidOperationException("Could not determine vehicle/station. Please ensure you have an active booking.");
                }
            }

            // Detect actual column names to be compatible with older schemas
            var colMap = await GetIncidentColumnSetsAsync(connection);

            var columns = new List<string> { "reservation_id", "vehicle_id", "station_id", "description", "reported_at", "created_at", "updated_at" };
            var values = new List<string> { "@ReservationId", "@VehicleId", "@StationId", "@Description", "GETDATE()", "GETDATE()", "GETDATE()" };

            // Include ALL synonyms present; this prevents NOT NULL columns from being omitted
            foreach (var c in colMap.UserIdCols) { columns.Insert(3, c); values.Insert(3, "@UserId"); }
            foreach (var c in colMap.TypeCols) { columns.Insert(3, c); values.Insert(3, "@Type"); }
            foreach (var c in colMap.TitleCols) { columns.Insert(3, c); values.Insert(3, "@Title"); }
            foreach (var c in colMap.StatusCols) { columns.Add(c); values.Add("@Status"); }
            foreach (var c in colMap.PriorityCols) { columns.Add(c); values.Add("@Priority"); }
            foreach (var c in colMap.SeverityCols) { columns.Add(c); values.Add("@Severity"); }
            // Some schemas require non-null incident_date
            foreach (var c in colMap.IncidentDateCols) { columns.Add(c); values.Add("GETDATE()" ); }

            var insertSql = $@"
                INSERT INTO incidents ({string.Join(", ", columns)})
                OUTPUT INSERTED.incident_id, INSERTED.reservation_id, INSERTED.vehicle_id, INSERTED.station_id,
                       {(colMap.UserIdCols.Any() ? $"INSERTED.{colMap.UserIdCols[0]}" : "NULL")} AS user_id,
                       {(colMap.TypeCols.Any() ? $"INSERTED.{colMap.TypeCols[0]}" : "NULL")} AS type,
                       INSERTED.description,
                       {(colMap.StatusCols.Any() ? $"INSERTED.{colMap.StatusCols[0]}" : "NULL")} AS status,
                       {(colMap.PriorityCols.Any() ? $"INSERTED.{colMap.PriorityCols[0]}" : "NULL")} AS priority,
                       INSERTED.reported_at, INSERTED.resolved_at,
                       {(colMap.StaffNotesCols.Any() ? $"INSERTED.{colMap.StaffNotesCols[0]}" : "NULL")} AS staff_notes,
                       {(colMap.HandledByCols.Any() ? $"INSERTED.{colMap.HandledByCols[0]}" : "NULL")} AS handled_by,
                       INSERTED.created_at, INSERTED.updated_at
                VALUES ({string.Join(", ", values)})";

            using var command = new SqlCommand(insertSql, connection);
            command.Parameters.AddWithValue("@VehicleId", vehicleId!.Value);
            command.Parameters.AddWithValue("@StationId", stationId!.Value);
            command.Parameters.AddWithValue("@Description", request.Description);
            command.Parameters.AddWithValue("@Status", "reported");
            command.Parameters.AddWithValue("@Priority", request.Priority);
            // Choose a severity that satisfies DB CHECK constraint
            var allowedSeverities = await GetAllowedSeverityValuesAsync(connection);
            string PickSeverity()
            {
                var desired = (request.Priority ?? "").Trim().ToLowerInvariant();
                var candidates = new List<string>();
                if (!string.IsNullOrEmpty(desired)) candidates.Add(desired);
                // Map common synonyms from priority -> severity
                if (desired == "urgent") candidates.Add("critical");
                if (desired == "high") candidates.AddRange(new[]{"high","critical"});
                if (desired == "medium") candidates.Add("medium");
                if (desired == "low") candidates.Add("low");
                // Always include safe fallbacks
                candidates.AddRange(new[]{"medium","high","low","critical"});
                if (allowedSeverities.Count > 0)
                {
                    foreach (var c in candidates)
                    {
                        if (allowedSeverities.Contains(c, StringComparer.OrdinalIgnoreCase)) return c;
                    }
                    // if none of the usual values match, pick the first allowed
                    return allowedSeverities[0];
                }
                // If cannot detect constraint, use medium by default
                return "medium";
            }
            var severity = PickSeverity();
            command.Parameters.AddWithValue("@Severity", severity);
            // Title: use type or description fallback
            var title = string.IsNullOrWhiteSpace(request.Type) ? (string.IsNullOrWhiteSpace(request.Description) ? "Incident" : request.Description.Substring(0, Math.Min(60, request.Description.Length))) : request.Type;
            command.Parameters.AddWithValue("@Title", title);
            command.Parameters.AddWithValue("@Type", request.Type);
            command.Parameters.AddWithValue("@UserId", userId);

            if (request.ReservationId.HasValue)
                command.Parameters.AddWithValue("@ReservationId", request.ReservationId.Value);
            else
                command.Parameters.AddWithValue("@ReservationId", DBNull.Value);

            using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                var incident = MapToIncidentDto(reader);
                
                // Get additional information
                await reader.CloseAsync();
                return await GetIncidentWithDetailsAsync(incident.IncidentId);
            }

            return null;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[IncidentRepository] Error creating incident: {ex.Message}");
            throw;
        }
    }

    public async Task<IEnumerable<IncidentDto>> GetIncidentsByStationIdAsync(int stationId)
    {
        var incidents = new List<IncidentDto>();
        
        try
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            var sql = @"
                SELECT i.incident_id, i.reservation_id, i.vehicle_id, i.station_id, i.user_id, 
                       i.type, i.description, i.status, i.priority, i.reported_at, i.resolved_at, 
                       i.staff_notes, i.handled_by, i.created_at, i.updated_at
                FROM incidents i
                WHERE i.station_id = @StationId
                ORDER BY 
                    CASE i.priority 
                        WHEN 'urgent' THEN 1 
                        WHEN 'high' THEN 2 
                        WHEN 'medium' THEN 3 
                        WHEN 'low' THEN 4 
                    END,
                    i.reported_at DESC";

            using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@StationId", stationId);

            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var incident = MapToIncidentDto(reader);
                incidents.Add(incident);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[IncidentRepository] Error getting incidents by station: {ex.Message}");
            throw;
        }

        // Get details for each incident
        foreach (var incident in incidents)
        {
            await FillIncidentDetailsAsync(incident);
        }

        return incidents;
    }

    public async Task<IEnumerable<IncidentDto>> GetIncidentsByUserIdAsync(int userId)
    {
        var incidents = new List<IncidentDto>();
        
        try
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            var sql = @"
                SELECT i.incident_id, i.reservation_id, i.vehicle_id, i.station_id, i.user_id, 
                       i.type, i.description, i.status, i.priority, i.reported_at, i.resolved_at, 
                       i.staff_notes, i.handled_by, i.created_at, i.updated_at
                FROM incidents i
                WHERE i.user_id = @UserId
                ORDER BY i.reported_at DESC";

            using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@UserId", userId);

            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var incident = MapToIncidentDto(reader);
                incidents.Add(incident);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[IncidentRepository] Error getting incidents by user: {ex.Message}");
            throw;
        }

        // Get details for each incident
        foreach (var incident in incidents)
        {
            await FillIncidentDetailsAsync(incident);
        }

        return incidents;
    }

    public async Task<IncidentDto?> GetIncidentByIdAsync(int incidentId)
    {
        try
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            var sql = @"
                SELECT i.incident_id, i.reservation_id, i.vehicle_id, i.station_id, i.user_id, 
                       i.type, i.description, i.status, i.priority, i.reported_at, i.resolved_at, 
                       i.staff_notes, i.handled_by, i.created_at, i.updated_at
                FROM incidents i
                WHERE i.incident_id = @IncidentId";

            using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@IncidentId", incidentId);

            using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                var incident = MapToIncidentDto(reader);
                await FillIncidentDetailsAsync(incident);
                return incident;
            }

            return null;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[IncidentRepository] Error getting incident by id: {ex.Message}");
            throw;
        }
    }

    public async Task<bool> UpdateIncidentAsync(int incidentId, UpdateIncidentRequest request, int? handledBy = null)
    {
        try
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            var updates = new List<string>();
            var parameters = new List<SqlParameter>
            {
                new SqlParameter("@IncidentId", incidentId)
            };

            if (!string.IsNullOrEmpty(request.Status))
            {
                updates.Add("status = @Status");
                parameters.Add(new SqlParameter("@Status", request.Status));
                
                if (request.Status == "resolved")
                {
                    updates.Add("resolved_at = GETDATE()");
                }
            }

            if (!string.IsNullOrEmpty(request.Priority))
            {
                updates.Add("priority = @Priority");
                parameters.Add(new SqlParameter("@Priority", request.Priority));
            }

            if (request.StaffNotes != null)
            {
                updates.Add("staff_notes = @StaffNotes");
                parameters.Add(new SqlParameter("@StaffNotes", request.StaffNotes));
            }

            if (handledBy.HasValue)
            {
                updates.Add("handled_by = @HandledBy");
                parameters.Add(new SqlParameter("@HandledBy", handledBy.Value));
            }

            if (updates.Count == 0)
            {
                return false;
            }

            updates.Add("updated_at = GETDATE()");

            var sql = $@"
                UPDATE incidents 
                SET {string.Join(", ", updates)}
                WHERE incident_id = @IncidentId";

            using var command = new SqlCommand(sql, connection);
            command.Parameters.AddRange(parameters.ToArray());

            var rowsAffected = await command.ExecuteNonQueryAsync();
            return rowsAffected > 0;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[IncidentRepository] Error updating incident: {ex.Message}");
            throw;
        }
    }

    public async Task<int> GetUnreadIncidentCountAsync(int stationId)
    {
        try
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            var sql = @"
                SELECT COUNT(*) 
                FROM incidents 
                WHERE station_id = @StationId AND status = 'reported'";

            using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@StationId", stationId);

            var result = await command.ExecuteScalarAsync();
            return result != null ? Convert.ToInt32(result) : 0;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[IncidentRepository] Error getting unread count: {ex.Message}");
            return 0;
        }
    }

    private async Task<IncidentDto> GetIncidentWithDetailsAsync(int incidentId)
    {
        var incident = await GetIncidentByIdAsync(incidentId);
        return incident ?? throw new InvalidOperationException($"Incident {incidentId} not found");
    }

    private async Task FillIncidentDetailsAsync(IncidentDto incident)
    {
        try
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            // Get vehicle info
            var vehicleSql = @"
                SELECT v.unique_vehicle_id, v.license_plate, vm.model_name, vm.brand
                FROM vehicles v
                LEFT JOIN vehicle_models vm ON v.model_id = vm.model_id
                WHERE v.vehicle_id = @VehicleId";

            using var vehicleCmd = new SqlCommand(vehicleSql, connection);
            vehicleCmd.Parameters.AddWithValue("@VehicleId", incident.VehicleId);

            using (var vehicleReader = await vehicleCmd.ExecuteReaderAsync())
            {
                if (await vehicleReader.ReadAsync())
                {
                    incident.VehicleName = vehicleReader.IsDBNull(2) 
                        ? null 
                        : $"{vehicleReader.GetString(3)} {vehicleReader.GetString(2)}";
                    incident.VehicleLicensePlate = vehicleReader.IsDBNull(1) 
                        ? null 
                        : vehicleReader.GetString(1);
                }
            }

            // Get station info
            var stationSql = "SELECT name FROM stations WHERE station_id = @StationId";
            using var stationCmd = new SqlCommand(stationSql, connection);
            stationCmd.Parameters.AddWithValue("@StationId", incident.StationId);

            using (var stationReader = await stationCmd.ExecuteReaderAsync())
            {
                if (await stationReader.ReadAsync())
                {
                    incident.StationName = stationReader.IsDBNull(0) ? null : stationReader.GetString(0);
                }
            }

            // Get customer info
            var userSql = "SELECT full_name, email FROM users WHERE user_id = @UserId";
            using var userCmd = new SqlCommand(userSql, connection);
            userCmd.Parameters.AddWithValue("@UserId", incident.UserId);

            using (var userReader = await userCmd.ExecuteReaderAsync())
            {
                if (await userReader.ReadAsync())
                {
                    incident.CustomerName = userReader.IsDBNull(0) ? null : userReader.GetString(0);
                    incident.CustomerEmail = userReader.IsDBNull(1) ? null : userReader.GetString(1);
                }
            }

            // Get handled by info
            if (incident.HandledBy.HasValue)
            {
                var handledBySql = "SELECT full_name FROM users WHERE user_id = @UserId";
                using var handledByCmd = new SqlCommand(handledBySql, connection);
                handledByCmd.Parameters.AddWithValue("@UserId", incident.HandledBy.Value);

                using (var handledByReader = await handledByCmd.ExecuteReaderAsync())
                {
                    if (await handledByReader.ReadAsync())
                    {
                        incident.HandledByName = handledByReader.IsDBNull(0) ? null : handledByReader.GetString(0);
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[IncidentRepository] Error filling incident details: {ex.Message}");
        }
    }

    private IncidentDto MapToIncidentDto(SqlDataReader reader)
    {
        return new IncidentDto
        {
            IncidentId = reader.GetInt32(reader.GetOrdinal("incident_id")),
            ReservationId = reader.IsDBNull(reader.GetOrdinal("reservation_id")) ? null : reader.GetInt32(reader.GetOrdinal("reservation_id")),
            VehicleId = reader.GetInt32(reader.GetOrdinal("vehicle_id")),
            StationId = reader.GetInt32(reader.GetOrdinal("station_id")),
            UserId = SafeGetInt(reader, new []{"user_id"}) ?? 0,
            Type = SafeGetString(reader, new []{"type","incident_type"}) ?? "other",
            Description = reader.GetString(reader.GetOrdinal("description")),
            Status = SafeGetString(reader, new []{"status","incident_status"}) ?? "reported",
            Priority = SafeGetString(reader, new []{"priority","priority_level"}) ?? "medium",
            ReportedAt = reader.GetDateTime(reader.GetOrdinal("reported_at")),
            ResolvedAt = reader.IsDBNull(reader.GetOrdinal("resolved_at")) ? null : reader.GetDateTime(reader.GetOrdinal("resolved_at")),
            StaffNotes = SafeGetString(reader, new []{"staff_notes","notes"}),
            HandledBy = SafeGetInt(reader, new []{"handled_by"}),
            CreatedAt = reader.IsDBNull(reader.GetOrdinal("created_at")) ? null : reader.GetDateTime(reader.GetOrdinal("created_at")),
            UpdatedAt = reader.IsDBNull(reader.GetOrdinal("updated_at")) ? null : reader.GetDateTime(reader.GetOrdinal("updated_at"))
        };
    }

    private static int? SafeGetInt(SqlDataReader r, string[] names)
    {
        foreach (var n in names)
        {
            int idx;
            try { idx = r.GetOrdinal(n); } catch { continue; }
            if (!r.IsDBNull(idx)) return r.GetInt32(idx);
            return null;
        }
        return null;
    }

    private static string? SafeGetString(SqlDataReader r, string[] names)
    {
        foreach (var n in names)
        {
            int idx;
            try { idx = r.GetOrdinal(n); } catch { continue; }
            if (!r.IsDBNull(idx)) return r.GetString(idx);
            return null;
        }
        return null;
    }

    private async Task<(List<string> TitleCols, List<string> TypeCols, List<string> PriorityCols, List<string> SeverityCols, List<string> StatusCols, List<string> UserIdCols, List<string> StaffNotesCols, List<string> HandledByCols, List<string> IncidentDateCols)> GetIncidentColumnSetsAsync(SqlConnection connection)
    {
        var cols = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        using (var cmd = new SqlCommand("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'incidents'", connection))
        using (var rd = await cmd.ExecuteReaderAsync())
        {
            while (await rd.ReadAsync())
            {
                cols.Add(rd.GetString(0));
            }
        }
        List<string> pickAll(params string[] options) => options.Where(c => cols.Contains(c)).ToList();
        return (
            TitleCols: pickAll("title","incident_title"),
            TypeCols: pickAll("type","incident_type"),
            PriorityCols: pickAll("priority","priority_level"),
            SeverityCols: pickAll("severity","incident_severity"),
            StatusCols: pickAll("status","incident_status"),
            UserIdCols: pickAll("user_id","reported_by"),
            StaffNotesCols: pickAll("staff_notes","notes"),
            HandledByCols: pickAll("handled_by","assigned_to"),
            IncidentDateCols: pickAll("incident_date")
        );
    }

    private static async Task EnsureIncidentTableAsync(SqlConnection connection)
    {
        var ddl = @"
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[incidents]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[incidents](
        [incident_id] [int] IDENTITY(1,1) NOT NULL,
        [reservation_id] [int] NULL,
        [vehicle_id] [int] NOT NULL,
        [station_id] [int] NOT NULL,
        [user_id] [int] NOT NULL,
        [type] [varchar](50) NOT NULL,
        [description] [nvarchar](max) NOT NULL,
        [status] [varchar](20) NOT NULL DEFAULT 'reported',
        [priority] [varchar](20) NOT NULL DEFAULT 'medium',
        [reported_at] [datetime] NOT NULL DEFAULT GETDATE(),
        [resolved_at] [datetime] NULL,
        [staff_notes] [nvarchar](max) NULL,
        [handled_by] [int] NULL,
        [created_at] [datetime] NULL DEFAULT GETDATE(),
        [updated_at] [datetime] NULL DEFAULT GETDATE(),
        CONSTRAINT [PK_incidents] PRIMARY KEY CLUSTERED ([incident_id] ASC)
    );
END;

-- Add missing columns if needed (idempotent)
IF COL_LENGTH('dbo.incidents', 'user_id') IS NULL ALTER TABLE dbo.incidents ADD [user_id] int NOT NULL DEFAULT(0);
IF COL_LENGTH('dbo.incidents', 'type') IS NULL ALTER TABLE dbo.incidents ADD [type] varchar(50) NOT NULL DEFAULT('other');
IF COL_LENGTH('dbo.incidents', 'priority') IS NULL ALTER TABLE dbo.incidents ADD [priority] varchar(20) NOT NULL DEFAULT('medium');
IF COL_LENGTH('dbo.incidents', 'staff_notes') IS NULL ALTER TABLE dbo.incidents ADD [staff_notes] nvarchar(max) NULL;
IF COL_LENGTH('dbo.incidents', 'handled_by') IS NULL ALTER TABLE dbo.incidents ADD [handled_by] int NULL;
IF COL_LENGTH('dbo.incidents', 'status') IS NULL ALTER TABLE dbo.incidents ADD [status] varchar(20) NOT NULL DEFAULT('reported');
IF COL_LENGTH('dbo.incidents', 'reported_at') IS NULL ALTER TABLE dbo.incidents ADD [reported_at] datetime NOT NULL DEFAULT(GETDATE());
IF COL_LENGTH('dbo.incidents', 'created_at') IS NULL ALTER TABLE dbo.incidents ADD [created_at] datetime NULL DEFAULT(GETDATE());
IF COL_LENGTH('dbo.incidents', 'updated_at') IS NULL ALTER TABLE dbo.incidents ADD [updated_at] datetime NULL DEFAULT(GETDATE());
IF COL_LENGTH('dbo.incidents', 'severity') IS NULL ALTER TABLE dbo.incidents ADD [severity] varchar(20) NOT NULL DEFAULT('medium');
IF COL_LENGTH('dbo.incidents', 'title') IS NULL ALTER TABLE dbo.incidents ADD [title] nvarchar(200) NOT NULL DEFAULT('Incident');

-- Extra compatibility: add defaults for legacy/extra columns so inserts never fail
IF COL_LENGTH('dbo.incidents', 'incident_date') IS NOT NULL
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM sys.default_constraints dc
        INNER JOIN sys.columns c ON c.object_id = dc.parent_object_id AND c.column_id = dc.parent_column_id
        WHERE dc.parent_object_id = OBJECT_ID('dbo.incidents') AND c.name = 'incident_date'
    )
    BEGIN
        ALTER TABLE dbo.incidents ADD CONSTRAINT DF_incidents_incident_date DEFAULT(GETDATE()) FOR incident_date;
    END
END

IF COL_LENGTH('dbo.incidents', 'location') IS NOT NULL
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM sys.default_constraints dc
        INNER JOIN sys.columns c ON c.object_id = dc.parent_object_id AND c.column_id = dc.parent_column_id
        WHERE dc.parent_object_id = OBJECT_ID('dbo.incidents') AND c.name = 'location'
    )
    BEGIN
        ALTER TABLE dbo.incidents ADD CONSTRAINT DF_incidents_location DEFAULT('') FOR location;
    END
END

IF COL_LENGTH('dbo.incidents', 'images') IS NOT NULL
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM sys.default_constraints dc
        INNER JOIN sys.columns c ON c.object_id = dc.parent_object_id AND c.column_id = dc.parent_column_id
        WHERE dc.parent_object_id = OBJECT_ID('dbo.incidents') AND c.name = 'images'
    )
    BEGIN
        ALTER TABLE dbo.incidents ADD CONSTRAINT DF_incidents_images DEFAULT('') FOR images;
    END
END

IF COL_LENGTH('dbo.incidents', 'resolution') IS NOT NULL
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM sys.default_constraints dc
        INNER JOIN sys.columns c ON c.object_id = dc.parent_object_id AND c.column_id = dc.parent_column_id
        WHERE dc.parent_object_id = OBJECT_ID('dbo.incidents') AND c.name = 'resolution'
    )
    BEGIN
        ALTER TABLE dbo.incidents ADD CONSTRAINT DF_incidents_resolution DEFAULT('') FOR resolution;
    END
END

IF COL_LENGTH('dbo.incidents', 'estimated_cost') IS NOT NULL
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM sys.default_constraints dc
        INNER JOIN sys.columns c ON c.object_id = dc.parent_object_id AND c.column_id = dc.parent_column_id
        WHERE dc.parent_object_id = OBJECT_ID('dbo.incidents') AND c.name = 'estimated_cost'
    )
    BEGIN
        ALTER TABLE dbo.incidents ADD CONSTRAINT DF_incidents_estimated_cost DEFAULT(0) FOR estimated_cost;
    END
END

IF COL_LENGTH('dbo.incidents', 'actual_cost') IS NOT NULL
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM sys.default_constraints dc
        INNER JOIN sys.columns c ON c.object_id = dc.parent_object_id AND c.column_id = dc.parent_column_id
        WHERE dc.parent_object_id = OBJECT_ID('dbo.incidents') AND c.name = 'actual_cost'
    )
    BEGIN
        ALTER TABLE dbo.incidents ADD CONSTRAINT DF_incidents_actual_cost DEFAULT(0) FOR actual_cost;
    END
END

-- Legacy synonyms add defaults if they exist and miss defaults
IF COL_LENGTH('dbo.incidents', 'incident_type') IS NOT NULL
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM sys.default_constraints dc
        INNER JOIN sys.columns c ON c.object_id = dc.parent_object_id AND c.column_id = dc.parent_column_id
        WHERE dc.parent_object_id = OBJECT_ID('dbo.incidents') AND c.name = 'incident_type'
    )
    BEGIN
        ALTER TABLE dbo.incidents ADD CONSTRAINT DF_incidents_incident_type DEFAULT('other') FOR incident_type;
    END
END

IF COL_LENGTH('dbo.incidents', 'priority_level') IS NOT NULL
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM sys.default_constraints dc
        INNER JOIN sys.columns c ON c.object_id = dc.parent_object_id AND c.column_id = dc.parent_column_id
        WHERE dc.parent_object_id = OBJECT_ID('dbo.incidents') AND c.name = 'priority_level'
    )
    BEGIN
        ALTER TABLE dbo.incidents ADD CONSTRAINT DF_incidents_priority_level DEFAULT('medium') FOR priority_level;
    END
END

IF COL_LENGTH('dbo.incidents', 'incident_status') IS NOT NULL
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM sys.default_constraints dc
        INNER JOIN sys.columns c ON c.object_id = dc.parent_object_id AND c.column_id = dc.parent_column_id
        WHERE dc.parent_object_id = OBJECT_ID('dbo.incidents') AND c.name = 'incident_status'
    )
    BEGIN
        ALTER TABLE dbo.incidents ADD CONSTRAINT DF_incidents_incident_status DEFAULT('reported') FOR incident_status;
    END
END

IF COL_LENGTH('dbo.incidents', 'reported_by') IS NOT NULL
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM sys.default_constraints dc
        INNER JOIN sys.columns c ON c.object_id = dc.parent_object_id AND c.column_id = dc.parent_column_id
        WHERE dc.parent_object_id = OBJECT_ID('dbo.incidents') AND c.name = 'reported_by'
    )
    BEGIN
        ALTER TABLE dbo.incidents ADD CONSTRAINT DF_incidents_reported_by DEFAULT(0) FOR reported_by;
    END
END

-- Ensure default constraint exists for severity to prevent NULL inserts
IF COL_LENGTH('dbo.incidents', 'severity') IS NOT NULL
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM sys.default_constraints dc
        INNER JOIN sys.columns c ON c.object_id = dc.parent_object_id AND c.column_id = dc.parent_column_id
        WHERE dc.parent_object_id = OBJECT_ID('dbo.incidents') AND c.name = 'severity'
    )
    BEGIN
        ALTER TABLE dbo.incidents ADD CONSTRAINT DF_incidents_severity DEFAULT('medium') FOR severity;
    END
END

-- Add FKs if they don't exist
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_incidents_users')
    ALTER TABLE dbo.incidents ADD CONSTRAINT FK_incidents_users FOREIGN KEY(user_id) REFERENCES dbo.users(user_id);
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_incidents_vehicles')
    ALTER TABLE dbo.incidents ADD CONSTRAINT FK_incidents_vehicles FOREIGN KEY(vehicle_id) REFERENCES dbo.vehicles(vehicle_id);
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_incidents_stations')
    ALTER TABLE dbo.incidents ADD CONSTRAINT FK_incidents_stations FOREIGN KEY(station_id) REFERENCES dbo.stations(station_id);
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_incidents_reservations')
    ALTER TABLE dbo.incidents ADD CONSTRAINT FK_incidents_reservations FOREIGN KEY(reservation_id) REFERENCES dbo.reservations(reservation_id);
";

        using var cmd = new SqlCommand(ddl, connection);
        cmd.CommandType = CommandType.Text;
        await cmd.ExecuteNonQueryAsync();
    }
}

