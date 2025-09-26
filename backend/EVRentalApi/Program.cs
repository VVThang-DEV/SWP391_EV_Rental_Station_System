using System.Data;
using Microsoft.Data.SqlClient;
using System.Security.Cryptography;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using EVRentalApi.Application.Services;
using EVRentalApi.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

// CORS (dev)
builder.Services.AddCors(p => p.AddDefaultPolicy(b => b
    .WithOrigins("http://localhost:5173", "http://localhost:3000", "http://localhost:8080")
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
builder.Services.AddScoped<UserRepository>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<EmailService>();

var app = builder.Build();

// Middleware
app.UseCors();

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

// Register endpoint
app.MapPost("/auth/register", async (RegisterRequest req, UserRepository users, EmailService emailService, HttpContext http) =>
{
    // Hash password
    var passwordHash = Sha256(req.Password);

    // Attempt to create customer
    var (ok, userId, token) = await users.CreateCustomerWithVerificationAsync(req.Email, passwordHash, req.FullName);
    if (!ok)
    {
        return Results.BadRequest(new { success = false, message = "Email already exists or registration failed." });
    }

    // Build verification link
    var host = http.Request.Host.Value;
    var scheme = http.Request.Scheme;
    var verificationLink = $"{scheme}://{host}/auth/verify?token={token}";

    await emailService.SendVerificationEmailAsync(req.Email, verificationLink);

    return Results.Ok(new { success = true, userId });
});

// Email verify endpoint
app.MapGet("/auth/verify", async (string token, UserRepository users) =>
{
    var ok = await users.VerifyEmailAsync(token);
    if (!ok) return Results.BadRequest(new { success = false, message = "Invalid or expired token" });
    return Results.Ok(new { success = true });
});

// Health
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.Run("http://0.0.0.0:5000");

record LoginRequest(string Email, string Password);
record RegisterRequest(string Email, string Password, string FullName);       