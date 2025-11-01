namespace EVRentalApi.Models;

public class UserDto
{
    public int UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public int RoleId { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public int? StationId { get; set; }
}

public class StaffProfileDto
{
    public int UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public int? StationId { get; set; }
    public string? StationName { get; set; }
    public string? StationAddress { get; set; }
    public string Role { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class UpdateVehicleRequest
{
    public int? BatteryLevel { get; set; }
    public string? Condition { get; set; }
    public int? Mileage { get; set; }
    public string? Status { get; set; }
    public DateTime? LastMaintenance { get; set; }
    public DateTime? InspectionDate { get; set; }
    public string? Notes { get; set; }
}

public class AddVehicleRequest
{
    public string ModelId { get; set; } = string.Empty;
    public string? UniqueVehicleId { get; set; }
    public int BatteryLevel { get; set; } = 100;
    public string Condition { get; set; } = "excellent";
    public int Mileage { get; set; } = 0;
    public string? LicensePlate { get; set; }
    public string? Location { get; set; }
    public string? Notes { get; set; }
}

public class AssignVehicleToStationRequest
{
    public int VehicleId { get; set; }
    public int StationId { get; set; }
    public string Location { get; set; } = string.Empty;
}

public class MaintenanceRecordRequest
{
    public string MaintenanceType { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal? Cost { get; set; }
    public DateTime CompletedAt { get; set; }
    public string? Notes { get; set; }
}

public class MaintenanceRecordDto
{
    public int MaintenanceId { get; set; }
    public int VehicleId { get; set; }
    public string? VehicleModel { get; set; }
    public string? VehicleUniqueId { get; set; }
    public int StaffId { get; set; }
    public string? StaffName { get; set; }
    public string MaintenanceType { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal? Cost { get; set; }
    public DateTime CompletedAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CustomerVerificationDto
{
    public int ReservationId { get; set; }
    public int UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Cccd { get; set; }
    public string? LicenseNumber { get; set; }
    public string? Address { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public int VehicleId { get; set; }
    public string VehicleModel { get; set; } = string.Empty;
    public decimal VehiclePricePerHour { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal DepositAmount { get; set; }
    public bool HasDocuments { get; set; }
    public List<DocumentDto> Documents { get; set; } = new();
    public DateTime CreatedAt { get; set; }
}

public class DocumentDto
{
    public int DocumentId { get; set; }
    public string DocumentType { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public string? Status { get; set; }
    public DateTime? VerifiedAt { get; set; }
    public int? VerifiedBy { get; set; }
    public string? VerifiedByName { get; set; }
    public DateTime UploadedAt { get; set; }
}

public class CustomerVerificationRequest
{
    public string? DocumentType { get; set; }
    public string? Status { get; set; } // "approved", "rejected", "pending"
    public string? Notes { get; set; }
}

public class HandoverRequest
{
    public int RentalId { get; set; }
    public string Type { get; set; } = string.Empty; // "pickup", "return"
    public string? ConditionNotes { get; set; }
    public List<string>? ImageUrls { get; set; }
}

public class HandoverDto
{
    public int HandoverId { get; set; }
    public int RentalId { get; set; }
    public int? CustomerId { get; set; }
    public string? CustomerName { get; set; }
    public int? VehicleId { get; set; }
    public string? VehicleModel { get; set; }
    public string? VehicleUniqueId { get; set; }
    public int StaffId { get; set; }
    public string? StaffName { get; set; }
    public string Type { get; set; } = string.Empty;
    public string? ConditionNotes { get; set; }
    public List<string>? ImageUrls { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class StationInfoDto
{
    public int StationId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
    public string Status { get; set; } = string.Empty;
    public int AvailableVehicles { get; set; }
    public int TotalSlots { get; set; }
    public List<string> Amenities { get; set; } = new();
    public decimal Rating { get; set; }
    public string OperatingHours { get; set; } = string.Empty;
    public bool FastCharging { get; set; }
    public string? Image { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

// Response models
public class StaffServiceResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }
}

public class VehicleUpdateResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public VehicleDto? Vehicle { get; set; }
}

public class VehicleAddResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public VehicleDto? Vehicle { get; set; }
}

public class MaintenanceResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public MaintenanceRecordDto? Record { get; set; }
}

public class CustomerVerificationResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
}

public class HandoverResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public HandoverDto? Handover { get; set; }
}

// Admin models
public class AdminCreateVehicleRequest
{
    public string ModelId { get; set; } = string.Empty;
    public string? UniqueVehicleId { get; set; }
    public int BatteryLevel { get; set; } = 100;
    public string Condition { get; set; } = "excellent";
    public int Mileage { get; set; } = 0;
    public string? LicensePlate { get; set; }
    public DateTime? LastMaintenance { get; set; }
    public DateTime? InspectionDate { get; set; }
    public DateTime? InsuranceExpiry { get; set; }
    public string? Location { get; set; }
    // Các trường mới từ form
    public string? Color { get; set; }
    public int? Year { get; set; }
    public decimal? BatteryCapacity { get; set; }
    public DateTime? PurchaseDate { get; set; }
    public DateTime? WarrantyExpiry { get; set; }
    public DateTime? NextMaintenanceDate { get; set; }
    public decimal? FuelEfficiency { get; set; }
    public string? Notes { get; set; }
}

public class AdminCreateVehicleResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public VehicleDto? Vehicle { get; set; }
}