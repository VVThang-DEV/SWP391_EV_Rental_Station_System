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

    public async Task<List<VehicleDto>> GetVehiclesByStatusAsync(int staffId, string status)
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
            WHERE u.user_id = @StaffId 
                AND u.role_id = (SELECT role_id FROM roles WHERE role_name = 'staff')
                AND v.status = @Status";

        await using var conn = _connFactory();
        await conn.OpenAsync();

        await using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@StaffId", staffId);
        cmd.Parameters.AddWithValue("@Status", status);

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
        const string sql = @"
            SELECT 
                r.reservation_id,
                r.user_id,
                r.vehicle_id,
                r.start_time,
                r.end_time,
                r.created_at,
                u.full_name,
                u.email,
                u.phone,
                u.cccd,
                u.license_number,
                u.address,
                u.date_of_birth,
                u.gender,
                v.model_id as vehicle_model,
                v.price_per_hour,
                ISNULL(
                    (SELECT SUM(amount) 
                     FROM payments 
                     WHERE reservation_id = r.reservation_id AND status = 'success'),
                    0
                ) as total_paid
            FROM reservations r
            INNER JOIN users u ON r.user_id = u.user_id
            INNER JOIN vehicles v ON r.vehicle_id = v.vehicle_id
            INNER JOIN stations s ON v.station_id = s.station_id
            INNER JOIN users staff ON staff.station_id = s.station_id
            WHERE staff.user_id = @StaffId 
                AND staff.role_id = (SELECT role_id FROM roles WHERE role_name = 'staff')
                AND LOWER(r.status) = 'pending'";

        await using var conn = _connFactory();
        await conn.OpenAsync();

        await using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@StaffId", staffId);

        var customers = new List<CustomerVerificationDto>();

        await using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            var startTime = reader.GetDateTime("start_time");
            var endTime = reader.GetDateTime("end_time");
            var pricePerHour = reader.GetDecimal("price_per_hour");
            var totalPaid = reader.GetDecimal("total_paid");
            
            // Calculate rental duration in hours
            var hours = Math.Ceiling((endTime - startTime).TotalHours);
            var totalAmount = (decimal)hours * pricePerHour;
            
            var customer = new CustomerVerificationDto
            {
                ReservationId = reader.GetInt32("reservation_id"),
                UserId = reader.GetInt32("user_id"),
                VehicleId = reader.GetInt32("vehicle_id"),
                FullName = reader.GetString("full_name"),
                Email = reader.GetString("email"),
                Phone = reader.GetString("phone"),
                VehicleModel = reader.GetString("vehicle_model"),
                VehiclePricePerHour = pricePerHour,
                StartTime = startTime,
                EndTime = endTime,
                TotalAmount = totalAmount,
                DepositAmount = totalPaid,
                CreatedAt = reader.GetDateTime("created_at"),
                Cccd = reader.IsDBNull("cccd") ? null : reader.GetString("cccd"),
                LicenseNumber = reader.IsDBNull("license_number") ? null : reader.GetString("license_number"),
                Address = reader.IsDBNull("address") ? null : reader.GetString("address"),
                DateOfBirth = reader.IsDBNull("date_of_birth") ? null : reader.GetDateTime("date_of_birth"),
                Gender = reader.IsDBNull("gender") ? null : reader.GetString("gender"),
                Documents = new List<DocumentDto>()
            };

            // Get documents for this customer
            customer.Documents = await GetUserDocumentsAsync(customer.UserId);
            customer.HasDocuments = customer.Documents.Count > 0;

            customers.Add(customer);
        }

        return customers;
    }

    private async Task<List<DocumentDto>> GetUserDocumentsAsync(int userId)
    {
        const string sql = @"
            SELECT 
                document_id,
                document_type,
                file_url,
                status,
                verified_at,
                verified_by,
                uploaded_at
            FROM user_documents
            WHERE user_id = @UserId";

        await using var conn = _connFactory();
        await conn.OpenAsync();

        await using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@UserId", userId);

        var documents = new List<DocumentDto>();

        await using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            documents.Add(new DocumentDto
            {
                DocumentId = reader.GetInt32("document_id"),
                DocumentType = reader.GetString("document_type"),
                FileUrl = reader.GetString("file_url"),
                Status = reader.IsDBNull("status") ? null : reader.GetString("status"),
                VerifiedAt = reader.IsDBNull("verified_at") ? null : reader.GetDateTime("verified_at"),
                VerifiedBy = reader.IsDBNull("verified_by") ? null : reader.GetInt32("verified_by"),
                UploadedAt = reader.GetDateTime("uploaded_at")
            });
        }

        return documents;
    }

    public async Task<bool> VerifyCustomerAsync(int customerId, int staffId, CustomerVerificationRequest request)
    {
        try
        {
            await using var conn = _connFactory();
            await conn.OpenAsync();

            // Only approve user documents, don't complete the checkout yet
            // Checkout will be completed later in Pickup Management after final verification
            const string updateDocumentsSql = @"
                UPDATE user_documents
                SET status = 'approved',
                    verified_at = GETDATE(),
                    verified_by = @StaffId
                WHERE user_id = @UserId AND status = 'pending'";

            await using var updateDocsCmd = new SqlCommand(updateDocumentsSql, conn);
            updateDocsCmd.Parameters.AddWithValue("@UserId", customerId);
            updateDocsCmd.Parameters.AddWithValue("@StaffId", staffId);
            var docsUpdated = await updateDocsCmd.ExecuteNonQueryAsync();

            if (docsUpdated > 0)
            {
                Console.WriteLine($"[VerifyCustomerAsync] Successfully approved {docsUpdated} documents for customer {customerId}");
                return true;
            }
            else
            {
                Console.WriteLine($"[VerifyCustomerAsync] No pending documents found for customer {customerId}");
                return false;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[VerifyCustomerAsync] Error: {ex.Message}");
            return false;
        }
    }

    public async Task<bool> ConfirmReservationAsync(int reservationId, int staffId)
    {
        try
        {
            await using var conn = _connFactory();
            await conn.OpenAsync();

            // Get reservation and vehicle info
            const string getReservationSql = @"
                SELECT user_id, vehicle_id 
                FROM reservations 
                WHERE reservation_id = @ReservationId AND status = 'pending'";

            await using var getCmd = new SqlCommand(getReservationSql, conn);
            getCmd.Parameters.AddWithValue("@ReservationId", reservationId);

            await using var reader = await getCmd.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
            {
                Console.WriteLine($"[ConfirmReservation] Reservation {reservationId} not found or not pending");
                return false;
            }

            int userId = reader.GetInt32(0);
            int vehicleId = reader.GetInt32(1);
            await reader.CloseAsync();

            Console.WriteLine($"[ConfirmReservation] Confirming reservation {reservationId} for user {userId}, vehicle {vehicleId}");

            // Update reservation status to confirmed
            const string updateReservationSql = @"
                UPDATE reservations 
                SET status = 'confirmed' 
                WHERE reservation_id = @ReservationId";

            await using var updateReservationCmd = new SqlCommand(updateReservationSql, conn);
            updateReservationCmd.Parameters.AddWithValue("@ReservationId", reservationId);
            var reservationUpdated = await updateReservationCmd.ExecuteNonQueryAsync();

            if (reservationUpdated > 0)
            {
                // Update vehicle status to rented
                const string updateVehicleSql = @"
                    UPDATE vehicles 
                    SET status = 'rented', updated_at = GETDATE()
                    WHERE vehicle_id = @VehicleId";

                await using var updateVehicleCmd = new SqlCommand(updateVehicleSql, conn);
                updateVehicleCmd.Parameters.AddWithValue("@VehicleId", vehicleId);
                await updateVehicleCmd.ExecuteNonQueryAsync();

                Console.WriteLine($"[ConfirmReservation] Successfully confirmed reservation {reservationId}. Vehicle {vehicleId} now rented.");
                return true;
            }

            return false;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ConfirmReservation] Error: {ex.Message}");
            return false;
        }
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

    public async Task<List<StaffActivityLogDto>> GetTodayActivityLogsAsync(int staffId)
    {
        var activities = new List<StaffActivityLogDto>();
        
        try
        {
            await using var conn = _connFactory();
            await conn.OpenAsync();

            // Get today's date range
            var today = DateTime.Today;
            var tomorrow = today.AddDays(1);

            // Query 1: Payments processed today - ONLY staff-processed payments (walk-in bookings)
            // Only get payments from reservations at staff's station (walk-in bookings are always from staff station)
            const string paymentsSql = @"
                SELECT 
                    p.payment_id,
                    'payment' as activity_type,
                    u.full_name as customer_name,
                    v.model_id as vehicle_model,
                    p.amount,
                    p.method_type as details,
                    p.created_at,
                    p.status
                FROM payments p
                INNER JOIN users u ON p.user_id = u.user_id
                INNER JOIN reservations r ON p.reservation_id = r.reservation_id
                INNER JOIN vehicles v ON r.vehicle_id = v.vehicle_id
                INNER JOIN stations s ON v.station_id = s.station_id
                INNER JOIN users staff_user ON staff_user.station_id = s.station_id
                WHERE p.created_at >= @Today AND p.created_at < @Tomorrow
                    AND staff_user.user_id = @StaffId
                    AND p.method_type IN ('cash', 'qr')  -- Only staff-handled payment methods
                ORDER BY p.created_at DESC";

            await using var paymentsCmd = new SqlCommand(paymentsSql, conn);
            paymentsCmd.Parameters.AddWithValue("@Today", today);
            paymentsCmd.Parameters.AddWithValue("@Tomorrow", tomorrow);
            paymentsCmd.Parameters.AddWithValue("@StaffId", staffId);

            await using var paymentsReader = await paymentsCmd.ExecuteReaderAsync();
            while (await paymentsReader.ReadAsync())
            {
                activities.Add(new StaffActivityLogDto
                {
                    ActivityId = paymentsReader.GetInt32(0),
                    ActivityType = paymentsReader.GetString(1),
                    CustomerName = paymentsReader.GetString(2),
                    VehicleModel = paymentsReader.IsDBNull(3) ? null : paymentsReader.GetString(3),
                    Amount = paymentsReader.GetDecimal(4),
                    Details = paymentsReader.GetString(5),
                    CreatedAt = paymentsReader.GetDateTime(6),
                    Status = paymentsReader.GetString(7)
                });
            }
            await paymentsReader.CloseAsync();

            // Query 2: Cancellations today - ONLY cancellations from staff's station
            const string cancellationsSql = @"
                SELECT 
                    r.reservation_id,
                    'cancellation' as activity_type,
                    u.full_name as customer_name,
                    v.model_id as vehicle_model,
                    NULL as amount,
                    r.cancellation_reason as details,
                    r.cancelled_at as created_at,
                    r.cancelled_by as status
                FROM reservations r
                INNER JOIN users u ON r.user_id = u.user_id
                INNER JOIN vehicles v ON r.vehicle_id = v.vehicle_id
                INNER JOIN stations s ON v.station_id = s.station_id
                INNER JOIN users staff_user ON staff_user.station_id = s.station_id
                WHERE r.status = 'cancelled' 
                    AND r.cancelled_at >= @Today 
                    AND r.cancelled_at < @Tomorrow
                    AND staff_user.user_id = @StaffId
                ORDER BY r.cancelled_at DESC";

            await using var cancellationsCmd = new SqlCommand(cancellationsSql, conn);
            cancellationsCmd.Parameters.AddWithValue("@Today", today);
            cancellationsCmd.Parameters.AddWithValue("@Tomorrow", tomorrow);
            cancellationsCmd.Parameters.AddWithValue("@StaffId", staffId);

            await using var cancellationsReader = await cancellationsCmd.ExecuteReaderAsync();
            while (await cancellationsReader.ReadAsync())
            {
                activities.Add(new StaffActivityLogDto
                {
                    ActivityId = cancellationsReader.GetInt32(0),
                    ActivityType = cancellationsReader.GetString(1),
                    CustomerName = cancellationsReader.GetString(2),
                    VehicleModel = cancellationsReader.GetString(3),
                    Amount = null,
                    Details = cancellationsReader.IsDBNull(5) ? "Cancelled" : cancellationsReader.GetString(5),
                    CreatedAt = cancellationsReader.GetDateTime(6),
                    Status = cancellationsReader.IsDBNull(7) ? "unknown" : cancellationsReader.GetString(7)
                });
            }
            await cancellationsReader.CloseAsync();

            // Query 3: Confirmations today - ONLY staff confirmations (from staff's station)
            const string confirmationsSql = @"
                SELECT 
                    r.reservation_id,
                    'confirmation' as activity_type,
                    u.full_name as customer_name,
                    v.model_id as vehicle_model,
                    NULL as amount,
                    'Reservation confirmed and vehicle unlocked' as details,
                    r.created_at,
                    r.status
                FROM reservations r
                INNER JOIN users u ON r.user_id = u.user_id
                INNER JOIN vehicles v ON r.vehicle_id = v.vehicle_id
                INNER JOIN stations s ON v.station_id = s.station_id
                INNER JOIN users staff_user ON staff_user.station_id = s.station_id
                WHERE r.status = 'confirmed' 
                    AND r.created_at >= @Today 
                    AND r.created_at < @Tomorrow
                    AND staff_user.user_id = @StaffId
                ORDER BY r.created_at DESC";

            await using var confirmationsCmd = new SqlCommand(confirmationsSql, conn);
            confirmationsCmd.Parameters.AddWithValue("@Today", today);
            confirmationsCmd.Parameters.AddWithValue("@Tomorrow", tomorrow);
            confirmationsCmd.Parameters.AddWithValue("@StaffId", staffId);

            await using var confirmationsReader = await confirmationsCmd.ExecuteReaderAsync();
            while (await confirmationsReader.ReadAsync())
            {
                activities.Add(new StaffActivityLogDto
                {
                    ActivityId = confirmationsReader.GetInt32(0),
                    ActivityType = confirmationsReader.GetString(1),
                    CustomerName = confirmationsReader.GetString(2),
                    VehicleModel = confirmationsReader.GetString(3),
                    Amount = null,
                    Details = confirmationsReader.GetString(5),
                    CreatedAt = confirmationsReader.GetDateTime(6),
                    Status = confirmationsReader.GetString(7)
                });
            }
            
            // Sort all activities by time
            activities = activities.OrderByDescending(a => a.CreatedAt).ToList();
            
            Console.WriteLine($"[GetTodayActivityLogs] Found {activities.Count} activities for today");
            
            return activities;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[GetTodayActivityLogs] Error: {ex.Message}");
            return activities;
        }
    }

    public async Task<List<ReservationDto>> GetStationReservationsAsync(int staffId)
    {
        var reservations = new List<ReservationDto>();
        
        try
        {
            const string sql = @"
                SELECT 
                    r.reservation_id,
                    r.user_id,
                    r.vehicle_id,
                    r.station_id,
                    r.start_time,
                    r.end_time,
                    r.status,
                    r.created_at,
                    r.cancellation_reason,
                    r.cancelled_by,
                    r.cancelled_at,
                    u.full_name as user_name,
                    u.email as user_email,
                    u.phone as user_phone,
                    v.model_id as vehicle_model,
                    v.unique_vehicle_id,
                    v.license_plate,
                    s.name as station_name
                FROM reservations r
                INNER JOIN vehicles v ON r.vehicle_id = v.vehicle_id
                INNER JOIN users u ON r.user_id = u.user_id
                INNER JOIN stations s ON r.station_id = s.station_id
                INNER JOIN users staff_user ON v.station_id = staff_user.station_id
                WHERE staff_user.user_id = @StaffId
                ORDER BY r.created_at DESC";

            await using var conn = _connFactory();
            await conn.OpenAsync();

            await using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@StaffId", staffId);

            await using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                reservations.Add(new ReservationDto
                {
                    ReservationId = reader.GetInt32(reader.GetOrdinal("reservation_id")),
                    UserId = reader.GetInt32(reader.GetOrdinal("user_id")),
                    VehicleId = reader.GetInt32(reader.GetOrdinal("vehicle_id")),
                    StationId = reader.GetInt32(reader.GetOrdinal("station_id")),
                    StartTime = reader.GetDateTime(reader.GetOrdinal("start_time")),
                    EndTime = reader.GetDateTime(reader.GetOrdinal("end_time")),
                    Status = reader.GetString(reader.GetOrdinal("status")),
                    CreatedAt = reader.GetDateTime(reader.GetOrdinal("created_at")),
                    CancellationReason = reader.IsDBNull(reader.GetOrdinal("cancellation_reason")) 
                        ? null : reader.GetString(reader.GetOrdinal("cancellation_reason")),
                    CancelledBy = reader.IsDBNull(reader.GetOrdinal("cancelled_by")) 
                        ? null : reader.GetString(reader.GetOrdinal("cancelled_by")),
                    CancelledAt = reader.IsDBNull(reader.GetOrdinal("cancelled_at")) 
                        ? null : reader.GetDateTime(reader.GetOrdinal("cancelled_at")),
                    UserName = reader.GetString(reader.GetOrdinal("user_name")),
                    UserEmail = reader.GetString(reader.GetOrdinal("user_email")),
                    UserPhone = reader.GetString(reader.GetOrdinal("user_phone")),
                    VehicleModel = reader.GetString(reader.GetOrdinal("vehicle_model")),
                    VehicleUniqueId = reader.GetString(reader.GetOrdinal("unique_vehicle_id")),
                    LicensePlate = reader.IsDBNull(reader.GetOrdinal("license_plate")) 
                        ? null : reader.GetString(reader.GetOrdinal("license_plate")),
                    StationName = reader.GetString(reader.GetOrdinal("station_name"))
                });
            }

            Console.WriteLine($"[GetStationReservations] Found {reservations.Count} reservations for staff {staffId}");
            return reservations;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[GetStationReservations] Error: {ex.Message}");
            return reservations;
        }
    }

    public async Task<List<StaffPaymentDto>> GetStationPaymentsAsync(int staffId)
    {
        var payments = new List<StaffPaymentDto>();
        
        try
        {
            const string sql = @"
                SELECT 
                    p.payment_id,
                    p.reservation_id,
                    p.rental_id,
                    p.user_id,
                    p.method_type,
                    p.amount,
                    p.status,
                    p.transaction_type,
                    p.transaction_id,
                    p.is_deposit,
                    p.created_at,
                    u.full_name as customer_name,
                    u.email as customer_email,
                    u.phone as customer_phone,
                    v.vehicle_id,
                    v.model_id as vehicle_model,
                    v.unique_vehicle_id
                FROM payments p
                LEFT JOIN users u ON p.user_id = u.user_id OR u.user_id = (
                    SELECT r.user_id FROM reservations r WHERE r.reservation_id = p.reservation_id
                )
                LEFT JOIN reservations r ON p.reservation_id = r.reservation_id
                LEFT JOIN vehicles v ON r.vehicle_id = v.vehicle_id
                INNER JOIN users staff_user ON v.station_id = staff_user.station_id OR v.station_id = (
                    SELECT station_id FROM users WHERE user_id = @StaffId
                )
                WHERE staff_user.user_id = @StaffId
                ORDER BY p.created_at DESC";

            await using var conn = _connFactory();
            await conn.OpenAsync();

            await using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@StaffId", staffId);

            await using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                payments.Add(new StaffPaymentDto
                {
                    PaymentId = reader.GetInt32(reader.GetOrdinal("payment_id")),
                    ReservationId = reader.IsDBNull(reader.GetOrdinal("reservation_id")) 
                        ? null : reader.GetInt32(reader.GetOrdinal("reservation_id")),
                    RentalId = reader.IsDBNull(reader.GetOrdinal("rental_id")) 
                        ? null : reader.GetInt32(reader.GetOrdinal("rental_id")),
                    UserId = reader.IsDBNull(reader.GetOrdinal("user_id")) 
                        ? null : reader.GetInt32(reader.GetOrdinal("user_id")),
                    CustomerName = reader.IsDBNull(reader.GetOrdinal("customer_name")) 
                        ? null : reader.GetString(reader.GetOrdinal("customer_name")),
                    CustomerEmail = reader.IsDBNull(reader.GetOrdinal("customer_email")) 
                        ? null : reader.GetString(reader.GetOrdinal("customer_email")),
                    CustomerPhone = reader.IsDBNull(reader.GetOrdinal("customer_phone")) 
                        ? null : reader.GetString(reader.GetOrdinal("customer_phone")),
                    VehicleId = reader.IsDBNull(reader.GetOrdinal("vehicle_id")) 
                        ? null : reader.GetInt32(reader.GetOrdinal("vehicle_id")),
                    VehicleModel = reader.IsDBNull(reader.GetOrdinal("vehicle_model")) 
                        ? null : reader.GetString(reader.GetOrdinal("vehicle_model")),
                    VehicleUniqueId = reader.IsDBNull(reader.GetOrdinal("unique_vehicle_id")) 
                        ? null : reader.GetString(reader.GetOrdinal("unique_vehicle_id")),
                    MethodType = reader.GetString(reader.GetOrdinal("method_type")),
                    Amount = reader.GetDecimal(reader.GetOrdinal("amount")),
                    Status = reader.GetString(reader.GetOrdinal("status")),
                    TransactionType = reader.IsDBNull(reader.GetOrdinal("transaction_type")) 
                        ? null : reader.GetString(reader.GetOrdinal("transaction_type")),
                    TransactionId = reader.IsDBNull(reader.GetOrdinal("transaction_id")) 
                        ? null : reader.GetString(reader.GetOrdinal("transaction_id")),
                    IsDeposit = reader.GetBoolean(reader.GetOrdinal("is_deposit")),
                    CreatedAt = reader.GetDateTime(reader.GetOrdinal("created_at"))
                });
            }

            Console.WriteLine($"[GetStationPayments] Found {payments.Count} payments for staff {staffId}");
            return payments;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[GetStationPayments] Error: {ex.Message}");
            return payments;
        }
    }
}
