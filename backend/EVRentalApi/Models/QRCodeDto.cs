namespace EVRentalApi.Models;

public class SaveQRCodeRequest
{
    public int ReservationId { get; set; }
    public string QRCodeData { get; set; } = string.Empty; // The complete JSON string from client-side
}

public class QRCodeDto
{
    public int QrId { get; set; }
    public int? ReservationId { get; set; }
    public int? RentalId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public DateTime? UsedAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class QRCodeResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public QRCodeDto? QRCode { get; set; }
}

public class VerifyQRCodeRequest
{
    public string QrCodeData { get; set; } = string.Empty;
}

public class VerifyQRCodeResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public ReservationDto? Reservation { get; set; }
    public string? VehicleName { get; set; }
    public string? UserName { get; set; }
}
