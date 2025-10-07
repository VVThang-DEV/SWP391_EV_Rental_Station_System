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
            // Diagnostic logging to help debug failing updates
            Console.WriteLine("[PersonalInfoService] UpdatePersonalInfoAsync called with:");
            Console.WriteLine($"  Email: {request.Email}");
            Console.WriteLine($"  Cccd: {request.Cccd}");
            Console.WriteLine($"  LicenseNumber: {request.LicenseNumber}");
            Console.WriteLine($"  Address: {request.Address}");
            Console.WriteLine($"  Gender: {request.Gender}");
            Console.WriteLine($"  DateOfBirth: {request.DateOfBirth}");
            Console.WriteLine($"  AvatarUrl: {request.AvatarUrl}");

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
                Console.WriteLine($"[PersonalInfoService] User not found for email: {request.Email}");
                return new UpdatePersonalInfoResponse(false, "Người dùng không tồn tại");
            }

            // Update personal information
            // Update personal information
            var success = await _userRepository.UpdatePersonalInfoAsync(
                request.Email,
                request.Cccd,
                request.LicenseNumber,
                request.Address,
                request.Gender,
                dateOfBirth
            );

            Console.WriteLine($"[PersonalInfoService] UpdatePersonalInfoAsync repository result: {success}");

            if (success)
            {
                // Nếu có AvatarUrl thì upsert vào bảng user_documents
                if (!string.IsNullOrWhiteSpace(request.AvatarUrl))
                {
                    var userId = await _userRepository.GetUserIdByEmailAsync(request.Email);
                    if (userId > 0)
                    {
                        var avatarUpdated = await _userRepository.UpsertAvatarAsync(userId, request.AvatarUrl);
                        Console.WriteLine($"[PersonalInfoService] Avatar update result: {avatarUpdated}");
                    }
                }

                return new UpdatePersonalInfoResponse(true, "Cập nhật thông tin cá nhân thành công");
            }
            else
            {
                Console.WriteLine($"[PersonalInfoService] Update failed for email: {request.Email}");
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
    
   public async Task<UpdatePersonalInfoResponse> UpdateDocumentAsync(UpdatePersonalInfoRequest request)
{
    try
    {
        var userId = await _userRepository.GetUserIdByEmailAsync(request.Email);

        if (userId <= 0)
            return new UpdatePersonalInfoResponse(false, "Không tìm thấy người dùng với email này.");

        if (string.IsNullOrWhiteSpace(request.DocumentUrl))
            return new UpdatePersonalInfoResponse(false, "Không có giấy tờ nào để cập nhật.");

        var documentUpdated = await _userRepository.UpsertDocumentAsync(userId, request.DocumentUrl);
        Console.WriteLine($"[PersonalInfoService] Document update result: {documentUpdated}");

        return documentUpdated
            ? new UpdatePersonalInfoResponse(true, "Cập nhật giấy tờ thành công.")
            : new UpdatePersonalInfoResponse(false, "Không thể cập nhật giấy tờ.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[PersonalInfoService] UpdateDocumentAsync failed: {ex.Message}");
        return new UpdatePersonalInfoResponse(false, $"Đã xảy ra lỗi khi cập nhật giấy tờ: {ex.Message}");
    }
}


}
