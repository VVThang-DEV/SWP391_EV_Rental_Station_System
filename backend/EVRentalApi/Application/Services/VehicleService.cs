using EVRentalApi.Models;
using EVRentalApi.Infrastructure.Repositories;

namespace EVRentalApi.Application.Services
{
    public class VehicleService : IVehicleService
    {
        private readonly IVehicleRepository _vehicleRepository;

        public VehicleService(IVehicleRepository vehicleRepository)
        {
            _vehicleRepository = vehicleRepository;
        }

        public async Task<IEnumerable<VehicleDto>> GetAllVehiclesAsync()
        {
            var vehicles = await _vehicleRepository.GetAllVehiclesAsync();
            return vehicles.Select(MapToDto);
        }

        public async Task<VehicleDto?> GetVehicleByIdAsync(int id)
        {
            var vehicle = await _vehicleRepository.GetVehicleByIdAsync(id);
            return vehicle != null ? MapToDto(vehicle) : null;
        }

        public async Task<IEnumerable<VehicleDto>> GetAvailableVehiclesAsync()
        {
            var vehicles = await _vehicleRepository.GetAvailableVehiclesAsync();
            return vehicles.Select(MapToDto);
        }

        public async Task<IEnumerable<VehicleDto>> GetVehiclesByModelIdAsync(string modelId)
        {
            var vehicles = await _vehicleRepository.GetVehiclesByModelIdAsync(modelId);
            return vehicles.Select(MapToDto);
        }

        public async Task<IEnumerable<VehicleDto>> GetVehiclesByStationIdAsync(int stationId)
        {
            var vehicles = await _vehicleRepository.GetVehiclesByStationIdAsync(stationId);
            return vehicles.Select(MapToDto);
        }

        private static VehicleDto MapToDto(dynamic vehicle)
        {
            return new VehicleDto
            {
                VehicleId = vehicle.vehicle_id,
                ModelId = vehicle.model_id,
                StationId = vehicle.station_id,
                UniqueVehicleId = vehicle.unique_vehicle_id,
                BatteryLevel = vehicle.battery_level,
                MaxRangeKm = vehicle.max_range_km,
                Status = vehicle.status,
                PricePerHour = vehicle.price_per_hour,
                PricePerDay = vehicle.price_per_day,
                Rating = vehicle.rating,
                ReviewCount = vehicle.review_count,
                Trips = vehicle.trips,
                Mileage = vehicle.mileage,
                LastMaintenance = vehicle.last_maintenance,
                InspectionDate = vehicle.inspection_date,
                InsuranceExpiry = vehicle.insurance_expiry,
                Condition = vehicle.condition,
                Image = vehicle.image,
                LicensePlate = vehicle.license_plate,
                FuelEfficiency = vehicle.fuel_efficiency,
                Location = vehicle.location,
                CreatedAt = vehicle.created_at,
                UpdatedAt = vehicle.updated_at
            };
        }
    }
}
