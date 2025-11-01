using EVRentalApi.Models;

namespace EVRentalApi.Application.Services;

public interface IStaffService
{
    // Staff Profile
    Task<StaffProfileDto?> GetStaffProfileAsync(int staffId);
    
    // Vehicle Management
    Task<List<VehicleDto>> GetStationVehiclesAsync(int staffId);
    Task<List<VehicleDto>> GetVehiclesByStatusAsync(int staffId, string status);
    Task<VehicleDto?> GetVehicleAsync(int vehicleId, int staffId);
    Task<VehicleUpdateResponse> UpdateVehicleAsync(int vehicleId, int staffId, UpdateVehicleRequest request);
    Task<VehicleUpdateResponse> UpdateVehicleByStaffAsync(int userId, int vehicleId, UpdateVehicleRequest request);
    Task<VehicleAddResponse> AddVehicleAsync(int staffId, AddVehicleRequest request);
    
    // Maintenance Management
    Task<MaintenanceResponse> RecordMaintenanceAsync(int vehicleId, int staffId, MaintenanceRecordRequest request);
    Task<List<MaintenanceRecordDto>> GetMaintenanceRecordsAsync(int staffId);
    
    // Station Information
    Task<StationInfoDto?> GetStationInfoAsync(int staffId);
    
    // Customer Verification
    Task<List<CustomerVerificationDto>> GetCustomersForVerificationAsync(int staffId);
    Task<CustomerVerificationResponse> VerifyCustomerAsync(int customerId, int staffId, CustomerVerificationRequest request);
    
    // Reservation Management
    Task<CustomerVerificationResponse> ConfirmReservationAsync(int reservationId, int staffId);
    
    // Handover Management
    Task<List<HandoverDto>> GetHandoversAsync(int staffId);
    Task<HandoverResponse> RecordHandoverAsync(int staffId, HandoverRequest request);
    
    // Activity Logs
    Task<List<StaffActivityLogDto>> GetTodayActivityLogsAsync(int staffId);
}
