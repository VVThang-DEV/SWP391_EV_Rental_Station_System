namespace EVRentalApi.Models;

public class SetPasswordWithTokenRequest
{
    public string Token { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}

