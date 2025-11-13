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
    private readonly IVehicleModelRepository _vehicleModelRepository;

    public QRCodeService(
        IQRCodeRepository qrCodeRepository,
        IReservationRepository reservationRepository,
        IUserRepository userRepository,
        IVehicleRepository vehicleRepository,
        IVehicleModelRepository vehicleModelRepository)
    {
        _qrCodeRepository = qrCodeRepository;
        _reservationRepository = reservationRepository;
        _userRepository = userRepository;
        _vehicleRepository = vehicleRepository;
        _vehicleModelRepository = vehicleModelRepository;
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
            Console.WriteLine($"[QRService] QR code data length: {qrCodeData?.Length ?? 0}");
            if (qrCodeData != null && qrCodeData.Length > 0 && qrCodeData.Length < 500)
            {
                Console.WriteLine($"[QRService] QR code data preview: {qrCodeData}");
            }

            // Parse QR code data - handle both direct JSON string and already parsed object
            Dictionary<string, JsonElement>? qrData = null;
            
            try
            {
                // Try to parse as JSON string first
                qrData = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(qrCodeData);
            }
            catch (JsonException)
            {
                // If parsing fails, try to parse as a single JSON object (not wrapped in quotes)
                try
                {
                    // Remove any surrounding quotes if present
                    var cleanedData = qrCodeData.Trim().Trim('"').Trim('\'');
                    qrData = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(cleanedData);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[QRService] Error parsing QR code data: {ex.Message}");
                    return new VerifyQRCodeResponse
                    {
                        Success = false,
                        Message = $"Invalid QR code format: {ex.Message}"
                    };
                }
            }

            if (qrData == null || qrData.Count == 0)
            {
                Console.WriteLine($"[QRService] Failed to parse QR code data. Raw data: {qrCodeData?.Substring(0, Math.Min(200, qrCodeData?.Length ?? 0))}");
                return new VerifyQRCodeResponse
                {
                    Success = false,
                    Message = "Invalid QR code format - could not parse JSON"
                };
            }

            Console.WriteLine($"[QRService] Parsed QR code keys: {string.Join(", ", qrData.Keys)}");

            // Extract reservation ID from QR code - try different key names
            int reservationId = 0;
            bool foundReservationId = false;

            if (qrData.ContainsKey("reservationId"))
            {
                if (qrData["reservationId"].ValueKind == JsonValueKind.Number)
                {
                    reservationId = qrData["reservationId"].GetInt32();
                    foundReservationId = true;
                }
                else if (qrData["reservationId"].ValueKind == JsonValueKind.String)
                {
                    if (int.TryParse(qrData["reservationId"].GetString(), out var parsedId))
                    {
                        reservationId = parsedId;
                        foundReservationId = true;
                    }
                }
            }
            else if (qrData.ContainsKey("reservation_id"))
            {
                if (qrData["reservation_id"].ValueKind == JsonValueKind.Number)
                {
                    reservationId = qrData["reservation_id"].GetInt32();
                    foundReservationId = true;
                }
                else if (qrData["reservation_id"].ValueKind == JsonValueKind.String)
                {
                    if (int.TryParse(qrData["reservation_id"].GetString(), out var parsedId))
                    {
                        reservationId = parsedId;
                        foundReservationId = true;
                    }
                }
            }
            else if (qrData.ContainsKey("bookingId"))
            {
                // Handle legacy bookingId format
                if (qrData["bookingId"].ValueKind == JsonValueKind.Number)
                {
                    reservationId = qrData["bookingId"].GetInt32();
                    foundReservationId = true;
                }
                else if (qrData["bookingId"].ValueKind == JsonValueKind.String)
                {
                    if (int.TryParse(qrData["bookingId"].GetString(), out var parsedId))
                    {
                        reservationId = parsedId;
                        foundReservationId = true;
                    }
                }
            }

            if (!foundReservationId || reservationId == 0)
            {
                Console.WriteLine($"[QRService] QR code does not contain valid reservation ID. Available keys: {string.Join(", ", qrData.Keys)}");
                return new VerifyQRCodeResponse
                {
                    Success = false,
                    Message = "QR code does not contain reservation information. Please ensure you're scanning the correct QR code from your booking confirmation."
                };
            }

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
                
                // If auto-save returned an existing QR code that was already used, 
                // check if it's the same code we're trying to verify
                if (qrCode.Status == "used" && qrCode.UsedAt.HasValue && qrCode.Code == qrCodeData)
                {
                    // Same QR code that was used before - check how long ago
                    var timeSinceUsed = DateTime.Now - qrCode.UsedAt.Value;
                    if (timeSinceUsed.TotalMinutes > 1)
                    {
                        // Used more than 1 minute ago - truly used
                        Console.WriteLine($"[QRService] QR code was used {timeSinceUsed.TotalMinutes} minutes ago");
                    }
                    else
                    {
                        // Recently used (within 1 minute) - might be race condition, continue verification
                        Console.WriteLine($"[QRService] QR code was recently marked as used ({timeSinceUsed.TotalSeconds}s ago), continuing verification");
                    }
                }
                else if (qrCode.Status == "used" && qrCode.Code != qrCodeData)
                {
                    // Different QR code for same reservation - this shouldn't happen, but log it
                    Console.WriteLine($"[QRService] Warning: Existing QR code for reservation {reservationId} has different code. Expected: {qrCodeData.Substring(0, Math.Min(50, qrCodeData.Length))}..., Got: {qrCode.Code.Substring(0, Math.Min(50, qrCode.Code.Length))}...");
                }
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
            // Only reject if status is explicitly "used" AND used_at is not null AND it was used more than 1 minute ago
            // This allows for race conditions where QR code might be marked as used just before this check
            if (qrCode.Status == "used" && qrCode.UsedAt.HasValue)
            {
                var timeSinceUsed = DateTime.Now - qrCode.UsedAt.Value;
                if (timeSinceUsed.TotalMinutes > 1) // More than 1 minute ago - truly used
                {
                    Console.WriteLine($"[QRService] QR code was used {timeSinceUsed.TotalMinutes:F1} minutes ago - rejecting");
                    return new VerifyQRCodeResponse
                    {
                        Success = false,
                        Message = "QR code has already been used"
                    };
                }
                else
                {
                    // Recently used (within 1 minute) - might be a race condition or duplicate scan
                    // Check if reservation is still valid for pickup
                    Console.WriteLine($"[QRService] QR code was recently marked as used ({timeSinceUsed.TotalSeconds:F1}s ago), but continuing verification");
                    // Continue to verify - if reservation is still valid, allow unlock
                }
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

            // Get vehicle model name for better display
            string vehicleName = "Unknown";
            if (vehicle != null)
            {
                try
                {
                    // Try to get model_id from dynamic object
                    var modelIdProp = vehicle.GetType().GetProperty("model_id");
                    var modelId = modelIdProp?.GetValue(vehicle)?.ToString();
                    
                    if (!string.IsNullOrEmpty(modelId))
                    {
                        var vehicleModel = await _vehicleModelRepository.GetVehicleModelByIdAsync(modelId);
                        if (vehicleModel != null)
                        {
                            var brandProp = vehicleModel.GetType().GetProperty("brand");
                            var modelNameProp = vehicleModel.GetType().GetProperty("model_name");
                            var brand = brandProp?.GetValue(vehicleModel)?.ToString() ?? "";
                            var modelName = modelNameProp?.GetValue(vehicleModel)?.ToString() ?? "";
                            
                            if (!string.IsNullOrEmpty(brand) && !string.IsNullOrEmpty(modelName))
                            {
                                vehicleName = $"{brand} {modelName}";
                            }
                            else
                            {
                                vehicleName = modelId;
                            }
                        }
                        else
                        {
                            vehicleName = modelId;
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[QRService] Error getting vehicle model: {ex.Message}");
                    vehicleName = "Unknown Vehicle";
                }
            }

            // Mark QR code as used (only if not already used)
            if (qrCode.Status != "used")
            {
                await _qrCodeRepository.MarkQRCodeAsUsedAsync(qrCodeData);
            }

            // Update reservation status to "confirmed" if still pending
            if (reservation.Status == "pending")
            {
                await _reservationRepository.UpdateReservationStatusAsync(reservationId, "confirmed");
                // Refresh reservation to get updated status
                reservation = await _reservationRepository.GetReservationByIdAsync(reservationId);
            }

            Console.WriteLine($"[QRService] ✅ QR code verified successfully for reservation {reservationId}");

            return new VerifyQRCodeResponse
            {
                Success = true,
                Message = $"✅ Unlock thành công! Xe đã sẵn sàng để nhận.\n\nKhách hàng: {user?.FullName ?? "Unknown"}\nXe: {vehicleName}\nMã đặt chỗ: #{reservationId}",
                Reservation = reservation,
                VehicleName = vehicleName,
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
