using EVRentalApi.Models;

namespace EVRentalApi.Infrastructure.Repositories;

public interface IQRCodeRepository
{
    Task<QRCodeResponse> SaveQRCodeAsync(SaveQRCodeRequest request);
    Task<QRCodeDto?> GetQRCodeByCodeAsync(string code);
    Task<QRCodeDto?> GetQRCodeByReservationIdAsync(int reservationId);
    Task<bool> MarkQRCodeAsUsedAsync(string code);
    Task<bool> DeleteExpiredQRCodesAsync();
}
