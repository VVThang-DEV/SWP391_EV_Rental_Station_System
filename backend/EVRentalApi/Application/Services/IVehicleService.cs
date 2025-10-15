using EVRentalApi.Models;

namespace EVRentalApi.Application.Services
{
    public interface IVehicleService
    {
        Task<IEnumerable<VehicleDto>> GetAllVehiclesAsync();
        Task<VehicleDto?> GetVehicleByIdAsync(int id);
        Task<IEnumerable<VehicleDto>> GetAvailableVehiclesAsync();
        Task<IEnumerable<VehicleDto>> GetVehiclesByModelIdAsync(string modelId);
        Task<IEnumerable<VehicleDto>> GetVehiclesByStationIdAsync(int stationId);
    }
}
