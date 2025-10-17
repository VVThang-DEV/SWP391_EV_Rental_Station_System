namespace EVRentalApi.Infrastructure.Repositories
{
    public interface IVehicleRepository
    {
        Task<IEnumerable<dynamic>> GetAllVehiclesAsync();
        Task<dynamic?> GetVehicleByIdAsync(int id);
        Task<IEnumerable<dynamic>> GetAvailableVehiclesAsync();
        Task<IEnumerable<dynamic>> GetVehiclesByModelIdAsync(string modelId);
        Task<IEnumerable<dynamic>> GetVehiclesByStationIdAsync(int stationId);
    }
}

