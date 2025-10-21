using Microsoft.Data.SqlClient;
using System.Data;
using EVRentalApi.Models;

namespace EVRentalApi.Infrastructure.Repositories;

public class StaffRepository : IStaffRepository
{
    private readonly Func<SqlConnection> _connFactory;

    public StaffRepository(Func<SqlConnection> connFactory)
    {
        _connFactory = connFactory;
    }

    public async Task<StaffProfileDto?> GetStaffProfileAsync(int staffId)
    {
        const string sql = @"
            SELECT 
                u.user_id,
                u.email,
                u.full_name,
                u.phone,
                u.station_id,
                s.name as station_name,
                s.address as station_address,
                r.role_name as role,
                u.is_active,
                u.created_at
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.role_id
            LEFT JOIN stations s ON u.station_id = s.station_id
            WHERE u.user_id = @StaffId AND r.role_name = 'staff'";

        await using var conn = _connFactory();
        await conn.OpenAsync();

        await using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@StaffId", staffId);

        await using var reader = await cmd.ExecuteReaderAsync();
        if (await reader.ReadAsync())
        {
            return new StaffProfileDto
            {
                UserId = reader.GetInt32("user_id"),
                Email = reader.GetString("email"),
                FullName = reader.GetString("full_name"),
                Phone = reader.GetString("phone"),
                StationId = reader.IsDBNull("station_id") ? null : reader.GetInt32("station_id"),
                StationName = reader.IsDBNull("station_name") ? null : reader.GetString("station_name"),
                StationAddress = reader.IsDBNull("station_address") ? null : reader.GetString("station_address"),
                Role = reader.GetString("role"),
                IsActive = reader.GetBoolean("is_active"),
                CreatedAt = reader.GetDateTime("created_at")
            };
        }

        return null;
    }

    public async Task<List<VehicleDto>> GetStationVehiclesAsync(int staffId)
    {
        const string sql = @"
            SELECT 
                v.vehicle_id,
                v.station_id,
                v.model_id,
                v.unique_vehicle_id,
                v.battery_level,
                v.max_range_km,
                v.status,
                v.price_per_hour,
                v.price_per_day,
                v.rating,
                v.review_count,
                v.trips,
                v.mileage,
                v.last_maintenance,
                v.last_maintenance,
                v.insurance_expiry,
                v.condition,
                v.created_at,
                v.updated_at,
                v.image,
                v.license_plate,
                v.fuel_efficiency,
                v.location
            FROM vehicles v
            INNER JOIN users u ON v.station_id = u.station_id
            WHERE u.user_id = @StaffId AND u.role_id = (SELECT role_id FROM roles WHERE role_name = 'staff')";

        await using var conn = _connFactory();
        await conn.OpenAsync();

        await using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@StaffId", staffId);

        await using var reader = await cmd.ExecuteReaderAsync();
        var vehicles = new List<VehicleDto>();

        while (await reader.ReadAsync())
        {
            vehicles.Add(new VehicleDto
            {
                VehicleId = reader.GetInt32("vehicle_id"),
                StationId = reader.GetInt32("station_id"),
                ModelId = reader.GetString("model_id"),
                UniqueVehicleId = reader.IsDBNull("unique_vehicle_id") ? null : reader.GetString("unique_vehicle_id"),
                BatteryLevel = reader.GetInt32("battery_level"),
                MaxRangeKm = reader.IsDBNull("max_range_km") ? 0 : reader.GetInt32("max_range_km"),
                Status = reader.GetString("status"),
                PricePerHour = reader.GetDecimal("price_per_hour"),
                PricePerDay = reader.IsDBNull("price_per_day") ? 0 : reader.GetDecimal("price_per_day"),
                Rating = reader.IsDBNull("rating") ? 0 : reader.GetDecimal("rating"),
                ReviewCount = reader.IsDBNull("review_count") ? 0 : reader.GetInt32("review_count"),
                Trips = reader.IsDBNull("trips") ? 0 : reader.GetInt32("trips"),
                Mileage = reader.IsDBNull("mileage") ? 0 : reader.GetInt32("mileage"),
                LastMaintenance = reader.IsDBNull("last_maintenance") ? "" : reader.GetDateTime("last_maintenance").ToString("yyyy-MM-dd"),
                InsuranceExpiry = reader.IsDBNull("insurance_expiry") ? "" : reader.GetDateTime("insurance_expiry").ToString("yyyy-MM-dd"),
                Condition = reader.IsDBNull("condition") ? null : reader.GetString("condition"),
                CreatedAt = reader.GetDateTime("created_at"),
                UpdatedAt = reader.GetDateTime("updated_at"),
                Image = reader.IsDBNull("image") ? null : reader.GetString("image"),
                LicensePlate = reader.IsDBNull("license_plate") ? null : reader.GetString("license_plate"),
                FuelEfficiency = reader.IsDBNull("fuel_efficiency") ? null : reader.GetString("fuel_efficiency"),
                Location = reader.IsDBNull("location") ? null : reader.GetString("location")
            });
        }

        return vehicles;
    }

    public async Task<VehicleDto?> GetVehicleAsync(int vehicleId, int staffId)
    {
        const string sql = @"
            SELECT 
                v.vehicle_id,
                v.station_id,
                v.model_id,
                v.unique_vehicle_id,
                v.battery_level,
                v.max_range_km,
                v.status,
                v.price_per_hour,
                v.price_per_day,
                v.rating,
                v.review_count,
                v.trips,
                v.mileage,
                v.last_maintenance,
                v.last_maintenance,
                v.insurance_expiry,
                v.condition,
                v.created_at,
                v.updated_at,
                v.image,
                v.license_plate,
                v.fuel_efficiency,
                v.location
            FROM vehicles v
            INNER JOIN users u ON v.station_id = u.station_id
            WHERE v.vehicle_id = @VehicleId AND u.user_id = @StaffId AND u.role_id = (SELECT role_id FROM roles WHERE role_name = 'staff')";

        await using var conn = _connFactory();
        await conn.OpenAsync();

        await using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@VehicleId", vehicleId);
        cmd.Parameters.AddWithValue("@StaffId", staffId);

        await using var reader = await cmd.ExecuteReaderAsync();
        if (await reader.ReadAsync())
        {
            return new VehicleDto
            {
                VehicleId = reader.GetInt32("vehicle_id"),
                StationId = reader.GetInt32("station_id"),
                ModelId = reader.GetString("model_id"),
                UniqueVehicleId = reader.IsDBNull("unique_vehicle_id") ? null : reader.GetString("unique_vehicle_id"),
                BatteryLevel = reader.GetInt32("battery_level"),
                MaxRangeKm = reader.IsDBNull("max_range_km") ? 0 : reader.GetInt32("max_range_km"),
                Status = reader.GetString("status"),
                PricePerHour = reader.GetDecimal("price_per_hour"),
                PricePerDay = reader.IsDBNull("price_per_day") ? 0 : reader.GetDecimal("price_per_day"),
                Rating = reader.IsDBNull("rating") ? 0 : reader.GetDecimal("rating"),
                ReviewCount = reader.IsDBNull("review_count") ? 0 : reader.GetInt32("review_count"),
                Trips = reader.IsDBNull("trips") ? 0 : reader.GetInt32("trips"),
                Mileage = reader.IsDBNull("mileage") ? 0 : reader.GetInt32("mileage"),
                LastMaintenance = reader.IsDBNull("last_maintenance") ? "" : reader.GetDateTime("last_maintenance").ToString("yyyy-MM-dd"),
                InsuranceExpiry = reader.IsDBNull("insurance_expiry") ? "" : reader.GetDateTime("insurance_expiry").ToString("yyyy-MM-dd"),
                Condition = reader.IsDBNull("condition") ? null : reader.GetString("condition"),
                CreatedAt = reader.GetDateTime("created_at"),
                UpdatedAt = reader.GetDateTime("updated_at"),
                Image = reader.IsDBNull("image") ? null : reader.GetString("image"),
                LicensePlate = reader.IsDBNull("license_plate") ? null : reader.GetString("license_plate"),
                FuelEfficiency = reader.IsDBNull("fuel_efficiency") ? null : reader.GetString("fuel_efficiency"),
                Location = reader.IsDBNull("location") ? null : reader.GetString("location")
            };
        }

        return null;
    }

    public async Task<VehicleDto?> UpdateVehicleAsync(int vehicleId, UpdateVehicleRequest request)
    {
        const string sql = @"
            UPDATE vehicles 
            SET 
                battery_level = COALESCE(@BatteryLevel, battery_level),
                condition = COALESCE(@Condition, condition),
                mileage = COALESCE(@Mileage, mileage),
                status = COALESCE(@Status, status),
                last_maintenance = COALESCE(@LastMaintenance, last_maintenance),
                updated_at = GETDATE()
            WHERE vehicle_id = @VehicleId";

        await using var conn = _connFactory();
        await conn.OpenAsync();

        await using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@VehicleId", vehicleId);
        cmd.Parameters.AddWithValue("@BatteryLevel", request.BatteryLevel ?? (object)DBNull.Value);
        cmd.Parameters.AddWithValue("@Condition", request.Condition ?? (object)DBNull.Value);
        cmd.Parameters.AddWithValue("@Mileage", request.Mileage ?? (object)DBNull.Value);
        cmd.Parameters.AddWithValue("@Status", request.Status ?? (object)DBNull.Value);
        cmd.Parameters.AddWithValue("@LastMaintenance", request.LastMaintenance ?? (object)DBNull.Value);
        cmd.Parameters.AddWithValue("@InspectionDate", request.InspectionDate ?? (object)DBNull.Value);

        await cmd.ExecuteNonQueryAsync();
        
        // Return updated vehicle (simplified)
        return new VehicleDto { VehicleId = vehicleId };
    }

    public async Task<VehicleDto?> AddVehicleAsync(int stationId, AddVehicleRequest request)
    {
        const string sql = @"
            INSERT INTO vehicles (
                station_id, model_id, unique_vehicle_id, battery_level, 
                condition, mileage, license_plate, location, created_at, updated_at
            )
            OUTPUT INSERTED.vehicle_id
            VALUES (
                @StationId, @ModelId, @UniqueVehicleId, @BatteryLevel,
                @Condition, @Mileage, @LicensePlate, @Location, GETDATE(), GETDATE()
            )";

        await using var conn = _connFactory();
        await conn.OpenAsync();

        await using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@StationId", stationId);
        cmd.Parameters.AddWithValue("@ModelId", request.ModelId);
        cmd.Parameters.AddWithValue("@UniqueVehicleId", request.UniqueVehicleId ?? (object)DBNull.Value);
        cmd.Parameters.AddWithValue("@BatteryLevel", request.BatteryLevel);
        cmd.Parameters.AddWithValue("@Condition", request.Condition);
        cmd.Parameters.AddWithValue("@Mileage", request.Mileage);
        cmd.Parameters.AddWithValue("@LicensePlate", request.LicensePlate ?? (object)DBNull.Value);
        cmd.Parameters.AddWithValue("@Location", request.Location ?? (object)DBNull.Value);

        var vehicleId = (int)await cmd.ExecuteScalarAsync();
        
        // Return new vehicle (simplified)
        return new VehicleDto { VehicleId = vehicleId };
    }

    public async Task<MaintenanceRecordDto?> RecordMaintenanceAsync(int vehicleId, int staffId, MaintenanceRecordRequest request)
    {
        const string sql = @"
            INSERT INTO maintenance_records (
                vehicle_id, staff_id, maintenance_type, description, cost, completed_at, created_at
            )
            OUTPUT INSERTED.maintenance_id
            VALUES (
                @VehicleId, @StaffId, @MaintenanceType, @Description, @Cost, @CompletedAt, GETDATE()
            )";

        await using var conn = _connFactory();
        await conn.OpenAsync();

        await using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@VehicleId", vehicleId);
        cmd.Parameters.AddWithValue("@StaffId", staffId);
        cmd.Parameters.AddWithValue("@MaintenanceType", request.MaintenanceType);
        cmd.Parameters.AddWithValue("@Description", request.Description ?? (object)DBNull.Value);
        cmd.Parameters.AddWithValue("@Cost", request.Cost ?? (object)DBNull.Value);
        cmd.Parameters.AddWithValue("@CompletedAt", request.CompletedAt);

        var maintenanceId = (int)await cmd.ExecuteScalarAsync();
        
        // Return maintenance record (simplified)
        return new MaintenanceRecordDto 
        { 
            MaintenanceId = maintenanceId,
            VehicleId = vehicleId,
            StaffId = staffId,
            MaintenanceType = request.MaintenanceType,
            CompletedAt = request.CompletedAt
        };
    }

    public async Task<List<MaintenanceRecordDto>> GetMaintenanceRecordsAsync(int staffId)
    {
        // Simplified implementation
        return new List<MaintenanceRecordDto>();
    }

    public async Task<StationInfoDto?> GetStationInfoAsync(int staffId)
    {
        const string sql = @"
            SELECT 
                s.station_id,
                s.name,
                s.address,
                s.city,
                s.latitude,
                s.longitude,
                s.status,
                s.available_vehicles,
                s.total_slots,
                s.amenities,
                s.rating,
                s.operating_hours,
                s.fast_charging,
                s.image,
                s.created_at,
                s.updated_at
            FROM stations s
            INNER JOIN users u ON s.station_id = u.station_id
            WHERE u.user_id = @StaffId AND u.role_id = (SELECT role_id FROM roles WHERE role_name = 'staff')";

        await using var conn = _connFactory();
        await conn.OpenAsync();

        await using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@StaffId", staffId);

        await using var reader = await cmd.ExecuteReaderAsync();
        if (await reader.ReadAsync())
        {
            var amenitiesJson = reader.IsDBNull("amenities") ? "[]" : reader.GetString("amenities");
            var amenities = System.Text.Json.JsonSerializer.Deserialize<List<string>>(amenitiesJson) ?? new List<string>();

            return new StationInfoDto
            {
                StationId = reader.GetInt32("station_id"),
                Name = reader.GetString("name"),
                Address = reader.GetString("address"),
                City = reader.GetString("city"),
                Latitude = reader.GetDecimal("latitude"),
                Longitude = reader.GetDecimal("longitude"),
                Status = reader.GetString("status"),
                AvailableVehicles = reader.GetInt32("available_vehicles"),
                TotalSlots = reader.GetInt32("total_slots"),
                Amenities = amenities,
                Rating = reader.GetDecimal("rating"),
                OperatingHours = reader.GetString("operating_hours"),
                FastCharging = reader.GetBoolean("fast_charging"),
                Image = reader.IsDBNull("image") ? null : reader.GetString("image"),
                CreatedAt = reader.GetDateTime("created_at"),
                UpdatedAt = reader.GetDateTime("updated_at")
            };
        }

        return null;
    }

    public async Task<List<CustomerVerificationDto>> GetCustomersForVerificationAsync(int staffId)
    {
        // Simplified implementation
        return new List<CustomerVerificationDto>();
    }

    public async Task<bool> VerifyCustomerAsync(int customerId, int staffId, CustomerVerificationRequest request)
    {
        // Simplified implementation
        return true;
    }

    public async Task<List<HandoverDto>> GetHandoversAsync(int staffId)
    {
        // Simplified implementation
        return new List<HandoverDto>();
    }

    public async Task<HandoverDto?> RecordHandoverAsync(int staffId, HandoverRequest request)
    {
        // Simplified implementation
        return new HandoverDto 
        { 
            HandoverId = 1,
            StaffId = staffId,
            Type = request.Type
        };
    }

    public async Task<bool> UpdateVehicleAsync(VehicleDto vehicle)
    {
        const string sql = @"
            UPDATE vehicles
            SET battery_level = @BatteryLevel, condition = @Condition, status = @Status, mileage = @Mileage,
                last_maintenance = @LastMaintenance, inspection_date = @InspectionDate, insurance_expiry = @InsuranceExpiry,
                license_plate = @LicensePlate, fuel_efficiency = @FuelEfficiency, location = @Location, updated_at = GETDATE()
            WHERE vehicle_id = @VehicleId";

        await using var conn = _connFactory();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@BatteryLevel", vehicle.BatteryLevel);
        cmd.Parameters.AddWithValue("@Condition", vehicle.Condition);
        cmd.Parameters.AddWithValue("@Status", vehicle.Status);
        cmd.Parameters.AddWithValue("@Mileage", vehicle.Mileage);
        cmd.Parameters.AddWithValue("@LastMaintenance", vehicle.LastMaintenance);
        cmd.Parameters.AddWithValue("@InspectionDate", vehicle.InspectionDate);
        cmd.Parameters.AddWithValue("@InsuranceExpiry", vehicle.InsuranceExpiry);
        cmd.Parameters.AddWithValue("@LicensePlate", vehicle.LicensePlate);
        cmd.Parameters.AddWithValue("@FuelEfficiency", vehicle.FuelEfficiency);
        cmd.Parameters.AddWithValue("@Location", vehicle.Location);
        cmd.Parameters.AddWithValue("@VehicleId", vehicle.VehicleId);

        var rowsAffected = await cmd.ExecuteNonQueryAsync();
        return rowsAffected > 0;
    }

    public async Task<UserDto?> GetStaffUserByIdAsync(int userId)
    {
        const string sql = @"
            SELECT u.user_id, u.email, u.full_name, u.phone, u.role_id, u.is_active, u.created_at, u.station_id
            FROM users u
            WHERE u.user_id = @UserId AND u.role_id = 2"; // role_id 2 for staff

        await using var conn = _connFactory();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@UserId", userId);

        await using var reader = await cmd.ExecuteReaderAsync();
        if (await reader.ReadAsync())
        {
            return new UserDto
            {
                UserId = reader.GetInt32("user_id"),
                Email = reader.GetString("email"),
                FullName = reader.GetString("full_name"),
                Phone = reader.GetString("phone"),
                RoleId = reader.GetInt32("role_id"),
                IsActive = reader.GetBoolean("is_active"),
                CreatedAt = reader.GetDateTime("created_at"),
                StationId = reader.IsDBNull("station_id") ? (int?)null : reader.GetInt32("station_id")
            };
        }
        return null;
    }
}
