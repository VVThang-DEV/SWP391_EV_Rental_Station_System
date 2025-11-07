namespace EVRentalApi.Models;

public class IncidentDto
{
    public int IncidentId { get; set; }
    public int? ReservationId { get; set; }
    public int VehicleId { get; set; }
    public string? VehicleName { get; set; }
    public string? VehicleLicensePlate { get; set; }
    public int StationId { get; set; }
    public string? StationName { get; set; }
    public int UserId { get; set; }
    public string? CustomerName { get; set; }
    public string? CustomerEmail { get; set; }
    public string Type { get; set; } = string.Empty; // 'accident', 'breakdown', 'damage', 'theft', 'other'
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "reported"; // 'reported', 'in_progress', 'resolved'
    public string Priority { get; set; } = "medium"; // 'low', 'medium', 'high', 'urgent'
    public DateTime ReportedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public string? StaffNotes { get; set; }
    public int? HandledBy { get; set; }
    public string? HandledByName { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class CreateIncidentRequest
{
    public int? ReservationId { get; set; }
    public int? VehicleId { get; set; }
    public int? StationId { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Priority { get; set; } = "medium";
}

public class UpdateIncidentRequest
{
    public string? Status { get; set; }
    public string? Priority { get; set; }
    public string? StaffNotes { get; set; }
}

