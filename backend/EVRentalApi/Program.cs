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

// Add controllers
builder.Services.AddControllers();

var app = builder.Build();

// Middleware
app.UseCors();

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

app.Run("http://localhost:5000");

record LoginRequest(string Email, string Password);


