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
}


