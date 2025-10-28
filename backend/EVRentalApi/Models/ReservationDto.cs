namespace EVRentalApi.Models;

public class CreateReservationRequest
{
    public int UserId { get; set; }
    public int VehicleId { get; set; }
    public int StationId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
}

public class ReservationResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public ReservationDto? Reservation { get; set; }
}

public class ReservationDto
{
    public int ReservationId { get; set; }
    public int UserId { get; set; }
    public int VehicleId { get; set; }
    public int StationId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

