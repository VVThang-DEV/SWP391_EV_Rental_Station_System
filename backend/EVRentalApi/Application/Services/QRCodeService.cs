using EVRentalApi.Infrastructure.Repositories;
using EVRentalApi.Models;
using System.Text.Json;

namespace EVRentalApi.Application.Services;

public interface IQRCodeService
{
    Task<QRCodeResponse> SaveQRCodeAsync(SaveQRCodeRequest request);
    Task<VerifyQRCodeResponse> VerifyQRCodeAsync(string qrCodeData);
    Task<QRCodeDto?> GetQRCodeByReservationIdAsync(int reservationId);
}

public class QRCodeService : IQRCodeService
{
    private readonly IQRCodeRepository _qrCodeRepository;
    private readonly IReservationRepository _reservationRepository;
    private readonly IUserRepository _userRepository;
    private readonly IVehicleRepository _vehicleRepository;

    public QRCodeService(
        IQRCodeRepository qrCodeRepository,
        IReservationRepository reservationRepository,
        IUserRepository userRepository,
        IVehicleRepository vehicleRepository)
    {
        _qrCodeRepository = qrCodeRepository;
        _reservationRepository = reservationRepository;
        _userRepository = userRepository;
        _vehicleRepository = vehicleRepository;
    }

    public async Task<QRCodeResponse> SaveQRCodeAsync(SaveQRCodeRequest request)
    {
        try
        {
            // Verify reservation exists
            var reservation = await _reservationRepository.GetReservationByIdAsync(request.ReservationId);
            if (reservation == null)
            {
                return new QRCodeResponse
                {
                    Success = false,
                    Message = $"Reservation {request.ReservationId} not found"
                };
            }

            // Save the QR code data that was generated on client-side
            var result = await _qrCodeRepository.SaveQRCodeAsync(request);
            return result;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[QRService] Error saving QR code: {ex.Message}");
            return new QRCodeResponse
            {
                Success = false,
                Message = $"Error saving QR code: {ex.Message}"
            };
        }
    }

    public async Task<VerifyQRCodeResponse> VerifyQRCodeAsync(string qrCodeData)
    {
        try
        {
            Console.WriteLine($"[QRService] Verifying QR code...");

            // Parse QR code data
            var qrData = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(qrCodeData);
            if (qrData == null)
            {
                return new VerifyQRCodeResponse
                {
                    Success = false,
                    Message = "Invalid QR code format"
                };
            }

            // Extract reservation ID from QR code
            if (!qrData.ContainsKey("reservationId"))
            {
                return new VerifyQRCodeResponse
                {
                    Success = false,
                    Message = "QR code does not contain reservation information"
                };
            }

            var reservationId = qrData["reservationId"].GetInt32();
            Console.WriteLine($"[QRService] QR code for reservation {reservationId}");

            // Check if QR code exists in database
            var qrCode = await _qrCodeRepository.GetQRCodeByCodeAsync(qrCodeData);
            if (qrCode == null)
            {
                // Auto-save fallback: if reservation exists but QR not saved, create it now
                // This helps when frontend skipped the save step
                var autoSave = await _qrCodeRepository.SaveQRCodeAsync(new SaveQRCodeRequest
                {
                    ReservationId = reservationId,
                    QRCodeData = qrCodeData
                });

                if (!autoSave.Success)
                {
                    return new VerifyQRCodeResponse
                    {
                        Success = false,
                        Message = "QR code not found in system. Please ensure the reservation was completed successfully."
                    };
                }

                qrCode = autoSave.QRCode;
            }

            // Check if QR code has expired
            if (qrCode.ExpiresAt < DateTime.Now)
            {
                return new VerifyQRCodeResponse
                {
                    Success = false,
                    Message = "QR code has expired"
                };
            }

            // Check if QR code has already been used
            if (qrCode.Status == "used")
            {
                return new VerifyQRCodeResponse
                {
                    Success = false,
                    Message = "QR code has already been used"
                };
            }

            // Get reservation details
            var reservation = await _reservationRepository.GetReservationByIdAsync(reservationId);
            if (reservation == null)
            {
                return new VerifyQRCodeResponse
                {
                    Success = false,
                    Message = "Reservation not found"
                };
            }

            // Check if reservation is in valid state for pickup
            if (reservation.Status != "pending" && reservation.Status != "confirmed")
            {
                return new VerifyQRCodeResponse
                {
                    Success = false,
                    Message = $"Reservation is not valid for pickup. Current status: {reservation.Status}"
                };
            }

            // Check if pickup time is within valid window (e.g., 30 minutes before start time to 1 hour after)
            var now = DateTime.Now;
            var pickupWindowStart = reservation.StartTime.AddMinutes(-30);
            var pickupWindowEnd = reservation.StartTime.AddHours(1);

            if (now < pickupWindowStart)
            {
                return new VerifyQRCodeResponse
                {
                    Success = false,
                    Message = $"Too early for pickup. Pickup window starts at {pickupWindowStart:yyyy-MM-dd HH:mm}"
                };
            }

            if (now > pickupWindowEnd)
            {
                return new VerifyQRCodeResponse
                {
                    Success = false,
                    Message = "Pickup window has expired. Please contact support."
                };
            }

            // Get user and vehicle information
            var user = await _userRepository.GetUserByIdAsync(reservation.UserId);
            var vehicle = await _vehicleRepository.GetVehicleByIdAsync(reservation.VehicleId);

            // Mark QR code as used
            await _qrCodeRepository.MarkQRCodeAsUsedAsync(qrCodeData);

            // Update reservation status to "confirmed" if still pending
            if (reservation.Status == "pending")
            {
                await _reservationRepository.UpdateReservationStatusAsync(reservationId, "confirmed");
            }

            Console.WriteLine($"[QRService] ✅ QR code verified successfully for reservation {reservationId}");

            return new VerifyQRCodeResponse
            {
                Success = true,
                Message = "QR code verified successfully. Vehicle is ready for pickup.",
                Reservation = reservation,
                VehicleName = vehicle?.model_id ?? "Unknown",
                UserName = user?.FullName ?? "Unknown"
            };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[QRService] ❌ Error verifying QR code: {ex.Message}");
            return new VerifyQRCodeResponse
            {
                Success = false,
                Message = $"Error verifying QR code: {ex.Message}"
            };
        }
    }

    public async Task<QRCodeDto?> GetQRCodeByReservationIdAsync(int reservationId)
    {
        return await _qrCodeRepository.GetQRCodeByReservationIdAsync(reservationId);
    }
}
