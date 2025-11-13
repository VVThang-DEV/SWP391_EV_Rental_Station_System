using EVRentalApi.Models;
using EVRentalApi.Infrastructure.Repositories;

namespace EVRentalApi.Application.Services
{
    public class CustomerService : ICustomerService
    {
        private readonly ICustomerRepository _customerRepository;

        public CustomerService(ICustomerRepository customerRepository)
        {
            _customerRepository = customerRepository;
        }

        public async Task<IEnumerable<CustomerDto>> GetAllCustomersAsync()
        {
            var customers = await _customerRepository.GetAllCustomersAsync();
            return customers.Select(MapToDto);
        }

        public async Task<CustomerDto?> GetCustomerByIdAsync(int userId)
        {
            var customer = await _customerRepository.GetCustomerByIdAsync(userId);
            if (customer == null) return null;
            
            var stats = await _customerRepository.GetCustomerStatsAsync(userId);
            return MapToDtoWithStats(customer, stats);
        }

        public async Task<CustomerDetailDto?> GetCustomerDetailAsync(int userId)
        {
            var customer = await _customerRepository.GetCustomerByIdAsync(userId);
            if (customer == null) return null;
            
            var stats = await _customerRepository.GetCustomerStatsAsync(userId);
            return MapToDetailDto(customer, stats);
        }

        private static CustomerDto MapToDto(dynamic customer)
        {
            return new CustomerDto
            {
                Id = customer.id,
                UserId = customer.user_id,
                Name = customer.name,
                Email = customer.email,
                Phone = customer.phone ?? "",
                Rentals = customer.rentals,
                Spent = customer.spent,
                Risk = customer.risk,
                Status = customer.status,
                WalletBalance = customer.wallet_balance ?? 0,
                CreatedAt = customer.created_at
            };
        }

        private static CustomerDto MapToDtoWithStats(dynamic customer, dynamic? stats)
        {
            var dto = new CustomerDto
            {
                Id = $"CU{customer.user_id.ToString("D3")}",
                UserId = customer.user_id,
                Name = customer.full_name,
                Email = customer.email,
                Phone = customer.phone ?? "",
                WalletBalance = (double)(customer.wallet_balance ?? 0),
                CreatedAt = customer.created_at
            };

            if (stats != null)
            {
                dto.Rentals = stats.total_rentals;
                dto.Spent = (double)stats.total_spent;
                
                // Calculate risk
                var cancelledCount = stats.cancelled_count;
                var totalReservations = stats.total_reservations;
                var lateReturns = stats.late_returns_count;
                
                if (totalReservations > 0 && (cancelledCount > totalReservations * 0.3 || lateReturns > 2))
                {
                    dto.Risk = "high";
                }
                else if (totalReservations > 0 && (cancelledCount > totalReservations * 0.15 || lateReturns > 0))
                {
                    dto.Risk = "medium";
                }
                else
                {
                    dto.Risk = "low";
                }
            }
            else
            {
                dto.Rentals = 0;
                dto.Spent = 0;
                dto.Risk = "low";
            }

            dto.Status = customer.is_active ? "active" : "suspended";
            
            return dto;
        }

        private static CustomerDetailDto MapToDetailDto(dynamic customer, dynamic? stats)
        {
            var dto = new CustomerDetailDto
            {
                Id = $"CU{customer.user_id.ToString("D3")}",
                UserId = customer.user_id,
                Name = customer.full_name,
                Email = customer.email,
                Phone = customer.phone ?? "",
                Cccd = customer.cccd,
                LicenseNumber = customer.license_number,
                Address = customer.address,
                Gender = customer.gender,
                DateOfBirth = customer.date_of_birth,
                WalletBalance = (double)(customer.wallet_balance ?? 0),
                CreatedAt = customer.created_at
            };

            if (stats != null)
            {
                dto.Rentals = stats.total_rentals;
                dto.Spent = (double)stats.total_spent;
                dto.TotalReservations = stats.total_reservations;
                dto.CancelledCount = stats.cancelled_count;
                dto.LateReturnsCount = stats.late_returns_count;
                dto.DamagesCount = stats.damages_count ?? 0;
                
                // Calculate risk level based on cancellation rate, late returns, and damages
                // High Risk: >30% cancellation rate OR >2 late returns OR >=2 damages
                // Medium Risk: >15% cancellation rate OR >=1 late return OR >=1 damage
                // Low Risk: Default for all other cases
                if (dto.TotalReservations > 0)
                {
                    double cancellationRate = (double)dto.CancelledCount / dto.TotalReservations;
                    if (cancellationRate > 0.3 || dto.LateReturnsCount > 2 || dto.DamagesCount >= 2)
                    {
                        dto.Risk = "high";
                    }
                    else if (cancellationRate > 0.15 || dto.LateReturnsCount > 0 || dto.DamagesCount >= 1)
                    {
                        dto.Risk = "medium";
                    }
                    else
                    {
                        dto.Risk = "low";
                    }
                }
                else
                {
                    // New customers with no reservations are considered low risk
                    // But if they already have damages, they should be medium risk
                    if (dto.DamagesCount >= 1)
                    {
                        dto.Risk = "medium";
                    }
                    else
                    {
                        dto.Risk = "low";
                    }
                }
            }
            else
            {
                dto.Rentals = 0;
                dto.Spent = 0;
                dto.TotalReservations = 0;
                dto.CancelledCount = 0;
                dto.LateReturnsCount = 0;
                dto.DamagesCount = 0;
                dto.Risk = "low";
            }

            dto.Status = customer.is_active ? "active" : "suspended";
            
            return dto;
        }

        public async Task<bool> UpdateCustomerAsync(int userId, UpdateCustomerRequest request)
        {
            return await _customerRepository.UpdateCustomerAsync(userId, request);
        }
    }
}

