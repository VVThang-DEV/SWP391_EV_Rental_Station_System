using EVRentalApi.Models;

namespace EVRentalApi.Infrastructure.Repositories
{
    public interface IStationRepository
    {
        Task<IEnumerable<dynamic>> GetAllStationsAsync();
        Task<dynamic?> GetStationByIdAsync(int id);
        Task<IEnumerable<dynamic>> GetVehiclesByStationIdAsync(int stationId);
        Task<dynamic?> UpdateStationAsync(int id, StationUpdateRequest request);
        Task<dynamic?> UpdateAvailableVehiclesAsync(int stationId);
    }
}

