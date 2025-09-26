using Microsoft.Data.SqlClient;
using System.Data;

namespace EVRentalApi.Infrastructure.Repositories;

public sealed class UserRepository
{
    private readonly Func<SqlConnection> _connFactory;

    public UserRepository(Func<SqlConnection> connFactory)
    {
        _connFactory = connFactory;
    }

    public async Task<(bool ok, int userId, string? fullName, string? roleName)> GetAdminStaffByEmailHashAsync(
        string email,
        string passwordHash)
    {
        const string sql = @"
SELECT TOP 1 u.user_id, u.full_name, r.role_name
FROM users u
JOIN roles r ON u.role_id = r.role_id
WHERE u.email = @Email
  AND u.password_hash = @PasswordHash
  AND u.is_active = 1
  AND r.role_name IN ('admin','staff')";

        await using var conn = _connFactory();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand(sql, conn)
        {
            CommandType = CommandType.Text
        };
        cmd.Parameters.AddWithValue("@Email", email);
        cmd.Parameters.AddWithValue("@PasswordHash", passwordHash);

        await using var reader = await cmd.ExecuteReaderAsync();
        if (await reader.ReadAsync())
        {
            return (true, Convert.ToInt32(reader["user_id"]), reader["full_name"].ToString(), reader["role_name"].ToString());
        }
        return (false, 0, null, null);
    }

    public async Task<(bool ok, int userId)> CreateCustomerAsync(string email, string passwordHash, string fullName)
    {
        using var conn = _connFactory();
        await conn.OpenAsync();

        // Check if email exists
        using (var checkCmd = new SqlCommand("SELECT COUNT(*) FROM Customers WHERE Email = @Email", conn))
        {
            checkCmd.Parameters.AddWithValue("@Email", email);
            var exists = (int)await checkCmd.ExecuteScalarAsync() > 0;
            if (exists)
                return (false, 0);
        }

        // Insert new customer
        using (var cmd = new SqlCommand(
            "INSERT INTO Customers (Email, PasswordHash, FullName) OUTPUT INSERTED.CustomerId VALUES (@Email, @PasswordHash, @FullName)", conn))
        {
            cmd.Parameters.AddWithValue("@Email", email);
            cmd.Parameters.AddWithValue("@PasswordHash", passwordHash);
            cmd.Parameters.AddWithValue("@FullName", fullName);

            var userId = (int)await cmd.ExecuteScalarAsync();
            return (true, userId);
        }
    }

    public async Task<(bool ok, int userId, string token)> CreateCustomerWithVerificationAsync(string email, string passwordHash, string fullName)
    {
        using var conn = _connFactory();
        await conn.OpenAsync();

        using (var tx = conn.BeginTransaction())
        {
            // Check if email exists
            using (var checkCmd = new SqlCommand("SELECT COUNT(*) FROM Customers WHERE Email = @Email", conn, tx))
            {
                checkCmd.Parameters.AddWithValue("@Email", email);
                var exists = (int)await checkCmd.ExecuteScalarAsync() > 0;
                if (exists)
                {
                    return (false, 0, string.Empty);
                }
            }

            int userId;
            using (var cmd = new SqlCommand(
                "INSERT INTO Customers (Email, PasswordHash, FullName, IsVerified) OUTPUT INSERTED.CustomerId VALUES (@Email, @PasswordHash, @FullName, 0)", conn, tx))
            {
                cmd.Parameters.AddWithValue("@Email", email);
                cmd.Parameters.AddWithValue("@PasswordHash", passwordHash);
                cmd.Parameters.AddWithValue("@FullName", fullName);
                userId = (int)await cmd.ExecuteScalarAsync();
            }

            // Create verification token
            var token = Guid.NewGuid().ToString("N");
            using (var tokenCmd = new SqlCommand(
                "INSERT INTO EmailVerifications (CustomerId, Token, ExpiresAt, Used) VALUES (@CustomerId, @Token, DATEADD(hour, 24, SYSUTCDATETIME()), 0)", conn, tx))
            {
                tokenCmd.Parameters.AddWithValue("@CustomerId", userId);
                tokenCmd.Parameters.AddWithValue("@Token", token);
                await tokenCmd.ExecuteNonQueryAsync();
            }

            tx.Commit();
            return (true, userId, token);
        }
    }

    public async Task<bool> VerifyEmailAsync(string token)
    {
        using var conn = _connFactory();
        await conn.OpenAsync();

        using var tx = conn.BeginTransaction();

        int? customerId = null;
        using (var getCmd = new SqlCommand(
            "SELECT TOP 1 CustomerId FROM EmailVerifications WHERE Token = @Token AND Used = 0 AND ExpiresAt > SYSUTCDATETIME()", conn, tx))
        {
            getCmd.Parameters.AddWithValue("@Token", token);
            var obj = await getCmd.ExecuteScalarAsync();
            if (obj == null)
            {
                tx.Rollback();
                return false;
            }
            customerId = (int)obj;
        }

        using (var updUser = new SqlCommand("UPDATE Customers SET IsVerified = 1 WHERE CustomerId = @Id", conn, tx))
        {
            updUser.Parameters.AddWithValue("@Id", customerId);
            await updUser.ExecuteNonQueryAsync();
        }

        using (var updToken = new SqlCommand("UPDATE EmailVerifications SET Used = 1 WHERE Token = @Token", conn, tx))
        {
            updToken.Parameters.AddWithValue("@Token", token);
            await updToken.ExecuteNonQueryAsync();
        }

        tx.Commit();
        return true;
    }
}


