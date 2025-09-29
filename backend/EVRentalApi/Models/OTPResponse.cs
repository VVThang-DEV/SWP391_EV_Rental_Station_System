namespace EVRentalApi.Models;

public record OTPResponse(
    bool Success,
    string Message,
    bool IsValid = false
);
