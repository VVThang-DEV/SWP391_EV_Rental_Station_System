using Microsoft.Data.SqlClient;
using System.Data;

namespace EVRentalApi.Infrastructure.Repositories;

public interface IUserRepository
{
    Task<(bool ok, int userId, string? fullName, string? roleName)> GetAdminStaffByEmailHashAsync(string email, string passwordHash);
    Task<(bool ok, int userId, string? fullName, string? roleName)> GetByEmailHashAsync(string email, string passwordHash);
    Task<bool> EmailExistsAsync(string email);
    Task<bool> PhoneExistsAsync(string phone);
    Task<int> GetCustomerRoleIdAsync();
    Task<(bool success, int userId)> RegisterCustomerAsync(string fullName, string email, string phone, DateTime dateOfBirth, string passwordHash);
    Task<bool> UserExistsByEmailAsync(string email);
    Task<bool> UpdatePasswordAsync(string email, string newPasswordHash);
    Task<bool> UpdatePersonalInfoAsync(string email, string? cccd, string? licenseNumber, string? address, string? gender, DateTime? dateOfBirth, string? avatarUrl);
}

public sealed class UserRepository : IUserRepository
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

    // Generic: get any active user by email + password hash (any role)
    public async Task<(bool ok, int userId, string? fullName, string? roleName)> GetByEmailHashAsync(
        string email,
        string passwordHash)
    {
        const string sql = @"
SELECT TOP 1 u.user_id, u.full_name, r.role_name
FROM users u
JOIN roles r ON u.role_id = r.role_id
WHERE u.email = @Email
  AND u.password_hash = @PasswordHash
  AND u.is_active = 1";

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

    // Check if email already exists
    public async Task<bool> EmailExistsAsync(string email)
    {
        const string sql = "SELECT COUNT(1) FROM users WHERE email = @Email";
        
        await using var conn = _connFactory();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand(sql, conn)
        {
            CommandType = CommandType.Text
        };
        cmd.Parameters.AddWithValue("@Email", email);
        
        var count = await cmd.ExecuteScalarAsync();
        return Convert.ToInt32(count) > 0;
    }

    // Check if phone already exists
    public async Task<bool> PhoneExistsAsync(string phone)
    {
        const string sql = "SELECT COUNT(1) FROM users WHERE phone = @Phone";
        
        await using var conn = _connFactory();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand(sql, conn)
        {
            CommandType = CommandType.Text
        };
        cmd.Parameters.AddWithValue("@Phone", phone);
        
        var count = await cmd.ExecuteScalarAsync();
        return Convert.ToInt32(count) > 0;
    }

    // Get customer role ID
    public async Task<int> GetCustomerRoleIdAsync()
    {
        const string sql = "SELECT role_id FROM roles WHERE role_name = 'customer'";
        
        await using var conn = _connFactory();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand(sql, conn)
        {
            CommandType = CommandType.Text
        };
        
        var result = await cmd.ExecuteScalarAsync();
        return result != null ? Convert.ToInt32(result) : 0;
    }

    // Register new customer
    public async Task<(bool success, int userId)> RegisterCustomerAsync(
        string fullName,
        string email,
        string phone,
        DateTime dateOfBirth,
        string passwordHash)
    {
        const string sql = @"
INSERT INTO users (email, password_hash, role_id, full_name, phone, created_at, updated_at, is_active)
VALUES (@Email, @PasswordHash, @RoleId, @FullName, @Phone, @CreatedAt, @UpdatedAt, 1);
SELECT SCOPE_IDENTITY();";

        await using var conn = _connFactory();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand(sql, conn)
        {
            CommandType = CommandType.Text
        };
        
        var roleId = await GetCustomerRoleIdAsync();
        if (roleId == 0)
        {
            return (false, 0);
        }

        cmd.Parameters.AddWithValue("@Email", email);
        cmd.Parameters.AddWithValue("@PasswordHash", passwordHash);
        cmd.Parameters.AddWithValue("@RoleId", roleId);
        cmd.Parameters.AddWithValue("@FullName", fullName);
        cmd.Parameters.AddWithValue("@Phone", phone);
        cmd.Parameters.AddWithValue("@CreatedAt", DateTime.UtcNow);
        cmd.Parameters.AddWithValue("@UpdatedAt", DateTime.UtcNow);

        try
        {
            var userId = await cmd.ExecuteScalarAsync();
            return (true, Convert.ToInt32(userId));
        }
        catch
        {
            return (false, 0);
        }
    }

    // Check if user exists by email (for forgot password)
    public async Task<bool> UserExistsByEmailAsync(string email)
    {
        const string sql = "SELECT COUNT(1) FROM users WHERE email = @Email AND is_active = 1";
        
        await using var conn = _connFactory();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand(sql, conn)
        {
            CommandType = CommandType.Text
        };
        cmd.Parameters.AddWithValue("@Email", email);
        
        var count = await cmd.ExecuteScalarAsync();
        return Convert.ToInt32(count) > 0;
    }

    // Update user password
    public async Task<bool> UpdatePasswordAsync(string email, string newPasswordHash)
    {
        const string sql = @"
UPDATE users 
SET password_hash = @NewPasswordHash, updated_at = @UpdatedAt
WHERE email = @Email AND is_active = 1";

        await using var conn = _connFactory();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand(sql, conn)
        {
            CommandType = CommandType.Text
        };

        cmd.Parameters.AddWithValue("@Email", email);
        cmd.Parameters.AddWithValue("@NewPasswordHash", newPasswordHash);
        cmd.Parameters.AddWithValue("@UpdatedAt", DateTime.UtcNow);

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

    // Update personal information
    public async Task<bool> UpdatePersonalInfoAsync(string email, string? cccd, string? licenseNumber, string? address, string? gender, DateTime? dateOfBirth, string? avatarUrl)
    {
        const string sql = @"
UPDATE users 
SET cccd = @Cccd,
    license_number = @LicenseNumber,
    address = @Address,
    gender = @Gender,
    date_of_birth = @DateOfBirth,
    avatar_url = @AvatarUrl,
    updated_at = @UpdatedAt
WHERE email = @Email AND is_active = 1";

        await using var conn = _connFactory();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand(sql, conn)
        {
            CommandType = CommandType.Text
        };

        cmd.Parameters.AddWithValue("@Email", email);
        cmd.Parameters.AddWithValue("@Cccd", cccd ?? (object)DBNull.Value);
        cmd.Parameters.AddWithValue("@LicenseNumber", licenseNumber ?? (object)DBNull.Value);
        cmd.Parameters.AddWithValue("@Address", address ?? (object)DBNull.Value);
        cmd.Parameters.AddWithValue("@Gender", gender ?? (object)DBNull.Value);
        cmd.Parameters.AddWithValue("@DateOfBirth", dateOfBirth ?? (object)DBNull.Value);
        cmd.Parameters.AddWithValue("@AvatarUrl", avatarUrl ?? (object)DBNull.Value);
        cmd.Parameters.AddWithValue("@UpdatedAt", DateTime.UtcNow);

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
}


