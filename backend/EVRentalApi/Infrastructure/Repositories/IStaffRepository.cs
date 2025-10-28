using EVRentalApi.Models;

namespace EVRentalApi.Infrastructure.Repositories;

public interface IStaffRepository
{
    // Staff Profile
    Task<StaffProfileDto?> GetStaffProfileAsync(int staffId);
    Task<UserDto?> GetStaffUserByIdAsync(int userId);
    
    // Vehicle Management
    Task<List<VehicleDto>> GetStationVehiclesAsync(int staffId);
    Task<List<VehicleDto>> GetVehiclesByStatusAsync(int staffId, string status);
    Task<VehicleDto?> GetVehicleAsync(int vehicleId, int staffId);
    Task<VehicleDto?> UpdateVehicleAsync(int vehicleId, UpdateVehicleRequest request);
    Task<bool> UpdateVehicleAsync(VehicleDto vehicle);
    Task<VehicleDto?> AddVehicleAsync(int stationId, AddVehicleRequest request);
    
    // Maintenance Management
    Task<MaintenanceRecordDto?> RecordMaintenanceAsync(int vehicleId, int staffId, MaintenanceRecordRequest request);
    Task<List<MaintenanceRecordDto>> GetMaintenanceRecordsAsync(int staffId);
    
    // Station Information
    Task<StationInfoDto?> GetStationInfoAsync(int staffId);
    
    // Customer Verification
    Task<List<CustomerVerificationDto>> GetCustomersForVerificationAsync(int staffId);
    Task<bool> VerifyCustomerAsync(int customerId, int staffId, CustomerVerificationRequest request);
    
    // Handover Management
    Task<List<HandoverDto>> GetHandoversAsync(int staffId);
    Task<HandoverDto?> RecordHandoverAsync(int staffId, HandoverRequest request);
}
