using EVRentalApi.Models;
using EVRentalApi.Infrastructure.Repositories;

namespace EVRentalApi.Application.Services
{
    public class VehicleModelService : IVehicleModelService
    {
        private readonly IVehicleModelRepository _vehicleModelRepository;

        public VehicleModelService(IVehicleModelRepository vehicleModelRepository)
        {
            _vehicleModelRepository = vehicleModelRepository;
        }

        public async Task<IEnumerable<VehicleModelDto>> GetAllVehicleModelsAsync()
        {
            var models = await _vehicleModelRepository.GetAllVehicleModelsAsync();
            return models.Select(MapToDto);
        }

        public async Task<VehicleModelDto?> GetVehicleModelByIdAsync(string modelId)
        {
            var model = await _vehicleModelRepository.GetVehicleModelByIdAsync(modelId);
            return model != null ? MapToDto(model) : null;
        }

        public async Task<IEnumerable<VehicleDto>> GetVehiclesByModelIdAsync(string modelId)
        {
            var vehicles = await _vehicleModelRepository.GetVehiclesByModelIdAsync(modelId);
            return vehicles.Select(MapVehicleToDto);
        }

        private static VehicleModelDto MapToDto(dynamic model)
        {
            return new VehicleModelDto
            {
                ModelId = model.model_id,
                Brand = model.brand,
                ModelName = model.model_name,
                Type = model.type,
                Year = model.year,
                Seats = model.seats,
                Features = model.features,
                Description = model.description,
                Image = model.image,
                PricePerHour = model.price_per_hour,
                PricePerDay = model.price_per_day,
                MaxRangeKm = model.max_range_km,
                CreatedAt = model.created_at,
                UpdatedAt = model.updated_at
            };
        }

        private static VehicleDto MapVehicleToDto(dynamic vehicle)
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
