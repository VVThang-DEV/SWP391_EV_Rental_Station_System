using System.Security.Cryptography;
using System.Text;

namespace EVRentalApi.Application.Services;

public interface IPasswordResetService
{
    string GenerateResetToken(int userId, string email);
    (bool isValid, int userId, string email) VerifyResetToken(string token);
}

public class PasswordResetService : IPasswordResetService
{
    private readonly IConfiguration _config;

    public PasswordResetService(IConfiguration config)
    {
        _config = config;
    }

    public string GenerateResetToken(int userId, string email)
    {
        // Create a simple token: userId|email|expiryTimestamp|signature
        var expiryTimestamp = DateTimeOffset.UtcNow.AddHours(24).ToUnixTimeSeconds();
        var data = $"{userId}|{email}|{expiryTimestamp}";
        
        // Sign the data
        var signature = SignData(data);
        var token = $"{data}|{signature}";
        
        // Base64 encode for URL safety
        var tokenBytes = Encoding.UTF8.GetBytes(token);
        return Convert.ToBase64String(tokenBytes)
            .Replace("+", "-")
            .Replace("/", "_")
            .Replace("=", "");
    }

    public (bool isValid, int userId, string email) VerifyResetToken(string token)
    {
        try
        {
            // Decode from Base64
            var paddedToken = token.Replace("-", "+").Replace("_", "/");
            var padding = (4 - paddedToken.Length % 4) % 4;
            paddedToken += new string('=', padding);
            
            var tokenBytes = Convert.FromBase64String(paddedToken);
            var tokenString = Encoding.UTF8.GetString(tokenBytes);
            
            // Parse token: userId|email|expiryTimestamp|signature
            var parts = tokenString.Split('|');
            if (parts.Length != 4)
            {
                Console.WriteLine("[PasswordReset] Invalid token format");
                return (false, 0, string.Empty);
            }

            var userId = int.Parse(parts[0]);
            var email = parts[1];
            var expiryTimestamp = long.Parse(parts[2]);
            var receivedSignature = parts[3];

            // Verify signature
            var data = $"{userId}|{email}|{expiryTimestamp}";
            var expectedSignature = SignData(data);
            
            if (receivedSignature != expectedSignature)
            {
                Console.WriteLine("[PasswordReset] Invalid signature");
                return (false, 0, string.Empty);
            }

            // Check expiry
            var expiryTime = DateTimeOffset.FromUnixTimeSeconds(expiryTimestamp);
            if (DateTimeOffset.UtcNow > expiryTime)
            {
                Console.WriteLine($"[PasswordReset] Token expired at {expiryTime}");
                return (false, 0, string.Empty);
            }

            Console.WriteLine($"[PasswordReset] Token verified successfully for user {userId}");
            return (true, userId, email);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[PasswordReset] Error verifying token: {ex.Message}");
            return (false, 0, string.Empty);
        }
    }

    private string SignData(string data)
    {
        // Use a secret key from configuration
        var secretKey = _config["Security:PasswordResetSecret"] ?? "EVRentals_PasswordReset_Secret_Key_2024";
        var keyBytes = Encoding.UTF8.GetBytes(secretKey);
        var dataBytes = Encoding.UTF8.GetBytes(data);
        
        using var hmac = new HMACSHA256(keyBytes);
        var hash = hmac.ComputeHash(dataBytes);
        return Convert.ToBase64String(hash);
    }
}

