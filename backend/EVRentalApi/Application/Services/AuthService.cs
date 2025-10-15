using EVRentalApi.Infrastructure.Repositories;
using EVRentalApi.Models;

namespace EVRentalApi.Application.Services;

public sealed class AuthService
{
    private readonly IUserRepository _users;

    public AuthService(IUserRepository users)
    {
        _users = users;
    }

    public async Task<(bool ok, int userId, string fullName, string roleName)> LoginAdminOrStaffAsync(
        string email,
        string password,
        Func<string, string> hashFunc)
    {
        var hash = hashFunc(password);
        var found = await _users.GetAdminStaffByEmailHashAsync(email, hash);

        // Optional legacy fallback if some seed used plain (unlikely after our seed)
        if (!found.ok)
        {
            found = await _users.GetAdminStaffByEmailHashAsync(email, password);
        }

        return found.ok ? (true, found.userId, found.fullName!, found.roleName!) : (false, 0, string.Empty, string.Empty);
    }

    public async Task<(bool ok, int userId, string fullName, string roleName)> LoginAnyAsync(
        string email,
        string password,
        Func<string, string> hashFunc)
    {
        var hash = hashFunc(password);
        var found = await _users.GetByEmailHashAsync(email, hash);

        if (!found.ok)
        {
            // Optional legacy fallback if stored plain
            found = await _users.GetByEmailHashAsync(email, password);
        }

        return found.ok ? (true, found.userId, found.fullName!, found.roleName!) : (false, 0, string.Empty, string.Empty);
    }

    public async Task<RegisterResponse> RegisterCustomerAsync(RegisterRequest request, Func<string, string> hashFunc)
    {
        try
        {
            // Validate input
            if (string.IsNullOrWhiteSpace(request.FullName))
                return new RegisterResponse(false, "Họ và tên không được để trống");

            if (string.IsNullOrWhiteSpace(request.Email))
                return new RegisterResponse(false, "Email không được để trống");

            if (string.IsNullOrWhiteSpace(request.Phone))
                return new RegisterResponse(false, "Số điện thoại không được để trống");

            if (string.IsNullOrWhiteSpace(request.Password))
                return new RegisterResponse(false, "Mật khẩu không được để trống");

            if (!DateTime.TryParse(request.DateOfBirth, out var dateOfBirth))
                return new RegisterResponse(false, "Ngày sinh không hợp lệ");

            // Check if email already exists
            if (await _users.EmailExistsAsync(request.Email))
                return new RegisterResponse(false, "Email đã được sử dụng");

            // Check if phone already exists
            if (await _users.PhoneExistsAsync(request.Phone))
                return new RegisterResponse(false, "Số điện thoại đã được sử dụng");

            // Hash password
            var passwordHash = hashFunc(request.Password);

            // Register customer
            var (success, userId) = await _users.RegisterCustomerAsync(
                request.FullName,
                request.Email,
                request.Phone,
                dateOfBirth,
                passwordHash);

            if (success)
            {
                return new RegisterResponse(true, "Đăng ký thành công", userId, request.Email);
            }
            else
            {
                return new RegisterResponse(false, "Có lỗi xảy ra khi đăng ký");
            }
        }
        catch (Exception ex)
        {
            return new RegisterResponse(false, $"Lỗi hệ thống: {ex.Message}");
        }
    }

    public async Task<object?> GetUserInfoAsync(int userId)
    {
        try
        {
            var userInfo = await _users.GetUserInfoByIdAsync(userId);
            return userInfo;
        }
        catch (Exception ex)
        {
            throw new Exception($"Error retrieving user information: {ex.Message}");
        }
    }
}


