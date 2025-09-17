using System.Data;
using Microsoft.Data.SqlClient;
using System.Security.Cryptography;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

// Services
builder.Services.AddCors(p => p.AddDefaultPolicy(b => b
    .WithOrigins("http://localhost:5173", "http://localhost:3000", "http://localhost:8080")
    .AllowAnyHeader()
    .AllowAnyMethod()));

var app = builder.Build();

// Middleware
app.UseCors();

// Minimal API endpoint for login using stored procedure LoginUser
string Sha256(string input)
{
    using var sha = SHA256.Create();
    var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(input));
    return Convert.ToHexString(bytes).ToLowerInvariant();
}

app.MapPost("/auth/login", async (LoginRequest req, IConfiguration config) =>
{
    var connectionString = config.GetConnectionString("EVRentalDB");

    static async Task<(bool ok, string? fullName, string? role, string? errorMessage)> TryLoginAsync(
        SqlConnection connection,
        string email,
        string passwordHash)
    {
        await using var command = new SqlCommand("LoginUser", connection)
        {
            CommandType = CommandType.StoredProcedure
        };
        command.Parameters.AddWithValue("@Email", email);
        command.Parameters.AddWithValue("@PasswordHash", passwordHash);

        try
        {
            await using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                return (true, reader["FullName"].ToString(), reader["RoleName"].ToString(), null);
            }
            return (false, null, null, null);
        }
        catch (SqlException ex) when (ex.Number == 50000)
        {
            // Business error from RAISERROR inside SP for wrong credentials
            return (false, null, null, ex.Message);
        }
    }

    try
    {
        await using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync();

        // 1) Try with SHA-256 (new accounts)
        var hashed = Sha256(req.Password);
        var attempt = await TryLoginAsync(connection, req.Email, hashed);

        // 2) Fallback: try legacy plain (old seeded accounts)
        if (!attempt.ok)
        {
            attempt = await TryLoginAsync(connection, req.Email, req.Password);
        }

        if (!attempt.ok)
        {
            return Results.Unauthorized();
        }

        // Issue JWT
        var jwtSection = config.GetSection("Jwt");
        var secret = jwtSection.GetValue<string>("Secret")!;
        var issuer = jwtSection.GetValue<string>("Issuer")!;
        var audience = jwtSection.GetValue<string>("Audience")!;
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var claims = new[]
        {
            new Claim(ClaimTypes.Name, req.Email),
            new Claim(ClaimTypes.Role, attempt.role ?? "Customer")
        };
        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: creds
        );
        var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

        return Results.Ok(new { success = true, fullName = attempt.fullName, role = attempt.role, token = tokenString });
    }
    catch (SqlException ex)
    {
        return Results.Problem(ex.Message, statusCode: 500);
    }
});

// Registration endpoint calling stored procedure RegisterCustomer
app.MapPost("/auth/register", async (RegisterRequest req, IConfiguration config) =>
{
    var connectionString = config.GetConnectionString("EVRentalDB");
    var passwordHash = Sha256(req.Password);

    try
    {
        await using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync();

        await using var command = new SqlCommand("RegisterCustomer", connection)
        {
            CommandType = CommandType.StoredProcedure
        };
        command.Parameters.AddWithValue("@FullName", req.FullName);
        command.Parameters.AddWithValue("@Email", req.Email);
        command.Parameters.AddWithValue("@Phone", req.Phone);
        command.Parameters.AddWithValue("@PasswordHash", passwordHash);
        command.Parameters.AddWithValue("@CCCD", (object?)req.CCCD ?? DBNull.Value);
        command.Parameters.AddWithValue("@LicenseNumber", (object?)req.LicenseNumber ?? DBNull.Value);

        try
        {
            await command.ExecuteNonQueryAsync();
        }
        catch (SqlException ex) when (ex.Number == 50000) // RAISERROR from SP
        {
            // Treat business RAISERROR as 409 Conflict for duplicates
            return Results.Conflict(new { success = false, message = ex.Message });
        }
        return Results.Created($"/auth/register", new { success = true });
    }
    catch (SqlException ex)
    {
        return Results.Problem(ex.Message, statusCode: 500);
    }
});

app.Run("http://0.0.0.0:5000");

record LoginRequest(string Email, string Password);
record RegisterRequest(string FullName, string Email, string Phone, string Password, string? CCCD, string? LicenseNumber);
