using System.Data;
using Microsoft.Data.SqlClient;
using System.Security.Cryptography;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using EVRentalApi.Application.Services;
using EVRentalApi.Infrastructure.Repositories;
using EVRentalApi.Infrastructure.Email;
using EVRentalApi.Models;
using System.Collections.Generic;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

// CORS (dev)
builder.Services.AddCors(p => p.AddDefaultPolicy(b => b
    .WithOrigins(
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8080",
        "http://localhost:8081",
        "http://localhost:8082",
        "http://localhost:8083"
    )
    .AllowAnyHeader()
    .AllowAnyMethod()));

// DI: SqlConnection factory
builder.Services.AddScoped<Func<SqlConnection>>(_ =>
{
    var config = _.GetRequiredService<IConfiguration>();
    var cs = config.GetConnectionString("EVRentalDB");
    return () => new SqlConnection(cs);
});

// DI: repositories & services
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IOTPRepository, OTPRepository>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<IEmailService, SmtpEmailService>();
builder.Services.AddScoped<OTPService>();
builder.Services.AddScoped<ForgotPasswordService>();
builder.Services.AddScoped<PersonalInfoService>();
builder.Services.AddScoped<IPasswordResetService, PasswordResetService>();
builder.Services.AddHostedService<OtpCleanupService>();

// DI: New repositories & services for vehicles and stations
builder.Services.AddScoped<IStationRepository, StationRepository>();
builder.Services.AddScoped<IVehicleRepository, VehicleRepository>();
builder.Services.AddScoped<IVehicleModelRepository, VehicleModelRepository>();
builder.Services.AddScoped<IStationService, StationService>();
builder.Services.AddScoped<IVehicleService, VehicleService>();
builder.Services.AddScoped<IVehicleModelService, VehicleModelService>();

// DI: Staff management
builder.Services.AddScoped<IStaffRepository, StaffRepository>();
builder.Services.AddScoped<IStaffService, StaffService>();

// DI: Reservation management
builder.Services.AddScoped<IReservationRepository, ReservationRepository>();
builder.Services.AddScoped<IReservationService, ReservationService>();

// DI: QR Code management
builder.Services.AddScoped<IQRCodeRepository, QRCodeRepository>();
builder.Services.AddScoped<IQRCodeService, QRCodeService>();

// DI: Payment management
builder.Services.AddScoped<IPaymentRepository, PaymentRepository>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<IPaymentGatewayService, PaymentGatewayService>();

// Add controllers
builder.Services.AddControllers();

// Add JWT Authentication
builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer("Bearer", options =>
    {
        var jwt = builder.Configuration.GetSection("Jwt");
        var secret = jwt["Secret"]!;
        var issuer = jwt["Issuer"]!;
        var audience = jwt["Audience"]!;
        
        options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = issuer,
            ValidAudience = audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret))
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// Middleware
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

// Serve static files from wwwroot
app.UseStaticFiles();

// Serve static files from uploads directory
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(
        Path.Combine(builder.Environment.ContentRootPath, "uploads")),
    RequestPath = "/uploads"
});

// Map controllers
app.MapControllers();

// Utility hash (shared)
static string Sha256(string input)
{
    using var sha = SHA256.Create();
    var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(input));
    return Convert.ToHexString(bytes).ToLowerInvariant();
}

// Admin/Staff login endpoint
app.MapPost("/auth/admin-login", async (LoginRequest req, AuthService auth, IConfiguration config) =>
{
    var (ok, userId, fullName, roleName) = await auth.LoginAdminOrStaffAsync(req.Email, req.Password, Sha256);
    if (!ok)
    {
        return Results.Unauthorized();
    }

    // Issue JWT
    var jwt = config.GetSection("Jwt");
    var secret = jwt["Secret"]!;
    var issuer = jwt["Issuer"]!;
    var audience = jwt["Audience"]!;
    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
    var claims = new[]
    {
        new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
        new Claim(ClaimTypes.Name, req.Email),
        new Claim(ClaimTypes.Role, roleName)
    };
    var token = new JwtSecurityToken(issuer, audience, claims, expires: DateTime.UtcNow.AddHours(8), signingCredentials: creds);
    var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

    return Results.Ok(new { success = true, fullName, role = roleName, token = tokenString });
});

// General login (any role)
app.MapPost("/auth/login", async (LoginRequest req, AuthService auth, IConfiguration config) =>
{
    var (ok, userId, fullName, roleName) = await auth.LoginAnyAsync(req.Email, req.Password, Sha256);
    if (!ok)
    {
        return Results.Unauthorized();
    }

    var jwt = config.GetSection("Jwt");
    var secret = jwt["Secret"]!;
    var issuer = jwt["Issuer"]!;
    var audience = jwt["Audience"]!;
    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
    var claims = new[]
    {
        new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
        new Claim(ClaimTypes.Name, req.Email),
        new Claim(ClaimTypes.Role, roleName)
    };
    var token = new JwtSecurityToken(issuer, audience, claims, expires: DateTime.UtcNow.AddHours(8), signingCredentials: creds);
    var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

    return Results.Ok(new { success = true, fullName, role = roleName, token = tokenString });
});

// Customer register endpoint
app.MapPost("/auth/register", async (RegisterRequest req, AuthService auth) =>
{
    var result = await auth.RegisterCustomerAsync(req, Sha256);
    
    if (result.Success)
    {
        return Results.Ok(new { 
            success = true, 
            message = result.Message,
            userId = result.UserId,
            email = result.Email
        });
    }
    else
    {
        return Results.BadRequest(new { 
            success = false, 
            message = result.Message 
        });
    }
});

// Send OTP endpoint
app.MapPost("/auth/send-otp", async (SendOTPRequest req, OTPService otpService) =>
{
    var result = await otpService.SendOTPAsync(req);
    if (result.Success)
    {
        return Results.Ok(new {
            success = true,
            message = result.Message,
            expiresIn = result.ExpiresInSeconds
        });
    }
    return Results.BadRequest(new { success = false, message = result.Message });
});

// Verify OTP endpoint
app.MapPost("/auth/verify-otp", async (OTPRequest req, OTPService otpService) =>
{
    var result = await otpService.VerifyOTPAsync(req);
    if (result.Success)
    {
        return Results.Ok(new { success = true, message = result.Message });
    }
    return Results.BadRequest(new { success = false, message = result.Message });
});

// Forgot password endpoint
app.MapPost("/auth/forgot-password", async (ForgotPasswordRequest req, ForgotPasswordService forgotPasswordService) =>
{
    var result = await forgotPasswordService.InitiateForgotPasswordAsync(req);
    if (result.Success)
    {
        return Results.Ok(new { success = true, message = result.Message });
    }
    return Results.BadRequest(new { success = false, message = result.Message });
});

// Reset password endpoint
app.MapPost("/auth/reset-password", async (ResetPasswordRequest req, ForgotPasswordService forgotPasswordService) =>
{
    var result = await forgotPasswordService.ResetPasswordAsync(req);
    if (result.Success)
    {
        return Results.Ok(new { success = true, message = result.Message });
    }
    return Results.BadRequest(new { success = false, message = result.Message });
});

// Set password with token (for walk-in customers)
app.MapPost("/api/auth/set-password", async (SetPasswordWithTokenRequest req, IPasswordResetService passwordResetService, IUserRepository userRepository) =>
{
    Console.WriteLine($"[SetPassword] Received request with token");
    
    // Verify token
    var (isValid, userId, email) = passwordResetService.VerifyResetToken(req.Token);
    
    if (!isValid)
    {
        Console.WriteLine($"[SetPassword] Invalid or expired token");
        return Results.BadRequest(new { success = false, message = "Invalid or expired password reset link" });
    }
    
    Console.WriteLine($"[SetPassword] Token valid for user {userId} ({email})");
    
    // Validate password
    if (string.IsNullOrWhiteSpace(req.NewPassword) || req.NewPassword.Length < 6)
    {
        return Results.BadRequest(new { success = false, message = "Password must be at least 6 characters" });
    }
    
    // Hash password
    using var sha = System.Security.Cryptography.SHA256.Create();
    var bytes = sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(req.NewPassword));
    var passwordHash = Convert.ToHexString(bytes).ToLowerInvariant();
    
    // Update password
    var success = await userRepository.UpdatePasswordAsync(email, passwordHash);
    
    if (success)
    {
        Console.WriteLine($"[SetPassword] ✅ Password set successfully for user {userId}");
        return Results.Ok(new { 
            success = true, 
            message = "Password set successfully! You can now login with your new password." 
        });
    }
    
    Console.WriteLine($"[SetPassword] ❌ Failed to update password");
    return Results.BadRequest(new { success = false, message = "Failed to set password" });
});

// Update personal information endpoint
app.MapPost("/auth/update-personal-info", async (UpdatePersonalInfoRequest req, PersonalInfoService personalInfoService) =>
{
    var result = await personalInfoService.UpdatePersonalInfoAsync(req);
    if (result.Success)
    {
        return Results.Ok(new { success = true, message = result.Message });
    }
    return Results.BadRequest(new { success = false, message = result.Message });
});

// Update document endpoint
app.MapPost("/auth/update-document", async (UpdatePersonalInfoRequest req, PersonalInfoService personalInfoService) =>
{
    var result = await personalInfoService.UpdateDocumentAsync(req);
    if (result.Success)
    {
        return Results.Ok(new { success = true, message = result.Message });
    }
    return Results.BadRequest(new { success = false, message = result.Message });
});

// Get current user info endpoint
app.MapGet("/auth/current-user", [Microsoft.AspNetCore.Authorization.Authorize] async (HttpContext context, AuthService auth) =>
{
    // Get user ID from JWT token
    var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier);
    if (userIdClaim == null)
    {
        return Results.Unauthorized();
    }

    if (!int.TryParse(userIdClaim.Value, out int userId))
    {
        return Results.BadRequest(new { message = "Invalid user ID" });
    }

    try
    {
        var userInfo = await auth.GetUserInfoAsync(userId);
        if (userInfo == null)
        {
            return Results.NotFound(new { message = "User not found" });
        }

        return Results.Ok(new { 
            success = true, 
            user = userInfo 
        });
    }
    catch (Exception ex)
    {
        return Results.Problem(
            detail: ex.Message,
            statusCode: 500,
            title: "Error retrieving user information"
        );
    }
});

// Health
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

// Debug vehicles endpoint
app.MapGet("/debug/vehicles", async (IVehicleService vehicleService) =>
{
    try
    {
        var vehicles = await vehicleService.GetAllVehiclesAsync();
        return Results.Ok(new { 
            success = true, 
            count = vehicles.Count(),
            vehicles = vehicles.Take(3) // Only return first 3 for debugging
        });
    }
    catch (Exception ex)
    {
        return Results.Ok(new { 
            success = false, 
            error = ex.Message,
            stackTrace = ex.StackTrace
        });
    }
});

// Debug endpoint
app.MapPost("/auth/debug-update", (UpdatePersonalInfoRequest req) =>
{
    Console.WriteLine($"[DEBUG] Received request:");
    Console.WriteLine($"  Email: {req.Email}");
    Console.WriteLine($"  CCCD: {req.Cccd}");
    Console.WriteLine($"  LicenseNumber: {req.LicenseNumber}");
    Console.WriteLine($"  Address: {req.Address}");
    Console.WriteLine($"  Gender: {req.Gender}");
    Console.WriteLine($"  DateOfBirth: {req.DateOfBirth}");
    Console.WriteLine($"  Phone: {req.Phone}");
    
    return Results.Ok(new { success = true, message = "Debug data received", data = req });
});

// Reservation endpoints
app.MapPost("/api/reservations", [Microsoft.AspNetCore.Authorization.Authorize] async (CreateReservationRequest req, IReservationService reservationService, HttpContext context) =>
{
    Console.WriteLine($"[API] Received reservation request: VehicleId={req.VehicleId}, StationId={req.StationId}");
    
    // Get user ID from JWT token
    var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier);
    if (userIdClaim == null)
    {
        Console.WriteLine("[API] No user ID claim found in token");
        return Results.Unauthorized();
    }

    Console.WriteLine($"[API] User ID claim value: {userIdClaim.Value}");

    if (!int.TryParse(userIdClaim.Value, out int userId))
    {
        Console.WriteLine($"[API] Invalid user ID format: {userIdClaim.Value}");
        return Results.BadRequest(new { success = false, message = "Invalid user ID" });
    }

    Console.WriteLine($"[API] Parsed user ID: {userId}");

    // Set user ID from token
    req.UserId = userId;

    var result = await reservationService.CreateReservationAsync(req);
    
    if (result.Success)
    {
        Console.WriteLine($"[API] Reservation created successfully: {result.Reservation?.ReservationId}");
        return Results.Ok(new { 
            success = true, 
            message = result.Message,
            reservation = result.Reservation 
        });
    }
    
    Console.WriteLine($"[API] Failed to create reservation: {result.Message}");
    return Results.BadRequest(new { success = false, message = result.Message });
});

app.MapGet("/api/reservations", [Microsoft.AspNetCore.Authorization.Authorize] async (IReservationService reservationService, HttpContext context) =>
{
    // Get user ID from JWT token
    var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier);
    if (userIdClaim == null)
    {
        return Results.Unauthorized();
    }

    if (!int.TryParse(userIdClaim.Value, out int userId))
    {
        return Results.BadRequest(new { success = false, message = "Invalid user ID" });
    }

    var reservations = await reservationService.GetUserReservationsAsync(userId);
    
    return Results.Ok(new { 
        success = true, 
        reservations = reservations 
    });
});

app.MapGet("/api/reservations/{id}", [Microsoft.AspNetCore.Authorization.Authorize] async (int id, IReservationService reservationService) =>
{
    var reservation = await reservationService.GetReservationByIdAsync(id);
    
    if (reservation == null)
    {
        return Results.NotFound(new { success = false, message = "Reservation not found" });
    }
    
    return Results.Ok(new { 
        success = true, 
        reservation = reservation 
    });
});

app.MapPost("/api/reservations/{id}/cancel", [Microsoft.AspNetCore.Authorization.Authorize] async (int id, CancelReservationRequest req, IReservationService reservationService, Func<SqlConnection> getConnection, HttpContext context) =>
{
    var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier);
    if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
    {
        return Results.Unauthorized();
    }

    Console.WriteLine($"[Cancel Booking] Processing cancellation for reservation {id} by user {userId}");
    Console.WriteLine($"[Cancel Booking] Reason: {req.Reason}, CancelledBy: {req.CancelledBy}");

    // Cancel the reservation with reason
    var success = await reservationService.CancelReservationAsync(id, req.Reason, req.CancelledBy);
    
    if (!success)
    {
        return Results.BadRequest(new { success = false, message = "Failed to cancel reservation" });
    }

    Console.WriteLine($"[Cancel Booking] Reservation {id} cancelled successfully. Checking for wallet refund...");

    // Check if this reservation was paid by wallet and process refund
    using var conn = getConnection();
    await conn.OpenAsync();
    var trans = conn.BeginTransaction();
    
    try
    {
        // First, get the customer's user_id from the reservation (NOT from JWT token, because staff might be cancelling)
        var getCustomerIdCmd = new SqlCommand("SELECT user_id FROM dbo.reservations WHERE reservation_id = @ReservationId", conn, trans);
        getCustomerIdCmd.Parameters.AddWithValue("@ReservationId", id);
        var customerIdObj = await getCustomerIdCmd.ExecuteScalarAsync();
        
        if (customerIdObj == null || customerIdObj == DBNull.Value)
        {
            Console.WriteLine($"[Cancel Booking] ERROR: Reservation {id} not found");
            trans.Rollback();
            await conn.CloseAsync();
            return Results.BadRequest(new { success = false, message = "Reservation not found" });
        }
        
        int customerId = (int)customerIdObj;
        Console.WriteLine($"[Cancel Booking] Found customer_id: {customerId} for reservation {id}");
        
        // Get payment information for this reservation
        Console.WriteLine($"[Cancel Booking] Checking payments for reservation {id} and customer {customerId}");
        
        // Query payments: check for wallet payments with flexible conditions
        var getPaymentCmd = new SqlCommand(@"
            SELECT payment_id, amount, method_type, transaction_id, user_id, transaction_type, status
            FROM dbo.payments 
            WHERE reservation_id = @ReservationId AND status = 'success' AND method_type = 'wallet'
            ORDER BY created_at DESC", conn, trans);
        getPaymentCmd.Parameters.AddWithValue("@ReservationId", id);
        
        using var paymentReader = await getPaymentCmd.ExecuteReaderAsync();
        decimal refundAmount = 0m;
        int paymentId = 0;
        string methodType = "";
        string transactionId = "";
        int paymentUserId = 0;
        
        while (await paymentReader.ReadAsync())
        {
            paymentId = paymentReader.GetInt32(0);
            var amount = paymentReader.GetDecimal(1);
            methodType = paymentReader.GetString(2);
            transactionId = paymentReader.IsDBNull(3) ? "" : paymentReader.GetString(3);
            paymentUserId = paymentReader.IsDBNull(4) ? 0 : paymentReader.GetInt32(4);
            var transactionType = paymentReader.IsDBNull(5) ? "NULL" : paymentReader.GetString(5);
            var status = paymentReader.GetString(6);
            
            Console.WriteLine($"[Cancel Booking] Found payment: id={paymentId}, amount={amount}, method={methodType}, user_id={paymentUserId}, transaction_type={transactionType}, status={status}");
            
            // Only refund if paid by wallet
            if (methodType == "wallet" && status == "success")
            {
                refundAmount += amount;
                Console.WriteLine($"[Cancel Booking] Found wallet payment: {amount} VND");
            }
        }
        await paymentReader.CloseAsync();
        
        Console.WriteLine($"[Cancel Booking] Total refund amount calculated: {refundAmount} VND");
        
        if (refundAmount > 0)
        {
            Console.WriteLine($"[Cancel Booking] Processing refund of {refundAmount} VND to wallet");
            
            // Update payment status to refunded
            var updatePaymentCmd = new SqlCommand(@"
                UPDATE dbo.payments 
                SET status = 'refunded'
                WHERE reservation_id = @ReservationId AND method_type = 'wallet' AND status = 'success'", conn, trans);
            updatePaymentCmd.Parameters.AddWithValue("@ReservationId", id);
            var updateCount = await updatePaymentCmd.ExecuteNonQueryAsync();
            Console.WriteLine($"[Cancel Booking] Updated {updateCount} payment records to refunded status");
            
            // Verify the update
            Console.WriteLine($"[Cancel Booking] Verification: reservation_id={id}, customerId={customerId}, refundAmount={refundAmount}");
            
            // Insert refund transaction (refund to CUSTOMER, not the staff who cancelled)
            var refundTransactionId = $"RFND_{DateTime.UtcNow.Ticks}_{customerId}";
            var insertRefundCmd = new SqlCommand(@"
                INSERT INTO dbo.payments (user_id, reservation_id, method_type, amount, status, transaction_type, transaction_id, created_at, updated_at)
                VALUES (@userId, @ReservationId, 'wallet', @amount, 'success', 'refund', @transactionId, GETDATE(), GETDATE());
                SELECT CAST(SCOPE_IDENTITY() as int);", conn, trans);
            insertRefundCmd.Parameters.AddWithValue("@userId", customerId);
            insertRefundCmd.Parameters.AddWithValue("@ReservationId", id);
            insertRefundCmd.Parameters.AddWithValue("@amount", refundAmount);
            insertRefundCmd.Parameters.AddWithValue("@transactionId", refundTransactionId);
            var refundPaymentId = await insertRefundCmd.ExecuteScalarAsync();
            Console.WriteLine($"[Cancel Booking] Created refund transaction with payment_id: {refundPaymentId}, refunding to customer_id: {customerId}");
            
            // Get current balance before refund (CUSTOMER's balance, not staff's)
            var checkBalanceBeforeCmd = new SqlCommand("SELECT wallet_balance FROM dbo.users WHERE user_id = @userId", conn, trans);
            checkBalanceBeforeCmd.Parameters.AddWithValue("@userId", customerId);
            var balanceBeforeResult = await checkBalanceBeforeCmd.ExecuteScalarAsync();
            var balanceBefore = balanceBeforeResult == DBNull.Value ? 0m : (decimal)balanceBeforeResult;
            Console.WriteLine($"[Cancel Booking] Customer balance BEFORE refund: {balanceBefore} VND");
            
            // Update wallet balance (CUSTOMER's wallet, not staff's)
            var updateWalletCmd = new SqlCommand(@"
                UPDATE dbo.users 
                SET wallet_balance = ISNULL(wallet_balance, 0) + @amount 
                WHERE user_id = @userId", conn, trans);
            updateWalletCmd.Parameters.AddWithValue("@userId", customerId);
            updateWalletCmd.Parameters.AddWithValue("@amount", refundAmount);
            await updateWalletCmd.ExecuteNonQueryAsync();
            Console.WriteLine($"[Cancel Booking] Updated customer wallet balance +{refundAmount}");
            
            // Get new balance (CUSTOMER's new balance)
            var getBalanceCmd = new SqlCommand("SELECT wallet_balance FROM dbo.users WHERE user_id = @userId", conn, trans);
            getBalanceCmd.Parameters.AddWithValue("@userId", customerId);
            var balanceResult = await getBalanceCmd.ExecuteScalarAsync();
            var newBalance = balanceResult == DBNull.Value ? 0m : (decimal)balanceResult;
            
            trans.Commit();
            await conn.CloseAsync();
            
            Console.WriteLine($"[Cancel Booking] Refund successful. New wallet balance: {newBalance} VND");
            
            return Results.Ok(new 
            { 
                success = true, 
                message = "Reservation cancelled successfully. Refund processed.",
                refundAmount,
                newBalance 
            });
        }
        
        // No wallet payment found, just cancel the reservation
        trans.Commit();
        await conn.CloseAsync();
        
        Console.WriteLine($"[Cancel Booking] No wallet payment found. Reservation cancelled only.");
        
        return Results.Ok(new { success = true, message = "Reservation cancelled successfully" });
    }
    catch (Exception ex)
    {
        trans.Rollback();
        await conn.CloseAsync();
        Console.WriteLine($"[Cancel Booking] Error processing refund: {ex.Message}");
        
        // Still return success for cancellation even if refund fails
        return Results.Ok(new 
        { 
            success = true, 
            message = "Reservation cancelled successfully, but refund processing failed. Please contact support.",
            refundAmount = 0,
            newBalance = (decimal?)null
        });
    }
});

// Walk-in Booking endpoint for staff
app.MapPost("/api/staff/walkin-bookings", [Microsoft.AspNetCore.Authorization.Authorize] async (
    CreateWalkInBookingRequest req, 
    IReservationService reservationService, 
    HttpContext context) =>
{
    Console.WriteLine($"[WalkIn API] Received walk-in booking request for {req.FullName}");
    
    // Check if user is staff
    var roleClaim = context.User.FindFirst(ClaimTypes.Role);
    if (roleClaim == null || roleClaim.Value != "staff")
    {
        Console.WriteLine("[WalkIn API] Unauthorized: User is not staff");
        return Results.Unauthorized();
    }

    var result = await reservationService.CreateWalkInBookingAsync(req);
    
    if (result.Success)
    {
        Console.WriteLine($"[WalkIn API] ✅ Walk-in booking created successfully");
        return Results.Ok(new { 
            success = true, 
            message = result.Message,
            reservation = result.Reservation,
            userId = result.UserId
        });
    }
    
    Console.WriteLine($"[WalkIn API] ❌ Failed to create walk-in booking: {result.Message}");
    return Results.BadRequest(new { 
        success = false, 
        message = result.Message 
    });
});

// ============================================
// QR Code endpoints
// ============================================

// Save QR code after reservation is created (called from frontend)
app.MapPost("/api/qr/save", [Microsoft.AspNetCore.Authorization.Authorize] async (SaveQRCodeRequest req, IQRCodeService qrCodeService, HttpContext context) =>
{
    var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier);
    if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
    {
        return Results.Unauthorized();
    }

    Console.WriteLine($"[QR] User {userId} saving QR code for reservation {req.ReservationId}");
    
    var result = await qrCodeService.SaveQRCodeAsync(req);
    
    if (result.Success)
    {
        Console.WriteLine($"[QR] ✅ QR code saved successfully for reservation {req.ReservationId}");
        return Results.Ok(new 
        { 
            success = true, 
            message = result.Message,
            qrCode = result.QRCode
        });
    }
    
    Console.WriteLine($"[QR] ❌ Failed to save QR code: {result.Message}");
    return Results.BadRequest(new 
    { 
        success = false, 
        message = result.Message 
    });
});

// Verify QR code (used by mobile app for staff to scan customer QR codes)
app.MapPost("/api/qr/verify", async (VerifyQRCodeRequest req, IQRCodeService qrCodeService) =>
{
    Console.WriteLine($"[QR] Verifying QR code...");
    
    var result = await qrCodeService.VerifyQRCodeAsync(req.QrCodeData);
    
    if (result.Success)
    {
        Console.WriteLine($"[QR] ✅ QR code verified successfully");
        return Results.Ok(new 
        { 
            success = true, 
            message = result.Message,
            reservation = result.Reservation,
            vehicleName = result.VehicleName,
            userName = result.UserName
        });
    }
    
    Console.WriteLine($"[QR] ❌ QR code verification failed: {result.Message}");
    return Results.BadRequest(new 
    { 
        success = false, 
        message = result.Message 
    });
});

// Get QR code for a reservation (optional - for frontend to retrieve if needed)
app.MapGet("/api/qr/reservation/{reservationId}", [Microsoft.AspNetCore.Authorization.Authorize] async (int reservationId, IQRCodeService qrCodeService) =>
{
    var qrCode = await qrCodeService.GetQRCodeByReservationIdAsync(reservationId);
    
    if (qrCode != null)
    {
        return Results.Ok(new { success = true, qrCode = qrCode });
    }
    
    return Results.NotFound(new { success = false, message = "QR code not found for this reservation" });
});

// Payment endpoints
app.MapPost("/api/payments", [Microsoft.AspNetCore.Authorization.Authorize] async (CreatePaymentRequest req, IPaymentService paymentService, HttpContext context, Func<SqlConnection> getConnection) =>
{
    var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier);
    if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
    {
        return Results.Unauthorized();
    }

    Console.WriteLine($"[CreatePayment] User {userId} creating payment for reservation {req.ReservationId}, amount: {req.Amount}, method: {req.MethodType}");
    
    var result = await paymentService.CreatePaymentAsync(req);
    
    if (result.Success)
    {
        // If payment is successful AND paid by wallet, update the payment record with user_id and transaction_type
        if (req.MethodType == "wallet" && req.ReservationId.HasValue)
        {
            using var conn = getConnection();
            await conn.OpenAsync();
            
            try
            {
                var updateCmd = new SqlCommand(@"
                    UPDATE dbo.payments 
                    SET user_id = @userId, transaction_type = 'payment'
                    WHERE reservation_id = @reservationId AND payment_id = (
                        SELECT TOP 1 payment_id FROM dbo.payments 
                        WHERE reservation_id = @reservationId 
                        ORDER BY created_at DESC
                    )", conn);
                updateCmd.Parameters.AddWithValue("@userId", userId);
                updateCmd.Parameters.AddWithValue("@reservationId", req.ReservationId.Value);
                await updateCmd.ExecuteNonQueryAsync();
                Console.WriteLine($"[CreatePayment] Updated payment with user_id {userId} and transaction_type 'payment'");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[CreatePayment] Error updating payment: {ex.Message}");
            }
            finally
            {
                await conn.CloseAsync();
            }
        }
        
        return Results.Ok(new { 
            success = true, 
            message = result.Message,
            payment = result.Payment 
        });
    }
    
    return Results.BadRequest(new { success = false, message = result.Message });
});

app.MapGet("/api/payments/reservation/{reservationId}", [Microsoft.AspNetCore.Authorization.Authorize] async (int reservationId, IPaymentService paymentService) =>
{
    var payments = await paymentService.GetReservationPaymentsAsync(reservationId);
    
    return Results.Ok(new { 
        success = true, 
        payments = payments 
    });
});

app.MapGet("/api/payments/user", [Microsoft.AspNetCore.Authorization.Authorize] async (IPaymentService paymentService, HttpContext context) =>
{
    // Get user ID from JWT token
    var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier);
    if (userIdClaim == null)
    {
        return Results.Unauthorized();
    }

    if (!int.TryParse(userIdClaim.Value, out int userId))
    {
        return Results.BadRequest(new { success = false, message = "Invalid user ID" });
    }

    var payments = await paymentService.GetUserPaymentsAsync(userId);
    
    return Results.Ok(new { 
        success = true, 
        payments = payments 
    });
});

app.MapGet("/api/payments/{id}", [Microsoft.AspNetCore.Authorization.Authorize] async (int id, IPaymentService paymentService) =>
{
    var payment = await paymentService.GetPaymentByIdAsync(id);
    
    if (payment == null)
    {
        return Results.NotFound(new { success = false, message = "Payment not found" });
    }
    
    return Results.Ok(new { 
        success = true, 
        payment = payment 
    });
});

// Wallet endpoints
app.MapGet("/api/wallet/balance", [Microsoft.AspNetCore.Authorization.Authorize] async (HttpContext context, Func<SqlConnection> getConnection) =>
{
    var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier);
    if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
    {
        return Results.Unauthorized();
    }

    using var conn = getConnection();
    var cmd = new SqlCommand("SELECT wallet_balance FROM dbo.users WHERE user_id = @userId", conn);
    cmd.Parameters.AddWithValue("@userId", userId);
    
    await conn.OpenAsync();
    var balanceResult = await cmd.ExecuteScalarAsync();
    await conn.CloseAsync();

    var balance = balanceResult == DBNull.Value ? 0m : (decimal)balanceResult;
    return Results.Ok(new { userId, balance });
});

app.MapPost("/api/wallet/deposit", [Microsoft.AspNetCore.Authorization.Authorize] async (HttpContext context, Func<SqlConnection> getConnection, DepositRequest req) =>
{
    Console.WriteLine($"Deposit request received: Amount={req.Amount}, MethodType={req.MethodType}, TransactionId={req.TransactionId}");
    
    var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier);
    if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
    {
        Console.WriteLine("Unauthorized: No valid user ID");
        return Results.Unauthorized();
    }

    Console.WriteLine($"User ID: {userId}");

    if (req.Amount < 10000)
    {
        Console.WriteLine($"Amount too low: {req.Amount}");
        return Results.BadRequest(new { success = false, message = "Minimum deposit is 10,000 VND" });
    }

    using var conn = getConnection();
    await conn.OpenAsync();
    
    var trans = conn.BeginTransaction();
    try
    {
        // Insert payment record
        var cmd1 = new SqlCommand(@"
            INSERT INTO dbo.payments (user_id, method_type, amount, status, transaction_type, transaction_id, created_at, updated_at)
            VALUES (@userId, @methodType, @amount, 'success', 'deposit', @transactionId, GETDATE(), GETDATE());
            SELECT CAST(SCOPE_IDENTITY() as int);", conn, trans);
        cmd1.Parameters.AddWithValue("@userId", userId);
        cmd1.Parameters.AddWithValue("@methodType", req.MethodType);
        cmd1.Parameters.AddWithValue("@amount", req.Amount);
        cmd1.Parameters.AddWithValue("@transactionId", req.TransactionId ?? $"TXN{DateTime.Now.Ticks}");
        
        var paymentId = (int)await cmd1.ExecuteScalarAsync();

        // Update wallet balance
        var cmd2 = new SqlCommand("UPDATE dbo.users SET wallet_balance = ISNULL(wallet_balance, 0) + @amount WHERE user_id = @userId", conn, trans);
        cmd2.Parameters.AddWithValue("@userId", userId);
        cmd2.Parameters.AddWithValue("@amount", req.Amount);
        await cmd2.ExecuteNonQueryAsync();

        // Get new balance
        var cmd3 = new SqlCommand("SELECT wallet_balance FROM dbo.users WHERE user_id = @userId", conn, trans);
        cmd3.Parameters.AddWithValue("@userId", userId);
        var balanceResult = await cmd3.ExecuteScalarAsync();
        var newBalance = balanceResult == DBNull.Value ? 0m : (decimal)balanceResult;

        trans.Commit();
        
        Console.WriteLine($"Deposit successful: paymentId={paymentId}, newBalance={newBalance}");
        return Results.Ok(new { success = true, message = "Deposit successful", paymentId, newBalance });
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Deposit failed: {ex.Message}");
        Console.WriteLine($"Stack trace: {ex.StackTrace}");
        trans.Rollback();
        return Results.BadRequest(new { success = false, message = $"Deposit failed: {ex.Message}" });
    }
    finally
    {
        await conn.CloseAsync();
    }
});

// ✅ Wallet withdrawal endpoint for payment
app.MapPost("/api/wallet/withdraw", [Microsoft.AspNetCore.Authorization.Authorize] async (HttpContext context, Func<SqlConnection> getConnection, WithdrawRequest req) =>
{
    Console.WriteLine($"Withdraw request received: Amount={req.Amount}, Reason={req.Reason}, ReservationId={req.ReservationId}");
    
    var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier);
    if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
    {
        Console.WriteLine("Unauthorized: No valid user ID");
        return Results.Unauthorized();
    }

    Console.WriteLine($"User ID: {userId}, Amount: {req.Amount}");

    using var conn = getConnection();
    await conn.OpenAsync();
    
    var trans = conn.BeginTransaction();
    try
    {
        // Check current balance
        var checkBalanceCmd = new SqlCommand("SELECT wallet_balance FROM dbo.users WHERE user_id = @userId", conn, trans);
        checkBalanceCmd.Parameters.AddWithValue("@userId", userId);
        var currentBalanceResult = await checkBalanceCmd.ExecuteScalarAsync();
        var currentBalance = currentBalanceResult == DBNull.Value ? 0m : (decimal)currentBalanceResult;
        
        Console.WriteLine($"Current balance: {currentBalance}");
        
        if (currentBalance < req.Amount)
        {
            await conn.CloseAsync();
            return Results.BadRequest(new { success = false, message = "Insufficient balance", currentBalance });
        }

        // Insert payment record with reservation_id
        var cmd1 = new SqlCommand(@"
            INSERT INTO dbo.payments (user_id, reservation_id, method_type, amount, status, transaction_type, transaction_id, created_at, updated_at)
            VALUES (@userId, @reservationId, 'wallet', @amount, 'success', 'payment', @transactionId, GETDATE(), GETDATE());
            SELECT CAST(SCOPE_IDENTITY() as int);", conn, trans);
        cmd1.Parameters.AddWithValue("@userId", userId);
        cmd1.Parameters.AddWithValue("@reservationId", (object?)req.ReservationId ?? DBNull.Value);
        cmd1.Parameters.AddWithValue("@amount", req.Amount);
        cmd1.Parameters.AddWithValue("@transactionId", req.TransactionId ?? $"TXN{DateTime.Now.Ticks}");
        
        var paymentId = (int)await cmd1.ExecuteScalarAsync();

        // Update wallet balance (subtract)
        var cmd2 = new SqlCommand("UPDATE dbo.users SET wallet_balance = ISNULL(wallet_balance, 0) - @amount WHERE user_id = @userId", conn, trans);
        cmd2.Parameters.AddWithValue("@userId", userId);
        cmd2.Parameters.AddWithValue("@amount", req.Amount);
        await cmd2.ExecuteNonQueryAsync();

        // Get new balance
        var cmd3 = new SqlCommand("SELECT wallet_balance FROM dbo.users WHERE user_id = @userId", conn, trans);
        cmd3.Parameters.AddWithValue("@userId", userId);
        var balanceResult = await cmd3.ExecuteScalarAsync();
        var newBalance = balanceResult == DBNull.Value ? 0m : (decimal)balanceResult;

        trans.Commit();
        
        Console.WriteLine($"Withdraw successful: paymentId={paymentId}, newBalance={newBalance}");
        return Results.Ok(new { success = true, message = "Payment successful", paymentId, newBalance, amount = req.Amount });
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Withdraw failed: {ex.Message}");
        Console.WriteLine($"Stack trace: {ex.StackTrace}");
        trans.Rollback();
        return Results.BadRequest(new { success = false, message = $"Payment failed: {ex.Message}" });
    }
    finally
    {
        await conn.CloseAsync();
    }
});

// Update payment with reservation_id (for wallet payments)
app.MapPut("/api/wallet/update-payment", [Microsoft.AspNetCore.Authorization.Authorize] async (HttpContext context, Func<SqlConnection> getConnection, UpdatePaymentRequest req) =>
{
    var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier);
    if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
    {
        return Results.Unauthorized();
    }

    Console.WriteLine($"[UpdatePayment] Updating payment with reservation_id={req.ReservationId}, amount={req.Amount}");
    
    using var conn = getConnection();
    await conn.OpenAsync();
    
    try
    {
        // Update the most recent payment record for this user that has method_type = 'wallet' and no reservation_id
        var updateCmd = new SqlCommand(@"
            UPDATE dbo.payments 
            SET reservation_id = @ReservationId
            WHERE payment_id = (
                SELECT TOP 1 payment_id 
                FROM dbo.payments 
                WHERE user_id = @UserId 
                  AND method_type = 'wallet' 
                  AND transaction_type = 'payment'
                  AND reservation_id IS NULL
                ORDER BY created_at DESC
            )", conn);
        updateCmd.Parameters.AddWithValue("@UserId", userId);
        updateCmd.Parameters.AddWithValue("@ReservationId", req.ReservationId);
        
        var rowsAffected = await updateCmd.ExecuteNonQueryAsync();
        Console.WriteLine($"[UpdatePayment] Updated {rowsAffected} payment records");
        
        await conn.CloseAsync();
        
        return Results.Ok(new { success = true, message = "Payment updated successfully", rowsAffected });
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[UpdatePayment] Error: {ex.Message}");
        await conn.CloseAsync();
        return Results.BadRequest(new { success = false, message = "Failed to update payment" });
    }
});

app.MapGet("/api/wallet/stats", [Microsoft.AspNetCore.Authorization.Authorize] async (HttpContext context, Func<SqlConnection> getConnection) =>
{
    var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier);
    if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
    {
        return Results.Unauthorized();
    }

    using var conn = getConnection();
    var cmd = new SqlCommand(@"
        SELECT 
            SUM(CASE WHEN transaction_type = 'deposit' THEN amount ELSE 0 END) AS TotalDeposits,
            SUM(CASE WHEN transaction_type = 'payment' THEN amount ELSE 0 END) AS TotalSpent,
            SUM(CASE WHEN transaction_type = 'refund' THEN amount ELSE 0 END) AS TotalRefunds,
            COUNT(*) AS TransactionCount
        FROM dbo.payments
        WHERE user_id = @userId AND status = 'success'", conn);
    cmd.Parameters.AddWithValue("@userId", userId);
    
    await conn.OpenAsync();
    using var reader = await cmd.ExecuteReaderAsync();
    if (await reader.ReadAsync())
    {
        var stats = new
        {
            totalDeposits = reader.GetDecimal(0),
            totalSpent = reader.GetDecimal(1),
            totalRefunds = reader.GetDecimal(2),
            transactionCount = reader.GetInt32(3)
        };
        await conn.CloseAsync();
        return Results.Ok(stats);
    }
    await conn.CloseAsync();
    return Results.Ok(new { totalDeposits = 0m, totalSpent = 0m, totalRefunds = 0m, transactionCount = 0 });
});

app.MapGet("/api/wallet/transactions", [Microsoft.AspNetCore.Authorization.Authorize] async (HttpContext context, Func<SqlConnection> getConnection) =>
{
    var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier);
    if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
    {
        return Results.Unauthorized();
    }

    using var conn = getConnection();
    var cmd = new SqlCommand(@"
        SELECT payment_id, user_id, reservation_id, rental_id, method_type, amount, status, transaction_id, transaction_type, created_at, updated_at
        FROM dbo.payments
        WHERE user_id = @userId
        ORDER BY created_at DESC", conn);
    cmd.Parameters.AddWithValue("@userId", userId);
    
    await conn.OpenAsync();
    using var reader = await cmd.ExecuteReaderAsync();
    var transactions = new List<object>();
    while (await reader.ReadAsync())
    {
        transactions.Add(new
        {
            paymentId = reader.GetInt32(0),
            userId = reader.IsDBNull(1) ? (int?)null : reader.GetInt32(1),
            reservationId = reader.IsDBNull(2) ? (int?)null : reader.GetInt32(2),
            rentalId = reader.IsDBNull(3) ? (int?)null : reader.GetInt32(3),
            methodType = reader.GetString(4),
            amount = reader.GetDecimal(5),
            status = reader.GetString(6),
            transactionId = reader.IsDBNull(7) ? null : reader.GetString(7),
            transactionType = reader.GetString(8),
            createdAt = reader.GetDateTime(9),
            updatedAt = reader.GetDateTime(10)
        });
    }
    await conn.CloseAsync();
    
    return Results.Ok(transactions);
});

// Payment Gateway Endpoints
app.MapPost("/api/wallet/payment-intent", [Microsoft.AspNetCore.Authorization.Authorize] async (HttpContext context, IPaymentGatewayService gatewayService, PaymentIntentRequest request) =>
{
    var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier);
    if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
    {
        return Results.Unauthorized();
    }

    var response = await gatewayService.CreatePaymentIntentAsync(request, userId);
    return Results.Ok(new { success = true, data = response });
});

// Storage for processed MoMo intents (in-memory for sandbox)
var _processedIntents = new Dictionary<string, ProcessedIntent>();

// MoMo Payment Webhook (public endpoint for MoMo to call)
app.MapPost("/api/payment/momo/webhook", async (HttpContext context, IPaymentGatewayService gatewayService, Func<SqlConnection> getConnection, MoMoWebhookRequest request) =>
{
    Console.WriteLine($"[MoMo Webhook] Received webhook: IntentId={request.IntentId}, Status={request.Status}, Amount={request.Amount}");
    
    // Validate webhook signature (in production, verify MoMo signature)
    // For sandbox, we'll skip signature verification
    
    try
    {
        Console.WriteLine($"[MoMo Webhook] Processing webhook for intent: {request.IntentId}");
        
        // Extract userId from intentId
        // Format: pi_{timestamp}_{userId}_{guid}
        var intentParts = request.IntentId.Split('_');
        int userId = 0;
        
        if (intentParts.Length >= 3 && int.TryParse(intentParts[2], out userId))
        {
            Console.WriteLine($"[MoMo Webhook] Extracted userId: {userId}");
        }
        else
        {
            Console.WriteLine("[MoMo Webhook] Could not extract userId from intentId");
            return Results.BadRequest(new { success = false, message = "Invalid intent ID format" });
        }
        
        // Use amount from request
        var amount = request.Amount;
        Console.WriteLine($"[MoMo Webhook] Amount: {amount}, Status: {request.Status}");
        
        // Only process if payment was successful
        if (request.Status != "completed")
        {
            Console.WriteLine($"[MoMo Webhook] Payment not successful, status: {request.Status}");
            return Results.Ok(new { success = true, message = "Webhook received but payment not completed" });
        }
        
        // Process wallet deposit
        using var conn = getConnection();
        await conn.OpenAsync();
        var trans = conn.BeginTransaction();
        
        try
        {
            Console.WriteLine($"[MoMo Webhook] Inserting payment record...");
            // Insert payment record
            var cmd1 = new SqlCommand(@"
                INSERT INTO dbo.payments (user_id, method_type, amount, status, transaction_type, transaction_id, created_at, updated_at)
                VALUES (@userId, 'momo', @amount, 'success', 'deposit', @transactionId, GETDATE(), GETDATE());
                SELECT CAST(SCOPE_IDENTITY() as int);", conn, trans);
            cmd1.Parameters.AddWithValue("@userId", userId);
            cmd1.Parameters.AddWithValue("@amount", amount);
            cmd1.Parameters.AddWithValue("@transactionId", request.TransactionId ?? $"TXN_{DateTime.Now.Ticks}");
            
            var paymentId = (int)await cmd1.ExecuteScalarAsync();
            Console.WriteLine($"[MoMo Webhook] Payment record inserted with ID: {paymentId}");

            Console.WriteLine($"[MoMo Webhook] Updating wallet balance...");
            // Update wallet balance
            var cmd2 = new SqlCommand("UPDATE dbo.users SET wallet_balance = ISNULL(wallet_balance, 0) + @amount WHERE user_id = @userId", conn, trans);
            cmd2.Parameters.AddWithValue("@userId", userId);
            cmd2.Parameters.AddWithValue("@amount", amount);
            await cmd2.ExecuteNonQueryAsync();
            
            Console.WriteLine($"[MoMo Webhook] Wallet balance updated.");

            // Get new balance
            var cmd3 = new SqlCommand("SELECT wallet_balance FROM dbo.users WHERE user_id = @userId", conn, trans);
            cmd3.Parameters.AddWithValue("@userId", userId);
            var balanceResult = await cmd3.ExecuteScalarAsync();
            var newBalance = balanceResult == DBNull.Value ? 0m : (decimal)balanceResult;

            trans.Commit();
            await conn.CloseAsync();
            
            Console.WriteLine($"[MoMo Webhook] Wallet updated successfully for user {userId}, amount: {amount}, new balance: {newBalance}");
            
            // Mark as processed for polling
            _processedIntents[request.IntentId] = new ProcessedIntent
            {
                Amount = amount,
                CompletedAt = DateTime.UtcNow
            };
            
            return Results.Ok(new 
            { 
                success = true, 
                message = "Webhook processed successfully",
                newBalance
            });
        }
        catch (Exception ex)
        {
            trans.Rollback();
            await conn.CloseAsync();
            Console.WriteLine($"[MoMo Webhook] Database error: {ex.Message}");
            Console.WriteLine($"[MoMo Webhook] Stack trace: {ex.StackTrace}");
            return Results.BadRequest(new { success = false, message = $"Webhook processing failed: {ex.Message}" });
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[MoMo Webhook] General error: {ex.Message}");
        return Results.BadRequest(new { success = false, message = ex.Message });
    }
});

// MoMo Payment Status Check
app.MapGet("/api/payment/momo/status", [Microsoft.AspNetCore.Authorization.Authorize] async (HttpContext context, IPaymentGatewayService gatewayService, string intentId) =>
{
    Console.WriteLine($"[MoMo Status] Checking status for intent: {intentId}");
    
    var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier);
    if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
    {
        return Results.Unauthorized();
    }
    
    // Check if payment was confirmed
    var (amount, methodType) = await gatewayService.GetIntentDetailsAsync(intentId);
    
    // In sandbox, simulate checking payment status from a storage
    // In production, this would query MoMo's API
    
    // For now, return a mock status
    var isCompleted = _processedIntents.ContainsKey(intentId);
    
    if (isCompleted)
    {
        var intentData = _processedIntents[intentId];
        return Results.Ok(new 
        { 
            success = true, 
            status = "completed",
            amount = intentData.Amount,
            completedAt = intentData.CompletedAt
        });
    }
    
    return Results.Ok(new { success = true, status = "pending" });
});

// MoMo Payment Confirmation
app.MapPost("/api/payment/momo/confirm", [Microsoft.AspNetCore.Authorization.Authorize] async (HttpContext context, IPaymentGatewayService gatewayService, Func<SqlConnection> getConnection, MoMoConfirmRequest request) =>
{
    Console.WriteLine($"[MoMo Confirm] IntentId: {request.IntentId}, Amount: {request.Amount}");
    
    var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier);
    if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
    {
        return Results.Unauthorized();
    }
    
    try
    {
        // Mark intent as processed
        _processedIntents[request.IntentId] = new ProcessedIntent
        {
            Amount = request.Amount,
            CompletedAt = DateTime.UtcNow
        };
        
        // Process wallet deposit
        using var conn = getConnection();
        await conn.OpenAsync();
        var trans = conn.BeginTransaction();
        
        try
        {
            // Insert payment record
            var cmd1 = new SqlCommand(@"
                INSERT INTO dbo.payments (user_id, method_type, amount, status, transaction_type, transaction_id, created_at, updated_at)
                VALUES (@userId, 'momo', @amount, 'success', 'deposit', @transactionId, GETDATE(), GETDATE());
                SELECT CAST(SCOPE_IDENTITY() as int);", conn, trans);
            cmd1.Parameters.AddWithValue("@userId", userId);
            cmd1.Parameters.AddWithValue("@amount", request.Amount);
            cmd1.Parameters.AddWithValue("@transactionId", $"TXN{DateTime.Now.Ticks}");
            
            var paymentId = (int)await cmd1.ExecuteScalarAsync();

            // Update wallet balance
            var cmd2 = new SqlCommand("UPDATE dbo.users SET wallet_balance = ISNULL(wallet_balance, 0) + @amount WHERE user_id = @userId", conn, trans);
            cmd2.Parameters.AddWithValue("@userId", userId);
            cmd2.Parameters.AddWithValue("@amount", request.Amount);
            await cmd2.ExecuteNonQueryAsync();

            // Get new balance
            var cmd3 = new SqlCommand("SELECT wallet_balance FROM dbo.users WHERE user_id = @userId", conn, trans);
            cmd3.Parameters.AddWithValue("@userId", userId);
            var balanceResult = await cmd3.ExecuteScalarAsync();
            var newBalance = balanceResult == DBNull.Value ? 0m : (decimal)balanceResult;

            trans.Commit();
            await conn.CloseAsync();
            
            return Results.Ok(new 
            { 
                success = true, 
                message = "Payment confirmed successfully",
                newBalance 
            });
        }
        catch (Exception ex)
        {
            trans.Rollback();
            await conn.CloseAsync();
            return Results.BadRequest(new { success = false, message = $"Payment processing failed: {ex.Message}" });
        }
    }
    catch (Exception ex)
    {
        return Results.BadRequest(new { success = false, message = ex.Message });
    }
});

app.MapPost("/api/wallet/confirm-payment", [Microsoft.AspNetCore.Authorization.Authorize] async (HttpContext context, IPaymentGatewayService gatewayService, Func<SqlConnection> getConnection, ConfirmPaymentRequest request) =>
{
    Console.WriteLine($"[Confirm Payment] IntentId: {request.IntentId}, PaymentMethod: {request.PaymentMethod}");
    
    var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier);
    if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
    {
        return Results.Unauthorized();
    }

    // Confirm with gateway service
    var confirmResponse = await gatewayService.ConfirmPaymentAsync(request, userId);
    Console.WriteLine($"[Confirm Payment] Gateway response: Success={confirmResponse.Success}, Message={confirmResponse.Message}");
    
    if (!confirmResponse.Success)
    {
        return Results.BadRequest(new { success = false, message = confirmResponse.Message });
    }

    // Get intent details from storage
    var (amount, methodType) = await gatewayService.GetIntentDetailsAsync(request.IntentId);
    
    // SANDBOX MODE: If intent not found, use amount from request
    if (amount == 0)
    {
        Console.WriteLine("[Confirm Payment] Intent not in storage (SANDBOX MODE), using amount from request");
        // Get amount from request (sent from frontend)
        amount = request.Amount ?? 0;
        methodType = request.PaymentMethod ?? "bank_transfer";
        
        if (amount == 0)
        {
            return Results.BadRequest(new { success = false, message = "Amount is required for payment confirmation" });
        }
    }

    // Get intent details to process wallet deposit
    using var conn = getConnection();
    await conn.OpenAsync();
    var trans = conn.BeginTransaction();
    
    try
    {
        // Insert payment record
        var cmd1 = new SqlCommand(@"
            INSERT INTO dbo.payments (user_id, method_type, amount, status, transaction_type, transaction_id, created_at, updated_at)
            VALUES (@userId, @methodType, @amount, 'success', 'deposit', @transactionId, GETDATE(), GETDATE());
            SELECT CAST(SCOPE_IDENTITY() as int);", conn, trans);
        cmd1.Parameters.AddWithValue("@userId", userId);
        cmd1.Parameters.AddWithValue("@methodType", methodType);
        cmd1.Parameters.AddWithValue("@amount", amount);
        cmd1.Parameters.AddWithValue("@transactionId", confirmResponse.TransactionId);
        
        var paymentId = (int)await cmd1.ExecuteScalarAsync();

        // Update wallet balance
        var cmd2 = new SqlCommand("UPDATE dbo.users SET wallet_balance = ISNULL(wallet_balance, 0) + @amount WHERE user_id = @userId", conn, trans);
        cmd2.Parameters.AddWithValue("@userId", userId);
        cmd2.Parameters.AddWithValue("@amount", amount);
        await cmd2.ExecuteNonQueryAsync();

        // Get new balance
        var cmd3 = new SqlCommand("SELECT wallet_balance FROM dbo.users WHERE user_id = @userId", conn, trans);
        cmd3.Parameters.AddWithValue("@userId", userId);
        var balanceResult = await cmd3.ExecuteScalarAsync();
        var newBalance = balanceResult == DBNull.Value ? 0m : (decimal)balanceResult;

        trans.Commit();
        await conn.CloseAsync();
        
        return Results.Ok(new 
        { 
            success = true, 
            message = confirmResponse.Message,
            transactionId = confirmResponse.TransactionId,
            newBalance 
        });
    }
    catch (Exception ex)
    {
        trans.Rollback();
        await conn.CloseAsync();
        return Results.BadRequest(new { success = false, message = $"Payment processing failed: {ex.Message}" });
    }
});

app.Run("http://0.0.0.0:5000");

record LoginRequest(string Email, string Password);
record DepositRequest(decimal Amount, string MethodType, string? TransactionId);
record WithdrawRequest(decimal Amount, string? Reason, string? TransactionId, int? ReservationId);
record UpdatePaymentRequest(int ReservationId, decimal Amount);
record MoMoWebhookRequest(string IntentId, string Status, decimal Amount, string? TransactionId);
record MoMoConfirmRequest(string IntentId, decimal Amount, string Method);

// Helper classes for MoMo integration
class ProcessedIntent
{
    public decimal Amount { get; set; }
    public DateTime CompletedAt { get; set; }
}


