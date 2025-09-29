namespace EVRentalApi.Models;

public record SendOTPResponse(
    bool Success,
    string Message,
    int ExpiresInSeconds = 300
);
