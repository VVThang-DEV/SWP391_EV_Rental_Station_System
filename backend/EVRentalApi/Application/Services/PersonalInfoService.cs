using EVRentalApi.Infrastructure.Repositories;
using EVRentalApi.Models;

namespace EVRentalApi.Application.Services;

public class PersonalInfoService
{
    private readonly IUserRepository _userRepository;

    public PersonalInfoService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<UpdatePersonalInfoResponse> UpdatePersonalInfoAsync(UpdatePersonalInfoRequest request)
    {
        try
        {
            // Validate input
            if (string.IsNullOrWhiteSpace(request.Email))
            {
                return new UpdatePersonalInfoResponse(false, "Email không được để trống");
            }

            // Validate CCCD format (12 digits)
            if (!string.IsNullOrWhiteSpace(request.Cccd) && !IsValidCccd(request.Cccd))
            {
                return new UpdatePersonalInfoResponse(false, "Số CCCD phải có 12 chữ số");
            }

            // Validate license number format
            if (!string.IsNullOrWhiteSpace(request.LicenseNumber) && !IsValidLicenseNumber(request.LicenseNumber))
            {
                return new UpdatePersonalInfoResponse(false, "Số bằng lái xe không hợp lệ");
            }

            // Validate gender
            if (!string.IsNullOrWhiteSpace(request.Gender) && !IsValidGender(request.Gender))
            {
                return new UpdatePersonalInfoResponse(false, "Giới tính không hợp lệ");
            }

            // Parse date of birth
            DateTime? dateOfBirth = null;
            if (!string.IsNullOrWhiteSpace(request.DateOfBirth))
            {
                if (!DateTime.TryParse(request.DateOfBirth, out var parsedDate))
                {
                    return new UpdatePersonalInfoResponse(false, "Ngày sinh không hợp lệ");
                }
                dateOfBirth = parsedDate;
            }

            // Check if user exists
            if (!await _userRepository.UserExistsByEmailAsync(request.Email))
            {
                return new UpdatePersonalInfoResponse(false, "Người dùng không tồn tại");
            }

            // Update personal information
            var success = await _userRepository.UpdatePersonalInfoAsync(
                request.Email,
                request.Cccd,
                request.LicenseNumber,
                request.Address,
                request.Gender,
                dateOfBirth,
                request.AvatarUrl
            );

            if (success)
            {
                return new UpdatePersonalInfoResponse(true, "Cập nhật thông tin cá nhân thành công");
            }
            else
            {
                return new UpdatePersonalInfoResponse(false, "Có lỗi xảy ra khi cập nhật thông tin");
            }
        }
        catch (Exception ex)
        {
            return new UpdatePersonalInfoResponse(false, $"Lỗi hệ thống: {ex.Message}");
        }
    }

    private static bool IsValidCccd(string cccd)
    {
        return cccd.Length == 12 && cccd.All(char.IsDigit);
    }

    private static bool IsValidLicenseNumber(string licenseNumber)
    {
        // Basic validation for Vietnamese license number format
        return licenseNumber.Length >= 8 && licenseNumber.Length <= 15;
    }

    private static bool IsValidGender(string gender)
    {
        var validGenders = new[] { "male", "female", "other", "nam", "nữ", "khác" };
        return validGenders.Contains(gender.ToLower());
    }
}
