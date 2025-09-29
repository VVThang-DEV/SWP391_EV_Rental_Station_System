using EVRentalApi.Infrastructure.Repositories;
using EVRentalApi.Models;

namespace EVRentalApi.Application.Services;

public sealed class OTPService
{
    private readonly IOTPRepository _otpRepository;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _config;
    private readonly Random _random = new();

    public OTPService(IOTPRepository otpRepository, IEmailService emailService, IConfiguration config)
    {
        _otpRepository = otpRepository;
        _emailService = emailService;
        _config = config;
    }

    // Generate 6-digit OTP code
    public string GenerateOTP()
    {
        return _random.Next(100000, 999999).ToString();
    }

    // Send OTP (mock implementation - in real app, integrate with email service)
    public async Task<SendOTPResponse> SendOTPAsync(SendOTPRequest request)
    {
        try
        {
            // Validate email
            if (string.IsNullOrWhiteSpace(request.Email))
            {
                return new SendOTPResponse(false, "Email không được để trống");
            }

            // Generate OTP
            var otpCode = GenerateOTP();
            var expiresAt = DateTime.UtcNow.AddMinutes(5); // 5 minutes expiry

            // Store OTP in database
            var stored = await _otpRepository.StoreOTPAsync(request.Email, otpCode, expiresAt);
            if (!stored)
            {
                return new SendOTPResponse(false, "Không thể lưu mã OTP");
            }

            // TODO: In production, send actual email here
            // For now, we'll just log it (in development)
            Console.WriteLine($"[DEV] OTP for {request.Email}: {otpCode}");

            // Send OTP email
            var subject = "EVRentals OTP Verification";
            var body = $"<p>Your verification code is:</p><h2 style=\"letter-spacing:4px\">{otpCode}</h2><p>This code expires in 5 minutes.</p>";
            var overrideTo = _config.GetSection("Smtp")["OverrideToEmail"];
            var recipient = string.IsNullOrWhiteSpace(overrideTo) ? request.Email : overrideTo;
            try
            {
                await _emailService.SendAsync(recipient, subject, body);
            }
            catch (Exception mailEx)
            {
                Console.WriteLine($"[Email] Failed to send OTP email: {mailEx.Message}");
                // Still consider OTP sent; client can fetch from email once credentials are valid
            }

            // In development, include expires to help client UX
            return new SendOTPResponse(true, "Mã OTP đã được gửi đến email của bạn", 300);
        }
        catch (Exception ex)
        {
            return new SendOTPResponse(false, $"Lỗi hệ thống: {ex.Message}");
        }
    }

    // Verify OTP
    public async Task<OTPResponse> VerifyOTPAsync(OTPRequest request)
    {
        try
        {
            // Validate input
            if (string.IsNullOrWhiteSpace(request.Email))
            {
                return new OTPResponse(false, "Email không được để trống");
            }

            if (string.IsNullOrWhiteSpace(request.OTPCode))
            {
                return new OTPResponse(false, "Mã OTP không được để trống");
            }

            // Verify OTP
            var (isValid, isExpired) = await _otpRepository.VerifyOTPAsync(request.Email, request.OTPCode);
            
            if (isExpired)
            {
                return new OTPResponse(false, "Mã OTP đã hết hạn");
            }

            if (!isValid)
            {
                return new OTPResponse(false, "Mã OTP không đúng");
            }

            // Mark OTP as used
            await _otpRepository.MarkOTPAsUsedAsync(request.Email, request.OTPCode);

            return new OTPResponse(true, "Xác thực OTP thành công", true);
        }
        catch (Exception ex)
        {
            return new OTPResponse(false, $"Lỗi hệ thống: {ex.Message}");
        }
    }

    // Clean up expired OTPs (call this periodically)
    public async Task CleanupExpiredOTPsAsync()
    {
        await _otpRepository.CleanupExpiredOTPsAsync();
    }
}
