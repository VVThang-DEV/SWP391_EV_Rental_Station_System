using EVRentalApi.Models;

namespace EVRentalApi.Infrastructure.Repositories;

public interface IPaymentRepository
{
    Task<PaymentResponse?> CreatePaymentAsync(CreatePaymentRequest request);
    Task<IEnumerable<PaymentDto>> GetPaymentsByReservationIdAsync(int reservationId);
    Task<IEnumerable<PaymentDto>> GetPaymentsByUserIdAsync(int userId);
    Task<PaymentDto?> GetPaymentByIdAsync(int paymentId);
}

