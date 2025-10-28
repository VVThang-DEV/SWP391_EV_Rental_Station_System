using EVRentalApi.Infrastructure.Repositories;
using EVRentalApi.Models;

namespace EVRentalApi.Application.Services;

public class StaffService : IStaffService
{
    private readonly IStaffRepository _staffRepository;

    public StaffService(IStaffRepository staffRepository)
    {
        _staffRepository = staffRepository;
    }

    public async Task<StaffProfileDto?> GetStaffProfileAsync(int staffId)
    {
        return await _staffRepository.GetStaffProfileAsync(staffId);
    }

    public async Task<List<VehicleDto>> GetStationVehiclesAsync(int staffId)
    {
        return await _staffRepository.GetStationVehiclesAsync(staffId);
    }

    public async Task<List<VehicleDto>> GetVehiclesByStatusAsync(int staffId, string status)
    {
        return await _staffRepository.GetVehiclesByStatusAsync(staffId, status);
    }

    public async Task<VehicleDto?> GetVehicleAsync(int vehicleId, int staffId)
    {
        return await _staffRepository.GetVehicleAsync(vehicleId, staffId);
    }

    public async Task<VehicleUpdateResponse> UpdateVehicleAsync(int vehicleId, int staffId, UpdateVehicleRequest request)
    {
        try
        {
            // Check if vehicle belongs to staff's station
            var vehicle = await _staffRepository.GetVehicleAsync(vehicleId, staffId);
            if (vehicle == null)
            {
                return new VehicleUpdateResponse
                {
                    Success = false,
                    Message = "Vehicle not found or not accessible"
                };
            }

            // Check if vehicle is currently rented or pending - prevent editing
            if (vehicle.Status?.ToLower() == "rented" || vehicle.Status?.ToLower() == "pending")
            {
                return new VehicleUpdateResponse
                {
                    Success = false,
                    Message = vehicle.Status?.ToLower() == "rented" 
                        ? "Cannot edit vehicle that is currently rented. Please wait until the rental period ends."
                        : "Cannot edit vehicle that is pending approval. Please approve or reject the vehicle first."
                };
            }

            // Update vehicle
            var updatedVehicle = await _staffRepository.UpdateVehicleAsync(vehicleId, request);
            if (updatedVehicle == null)
            {
                return new VehicleUpdateResponse
                {
                    Success = false,
                    Message = "Failed to update vehicle"
                };
            }

            return new VehicleUpdateResponse
            {
                Success = true,
                Message = "Vehicle updated successfully",
                Vehicle = updatedVehicle
            };
        }
        catch (Exception ex)
        {
            return new VehicleUpdateResponse
            {
                Success = false,
                Message = $"Error updating vehicle: {ex.Message}"
            };
        }
    }

    public async Task<VehicleAddResponse> AddVehicleAsync(int staffId, AddVehicleRequest request)
    {
        try
        {
            // Get staff's station ID
            var staffProfile = await _staffRepository.GetStaffProfileAsync(staffId);
            if (staffProfile?.StationId == null)
            {
                return new VehicleAddResponse
                {
                    Success = false,
                    Message = "Staff is not assigned to any station"
                };
            }

            // Add vehicle to station
            var newVehicle = await _staffRepository.AddVehicleAsync(staffProfile.StationId.Value, request);
            if (newVehicle == null)
            {
                return new VehicleAddResponse
                {
                    Success = false,
                    Message = "Failed to add vehicle"
                };
            }

            return new VehicleAddResponse
            {
                Success = true,
                Message = "Vehicle added successfully",
                Vehicle = newVehicle
            };
        }
        catch (Exception ex)
        {
            return new VehicleAddResponse
            {
                Success = false,
                Message = $"Error adding vehicle: {ex.Message}"
            };
        }
    }

    public async Task<MaintenanceResponse> RecordMaintenanceAsync(int vehicleId, int staffId, MaintenanceRecordRequest request)
    {
        try
        {
            // Check if vehicle belongs to staff's station
            var vehicle = await _staffRepository.GetVehicleAsync(vehicleId, staffId);
            if (vehicle == null)
            {
                return new MaintenanceResponse
                {
                    Success = false,
                    Message = "Vehicle not found or not accessible"
                };
            }

            // Check if vehicle is currently rented or pending - prevent maintenance
            if (vehicle.Status?.ToLower() == "rented" || vehicle.Status?.ToLower() == "pending")
            {
                return new MaintenanceResponse
                {
                    Success = false,
                    Message = vehicle.Status?.ToLower() == "rented" 
                        ? "Cannot perform maintenance on vehicle that is currently rented. Please wait until the rental period ends."
                        : "Cannot perform maintenance on vehicle that is pending approval. Please approve or reject the vehicle first."
                };
            }

            // Record maintenance
            var record = await _staffRepository.RecordMaintenanceAsync(vehicleId, staffId, request);
            if (record == null)
            {
                return new MaintenanceResponse
                {
                    Success = false,
                    Message = "Failed to record maintenance"
                };
            }

            return new MaintenanceResponse
            {
                Success = true,
                Message = "Maintenance recorded successfully",
                Record = record
            };
        }
        catch (Exception ex)
        {
            return new MaintenanceResponse
            {
                Success = false,
                Message = $"Error recording maintenance: {ex.Message}"
            };
        }
    }

    public async Task<List<MaintenanceRecordDto>> GetMaintenanceRecordsAsync(int staffId)
    {
        return await _staffRepository.GetMaintenanceRecordsAsync(staffId);
    }

    public async Task<StationInfoDto?> GetStationInfoAsync(int staffId)
    {
        return await _staffRepository.GetStationInfoAsync(staffId);
    }

    public async Task<List<CustomerVerificationDto>> GetCustomersForVerificationAsync(int staffId)
    {
        return await _staffRepository.GetCustomersForVerificationAsync(staffId);
    }

    public async Task<CustomerVerificationResponse> VerifyCustomerAsync(int customerId, int staffId, CustomerVerificationRequest request)
    {
        try
        {
            var success = await _staffRepository.VerifyCustomerAsync(customerId, staffId, request);
            if (!success)
            {
                return new CustomerVerificationResponse
                {
                    Success = false,
                    Message = "Failed to verify customer"
                };
            }

            return new CustomerVerificationResponse
            {
                Success = true,
                Message = "Customer verified successfully"
            };
        }
        catch (Exception ex)
        {
            return new CustomerVerificationResponse
            {
                Success = false,
                Message = $"Error verifying customer: {ex.Message}"
            };
        }
    }

    public async Task<List<HandoverDto>> GetHandoversAsync(int staffId)
    {
        return await _staffRepository.GetHandoversAsync(staffId);
    }

    public async Task<HandoverResponse> RecordHandoverAsync(int staffId, HandoverRequest request)
    {
        try
        {
            var handover = await _staffRepository.RecordHandoverAsync(staffId, request);
            if (handover == null)
            {
                return new HandoverResponse
                {
                    Success = false,
                    Message = "Failed to record handover"
                };
            }

            return new HandoverResponse
            {
                Success = true,
                Message = "Handover recorded successfully",
                Handover = handover
            };
        }
        catch (Exception ex)
        {
            return new HandoverResponse
            {
                Success = false,
                Message = $"Error recording handover: {ex.Message}"
            };
        }
    }

    public async Task<VehicleUpdateResponse> UpdateVehicleByStaffAsync(int userId, int vehicleId, UpdateVehicleRequest request)
    {
        try
        {
            // Get staff user to check station
            var user = await _staffRepository.GetStaffUserByIdAsync(userId);
            if (user == null || user.RoleId != 2 || !user.StationId.HasValue)
            {
                return new VehicleUpdateResponse { Success = false, Message = "Unauthorized or invalid staff." };
            }

            // Get vehicle and check if it belongs to staff's station
            var vehicle = await _staffRepository.GetVehicleAsync(vehicleId, userId);
            if (vehicle == null || vehicle.StationId != user.StationId.Value)
            {
                return new VehicleUpdateResponse { Success = false, Message = "Vehicle not found or does not belong to your station." };
            }

            // Check if vehicle is currently rented or pending - prevent editing
            if (vehicle.Status?.ToLower() == "rented" || vehicle.Status?.ToLower() == "pending")
            {
                return new VehicleUpdateResponse 
                { 
                    Success = false, 
                    Message = vehicle.Status?.ToLower() == "rented" 
                        ? "Cannot edit vehicle that is currently rented. Please wait until the rental period ends."
                        : "Cannot edit vehicle that is pending approval. Please approve or reject the vehicle first."
                };
            }

            // Update vehicle properties
            if (request.BatteryLevel.HasValue) vehicle.BatteryLevel = request.BatteryLevel.Value;
            if (!string.IsNullOrEmpty(request.Condition)) vehicle.Condition = request.Condition;
            if (!string.IsNullOrEmpty(request.Status)) vehicle.Status = request.Status;
            if (request.Mileage.HasValue) vehicle.Mileage = request.Mileage.Value;
            if (request.LastMaintenance.HasValue) vehicle.LastMaintenance = request.LastMaintenance.Value.ToString("yyyy-MM-dd");
            if (request.InspectionDate.HasValue) vehicle.InspectionDate = request.InspectionDate.Value.ToString("yyyy-MM-dd");

            // Save to database
            var success = await _staffRepository.UpdateVehicleAsync(vehicle);
            if (!success)
            {
                return new VehicleUpdateResponse { Success = false, Message = "Failed to update vehicle in database." };
            }

            return new VehicleUpdateResponse { Success = true, Message = "Vehicle updated successfully.", Vehicle = vehicle };
        }
        catch (Exception ex)
        {
            return new VehicleUpdateResponse { Success = false, Message = $"Error updating vehicle: {ex.Message}" };
        }
    }
}
