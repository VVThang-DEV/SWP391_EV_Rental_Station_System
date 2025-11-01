using EVRentalApi.Infrastructure.Repositories;
using EVRentalApi.Models;
using System.Security.Cryptography;
using System.Text;

namespace EVRentalApi.Application.Services;

public interface IReservationService
{
    Task<ReservationResponse> CreateReservationAsync(CreateReservationRequest request);
    Task<IEnumerable<ReservationDto>> GetUserReservationsAsync(int userId);
    Task<ReservationDto?> GetReservationByIdAsync(int reservationId);
    Task<bool> CancelReservationAsync(int reservationId, string? reason = null, string? cancelledBy = null);
    Task<WalkInBookingResponse> CreateWalkInBookingAsync(CreateWalkInBookingRequest request);
}

public class ReservationService : IReservationService
{
    private readonly IReservationRepository _reservationRepository;
    private readonly IEmailService _emailService;
    private readonly IUserRepository _userRepository;
    private readonly IVehicleRepository _vehicleRepository;
    private readonly IConfiguration _config;
    private readonly IPasswordResetService _passwordResetService;

    public ReservationService(
        IReservationRepository reservationRepository,
        IEmailService emailService,
        IUserRepository userRepository,
        IVehicleRepository vehicleRepository,
        IConfiguration config,
        IPasswordResetService passwordResetService)
    {
        _reservationRepository = reservationRepository;
        _emailService = emailService;
        _userRepository = userRepository;
        _vehicleRepository = vehicleRepository;
        _config = config;
        _passwordResetService = passwordResetService;
    }

    public async Task<ReservationResponse> CreateReservationAsync(CreateReservationRequest request)
    {
        // Validate request
        if (request.StartTime >= request.EndTime)
        {
            return new ReservationResponse
            {
                Success = false,
                Message = "End time must be after start time"
            };
        }

        // SANDBOX MODE: Allow any start time for testing
        // In production, you might want to re-enable this validation:
        // if (request.StartTime < DateTime.Now.AddMinutes(-15))
        // {
        //     return new ReservationResponse
        //     {
        //         Success = false,
        //         Message = "Start time cannot be more than 15 minutes in the past"
        //     };
        // }
        
        // Check if start time is in the future for better UX
        if (request.StartTime < DateTime.Now.AddHours(-1))
        {
            Console.WriteLine($"[Reservation] Warning: Start time is more than 1 hour in the past. Allowing in SANDBOX mode.");
        }

        var result = await _reservationRepository.CreateReservationAsync(request);
        
        if (result == null)
        {
            return new ReservationResponse
            {
                Success = false,
                Message = "Failed to create reservation"
            };
        }

        // Send confirmation email to customer
        if (result.Success && result.Reservation != null)
        {
            try
            {
                await SendBookingConfirmationEmailAsync(result.Reservation);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Email] Failed to send booking confirmation email: {ex.Message}");
                // Don't fail the reservation if email fails
            }
        }

        return result;
    }

    public async Task<IEnumerable<ReservationDto>> GetUserReservationsAsync(int userId)
    {
        return await _reservationRepository.GetReservationsByUserIdAsync(userId);
    }

    public async Task<ReservationDto?> GetReservationByIdAsync(int reservationId)
    {
        return await _reservationRepository.GetReservationByIdAsync(reservationId);
    }

    public async Task<bool> CancelReservationAsync(int reservationId, string? reason = null, string? cancelledBy = null)
    {
        return await _reservationRepository.CancelReservationAsync(reservationId, reason, cancelledBy);
    }

    public async Task<WalkInBookingResponse> CreateWalkInBookingAsync(CreateWalkInBookingRequest request)
    {
        try
        {
            Console.WriteLine($"[WalkIn] Creating walk-in booking for {request.FullName}");

            // Check if customer already exists by email or phone
            int userId = 0;
            var existingUserByEmail = !string.IsNullOrWhiteSpace(request.Email) 
                ? await _userRepository.GetUserIdByEmailAsync(request.Email) 
                : 0;

            if (existingUserByEmail > 0)
            {
                userId = existingUserByEmail;
                Console.WriteLine($"[WalkIn] Found existing customer by email: UserId={userId}");
            }
            else
            {
                // Create new customer account
                // Generate a random password for walk-in customer
                var randomPassword = Guid.NewGuid().ToString().Substring(0, 8);
                var passwordHash = HashPassword(randomPassword);

                var dateOfBirth = request.DateOfBirth ?? DateTime.Now.AddYears(-25);
                var email = string.IsNullOrWhiteSpace(request.Email) 
                    ? $"walkin_{DateTime.Now.Ticks}@evrentals.local"  // Fallback email
                    : request.Email;

                var (success, newUserId) = await _userRepository.RegisterCustomerAsync(
                    request.FullName,
                    email,
                    request.Phone,
                    dateOfBirth,
                    passwordHash
                );

                if (!success || newUserId == 0)
                {
                    return new WalkInBookingResponse
                    {
                        Success = false,
                        Message = "Failed to create customer account"
                    };
                }

                userId = newUserId;
                Console.WriteLine($"[WalkIn] Created new customer: UserId={userId}");

                // Send welcome email with password reset link for new walk-in customer
                if (!string.IsNullOrWhiteSpace(request.Email) && !request.Email.EndsWith("@evrentals.local"))
                {
                    try
                    {
                        await SendWalkInCustomerWelcomeEmailAsync(userId, email, request.FullName);
                        Console.WriteLine($"[WalkIn] Welcome email sent to {email}");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[WalkIn] Failed to send welcome email: {ex.Message}");
                        // Don't fail the booking if email fails
                    }
                }

                // Update additional information
                if (!string.IsNullOrWhiteSpace(request.LicenseNumber) || 
                    !string.IsNullOrWhiteSpace(request.IdNumber) || 
                    !string.IsNullOrWhiteSpace(request.Address))
                {
                    await _userRepository.UpdatePersonalInfoAsync(
                        email,
                        request.IdNumber,
                        request.LicenseNumber,
                        request.Address,
                        null,
                        request.DateOfBirth,
                        null // Phone already set during registration
                    );
                }
            }

            // Create reservation
            var reservationRequest = new CreateReservationRequest
            {
                UserId = userId,
                VehicleId = request.VehicleId,
                StationId = request.StationId,
                StartTime = request.StartTime,
                EndTime = request.EndTime
            };

            var reservationResult = await CreateReservationAsync(reservationRequest);

            if (!reservationResult.Success)
            {
                return new WalkInBookingResponse
                {
                    Success = false,
                    Message = reservationResult.Message,
                    UserId = userId
                };
            }

            Console.WriteLine($"[WalkIn] ✅ Walk-in booking created successfully. ReservationId={reservationResult.Reservation?.ReservationId}, UserId={userId}");

            return new WalkInBookingResponse
            {
                Success = true,
                Message = "Walk-in booking created successfully. Confirmation email sent to customer.",
                Reservation = reservationResult.Reservation,
                UserId = userId
            };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[WalkIn] ❌ Error creating walk-in booking: {ex.Message}");
            return new WalkInBookingResponse
            {
                Success = false,
                Message = $"Error creating walk-in booking: {ex.Message}"
            };
        }
    }

    private async Task SendBookingConfirmationEmailAsync(ReservationDto reservation)
    {
        try
        {
            // Get user information
            var user = await _userRepository.GetUserByIdAsync(reservation.UserId);
            if (user == null)
            {
                Console.WriteLine($"[Email] User not found for reservation {reservation.ReservationId}");
                return;
            }

            // Get vehicle information
            dynamic? vehicle = await _vehicleRepository.GetVehicleByIdAsync(reservation.VehicleId);
            if (vehicle == null)
            {
                Console.WriteLine($"[Email] Vehicle not found for reservation {reservation.ReservationId}");
                return;
            }

            // Calculate rental duration
            var duration = reservation.EndTime - reservation.StartTime;
            var hours = Math.Ceiling(duration.TotalHours);
            var isHourlyRental = duration.TotalHours < 24 && reservation.StartTime.Date == reservation.EndTime.Date;
            var rentalType = isHourlyRental ? "Hourly Rental" : "Daily Rental";
            
            // Round times to nearest minute (remove seconds for cleaner display)
            var startTimeRounded = new DateTime(
                reservation.StartTime.Year, 
                reservation.StartTime.Month, 
                reservation.StartTime.Day,
                reservation.StartTime.Hour, 
                reservation.StartTime.Minute, 
                0
            );
            
            var endTimeRounded = new DateTime(
                reservation.EndTime.Year, 
                reservation.EndTime.Month, 
                reservation.EndTime.Day,
                reservation.EndTime.Hour, 
                reservation.EndTime.Minute, 
                0
            );
            
            // Calculate pickup slot (for hourly rental, show the 30-min pickup window)
            var pickupTime = startTimeRounded;
            var pickupDeadline = isHourlyRental ? startTimeRounded.AddMinutes(30) : startTimeRounded;

            // Extract vehicle properties (use snake_case from database)
            var vehicleModel = (string)vehicle.model_id;
            var vehicleId = (int)vehicle.vehicle_id;
            var batteryLevel = (int)vehicle.battery_level;
            var pricePerHourUSD = (decimal)vehicle.price_per_hour;

            // Convert USD to VND (1 USD ≈ 26,000 VND)
            const decimal USD_TO_VND_RATE = 26000m;
            var pricePerHour = pricePerHourUSD * USD_TO_VND_RATE;

            // Calculate total cost in VND
            var totalCost = (decimal)hours * pricePerHour;

            // Create email HTML
            var subject = $"Booking Confirmation - Reservation #{reservation.ReservationId}";
            var htmlBody = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
        .info-box {{ background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #667eea; }}
        .info-row {{ display: flex; justify-content: space-between; margin: 10px 0; }}
        .label {{ font-weight: bold; color: #666; }}
        .value {{ color: #333; }}
        .highlight {{ background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }}
        .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 14px; }}
        .button {{ display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>🎉 Booking Confirmed!</h1>
            <p>Your vehicle reservation is confirmed</p>
        </div>
        
        <div class='content'>
            <p>Dear {user.FullName},</p>
            <p>Thank you for choosing EVRentals! Your booking has been successfully confirmed.</p>
            
            <div class='info-box'>
                <h3>📋 Booking Details</h3>
                <div class='info-row'>
                    <span class='label'>Reservation ID:</span>
                    <span class='value'>#{reservation.ReservationId}</span>
                </div>
                <div class='info-row'>
                    <span class='label'>Rental Type:</span>
                    <span class='value'>{rentalType}</span>
                </div>
                <div class='info-row'>
                    <span class='label'>Status:</span>
                    <span class='value'>Pending Pickup</span>
                </div>
            </div>

            <div class='info-box'>
                <h3>🚗 Vehicle Information</h3>
                <div class='info-row'>
                    <span class='label'>Vehicle:</span>
                    <span class='value'>{vehicleModel}</span>
                </div>
                <div class='info-row'>
                    <span class='label'>Vehicle ID:</span>
                    <span class='value'>{vehicleId}</span>
                </div>
                <div class='info-row'>
                    <span class='label'>Battery Level:</span>
                    <span class='value'>{batteryLevel}%</span>
                </div>
            </div>

            <div class='info-box'>
                <h3>📅 Rental Period</h3>
                <div class='info-row'>
                    <span class='label'>Pickup Time:</span>
                    <span class='value'>{pickupTime:yyyy-MM-dd HH:mm} - {pickupDeadline:HH:mm}</span>
                </div>
                <div class='info-row'>
                    <span class='label'>Return Time:</span>
                    <span class='value'>{endTimeRounded:yyyy-MM-dd HH:mm}</span>
                </div>
                <div class='info-row'>
                    <span class='label'>Duration:</span>
                    <span class='value'>{hours} hour(s)</span>
                </div>
            </div>

            <div class='info-box'>
                <h3>💰 Payment Summary</h3>
                <div class='info-row'>
                    <span class='label'>Hourly Rate:</span>
                    <span class='value'>${pricePerHourUSD:N2} USD ({pricePerHour:N0} VND)</span>
                </div>
                <div class='info-row'>
                    <span class='label'>Total Amount:</span>
                    <span class='value' style='font-size: 18px; font-weight: bold; color: #667eea;'>
                        ${(totalCost / USD_TO_VND_RATE):N2} USD ({totalCost:N0} VND)
                    </span>
                </div>
            </div>

            <div class='highlight'>
                <strong>⏰ Important:</strong> Please arrive within your pickup time slot ({pickupTime:HH:mm} - {pickupDeadline:HH:mm}). 
                You'll receive a QR code to unlock the vehicle. Make sure to bring your driver's license and ID documents for verification.
            </div>

            <div style='text-align: center;'>
                <p>Show your QR code at the station to unlock your vehicle</p>
            </div>

            <div class='footer'>
                <p>Questions? Contact us at evrentalsystem@gmail.com</p>
                <p>Thank you for choosing EVRentals!</p>
                <p style='font-size: 12px; color: #999; margin-top: 20px;'>
                    This is an automated email. Please do not reply to this message.
                </p>
            </div>
        </div>
    </div>
</body>
</html>";

            // Send email
            var overrideTo = _config.GetSection("Smtp")["OverrideToEmail"];
            var recipient = string.IsNullOrWhiteSpace(overrideTo) ? user.Email : overrideTo;
            
            Console.WriteLine($"[Email] Sending booking confirmation to {user.Email} (recipient: {recipient})");
            await _emailService.SendAsync(recipient, subject, htmlBody);
            Console.WriteLine($"[Email] ✅ Booking confirmation email sent successfully for reservation {reservation.ReservationId}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[Email] ❌ Failed to send booking confirmation email: {ex.Message}");
            throw;
        }
    }

    private async Task SendWalkInCustomerWelcomeEmailAsync(int userId, string email, string fullName)
    {
        try
        {
            Console.WriteLine($"[Email] Preparing welcome email for walk-in customer {fullName} ({email})");

            // Generate password reset token
            var resetToken = _passwordResetService.GenerateResetToken(userId, email);
            
            // Build password reset URL
            var frontendUrl = _config["Frontend:BaseUrl"] ?? "http://localhost:8080";
            var setPasswordUrl = $"{frontendUrl}/set-password?token={resetToken}";

            var subject = "Welcome to EV Rentals - Set Your Password";
            var htmlBody = $@"<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }}
        .header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }}
        .content {{
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }}
        .button {{
            display: inline-block;
            padding: 15px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
        }}
        .info-box {{
            background: white;
            padding: 20px;
            border-left: 4px solid #667eea;
            margin: 20px 0;
            border-radius: 5px;
        }}
        .footer {{
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 12px;
        }}
    </style>
</head>
<body>
    <div class='header'>
        <h1>🚗 Welcome to EV Rentals!</h1>
    </div>
    <div class='content'>
        <h2>Hello {fullName},</h2>
        <p>
            Thank you for choosing EV Rentals! Your booking has been successfully created.
        </p>
        <p>
            We've created an account for you to manage your bookings online. To get started, 
            please set your password by clicking the button below:
        </p>
        
        <div style='text-align: center;'>
            <a href='{setPasswordUrl}' class='button'>Set Your Password</a>
        </div>

        <div class='info-box'>
            <h3>📧 Your Account Details</h3>
            <p><strong>Email:</strong> {email}</p>
            <p>After setting your password, you can login to:</p>
            <ul>
                <li>View your booking history</li>
                <li>Manage your profile</li>
                <li>Make new bookings online</li>
                <li>Track your rental status</li>
            </ul>
        </div>

        <div class='info-box' style='border-left-color: #f59e0b;'>
            <p><strong>⏰ Important:</strong> This link will expire in 24 hours for security reasons.</p>
            <p>If you didn't make this booking, please contact us immediately.</p>
        </div>

        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style='word-break: break-all; color: #667eea;'>{setPasswordUrl}</p>

        <div class='footer'>
            <p>Thank you for choosing EV Rentals!</p>
            <p>If you have any questions, feel free to contact our support team.</p>
            <p>&copy; 2024 EV Rentals. All rights reserved.</p>
        </div>
    </div>
</body>
</html>";

            // Send email
            var overrideTo = _config.GetSection("Smtp")["OverrideToEmail"];
            var recipient = string.IsNullOrWhiteSpace(overrideTo) ? email : overrideTo;
            
            Console.WriteLine($"[Email] Sending welcome email to {email} (recipient: {recipient})");
            Console.WriteLine($"[Email] Set password URL: {setPasswordUrl}");
            
            await _emailService.SendAsync(recipient, subject, htmlBody);
            Console.WriteLine($"[Email] ✅ Welcome email sent successfully to {email}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[Email] ❌ Failed to send welcome email: {ex.Message}");
            throw;
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

