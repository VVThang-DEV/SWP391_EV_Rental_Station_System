using Microsoft.Data.SqlClient;
using EVRentalApi.Models;

namespace EVRentalApi.Infrastructure.Repositories;

public class QRCodeRepository : IQRCodeRepository
{
    private readonly string _connectionString;

    public QRCodeRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("EVRentalDB") 
            ?? throw new InvalidOperationException("EVRentalDB connection string not found");
    }

    public async Task<QRCodeResponse> SaveQRCodeAsync(SaveQRCodeRequest request)
    {
        try
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            // Use the QR code data directly from client-side (already generated)
            var qrCodeData = request.QRCodeData;

            // Parse to extract end time for expiry
            DateTime expiresAt;
            try
            {
                var jsonDoc = System.Text.Json.JsonDocument.Parse(qrCodeData);
                var endTimeStr = jsonDoc.RootElement.GetProperty("endTime").GetString();
                expiresAt = DateTime.Parse(endTimeStr ?? DateTime.Now.AddDays(1).ToString());
            }
            catch
            {
                // Default to 1 day from now if parsing fails
                expiresAt = DateTime.Now.AddDays(1);
            }

            // Check if QR code already exists for this reservation
            var checkExistingSql = @"
                SELECT qr_id, code, status, expires_at, created_at
                FROM pickup_qr_codes
                WHERE reservation_id = @ReservationId";

            using var checkCmd = new SqlCommand(checkExistingSql, connection);
            checkCmd.Parameters.AddWithValue("@ReservationId", request.ReservationId);

            using var existingReader = await checkCmd.ExecuteReaderAsync();
            if (await existingReader.ReadAsync())
            {
                // QR code already exists, return it
                var existingQRCode = new QRCodeDto
                {
                    QrId = existingReader.GetInt32(existingReader.GetOrdinal("qr_id")),
                    ReservationId = request.ReservationId,
                    Code = existingReader.GetString(existingReader.GetOrdinal("code")),
                    Status = existingReader.GetString(existingReader.GetOrdinal("status")),
                    ExpiresAt = existingReader.GetDateTime(existingReader.GetOrdinal("expires_at")),
                    CreatedAt = existingReader.GetDateTime(existingReader.GetOrdinal("created_at"))
                };

                await existingReader.CloseAsync();

                Console.WriteLine($"[QR] QR code already exists for reservation {request.ReservationId}");
                return new QRCodeResponse
                {
                    Success = true,
                    Message = "QR code already exists for this reservation",
                    QRCode = existingQRCode
                };
            }
            await existingReader.CloseAsync();

            // Create new QR code - expiresAt already parsed above

            var insertSql = @"
                INSERT INTO pickup_qr_codes (reservation_id, code, status, expires_at, created_at)
                OUTPUT INSERTED.qr_id, INSERTED.reservation_id, INSERTED.code, 
                       INSERTED.status, INSERTED.expires_at, INSERTED.created_at
                VALUES (@ReservationId, @Code, @Status, @ExpiresAt, GETDATE())";

            using var command = new SqlCommand(insertSql, connection);
            command.Parameters.AddWithValue("@ReservationId", request.ReservationId);
            command.Parameters.AddWithValue("@Code", qrCodeData);
            command.Parameters.AddWithValue("@Status", "active");
            command.Parameters.AddWithValue("@ExpiresAt", expiresAt);

            using var reader = await command.ExecuteReaderAsync();
            
            if (await reader.ReadAsync())
            {
                var qrCode = new QRCodeDto
                {
                    QrId = reader.GetInt32(reader.GetOrdinal("qr_id")),
                    ReservationId = reader.GetInt32(reader.GetOrdinal("reservation_id")),
                    Code = reader.GetString(reader.GetOrdinal("code")),
                    Status = reader.GetString(reader.GetOrdinal("status")),
                    ExpiresAt = reader.GetDateTime(reader.GetOrdinal("expires_at")),
                    CreatedAt = reader.GetDateTime(reader.GetOrdinal("created_at"))
                };

                Console.WriteLine($"[QR] ✅ QR code created successfully for reservation {request.ReservationId}");

                return new QRCodeResponse
                {
                    Success = true,
                    Message = "QR code created successfully",
                    QRCode = qrCode
                };
            }

            return new QRCodeResponse
            {
                Success = false,
                Message = "Failed to create QR code"
            };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[QR] ❌ Error creating QR code: {ex.Message}");
            return new QRCodeResponse
            {
                Success = false,
                Message = $"Error creating QR code: {ex.Message}"
            };
        }
    }

    public async Task<QRCodeDto?> GetQRCodeByCodeAsync(string code)
    {
        try
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            var sql = @"
                SELECT qr_id, reservation_id, rental_id, code, status, expires_at, used_at, created_at
                FROM pickup_qr_codes
                WHERE code = @Code";

            using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@Code", code);

            using var reader = await command.ExecuteReaderAsync();
            
            if (await reader.ReadAsync())
            {
                var qrIdOrdinal = reader.GetOrdinal("qr_id");
                var reservationIdOrdinal = reader.GetOrdinal("reservation_id");
                var rentalIdOrdinal = reader.GetOrdinal("rental_id");
                var codeOrdinal = reader.GetOrdinal("code");
                var statusOrdinal = reader.GetOrdinal("status");
                var expiresAtOrdinal = reader.GetOrdinal("expires_at");
                var usedAtOrdinal = reader.GetOrdinal("used_at");
                var createdAtOrdinal = reader.GetOrdinal("created_at");

                return new QRCodeDto
                {
                    QrId = reader.GetInt32(qrIdOrdinal),
                    ReservationId = reader.IsDBNull(reservationIdOrdinal) 
                        ? null 
                        : reader.GetInt32(reservationIdOrdinal),
                    RentalId = reader.IsDBNull(rentalIdOrdinal) 
                        ? null 
                        : reader.GetInt32(rentalIdOrdinal),
                    Code = reader.GetString(codeOrdinal),
                    Status = reader.GetString(statusOrdinal),
                    ExpiresAt = reader.GetDateTime(expiresAtOrdinal),
                    UsedAt = reader.IsDBNull(usedAtOrdinal) 
                        ? null 
                        : reader.GetDateTime(usedAtOrdinal),
                    CreatedAt = reader.GetDateTime(createdAtOrdinal)
                };
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[QR] Error getting QR code: {ex.Message}");
        }

        return null;
    }

    public async Task<QRCodeDto?> GetQRCodeByReservationIdAsync(int reservationId)
    {
        try
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            var sql = @"
                SELECT qr_id, reservation_id, rental_id, code, status, expires_at, used_at, created_at
                FROM pickup_qr_codes
                WHERE reservation_id = @ReservationId";

            using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@ReservationId", reservationId);

            using var reader = await command.ExecuteReaderAsync();
            
            if (await reader.ReadAsync())
            {
                var qrIdOrdinal = reader.GetOrdinal("qr_id");
                var reservationIdOrdinal = reader.GetOrdinal("reservation_id");
                var rentalIdOrdinal = reader.GetOrdinal("rental_id");
                var codeOrdinal = reader.GetOrdinal("code");
                var statusOrdinal = reader.GetOrdinal("status");
                var expiresAtOrdinal = reader.GetOrdinal("expires_at");
                var usedAtOrdinal = reader.GetOrdinal("used_at");
                var createdAtOrdinal = reader.GetOrdinal("created_at");

                return new QRCodeDto
                {
                    QrId = reader.GetInt32(qrIdOrdinal),
                    ReservationId = reader.IsDBNull(reservationIdOrdinal) 
                        ? null 
                        : reader.GetInt32(reservationIdOrdinal),
                    RentalId = reader.IsDBNull(rentalIdOrdinal) 
                        ? null 
                        : reader.GetInt32(rentalIdOrdinal),
                    Code = reader.GetString(codeOrdinal),
                    Status = reader.GetString(statusOrdinal),
                    ExpiresAt = reader.GetDateTime(expiresAtOrdinal),
                    UsedAt = reader.IsDBNull(usedAtOrdinal) 
                        ? null 
                        : reader.GetDateTime(usedAtOrdinal),
                    CreatedAt = reader.GetDateTime(createdAtOrdinal)
                };
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[QR] Error getting QR code by reservation: {ex.Message}");
        }

        return null;
    }

    public async Task<bool> MarkQRCodeAsUsedAsync(string code)
    {
        try
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            var sql = @"
                UPDATE pickup_qr_codes
                SET status = 'used', used_at = GETDATE()
                WHERE code = @Code AND status = 'active'";

            using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@Code", code);

            var rowsAffected = await command.ExecuteNonQueryAsync();
            return rowsAffected > 0;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[QR] Error marking QR code as used: {ex.Message}");
            return false;
        }
    }

    public async Task<bool> DeleteExpiredQRCodesAsync()
    {
        try
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            var sql = @"
                DELETE FROM pickup_qr_codes
                WHERE expires_at < GETDATE() AND status != 'used'";

            using var command = new SqlCommand(sql, connection);
            var rowsAffected = await command.ExecuteNonQueryAsync();

            if (rowsAffected > 0)
            {
                Console.WriteLine($"[QR] Deleted {rowsAffected} expired QR codes");
            }

            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[QR] Error deleting expired QR codes: {ex.Message}");
            return false;
        }
    }
}
