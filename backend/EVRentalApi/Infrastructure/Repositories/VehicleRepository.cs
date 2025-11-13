using System.Data;
using Microsoft.Data.SqlClient;
using EVRentalApi.Models;

namespace EVRentalApi.Infrastructure.Repositories
{
    public class VehicleRepository : IVehicleRepository
    {
        private readonly string _connectionString;

        public VehicleRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") 
                ?? throw new ArgumentNullException(nameof(configuration));
        }

        public async Task<IEnumerable<dynamic>> GetAllVehiclesAsync()
        {
            var vehicles = new List<dynamic>();
            
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();
            
            var query = @"
                SELECT v.vehicle_id, v.model_id, v.station_id, v.unique_vehicle_id, v.battery_level, 
                       v.max_range_km, v.status, v.price_per_hour, v.price_per_day, v.rating, 
                       v.review_count, v.trips, v.mileage, v.last_maintenance, v.inspection_date,  
                       v.insurance_expiry, v.condition, COALESCE(v.image, vm.image) AS image, 
                       v.license_plate, v.fuel_efficiency, COALESCE(s.name, v.location) AS location, 
                       v.created_at, v.updated_at
                FROM vehicles v
                LEFT JOIN stations s ON v.station_id = s.station_id
                LEFT JOIN vehicle_models vm ON v.model_id = vm.model_id
                ORDER BY v.vehicle_id";
            
            using var command = new SqlCommand(query, connection);
            using var reader = await command.ExecuteReaderAsync();
            
            while (await reader.ReadAsync())
            {
                vehicles.Add(CreateVehicleObject(reader));
            }
            
            return vehicles;
        }

        public async Task<dynamic?> GetVehicleByIdAsync(int id)
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();
            
            var query = @"
                SELECT v.vehicle_id, v.model_id, v.station_id, v.unique_vehicle_id, v.battery_level, 
                       v.max_range_km, v.status, v.price_per_hour, v.price_per_day, v.rating, 
                       v.review_count, v.trips, v.mileage, v.last_maintenance, v.inspection_date,  
                       v.insurance_expiry, v.condition, COALESCE(v.image, vm.image) AS image, 
                       v.license_plate, v.fuel_efficiency, COALESCE(s.name, v.location) AS location, 
                       v.created_at, v.updated_at
                FROM vehicles v
                LEFT JOIN stations s ON v.station_id = s.station_id
                LEFT JOIN vehicle_models vm ON v.model_id = vm.model_id
                WHERE v.vehicle_id = @VehicleId";
            
            using var command = new SqlCommand(query, connection);
            command.Parameters.AddWithValue("@VehicleId", id);
            
            using var reader = await command.ExecuteReaderAsync();
            
            if (await reader.ReadAsync())
            {
                return CreateVehicleObject(reader);
            }
            
            return null;
        }

        public async Task<IEnumerable<dynamic>> GetAvailableVehiclesAsync()
        {
            var vehicles = new List<dynamic>();
            
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();
            
            var query = @"
                SELECT v.vehicle_id, v.model_id, v.station_id, v.unique_vehicle_id, v.battery_level, 
                       v.max_range_km, v.status, v.price_per_hour, v.price_per_day, v.rating, 
                       v.review_count, v.trips, v.mileage, v.last_maintenance, v.inspection_date,  
                       v.insurance_expiry, v.condition, COALESCE(v.image, vm.image) AS image, 
                       v.license_plate, v.fuel_efficiency, COALESCE(s.name, v.location) AS location, 
                       v.created_at, v.updated_at
                FROM vehicles v
                LEFT JOIN stations s ON v.station_id = s.station_id
                LEFT JOIN vehicle_models vm ON v.model_id = vm.model_id
                WHERE v.status = 'available'
                ORDER BY v.vehicle_id";
            
            using var command = new SqlCommand(query, connection);
            using var reader = await command.ExecuteReaderAsync();
            
            while (await reader.ReadAsync())
            {
                vehicles.Add(CreateVehicleObject(reader));
            }
            
            return vehicles;
        }

        public async Task<IEnumerable<dynamic>> GetVehiclesByModelIdAsync(string modelId)
        {
            var vehicles = new List<dynamic>();
            
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();
            
            var query = @"
                SELECT v.vehicle_id, v.model_id, v.station_id, v.unique_vehicle_id, v.battery_level, 
                       v.max_range_km, v.status, v.price_per_hour, v.price_per_day, v.rating, 
                       v.review_count, v.trips, v.mileage, v.last_maintenance, v.inspection_date,  
                       v.insurance_expiry, v.condition, COALESCE(v.image, vm.image) AS image, 
                       v.license_plate, v.fuel_efficiency, COALESCE(s.name, v.location) AS location, 
                       v.created_at, v.updated_at
                FROM vehicles v
                LEFT JOIN stations s ON v.station_id = s.station_id
                LEFT JOIN vehicle_models vm ON v.model_id = vm.model_id
                WHERE v.model_id = @ModelId
                ORDER BY v.vehicle_id";
            
            using var command = new SqlCommand(query, connection);
            command.Parameters.AddWithValue("@ModelId", modelId);
            
            using var reader = await command.ExecuteReaderAsync();
            
            while (await reader.ReadAsync())
            {
                vehicles.Add(CreateVehicleObject(reader));
            }
            
            return vehicles;
        }

        public async Task<IEnumerable<dynamic>> GetVehiclesByStationIdAsync(int stationId)
        {
            var vehicles = new List<dynamic>();
            
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();
            
            var query = @"
                SELECT v.vehicle_id, v.model_id, v.station_id, v.unique_vehicle_id, v.battery_level, 
                       v.max_range_km, v.status, v.price_per_hour, v.price_per_day, v.rating, 
                       v.review_count, v.trips, v.mileage, v.last_maintenance, v.inspection_date,  
                       v.insurance_expiry, v.condition, COALESCE(v.image, vm.image) AS image, 
                       v.license_plate, v.fuel_efficiency, COALESCE(s.name, v.location) AS location, 
                       v.created_at, v.updated_at
                FROM vehicles v
                LEFT JOIN stations s ON v.station_id = s.station_id
                LEFT JOIN vehicle_models vm ON v.model_id = vm.model_id
                WHERE v.station_id = @StationId
                ORDER BY v.vehicle_id";
            
            using var command = new SqlCommand(query, connection);
            command.Parameters.AddWithValue("@StationId", stationId);
            
            using var reader = await command.ExecuteReaderAsync();
            
            while (await reader.ReadAsync())
            {
                vehicles.Add(CreateVehicleObject(reader));
            }
            
            return vehicles;
        }

        public async Task<IEnumerable<dynamic>> GetUnassignedVehiclesAsync()
        {
            var vehicles = new List<dynamic>();
            
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();
            
            var query = @"
                SELECT v.vehicle_id, v.model_id, v.station_id, v.unique_vehicle_id, v.battery_level, 
                       v.max_range_km, v.status, v.price_per_hour, v.price_per_day, v.rating, 
                       v.review_count, v.trips, v.mileage, v.last_maintenance, v.inspection_date,  
                       v.insurance_expiry, v.condition, COALESCE(v.image, vm.image) AS image, 
                       v.license_plate, v.fuel_efficiency, v.location, v.created_at, v.updated_at
                FROM vehicles v
                LEFT JOIN vehicle_models vm ON v.model_id = vm.model_id
                WHERE v.station_id IS NULL
                ORDER BY v.vehicle_id";
            
            using var command = new SqlCommand(query, connection);
            using var reader = await command.ExecuteReaderAsync();
            
            while (await reader.ReadAsync())
            {
                vehicles.Add(CreateVehicleObject(reader));
            }
            
            return vehicles;
        }

        public async Task<bool> AssignVehicleToStationAsync(int vehicleId, int stationId, string location)
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();
            
            var query = @"
                UPDATE vehicles 
                SET station_id = @StationId, 
                    location = @Location,
                    updated_at = GETDATE()
                WHERE vehicle_id = @VehicleId";
            
            using var command = new SqlCommand(query, connection);
            command.Parameters.AddWithValue("@VehicleId", vehicleId);
            command.Parameters.AddWithValue("@StationId", stationId);
            command.Parameters.AddWithValue("@Location", location);
            
            var rowsAffected = await command.ExecuteNonQueryAsync();
            return rowsAffected > 0;
        }

        public async Task<bool> CheckDuplicateLicensePlateAsync(string licensePlate)
        {
            if (string.IsNullOrWhiteSpace(licensePlate))
            {
                return false; // Empty license plate is not considered duplicate
            }

            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();
            
            // Use case-insensitive comparison and trim whitespace
            var query = @"
                SELECT COUNT(*) 
                FROM vehicles 
                WHERE LTRIM(RTRIM(UPPER(license_plate))) = LTRIM(RTRIM(UPPER(@LicensePlate)))
                  AND license_plate IS NOT NULL";
            
            using var command = new SqlCommand(query, connection);
            command.Parameters.AddWithValue("@LicensePlate", licensePlate.Trim());
            
            var count = (int)await command.ExecuteScalarAsync();
            return count > 0;
        }

        public async Task<bool> CheckDuplicateVINAsync(string uniqueVehicleId)
        {
            if (string.IsNullOrWhiteSpace(uniqueVehicleId))
            {
                return false; // Empty VIN is not considered duplicate
            }

            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();
            
            // Use case-insensitive comparison and trim whitespace
            var query = @"
                SELECT COUNT(*) 
                FROM vehicles 
                WHERE LTRIM(RTRIM(UPPER(unique_vehicle_id))) = LTRIM(RTRIM(UPPER(@UniqueVehicleId)))
                  AND unique_vehicle_id IS NOT NULL";
            
            using var command = new SqlCommand(query, connection);
            command.Parameters.AddWithValue("@UniqueVehicleId", uniqueVehicleId.Trim());
            
            var count = (int)await command.ExecuteScalarAsync();
            return count > 0;
        }

        public async Task<dynamic?> CreateVehicleAsync(AdminCreateVehicleRequest request)
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();
            
            // First, check if model exists
            var checkModelQuery = "SELECT COUNT(*) FROM vehicle_models WHERE model_id = @ModelId";
            using var checkCommand = new SqlCommand(checkModelQuery, connection);
            checkCommand.Parameters.AddWithValue("@ModelId", request.ModelId);
            var modelExists = (int)await checkCommand.ExecuteScalarAsync() > 0;
            
            if (!modelExists)
            {
                throw new InvalidOperationException($"Vehicle model '{request.ModelId}' does not exist in the system.");
            }
            
            var query = @"
                INSERT INTO vehicles (
                    model_id, station_id, unique_vehicle_id, battery_level, 
                    condition, mileage, license_plate, last_maintenance, 
                    inspection_date, insurance_expiry, location, color, year, battery_capacity, 
                    purchase_date, warranty_expiry, next_maintenance_date, notes,
                    price_per_hour, price_per_day, max_range_km,
                    rating, review_count, trips, image, fuel_efficiency,
                    status, created_at, updated_at
                )
                OUTPUT INSERTED.vehicle_id, INSERTED.model_id, INSERTED.station_id, 
                       INSERTED.unique_vehicle_id, INSERTED.battery_level, 
                       INSERTED.condition, INSERTED.mileage, INSERTED.license_plate, 
                       INSERTED.last_maintenance, INSERTED.inspection_date, INSERTED.insurance_expiry, INSERTED.location, 
                       INSERTED.color, INSERTED.year, INSERTED.battery_capacity,
                       INSERTED.purchase_date, INSERTED.warranty_expiry,
                       INSERTED.next_maintenance_date, INSERTED.notes,
                       INSERTED.price_per_hour, INSERTED.price_per_day, INSERTED.max_range_km,
                       INSERTED.rating, INSERTED.review_count, INSERTED.trips, INSERTED.image,
                       INSERTED.fuel_efficiency, INSERTED.status, INSERTED.created_at, INSERTED.updated_at
                SELECT 
                    @ModelId, NULL, @UniqueVehicleId, @BatteryLevel,
                    @Condition, @Mileage, @LicensePlate, @LastMaintenance,
                    @InspectionDate, @InsuranceExpiry, @Location, @Color, @Year, @BatteryCapacity, 
                    @PurchaseDate, @WarrantyExpiry, @NextMaintenanceDate, @Notes,
                    vm.price_per_hour, vm.price_per_day, vm.max_range_km,
                    0, 0, 0, vm.image, @FuelEfficiency,
                    'available', GETDATE(), GETDATE()
                FROM vehicle_models vm
                WHERE vm.model_id = @ModelId";
            
            using var command = new SqlCommand(query, connection);
            command.Parameters.AddWithValue("@ModelId", request.ModelId);
            command.Parameters.AddWithValue("@UniqueVehicleId", request.UniqueVehicleId ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@BatteryLevel", request.BatteryLevel);
            command.Parameters.AddWithValue("@Condition", request.Condition);
            command.Parameters.AddWithValue("@Mileage", request.Mileage);
            command.Parameters.AddWithValue("@LicensePlate", request.LicensePlate ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@LastMaintenance", request.LastMaintenance ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@InspectionDate", request.InspectionDate ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@InsuranceExpiry", request.InsuranceExpiry ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@Location", request.Location ?? (object)DBNull.Value);
            // Các trường mới
            command.Parameters.AddWithValue("@Color", request.Color ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@Year", request.Year ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@BatteryCapacity", request.BatteryCapacity ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@PurchaseDate", request.PurchaseDate ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@WarrantyExpiry", request.WarrantyExpiry ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@NextMaintenanceDate", request.NextMaintenanceDate ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@FuelEfficiency", request.FuelEfficiency ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@Notes", request.Notes ?? (object)DBNull.Value);
            
            try
            {
                using var reader = await command.ExecuteReaderAsync();
                
                if (await reader.ReadAsync())
                {
                    return CreateVehicleObject(reader);
                }
                
                return null;
            }
            catch (SqlException sqlEx)
            {
                // Re-throw with more descriptive message
                if (sqlEx.Number == 2627 || sqlEx.Number == 2601) // Unique constraint violation
                {
                    if (sqlEx.Message.Contains("license_plate"))
                    {
                        throw new InvalidOperationException($"License Plate Number '{request.LicensePlate}' already exists. Please use a different license plate.");
                    }
                    else if (sqlEx.Message.Contains("unique_vehicle_id"))
                    {
                        throw new InvalidOperationException($"VIN (Vehicle Identification Number) '{request.UniqueVehicleId}' already exists. Please use a different VIN.");
                    }
                    else
                    {
                        throw new InvalidOperationException("A duplicate entry was detected. Please check License Plate and VIN are unique.");
                    }
                }
                throw; // Re-throw other SQL exceptions
            }
        }

        private static string ValidateAndFixImageUrl(string? imageUrl)
        {
            if (string.IsNullOrWhiteSpace(imageUrl))
            {
                return "";
            }

            // Remove whitespace
            imageUrl = imageUrl.Trim();

            // Check if URL contains invalid patterns like "https://.../" or "http://.../"
            if (imageUrl.Contains("://...") || imageUrl.StartsWith("...") || 
                (imageUrl.StartsWith("https://") && !imageUrl.Contains(".") && imageUrl.Length < 20))
            {
                return ""; // Return empty to use fallback from vehicle_models
            }

            // Check if it's a valid URL format
            if (Uri.TryCreate(imageUrl, UriKind.Absolute, out var uri) && 
                (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps))
            {
                return imageUrl;
            }

            // If it's a relative path, return empty to use fallback
            if (imageUrl.StartsWith("/") || imageUrl.StartsWith("./"))
            {
                return ""; // Return empty to use fallback
            }

            // If it doesn't look like a valid URL, return empty
            return "";
        }

        private static dynamic CreateVehicleObject(SqlDataReader reader)
        {
            var rawImage = reader.IsDBNull("image") ? "" : reader.GetString("image");
            var validatedImage = ValidateAndFixImageUrl(rawImage);

            return new
            {
                vehicle_id = reader.GetInt32("vehicle_id"),
                model_id = reader.GetString("model_id"),
                station_id = reader.IsDBNull("station_id") ? 0 : reader.GetInt32("station_id"),
                unique_vehicle_id = reader.IsDBNull("unique_vehicle_id") ? "" : reader.GetString("unique_vehicle_id"),
                battery_level = reader.GetInt32("battery_level"),
                max_range_km = reader.IsDBNull("max_range_km") ? 0 : reader.GetInt32("max_range_km"),
                status = reader.GetString("status"),
                price_per_hour = reader.GetDecimal("price_per_hour"),
                price_per_day = reader.IsDBNull("price_per_day") ? 0 : reader.GetDecimal("price_per_day"),
                rating = reader.IsDBNull("rating") ? 0 : reader.GetDecimal("rating"),
                review_count = reader.IsDBNull("review_count") ? 0 : reader.GetInt32("review_count"),
                trips = reader.IsDBNull("trips") ? 0 : reader.GetInt32("trips"),
                mileage = reader.IsDBNull("mileage") ? 0 : reader.GetInt32("mileage"),
                last_maintenance = reader.IsDBNull("last_maintenance") ? null : reader.GetDateTime("last_maintenance").ToString("yyyy-MM-dd"),
                inspection_date = reader.IsDBNull("inspection_date") ? null : reader.GetDateTime("inspection_date").ToString("yyyy-MM-dd"),
                insurance_expiry = reader.IsDBNull("insurance_expiry") ? null : reader.GetDateTime("insurance_expiry").ToString("yyyy-MM-dd"),
                condition = reader.IsDBNull("condition") ? "unknown" : reader.GetString("condition"),
                image = validatedImage, // Use validated image URL
                license_plate = reader.IsDBNull("license_plate") ? "" : reader.GetString("license_plate"),
                fuel_efficiency = reader.IsDBNull("fuel_efficiency") ? "" : reader.GetString("fuel_efficiency"),
                location = reader.IsDBNull("location") ? "" : reader.GetString("location"),
                created_at = reader.IsDBNull("created_at") ? DateTime.Now : reader.GetDateTime("created_at"),
                updated_at = reader.IsDBNull("updated_at") ? DateTime.Now : reader.GetDateTime("updated_at")
            };
        }
    }
}
