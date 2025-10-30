using EVRentalApi.Infrastructure.Repositories;
using EVRentalApi.Models;

namespace EVRentalApi.Application.Services;

public interface IReservationService
{
    Task<ReservationResponse> CreateReservationAsync(CreateReservationRequest request);
    Task<IEnumerable<ReservationDto>> GetUserReservationsAsync(int userId);
    Task<ReservationDto?> GetReservationByIdAsync(int reservationId);
    Task<bool> CancelReservationAsync(int reservationId, string? reason = null, string? cancelledBy = null);
}

public class ReservationService : IReservationService
{
    private readonly IReservationRepository _reservationRepository;

    public ReservationService(IReservationRepository reservationRepository)
    {
        _reservationRepository = reservationRepository;
    }

    public async Task<ReservationResponse> CreateReservationAsync(CreateReservationRequest request)
    {
        // Validate request
        if (request.StartTime >= request.EndTime)
        {
            return new ReservationResponse
            {
                Success = false,
                Message = "End time must be after start time"
            };
        }

        // SANDBOX MODE: Allow any start time for testing
        // In production, you might want to re-enable this validation:
        // if (request.StartTime < DateTime.Now.AddMinutes(-15))
        // {
        //     return new ReservationResponse
        //     {
        //         Success = false,
        //         Message = "Start time cannot be more than 15 minutes in the past"
        //     };
        // }
        
        // Check if start time is in the future for better UX
        if (request.StartTime < DateTime.Now.AddHours(-1))
        {
            Console.WriteLine($"[Reservation] Warning: Start time is more than 1 hour in the past. Allowing in SANDBOX mode.");
        }

        var result = await _reservationRepository.CreateReservationAsync(request);
        
        if (result == null)
        {
            return new ReservationResponse
            {
                Success = false,
                Message = "Failed to create reservation"
            };
        }

        return result;
    }

    public async Task<IEnumerable<ReservationDto>> GetUserReservationsAsync(int userId)
    {
        return await _reservationRepository.GetReservationsByUserIdAsync(userId);
    }

    public async Task<ReservationDto?> GetReservationByIdAsync(int reservationId)
    {
        return await _reservationRepository.GetReservationByIdAsync(reservationId);
    }

    public async Task<bool> CancelReservationAsync(int reservationId, string? reason = null, string? cancelledBy = null)
    {
        return await _reservationRepository.CancelReservationAsync(reservationId, reason, cancelledBy);
    }
}

