namespace EVRentalApi.Infrastructure.Repositories
{
    public interface IVehicleModelRepository
    {
        Task<IEnumerable<dynamic>> GetAllVehicleModelsAsync();
        Task<dynamic?> GetVehicleModelByIdAsync(string modelId);
        Task<IEnumerable<dynamic>> GetVehiclesByModelIdAsync(string modelId);
    }
}
