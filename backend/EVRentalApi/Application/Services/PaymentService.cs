using EVRentalApi.Infrastructure.Repositories;
using EVRentalApi.Models;

namespace EVRentalApi.Application.Services;

public interface IPaymentService
{
    Task<PaymentResponse> CreatePaymentAsync(CreatePaymentRequest request);
    Task<IEnumerable<PaymentDto>> GetUserPaymentsAsync(int userId);
    Task<IEnumerable<PaymentDto>> GetReservationPaymentsAsync(int reservationId);
    Task<PaymentDto?> GetPaymentByIdAsync(int paymentId);
}

public class PaymentService : IPaymentService
{
    private readonly IPaymentRepository _paymentRepository;

    public PaymentService(IPaymentRepository paymentRepository)
    {
        _paymentRepository = paymentRepository;
    }

    public async Task<PaymentResponse> CreatePaymentAsync(CreatePaymentRequest request)
    {
        // Validate payment method
        var validMethods = new[] { "cash", "momo", "vnpay", "bank_transfer" };
        if (!validMethods.Contains(request.MethodType.ToLower()))
        {
            return new PaymentResponse
            {
                Success = false,
                Message = $"Invalid payment method. Must be one of: {string.Join(", ", validMethods)}"
            };
        }

        // Validate amount
        if (request.Amount <= 0)
        {
            return new PaymentResponse
            {
                Success = false,
                Message = "Payment amount must be greater than 0"
            };
        }

        var result = await _paymentRepository.CreatePaymentAsync(request);
        
        if (result == null)
        {
            return new PaymentResponse
            {
                Success = false,
                Message = "Failed to create payment"
            };
        }

        return result;
    }

    public async Task<IEnumerable<PaymentDto>> GetUserPaymentsAsync(int userId)
    {
        return await _paymentRepository.GetPaymentsByUserIdAsync(userId);
    }

    public async Task<IEnumerable<PaymentDto>> GetReservationPaymentsAsync(int reservationId)
    {
        return await _paymentRepository.GetPaymentsByReservationIdAsync(reservationId);
    }

    public async Task<PaymentDto?> GetPaymentByIdAsync(int paymentId)
    {
        return await _paymentRepository.GetPaymentByIdAsync(paymentId);
    }
}

