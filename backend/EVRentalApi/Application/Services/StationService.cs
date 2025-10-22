using EVRentalApi.Models;
using EVRentalApi.Infrastructure.Repositories;

namespace EVRentalApi.Application.Services
{
    public class StationService : IStationService
    {
        private readonly IStationRepository _stationRepository;

        public StationService(IStationRepository stationRepository)
        {
            _stationRepository = stationRepository;
        }

        public async Task<IEnumerable<StationDto>> GetAllStationsAsync()
        {
            var stations = await _stationRepository.GetAllStationsAsync();
            return stations.Select(MapToDto);
        }

        public async Task<StationDto?> GetStationByIdAsync(int id)
        {
            var station = await _stationRepository.GetStationByIdAsync(id);
            return station != null ? MapToDto(station) : null;
        }

        public async Task<IEnumerable<VehicleDto>> GetVehiclesByStationIdAsync(int stationId)
        {
            var vehicles = await _stationRepository.GetVehiclesByStationIdAsync(stationId);
            return vehicles.Select(MapVehicleToDto);
        }

        public async Task<StationDto?> UpdateStationAsync(int id, StationUpdateRequest request)
        {
            var updatedStation = await _stationRepository.UpdateStationAsync(id, request);
            return updatedStation != null ? MapToDto(updatedStation) : null;
        }

        public async Task<StationDto?> UpdateAvailableVehiclesAsync(int stationId)
        {
            var updatedStation = await _stationRepository.UpdateAvailableVehiclesAsync(stationId);
            return updatedStation != null ? MapToDto(updatedStation) : null;
        }

        private static StationDto MapToDto(dynamic station)
        {
            return new StationDto
            {
                StationId = station.station_id,
                Name = station.name,
                Address = station.address,
                City = station.city,
                Latitude = station.latitude,
                Longitude = station.longitude,
                Status = station.status,
                AvailableVehicles = station.available_vehicles,
                TotalSlots = station.total_slots,
                Amenities = station.amenities,
                Rating = station.rating,
                OperatingHours = station.operating_hours,
                FastCharging = station.fast_charging,
                Image = station.image,
                CreatedAt = station.created_at,
                UpdatedAt = station.updated_at
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

