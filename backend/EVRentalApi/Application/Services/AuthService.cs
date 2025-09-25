using EVRentalApi.Infrastructure.Repositories;

namespace EVRentalApi.Application.Services;

public sealed class AuthService
{
    private readonly UserRepository _users;

    public AuthService(UserRepository users)
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
}


