using Microsoft.Data.SqlClient;
using System.Data;

namespace EVRentalApi.Infrastructure.Repositories;

public interface IUserRepository
{
    Task<bool> UpsertAvatarAsync(int userId, string avatarUrl);

    Task<(bool ok, int userId, string? fullName, string? roleName)> GetAdminStaffByEmailHashAsync(string email, string passwordHash);
    Task<(bool ok, int userId, string? fullName, string? roleName)> GetByEmailHashAsync(string email, string passwordHash);
    Task<bool> EmailExistsAsync(string email);
    Task<bool> PhoneExistsAsync(string phone);
    Task<int> GetCustomerRoleIdAsync();
    Task<(bool success, int userId)> RegisterCustomerAsync(string fullName, string email, string phone, DateTime dateOfBirth, string passwordHash);
    Task<bool> UserExistsByEmailAsync(string email);
    Task<bool> UpdatePasswordAsync(string email, string newPasswordHash);
    Task<bool> UpdatePersonalInfoAsync(string email, string? cccd, string? licenseNumber, string? address, string? gender, DateTime? dateOfBirth, string? phone);
    Task<int> GetUserIdByEmailAsync(string email);
    Task<bool> UpsertDocumentAsync(int userId, string documentUrl, string documentType);
    Task<bool> UpdateDocumentAsync(int userId, string documentUrl, string documentType);
    Task<object?> GetUserInfoByIdAsync(int userId);
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
    public async Task<bool> UpdatePersonalInfoAsync(string email, string? cccd, string? licenseNumber, string? address, string? gender, DateTime? dateOfBirth, string? phone)
    {
        Console.WriteLine($"[UserRepository] UpdatePersonalInfoAsync called with email: {email}");
        
        await using var conn = _connFactory();
        await conn.OpenAsync();

        // Check if phone is being updated and if it conflicts with existing data
        if (!string.IsNullOrWhiteSpace(phone))
        {
            const string checkPhoneSql = @"
SELECT user_id, email, full_name
FROM users 
WHERE phone = @Phone AND email != @Email";
            
            await using var checkCmd = new SqlCommand(checkPhoneSql, conn);
            checkCmd.Parameters.AddWithValue("@Phone", phone);
            checkCmd.Parameters.AddWithValue("@Email", email);
            
            await using var reader = await checkCmd.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                var conflictingUserId = reader.GetInt32(0);
                var conflictingEmail = reader.GetString(1);
                var conflictingName = reader.GetString(2);
                Console.WriteLine($"[UserRepository] ❌ PHONE DUPLICATE: Phone {phone} is already used by user_id={conflictingUserId}, email={conflictingEmail}, name={conflictingName}");
                return false;
            }
        }
        
        // Force update by always updating updated_at, even if data hasn't changed
        const string sql = @"
UPDATE users 
SET cccd = CASE WHEN @Cccd IS NOT NULL THEN @Cccd ELSE cccd END,
    license_number = CASE WHEN @LicenseNumber IS NOT NULL THEN @LicenseNumber ELSE license_number END,
    address = CASE WHEN @Address IS NOT NULL THEN @Address ELSE address END,
    gender = CASE WHEN @Gender IS NOT NULL THEN @Gender ELSE gender END,
    date_of_birth = CASE WHEN @DateOfBirth IS NOT NULL THEN @DateOfBirth ELSE date_of_birth END,
    phone = CASE WHEN @Phone IS NOT NULL THEN @Phone ELSE phone END,
    updated_at = @UpdatedAt
WHERE email = @Email AND is_active = 1";

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
        cmd.Parameters.AddWithValue("@Phone", phone ?? (object)DBNull.Value);
        cmd.Parameters.AddWithValue("@UpdatedAt", DateTime.UtcNow);

        try
        {
            var rowsAffected = await cmd.ExecuteNonQueryAsync();
            Console.WriteLine($"[UserRepository] UpdatePersonalInfoAsync - rows affected: {rowsAffected}");
            
            if (rowsAffected == 0)
            {
                Console.WriteLine($"[UserRepository] No user found with email: {email}");
                
                // Check if user exists at all
                var checkSql = "SELECT user_id, is_active FROM users WHERE email = @Email";
                await using var checkCmd = new SqlCommand(checkSql, conn);
                checkCmd.Parameters.AddWithValue("@Email", email);
                var checkResult = await checkCmd.ExecuteScalarAsync();
                
                if (checkResult == null)
                {
                    Console.WriteLine($"[UserRepository] User does not exist in database");
                }
                else
                {
                    Console.WriteLine($"[UserRepository] User exists with is_active status");
                }
            }
            
            return rowsAffected > 0;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[UserRepository] UpdatePersonalInfoAsync error: {ex.Message}");
            return false;
        }
    }

    public async Task<bool> UpsertAvatarAsync(int userId, string avatarUrl)
    {
        const string sql = @"
IF EXISTS (SELECT 1 FROM user_documents WHERE user_id = @UserId AND document_type = 'avatar')
BEGIN
    UPDATE user_documents
    SET file_url = @AvatarUrl,
        uploaded_at = GETDATE()
    WHERE user_id = @UserId AND document_type = 'avatar';
END
ELSE
BEGIN
    INSERT INTO user_documents (user_id, document_type, file_url, status, uploaded_at)
    VALUES (@UserId, 'avatar', @AvatarUrl, 'approved', GETDATE());
END
";

        await using var conn = _connFactory();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@UserId", userId);
        cmd.Parameters.AddWithValue("@AvatarUrl", avatarUrl);

        try
        {
            await cmd.ExecuteNonQueryAsync();
            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[UpsertAvatarAsync] Error: {ex.Message}");
            return false;
        }
    }

    public async Task<int> GetUserIdByEmailAsync(string email)
    {
        const string sql = "SELECT user_id FROM users WHERE email = @Email AND is_active = 1";

        await using var conn = _connFactory();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@Email", email);

        var result = await cmd.ExecuteScalarAsync();
        return result == null ? 0 : Convert.ToInt32(result);
    }

    public async Task<bool> UpsertDocumentAsync(int userId, string documentUrl, string documentType)
    {
        const string sql = @"
IF EXISTS (SELECT 1 FROM user_documents WHERE user_id = @UserId AND document_type = @DocumentType)
BEGIN
    UPDATE user_documents
    SET file_url = @DocumentUrl,
        uploaded_at = GETDATE()
    WHERE user_id = @UserId AND document_type = @DocumentType;
END
ELSE
BEGIN
    INSERT INTO user_documents (user_id, document_type, file_url, status, uploaded_at)
    VALUES (@UserId, @DocumentType, @DocumentUrl, 'pending', GETDATE());
END
";

        await using var conn = _connFactory();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@UserId", userId);
        cmd.Parameters.AddWithValue("@DocumentUrl", documentUrl);
        cmd.Parameters.AddWithValue("@DocumentType", documentType);

        try
        {
            await cmd.ExecuteNonQueryAsync();
            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[UpsertDocumentAsync] Error: {ex.Message}");
            return false;
        }
    }

    public async Task<bool> UpdateDocumentAsync(int userId, string documentUrl, string documentType)
    {
        return await UpsertDocumentAsync(userId, documentUrl, documentType);
    }

    public async Task<object?> GetUserInfoByIdAsync(int userId)
    {
        const string sql = @"
SELECT 
    u.user_id,
    u.email,
    u.full_name,
    u.phone,
    u.cccd,
    u.license_number,
    u.address,
    u.gender,
    u.date_of_birth,
    u.position,
    r.role_name,
    u.created_at,
    u.updated_at
FROM users u
JOIN roles r ON u.role_id = r.role_id
WHERE u.user_id = @UserId AND u.is_active = 1";

        await using var conn = _connFactory();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand(sql, conn)
        {
            CommandType = CommandType.Text
        };
        cmd.Parameters.AddWithValue("@UserId", userId);

        await using var reader = await cmd.ExecuteReaderAsync();
        if (await reader.ReadAsync())
        {
            return new
            {
                userId = Convert.ToInt32(reader["user_id"]),
                email = reader["email"].ToString(),
                fullName = reader["full_name"].ToString(),
                phone = reader["phone"]?.ToString(),
                cccd = reader["cccd"]?.ToString(),
                licenseNumber = reader["license_number"]?.ToString(),
                address = reader["address"]?.ToString(),
                gender = reader["gender"]?.ToString(),
                dateOfBirth = reader["date_of_birth"] != DBNull.Value ? Convert.ToDateTime(reader["date_of_birth"]).ToString("yyyy-MM-dd") : null,
                position = reader["position"]?.ToString(),
                roleName = reader["role_name"].ToString(),
                createdAt = Convert.ToDateTime(reader["created_at"]),
                updatedAt = Convert.ToDateTime(reader["updated_at"])
            };
        }
        return null;
    }
}


