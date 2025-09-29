using Microsoft.Data.SqlClient;
using System.Data;

namespace EVRentalApi.Infrastructure.Repositories;

public interface IOTPRepository
{
    Task<bool> StoreOTPAsync(string email, string otpCode, DateTime expiresAt);
    Task<(bool isValid, bool isExpired)> VerifyOTPAsync(string email, string otpCode);
    Task<bool> MarkOTPAsUsedAsync(string email, string otpCode);
    Task CleanupExpiredOTPsAsync();
}

public sealed class OTPRepository : IOTPRepository
{
    private readonly Func<SqlConnection> _connFactory;

    public OTPRepository(Func<SqlConnection> connFactory)
    {
        _connFactory = connFactory;
    }

    // Store OTP code
    public async Task<bool> StoreOTPAsync(string email, string otpCode, DateTime expiresAt)
    {
        const string sql = @"
INSERT INTO dbo.otp_codes (email, otp_code, expires_at, created_at, is_used)
VALUES (@Email, @OTPCode, @ExpiresAt, @CreatedAt, 0)";

        await using var conn = _connFactory();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand(sql, conn)
        {
            CommandType = CommandType.Text
        };

        cmd.Parameters.AddWithValue("@Email", email);
        cmd.Parameters.AddWithValue("@OTPCode", otpCode);
        cmd.Parameters.AddWithValue("@ExpiresAt", expiresAt);
        cmd.Parameters.AddWithValue("@CreatedAt", DateTime.UtcNow);

        try
        {
            var affected = await cmd.ExecuteNonQueryAsync();
            return affected > 0;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[OTPRepository] StoreOTPAsync error: {ex.Message}");
            return false;
        }
    }

    // Verify OTP code
    public async Task<(bool isValid, bool isExpired)> VerifyOTPAsync(string email, string otpCode)
    {
        const string sql = @"
SELECT TOP 1 expires_at, is_used
FROM otp_codes 
WHERE email = @Email 
  AND otp_code = @OTPCode 
  AND is_used = 0
ORDER BY created_at DESC";

        await using var conn = _connFactory();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand(sql, conn)
        {
            CommandType = CommandType.Text
        };

        cmd.Parameters.AddWithValue("@Email", email);
        cmd.Parameters.AddWithValue("@OTPCode", otpCode);

        await using var reader = await cmd.ExecuteReaderAsync();
        if (await reader.ReadAsync())
        {
            var expiresAt = Convert.ToDateTime(reader["expires_at"]);
            var isUsed = Convert.ToBoolean(reader["is_used"]);
            
            if (isUsed)
            {
                return (false, false); // Already used
            }
            
            if (DateTime.UtcNow > expiresAt)
            {
                return (false, true); // Expired
            }
            
            return (true, false); // Valid
        }
        
        return (false, false); // Not found
    }

    // Mark OTP as used
    public async Task<bool> MarkOTPAsUsedAsync(string email, string otpCode)
    {
        const string sql = @"
UPDATE otp_codes 
SET is_used = 1, used_at = @UsedAt
WHERE email = @Email AND otp_code = @OTPCode";

        await using var conn = _connFactory();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand(sql, conn)
        {
            CommandType = CommandType.Text
        };

        cmd.Parameters.AddWithValue("@Email", email);
        cmd.Parameters.AddWithValue("@OTPCode", otpCode);
        cmd.Parameters.AddWithValue("@UsedAt", DateTime.UtcNow);

        try
        {
            var rowsAffected = await cmd.ExecuteNonQueryAsync();
            return rowsAffected > 0;
        }
        catch
        {
            return false;
        }
    }

    // Clean up expired OTPs
    public async Task CleanupExpiredOTPsAsync()
    {
        const string sql = "DELETE FROM otp_codes WHERE expires_at < @Now";
        
        await using var conn = _connFactory();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand(sql, conn)
        {
            CommandType = CommandType.Text
        };

        cmd.Parameters.AddWithValue("@Now", DateTime.UtcNow);
        await cmd.ExecuteNonQueryAsync();
    }
}
