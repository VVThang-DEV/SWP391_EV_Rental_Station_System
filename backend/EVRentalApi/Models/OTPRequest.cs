namespace EVRentalApi.Models;

public record OTPRequest(
    string Email,
    string OTPCode
);
