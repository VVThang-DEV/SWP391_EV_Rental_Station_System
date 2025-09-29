using EVRentalApi.Infrastructure.Repositories;
using EVRentalApi.Models;
using System.Security.Cryptography;
using System.Text;

namespace EVRentalApi.Application.Services;

public sealed class ForgotPasswordService
{
    private readonly IUserRepository _userRepository;
    private readonly OTPService _otpService;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _config;

    public ForgotPasswordService(
        IUserRepository userRepository, 
        OTPService otpService, 
        IEmailService emailService, 
        IConfiguration config)
    {
        _userRepository = userRepository;
        _otpService = otpService;
        _emailService = emailService;
        _config = config;
    }

    // Initiate forgot password process
    public async Task<ForgotPasswordResponse> InitiateForgotPasswordAsync(ForgotPasswordRequest request)
    {
        try
        {
            // Validate email
            if (string.IsNullOrWhiteSpace(request.Email))
            {
                return new ForgotPasswordResponse(false, "Email không được để trống");
            }

            // Check if user exists
            var userExists = await _userRepository.UserExistsByEmailAsync(request.Email);
            if (!userExists)
            {
                // For security, don't reveal if email exists or not
                return new ForgotPasswordResponse(true, "Nếu email tồn tại, chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu");
            }

            // Generate and send OTP
            var sendOtpRequest = new SendOTPRequest(request.Email);
            var otpResult = await _otpService.SendOTPAsync(sendOtpRequest);
            
            if (!otpResult.Success)
            {
                return new ForgotPasswordResponse(false, "Không thể gửi mã xác thực. Vui lòng thử lại sau");
            }

            // Send a notification email (OTP email already sent by OTPService)
            var subject = "EVRentals - Hướng dẫn đặt lại mật khẩu";
            var body = $@"
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                    <h2 style='color: #2563eb;'>Đặt lại mật khẩu</h2>
                    <p>Chúng tôi đã gửi <strong>mã xác thực 6 số</strong> đến email của bạn.</p>
                    <p>Vui lòng quay lại trang đặt lại mật khẩu và nhập mã để tiếp tục.</p>
                    <p><strong>Lưu ý:</strong> Mã sẽ hết hạn sau 5 phút.</p>
                    <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
                    <hr style='margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;'>
                    <p style='color: #6b7280; font-size: 14px;'>EVRentals - Hệ thống thuê xe điện</p>
                </div>";

            var overrideTo = _config.GetSection("Smtp")["OverrideToEmail"];
            var recipient = string.IsNullOrWhiteSpace(overrideTo) ? request.Email : overrideTo;
            
            try
            {
                await _emailService.SendAsync(recipient, subject, body);
            }
            catch (Exception mailEx)
            {
                Console.WriteLine($"[Email] Failed to send forgot password email: {mailEx.Message}");
                // Still consider successful for security
            }

            return new ForgotPasswordResponse(true, "Nếu email tồn tại, chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu");
        }
        catch (Exception ex)
        {
            return new ForgotPasswordResponse(false, $"Lỗi hệ thống: {ex.Message}");
        }
    }

    // Reset password with OTP verification
    public async Task<ForgotPasswordResponse> ResetPasswordAsync(ResetPasswordRequest request)
    {
        try
        {
            // Validate input
            if (string.IsNullOrWhiteSpace(request.Email))
            {
                return new ForgotPasswordResponse(false, "Email không được để trống");
            }

            if (string.IsNullOrWhiteSpace(request.OTPCode))
            {
                return new ForgotPasswordResponse(false, "Mã OTP không được để trống");
            }

            if (string.IsNullOrWhiteSpace(request.NewPassword))
            {
                return new ForgotPasswordResponse(false, "Mật khẩu mới không được để trống");
            }

            // Validate password strength
            if (request.NewPassword.Length < 8)
            {
                return new ForgotPasswordResponse(false, "Mật khẩu phải có ít nhất 8 ký tự");
            }

            // Verify OTP but do not mark as used yet
            var otpRequest = new OTPRequest(request.Email, request.OTPCode);
            var otpResult = await _otpService.VerifyOTPAsync(otpRequest);

            if (!otpResult.Success)
            {
                return new ForgotPasswordResponse(false, otpResult.Message);
            }

            // Hash new password
            var hashedPassword = HashPassword(request.NewPassword);

            // Update password in database
            var updateResult = await _userRepository.UpdatePasswordAsync(request.Email, hashedPassword);
            if (!updateResult)
            {
                return new ForgotPasswordResponse(false, "Không thể cập nhật mật khẩu. Vui lòng thử lại");
            }

            // Mark OTP as used only after successful password update
            await _otpService.MarkOtpAsUsedAsync(request.Email, request.OTPCode);

            return new ForgotPasswordResponse(true, "Mật khẩu đã được đặt lại thành công");
        }
        catch (Exception ex)
        {
            return new ForgotPasswordResponse(false, $"Lỗi hệ thống: {ex.Message}");
        }
    }

    // Hash password using SHA256
    private static string HashPassword(string password)
    {
        using var sha = SHA256.Create();
        var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }
}



