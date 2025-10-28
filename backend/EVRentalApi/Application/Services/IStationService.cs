using EVRentalApi.Models;

namespace EVRentalApi.Application.Services
{
    public interface IStationService
    {
        Task<IEnumerable<StationDto>> GetAllStationsAsync();
        Task<StationDto?> GetStationByIdAsync(int id);
        Task<IEnumerable<VehicleDto>> GetVehiclesByStationIdAsync(int stationId);
        Task<StationDto?> UpdateStationAsync(int id, StationUpdateRequest request);
        Task<StationDto?> UpdateAvailableVehiclesAsync(int stationId);
    }
}

