namespace EVRentalApi.Infrastructure.Repositories
{
    public interface ICustomerRepository
    {
        Task<IEnumerable<dynamic>> GetAllCustomersAsync();
        Task<dynamic?> GetCustomerByIdAsync(int userId);
        Task<dynamic?> GetCustomerStatsAsync(int userId);
        Task<bool> UpdateCustomerAsync(int userId, UpdateCustomerRequest request);
    }

    public class UpdateCustomerRequest
    {
        public string? FullName { get; set; }
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public bool? IsActive { get; set; }
    }
}

