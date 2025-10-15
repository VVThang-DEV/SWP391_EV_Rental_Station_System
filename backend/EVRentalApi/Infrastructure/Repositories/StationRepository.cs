using System.Data;
using Microsoft.Data.SqlClient;

namespace EVRentalApi.Infrastructure.Repositories
{
    public class StationRepository : IStationRepository
    {
        private readonly string _connectionString;

        public StationRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") 
                ?? throw new ArgumentNullException(nameof(configuration));
        }

        public async Task<IEnumerable<dynamic>> GetAllStationsAsync()
        {
            var stations = new List<dynamic>();
            
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();
            
            var query = @"
                SELECT station_id, name, latitude, longitude, address, status, 
                       city, available_vehicles, total_slots, amenities, rating, 
                       operating_hours, fast_charging, image, created_at, updated_at
                FROM stations
                ORDER BY station_id";
            
            using var command = new SqlCommand(query, connection);
            using var reader = await command.ExecuteReaderAsync();
            
            while (await reader.ReadAsync())
            {
                stations.Add(new
                {
                    station_id = reader.GetInt32("station_id"),
                    name = reader.GetString("name"),
                    latitude = reader.GetDecimal("latitude"),
                    longitude = reader.GetDecimal("longitude"),
                    address = reader.GetString("address"),
                    status = reader.GetString("status"),
                    city = reader.IsDBNull("city") ? "" : reader.GetString("city"),
                    available_vehicles = reader.IsDBNull("available_vehicles") ? 0 : reader.GetInt32("available_vehicles"),
                    total_slots = reader.IsDBNull("total_slots") ? 0 : reader.GetInt32("total_slots"),
                    amenities = reader.IsDBNull("amenities") ? "" : reader.GetString("amenities"),
                    rating = reader.IsDBNull("rating") ? 0 : reader.GetDecimal("rating"),
                    operating_hours = reader.IsDBNull("operating_hours") ? "" : reader.GetString("operating_hours"),
                    fast_charging = reader.IsDBNull("fast_charging") ? false : reader.GetBoolean("fast_charging"),
                    image = reader.IsDBNull("image") ? "" : reader.GetString("image"),
                    created_at = reader.GetDateTime("created_at"),
                    updated_at = reader.GetDateTime("updated_at")
                });
            }
            
            return stations;
        }

        public async Task<dynamic?> GetStationByIdAsync(int id)
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();
            
            var query = @"
                SELECT station_id, name, latitude, longitude, address, status, 
                       city, available_vehicles, total_slots, amenities, rating, 
                       operating_hours, fast_charging, image, created_at, updated_at
                FROM stations
                WHERE station_id = @StationId";
            
            using var command = new SqlCommand(query, connection);
            command.Parameters.AddWithValue("@StationId", id);
            
            using var reader = await command.ExecuteReaderAsync();
            
            if (await reader.ReadAsync())
            {
                return new
                {
                    station_id = reader.GetInt32("station_id"),
                    name = reader.GetString("name"),
                    latitude = reader.GetDecimal("latitude"),
                    longitude = reader.GetDecimal("longitude"),
                    address = reader.GetString("address"),
                    status = reader.GetString("status"),
                    city = reader.IsDBNull("city") ? "" : reader.GetString("city"),
                    available_vehicles = reader.IsDBNull("available_vehicles") ? 0 : reader.GetInt32("available_vehicles"),
                    total_slots = reader.IsDBNull("total_slots") ? 0 : reader.GetInt32("total_slots"),
                    amenities = reader.IsDBNull("amenities") ? "" : reader.GetString("amenities"),
                    rating = reader.IsDBNull("rating") ? 0 : reader.GetDecimal("rating"),
                    operating_hours = reader.IsDBNull("operating_hours") ? "" : reader.GetString("operating_hours"),
                    fast_charging = reader.IsDBNull("fast_charging") ? false : reader.GetBoolean("fast_charging"),
                    image = reader.IsDBNull("image") ? "" : reader.GetString("image"),
                    created_at = reader.GetDateTime("created_at"),
                    updated_at = reader.GetDateTime("updated_at")
                };
            }
            
            return null;
        }

        public async Task<IEnumerable<dynamic>> GetVehiclesByStationIdAsync(int stationId)
        {
            var vehicles = new List<dynamic>();
            
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();
            
            var query = @"
                SELECT vehicle_id, model_id, station_id, unique_vehicle_id, battery_level, 
                       max_range_km, status, price_per_hour, price_per_day, rating, 
                       review_count, trips, mileage, last_maintenance, inspection_date, 
                       insurance_expiry, condition, image, license_plate, fuel_efficiency, 
                       location, created_at, updated_at
                FROM vehicles
                WHERE station_id = @StationId
                ORDER BY vehicle_id";
            
            using var command = new SqlCommand(query, connection);
            command.Parameters.AddWithValue("@StationId", stationId);
            
            using var reader = await command.ExecuteReaderAsync();
            
            while (await reader.ReadAsync())
            {
                vehicles.Add(new
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
                });
            }
            
            return vehicles;
        }
    }
}
