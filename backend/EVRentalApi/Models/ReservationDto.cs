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
    public string? CancellationReason { get; set; }
    public string? CancelledBy { get; set; }
    public DateTime? CancelledAt { get; set; }
    public string? StationName { get; set; }
    public string? VehicleName { get; set; }
}

public class CancelReservationRequest
{
    public string? Reason { get; set; }
    public string? CancelledBy { get; set; }
}

public class CreateWalkInBookingRequest
{
    // Customer Information
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? LicenseNumber { get; set; }
    public string? IdNumber { get; set; }
    public string? Address { get; set; }
    public DateTime? DateOfBirth { get; set; }
    
    // Booking Information
    public int VehicleId { get; set; }
    public int StationId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    
    // Payment Information
    public string PaymentMethod { get; set; } = "cash"; // cash, qr
}

public class WalkInBookingResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public ReservationDto? Reservation { get; set; }
    public int? UserId { get; set; }
}

