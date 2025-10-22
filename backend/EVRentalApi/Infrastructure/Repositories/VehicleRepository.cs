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
                       v.insurance_expiry, v.condition, v.image, v.license_plate, v.fuel_efficiency, 
                       v.location, v.created_at, v.updated_at
                FROM vehicles v
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
                       v.insurance_expiry, v.condition, v.image, v.license_plate, v.fuel_efficiency, 
                       v.location, v.created_at, v.updated_at
                FROM vehicles v
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
                       v.insurance_expiry, v.condition, v.image, v.license_plate, v.fuel_efficiency, 
                       v.location, v.created_at, v.updated_at
                FROM vehicles v
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
                       v.insurance_expiry, v.condition, v.image, v.license_plate, v.fuel_efficiency, 
                       v.location, v.created_at, v.updated_at
                FROM vehicles v
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
                       v.insurance_expiry, v.condition, v.image, v.license_plate, v.fuel_efficiency, 
                       v.location, v.created_at, v.updated_at
                FROM vehicles v
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
                       v.insurance_expiry, v.condition, v.image, v.license_plate, v.fuel_efficiency, 
                       v.location, v.created_at, v.updated_at
                FROM vehicles v
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

        public async Task<dynamic?> CreateVehicleAsync(AdminCreateVehicleRequest request)
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();
            
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
            
            using var reader = await command.ExecuteReaderAsync();
            
            if (await reader.ReadAsync())
            {
                return CreateVehicleObject(reader);
            }
            
            return null;
        }

        private static dynamic CreateVehicleObject(SqlDataReader reader)
        {
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
                image = reader.IsDBNull("image") ? "" : reader.GetString("image"),
                license_plate = reader.IsDBNull("license_plate") ? "" : reader.GetString("license_plate"),
                fuel_efficiency = reader.IsDBNull("fuel_efficiency") ? "" : reader.GetString("fuel_efficiency"),
                location = reader.IsDBNull("location") ? "" : reader.GetString("location"),
                created_at = reader.IsDBNull("created_at") ? DateTime.Now : reader.GetDateTime("created_at"),
                updated_at = reader.IsDBNull("updated_at") ? DateTime.Now : reader.GetDateTime("updated_at")
            };
        }
    }
}
