namespace EVRentalApi.Models;

public record ResetPasswordRequest(
    string Email,
    string OTPCode,
    string NewPassword
);



