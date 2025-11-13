using EVRentalApi.Models;
using EVRentalApi.Infrastructure.Repositories;

namespace EVRentalApi.Application.Services
{
    public interface ICustomerService
    {
        Task<IEnumerable<CustomerDto>> GetAllCustomersAsync();
        Task<CustomerDto?> GetCustomerByIdAsync(int userId);
        Task<CustomerDetailDto?> GetCustomerDetailAsync(int userId);
        Task<bool> UpdateCustomerAsync(int userId, UpdateCustomerRequest request);
    }
}

