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

var builder = WebApplication.CreateBuilder(args);

// CORS (dev)
builder.Services.AddCors(p => p.AddDefaultPolicy(b => b
    .WithOrigins(
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8080",
        "http://localhost:8081",
        "http://localhost:8082"
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

// DI: Payment management
builder.Services.AddScoped<IPaymentRepository, PaymentRepository>();
builder.Services.AddScoped<IPaymentService, PaymentService>();

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

// Serve static files (for uploaded documents)
app.UseStaticFiles();

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

app.MapPost("/api/reservations/{id}/cancel", [Microsoft.AspNetCore.Authorization.Authorize] async (int id, IReservationService reservationService) =>
{
    var success = await reservationService.CancelReservationAsync(id);
    
    if (success)
    {
        return Results.Ok(new { success = true, message = "Reservation cancelled successfully" });
    }
    
    return Results.BadRequest(new { success = false, message = "Failed to cancel reservation" });
});

// Payment endpoints
app.MapPost("/api/payments", [Microsoft.AspNetCore.Authorization.Authorize] async (CreatePaymentRequest req, IPaymentService paymentService) =>
{
    var result = await paymentService.CreatePaymentAsync(req);
    
    if (result.Success)
    {
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

app.Run("http://localhost:5000");

record LoginRequest(string Email, string Password);


