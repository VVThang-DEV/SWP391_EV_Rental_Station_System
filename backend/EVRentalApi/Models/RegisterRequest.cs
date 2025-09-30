namespace EVRentalApi.Models;

public record RegisterRequest(
    string FullName,
    string Email,
    string Phone,
    string DateOfBirth,
    string Password
);
