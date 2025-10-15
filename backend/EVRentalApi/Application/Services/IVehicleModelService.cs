using EVRentalApi.Models;

namespace EVRentalApi.Application.Services
{
    public interface IVehicleModelService
    {
        Task<IEnumerable<VehicleModelDto>> GetAllVehicleModelsAsync();
        Task<VehicleModelDto?> GetVehicleModelByIdAsync(string modelId);
        Task<IEnumerable<VehicleDto>> GetVehiclesByModelIdAsync(string modelId);
    }
}

