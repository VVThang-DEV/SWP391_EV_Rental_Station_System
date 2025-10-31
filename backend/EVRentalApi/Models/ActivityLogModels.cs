namespace EVRentalApi.Models;

public class StaffActivityLogDto
{
    public int ActivityId { get; set; }
    public string ActivityType { get; set; } = string.Empty; // payment, cancellation, confirmation, verification
    public string CustomerName { get; set; } = string.Empty;
    public string? VehicleModel { get; set; }
    public decimal? Amount { get; set; }
    public string? Details { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? Status { get; set; }
}

