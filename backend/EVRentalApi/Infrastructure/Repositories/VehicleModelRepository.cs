using System.Data;
using Microsoft.Data.SqlClient;

namespace EVRentalApi.Infrastructure.Repositories
{
    public class VehicleModelRepository : IVehicleModelRepository
    {
        private readonly string _connectionString;

        public VehicleModelRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") 
                ?? throw new ArgumentNullException(nameof(configuration));
        }

        public async Task<IEnumerable<dynamic>> GetAllVehicleModelsAsync()
        {
            var models = new List<dynamic>();
            
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();
            
            var query = @"
                SELECT model_id, brand, model_name, type, year, seats, features, 
                       description, image, price_per_hour, price_per_day, max_range_km, 
                       created_at, updated_at
                FROM vehicle_models
                ORDER BY model_id";
            
            using var command = new SqlCommand(query, connection);
            using var reader = await command.ExecuteReaderAsync();
            
            while (await reader.ReadAsync())
            {
                models.Add(CreateModelObject(reader));
            }
            
            return models;
        }

        public async Task<dynamic?> GetVehicleModelByIdAsync(string modelId)
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();
            
            var query = @"
                SELECT model_id, brand, model_name, type, year, seats, features, 
                       description, image, price_per_hour, price_per_day, max_range_km, 
                       created_at, updated_at
                FROM vehicle_models
                WHERE model_id = @ModelId";
            
            using var command = new SqlCommand(query, connection);
            command.Parameters.AddWithValue("@ModelId", modelId);
            
            using var reader = await command.ExecuteReaderAsync();
            
            if (await reader.ReadAsync())
            {
                return CreateModelObject(reader);
            }
            
            return null;
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

        private static dynamic CreateModelObject(SqlDataReader reader)
        {
            return new
            {
                model_id = reader.GetString("model_id"),
                brand = reader.GetString("brand"),
                model_name = reader.GetString("model_name"),
                type = reader.GetString("type"),
                year = reader.GetInt32("year"),
                seats = reader.GetInt32("seats"),
                features = reader.GetString("features"),
                description = reader.GetString("description"),
                image = reader.IsDBNull("image") ? "" : reader.GetString("image"),
                price_per_hour = reader.IsDBNull("price_per_hour") ? 0 : reader.GetDecimal("price_per_hour"),
                price_per_day = reader.IsDBNull("price_per_day") ? 0 : reader.GetDecimal("price_per_day"),
                max_range_km = reader.IsDBNull("max_range_km") ? 0 : reader.GetInt32("max_range_km"),
                created_at = reader.GetDateTime("created_at"),
                updated_at = reader.GetDateTime("updated_at")
            };
        }

        private static dynamic CreateVehicleObject(SqlDataReader reader)
        {
            return new
            {
                vehicle_id = reader.GetInt32("vehicle_id"),
                model_id = reader.GetString("model_id"),
                station_id = reader.GetInt32("station_id"),
                unique_vehicle_id = reader.GetString("unique_vehicle_id"),
                battery_level = reader.GetInt32("battery_level"),
                max_range_km = reader.GetInt32("max_range_km"),
                status = reader.GetString("status"),
                price_per_hour = reader.GetDecimal("price_per_hour"),
                price_per_day = reader.GetDecimal("price_per_day"),
                rating = reader.GetDecimal("rating"),
                review_count = reader.GetInt32("review_count"),
                trips = reader.GetInt32("trips"),
                mileage = reader.GetInt32("mileage"),
                last_maintenance = reader.GetString("last_maintenance"),
                inspection_date = reader.GetString("inspection_date"),
                insurance_expiry = reader.GetString("insurance_expiry"),
                condition = reader.GetString("condition"),
                image = reader.IsDBNull("image") ? "" : reader.GetString("image"),
                license_plate = reader.IsDBNull("license_plate") ? "" : reader.GetString("license_plate"),
                fuel_efficiency = reader.IsDBNull("fuel_efficiency") ? "" : reader.GetString("fuel_efficiency"),
                location = reader.IsDBNull("location") ? "" : reader.GetString("location"),
                created_at = reader.GetDateTime("created_at"),
                updated_at = reader.GetDateTime("updated_at")
            };
        }
    }
}
