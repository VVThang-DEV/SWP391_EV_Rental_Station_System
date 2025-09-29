namespace EVRentalApi.Models;

public record RegisterResponse(
    bool Success,
    string Message,
    int? UserId = null,
    string? Email = null
);
