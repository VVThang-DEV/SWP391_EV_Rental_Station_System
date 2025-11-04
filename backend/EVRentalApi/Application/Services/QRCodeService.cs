using EVRentalApi.Models;
using Microsoft.Data.SqlClient;
using System.Text.Json;

namespace EVRentalApi.Application.Services;

public interface IQRCodeService
{
    Task<string?> GeneratePickupQRCodeAsync(int reservationId);
    Task<QRVerificationResponse> VerifyAndConfirmQRCodeAsync(string qrCodeData);
}

public class QRCodeService : IQRCodeService
{
    private readonly IConfiguration _config;
    private readonly string _connectionString;

    public QRCodeService(IConfiguration config)
    {
        _config = config;
        _connectionString = _config.GetConnectionString("DefaultConnection") 
            ?? throw new InvalidOperationException("DefaultConnection connection string not found");
    }

    public async Task<string?> GeneratePickupQRCodeAsync(int reservationId)
    {
        try
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            // Get reservation details
            var reservationSql = @"
                SELECT reservation_id, user_id, vehicle_id, station_id, 
                       start_time, end_time, status, created_at
                FROM reservations
                WHERE reservation_id = @ReservationId";

            using var reservationCmd = new SqlCommand(reservationSql, connection);
            reservationCmd.Parameters.AddWithValue("@ReservationId", reservationId);

            using var reader = await reservationCmd.ExecuteReaderAsync();

            if (!await reader.ReadAsync())
            {
                Console.WriteLine($"[QR Generate] Reservation {reservationId} not found");
                return null;
            }

            var timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            var accessCode = $"ACCESS_{reservationId}_{timestamp}";

            var qrData = new PickupQRCodeData
            {
                ReservationId = reader.GetInt32(reader.GetOrdinal("reservation_id")),
                VehicleId = reader.GetInt32(reader.GetOrdinal("vehicle_id")),
                StationId = reader.GetInt32(reader.GetOrdinal("station_id")),
                UserId = reader.GetInt32(reader.GetOrdinal("user_id")),
                StartTime = reader.GetDateTime(reader.GetOrdinal("start_time")),
                EndTime = reader.GetDateTime(reader.GetOrdinal("end_time")),
                Status = reader.GetString(reader.GetOrdinal("status")),
                AccessCode = accessCode,
                Timestamp = DateTime.UtcNow
            };

            reader.Close();

            // Serialize to JSON
            var jsonOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };
            var qrCodeJson = JsonSerializer.Serialize(qrData, jsonOptions);

            // Check if a rental exists for this reservation
            var checkRentalSql = @"
                SELECT rental_id 
                FROM rentals 
                WHERE reservation_id = @ReservationId";

            using var checkRentalCmd = new SqlCommand(checkRentalSql, connection);
            checkRentalCmd.Parameters.AddWithValue("@ReservationId", reservationId);
            var rentalIdObj = await checkRentalCmd.ExecuteScalarAsync();

            int rentalId;
            if (rentalIdObj == null || rentalIdObj == DBNull.Value)
            {
                // Create a rental record if it doesn't exist
                var createRentalSql = @"
                    INSERT INTO rentals (reservation_id, user_id, vehicle_id, pickup_station_id, start_time, status, created_at)
                    OUTPUT INSERTED.rental_id
                    VALUES (@ReservationId, @UserId, @VehicleId, @StationId, @StartTime, 'pending', GETDATE())";

                using var createRentalCmd = new SqlCommand(createRentalSql, connection);
                createRentalCmd.Parameters.AddWithValue("@ReservationId", reservationId);
                createRentalCmd.Parameters.AddWithValue("@UserId", qrData.UserId);
                createRentalCmd.Parameters.AddWithValue("@VehicleId", qrData.VehicleId);
                createRentalCmd.Parameters.AddWithValue("@StationId", qrData.StationId);
                createRentalCmd.Parameters.AddWithValue("@StartTime", qrData.StartTime);

                rentalId = (int)await createRentalCmd.ExecuteScalarAsync();
                Console.WriteLine($"[QR Generate] Created rental {rentalId} for reservation {reservationId}");
            }
            else
            {
                rentalId = (int)rentalIdObj;
                Console.WriteLine($"[QR Generate] Using existing rental {rentalId} for reservation {reservationId}");
            }

            // Check if QR code already exists for this rental
            var checkQRSql = @"
                SELECT qr_id 
                FROM pickup_qr_codes 
                WHERE rental_id = @RentalId AND status = 'active'";

            using var checkQRCmd = new SqlCommand(checkQRSql, connection);
            checkQRCmd.Parameters.AddWithValue("@RentalId", rentalId);
            var existingQRId = await checkQRCmd.ExecuteScalarAsync();

            if (existingQRId != null && existingQRId != DBNull.Value)
            {
                // Update existing QR code
                var updateQRSql = @"
                    UPDATE pickup_qr_codes 
                    SET code = @Code, expires_at = @ExpiresAt
                    WHERE qr_id = @QRId";

                using var updateQRCmd = new SqlCommand(updateQRSql, connection);
                updateQRCmd.Parameters.AddWithValue("@Code", qrCodeJson);
                updateQRCmd.Parameters.AddWithValue("@ExpiresAt", qrData.StartTime.AddHours(24));
                updateQRCmd.Parameters.AddWithValue("@QRId", existingQRId);
                await updateQRCmd.ExecuteNonQueryAsync();

                Console.WriteLine($"[QR Generate] Updated QR code for rental {rentalId}");
            }
            else
            {
                // Insert new QR code into pickup_qr_codes table
                var insertQRSql = @"
                    INSERT INTO pickup_qr_codes (rental_id, code, status, expires_at, created_at)
                    VALUES (@RentalId, @Code, 'active', @ExpiresAt, GETDATE())";

                using var insertQRCmd = new SqlCommand(insertQRSql, connection);
                insertQRCmd.Parameters.AddWithValue("@RentalId", rentalId);
                insertQRCmd.Parameters.AddWithValue("@Code", qrCodeJson);
                insertQRCmd.Parameters.AddWithValue("@ExpiresAt", qrData.StartTime.AddHours(24));
                await insertQRCmd.ExecuteNonQueryAsync();

                Console.WriteLine($"[QR Generate] ✅ Generated QR code for rental {rentalId}, reservation {reservationId}");
            }

            return qrCodeJson;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[QR Generate] ❌ Error: {ex.Message}");
            return null;
        }
    }

    public async Task<QRVerificationResponse> VerifyAndConfirmQRCodeAsync(string qrCodeData)
    {
        try
        {
            Console.WriteLine($"[QR Verify] Verifying QR code...");

            // Parse QR code JSON
            var jsonOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };
            var qrData = JsonSerializer.Deserialize<PickupQRCodeData>(qrCodeData, jsonOptions);

            if (qrData == null)
            {
                return new QRVerificationResponse
                {
                    Success = false,
                    Message = "Invalid QR code format"
                };
            }

            Console.WriteLine($"[QR Verify] Parsed QR data: ReservationId={qrData.ReservationId}, AccessCode={qrData.AccessCode}");

            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            // Verify QR code exists and is active
            var verifyQRSql = @"
                SELECT qr.qr_id, qr.status, qr.expires_at, qr.rental_id,
                       r.reservation_id, r.user_id, r.vehicle_id, r.station_id,
                       r.start_time, r.end_time, r.status as reservation_status, r.created_at,
                       s.name as station_name, v.model_id as vehicle_model,
                       u.full_name as user_name, u.email as user_email, u.phone as user_phone
                FROM pickup_qr_codes qr
                INNER JOIN rentals rt ON qr.rental_id = rt.rental_id
                INNER JOIN reservations r ON rt.reservation_id = r.reservation_id
                LEFT JOIN stations s ON r.station_id = s.station_id
                LEFT JOIN vehicles v ON r.vehicle_id = v.vehicle_id
                LEFT JOIN users u ON r.user_id = u.user_id
                WHERE qr.code = @QRCode";

            using var verifyCmd = new SqlCommand(verifyQRSql, connection);
            verifyCmd.Parameters.AddWithValue("@QRCode", qrCodeData);

            using var reader = await verifyCmd.ExecuteReaderAsync();

            if (!await reader.ReadAsync())
            {
                Console.WriteLine($"[QR Verify] ❌ QR code not found in database");
                return new QRVerificationResponse
                {
                    Success = false,
                    Message = "Invalid QR code. Not found in system."
                };
            }

            var qrId = reader.GetInt32(reader.GetOrdinal("qr_id"));
            var qrStatus = reader.GetString(reader.GetOrdinal("status"));
            var expiresAt = reader.GetDateTime(reader.GetOrdinal("expires_at"));
            var rentalId = reader.GetInt32(reader.GetOrdinal("rental_id"));

            var reservation = new ReservationDto
            {
                ReservationId = reader.GetInt32(reader.GetOrdinal("reservation_id")),
                UserId = reader.GetInt32(reader.GetOrdinal("user_id")),
                VehicleId = reader.GetInt32(reader.GetOrdinal("vehicle_id")),
                StationId = reader.GetInt32(reader.GetOrdinal("station_id")),
                StartTime = reader.GetDateTime(reader.GetOrdinal("start_time")),
                EndTime = reader.GetDateTime(reader.GetOrdinal("end_time")),
                Status = reader.GetString(reader.GetOrdinal("reservation_status")),
                CreatedAt = reader.GetDateTime(reader.GetOrdinal("created_at")),
                StationName = reader.IsDBNull(reader.GetOrdinal("station_name")) ? null : reader.GetString(reader.GetOrdinal("station_name")),
                VehicleName = reader.IsDBNull(reader.GetOrdinal("vehicle_model")) ? null : reader.GetString(reader.GetOrdinal("vehicle_model")),
                UserName = reader.IsDBNull(reader.GetOrdinal("user_name")) ? null : reader.GetString(reader.GetOrdinal("user_name")),
                UserEmail = reader.IsDBNull(reader.GetOrdinal("user_email")) ? null : reader.GetString(reader.GetOrdinal("user_email")),
                UserPhone = reader.IsDBNull(reader.GetOrdinal("user_phone")) ? null : reader.GetString(reader.GetOrdinal("user_phone"))
            };

            reader.Close();

            // Check if QR code has expired
            if (DateTime.Now > expiresAt)
            {
                Console.WriteLine($"[QR Verify] ❌ QR code has expired");
                return new QRVerificationResponse
                {
                    Success = false,
                    Message = "QR code has expired",
                    Reservation = reservation
                };
            }

            // Check if QR code has already been used
            if (qrStatus == "used")
            {
                Console.WriteLine($"[QR Verify] ℹ️ QR code has already been used");
                return new QRVerificationResponse
                {
                    Success = true,
                    Message = "QR code has already been used. Reservation is confirmed.",
                    Reservation = reservation
                };
            }

            // Check if QR code is active
            if (qrStatus != "active")
            {
                Console.WriteLine($"[QR Verify] ❌ QR code status is {qrStatus}");
                return new QRVerificationResponse
                {
                    Success = false,
                    Message = $"QR code is {qrStatus}",
                    Reservation = reservation
                };
            }

            // Check reservation status
            if (reservation.Status == "cancelled" || reservation.Status == "expired")
            {
                Console.WriteLine($"[QR Verify] ❌ Reservation is {reservation.Status}");
                return new QRVerificationResponse
                {
                    Success = false,
                    Message = $"Reservation has been {reservation.Status}",
                    Reservation = reservation
                };
            }

            // Update reservation status to confirmed
            var updateReservationSql = @"
                UPDATE reservations 
                SET status = 'confirmed'
                WHERE reservation_id = @ReservationId";

            using var updateResCmd = new SqlCommand(updateReservationSql, connection);
            updateResCmd.Parameters.AddWithValue("@ReservationId", reservation.ReservationId);
            await updateResCmd.ExecuteNonQueryAsync();

            // Update QR code status to used
            var updateQRSql = @"
                UPDATE pickup_qr_codes 
                SET status = 'used', used_at = GETDATE()
                WHERE qr_id = @QRId";

            using var updateQRCmd = new SqlCommand(updateQRSql, connection);
            updateQRCmd.Parameters.AddWithValue("@QRId", qrId);
            await updateQRCmd.ExecuteNonQueryAsync();

            // Update rental status to ongoing
            var updateRentalSql = @"
                UPDATE rentals 
                SET status = 'ongoing', updated_at = GETDATE()
                WHERE rental_id = @RentalId";

            using var updateRentalCmd = new SqlCommand(updateRentalSql, connection);
            updateRentalCmd.Parameters.AddWithValue("@RentalId", rentalId);
            await updateRentalCmd.ExecuteNonQueryAsync();

            // Update vehicle status to rented
            var updateVehicleSql = @"
                UPDATE vehicles 
                SET status = 'rented', updated_at = GETDATE()
                WHERE vehicle_id = @VehicleId";

            using var updateVehicleCmd = new SqlCommand(updateVehicleSql, connection);
            updateVehicleCmd.Parameters.AddWithValue("@VehicleId", reservation.VehicleId);
            await updateVehicleCmd.ExecuteNonQueryAsync();

            reservation.Status = "confirmed";

            Console.WriteLine($"[QR Verify] ✅ Reservation {reservation.ReservationId} confirmed successfully");

            return new QRVerificationResponse
            {
                Success = true,
                Message = "Reservation confirmed successfully! Vehicle is ready for pickup.",
                Reservation = reservation
            };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[QR Verify] ❌ Error: {ex.Message}");
            return new QRVerificationResponse
            {
                Success = false,
                Message = $"Error verifying QR code: {ex.Message}"
            };
        }
    }
}
