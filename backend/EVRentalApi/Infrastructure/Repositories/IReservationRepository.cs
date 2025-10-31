using EVRentalApi.Models;

namespace EVRentalApi.Infrastructure.Repositories;

public interface IReservationRepository
{
    Task<ReservationResponse?> CreateReservationAsync(CreateReservationRequest request);
    Task<IEnumerable<ReservationDto>> GetReservationsByUserIdAsync(int userId);
    Task<ReservationDto?> GetReservationByIdAsync(int reservationId);
    Task<bool> UpdateReservationStatusAsync(int reservationId, string status);
    Task<bool> CancelReservationAsync(int reservationId, string? reason = null, string? cancelledBy = null);
}

