namespace EVRentalApi.Models;

public record UpdatePersonalInfoRequest(
    string Email,
    string? Cccd,
    string? LicenseNumber,
    string? Address,
    string? Gender,
    string? DateOfBirth,
    string? AvatarUrl,
    string? DocumentUrl
    
);
