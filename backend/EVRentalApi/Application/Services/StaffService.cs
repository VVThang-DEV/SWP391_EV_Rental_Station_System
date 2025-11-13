using EVRentalApi.Infrastructure.Repositories;
using EVRentalApi.Models;

namespace EVRentalApi.Application.Services;

public class StaffService : IStaffService
{
    private readonly IStaffRepository _staffRepository;
    private readonly IHandoverService _handoverService;
    private readonly IUserRepository _userRepository;

    public StaffService(IStaffRepository staffRepository, IHandoverService handoverService, IUserRepository userRepository)
    {
        _staffRepository = staffRepository;
        _handoverService = handoverService;
        _userRepository = userRepository;
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
                    Message = "Failed to verify customer. Customer may not have any documents uploaded, or documents are in an invalid state."
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
            Console.WriteLine($"[StaffService.VerifyCustomerAsync] Exception: {ex.Message}");
            Console.WriteLine($"[StaffService.VerifyCustomerAsync] Stack trace: {ex.StackTrace}");
            return new CustomerVerificationResponse
            {
                Success = false,
                Message = $"Error verifying customer: {ex.Message}"
            };
        }
    }

    public async Task<CustomerVerificationResponse> ConfirmReservationAsync(int reservationId, int staffId)
    {
        try
        {
            var success = await _staffRepository.ConfirmReservationAsync(reservationId, staffId);
            if (!success)
            {
                return new CustomerVerificationResponse
                {
                    Success = false,
                    Message = "Failed to confirm reservation"
                };
            }

            return new CustomerVerificationResponse
            {
                Success = true,
                Message = "Reservation confirmed successfully"
            };
        }
        catch (Exception ex)
        {
            return new CustomerVerificationResponse
            {
                Success = false,
                Message = $"Error confirming reservation: {ex.Message}"
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
            // Convert HandoverRequest to CreateHandoverRequest
            var createRequest = new CreateHandoverRequest
            {
                RentalId = request.RentalId,
                ReservationId = request.ReservationId,
                Type = request.Type,
                ConditionNotes = request.ConditionNotes,
                ImageUrlList = request.ImageUrlList,
                ReturnTimeStatus = request.ReturnTimeStatus,
                LateHours = request.LateHours,
                BatteryLevel = request.BatteryLevel,
                Mileage = request.Mileage,
                ExteriorCondition = request.ExteriorCondition,
                InteriorCondition = request.InteriorCondition,
                TiresCondition = request.TiresCondition,
                DamagesList = request.DamagesList,
                LateFee = request.LateFee,
                DamageFee = request.DamageFee,
                TotalDue = request.TotalDue,
                DepositRefund = request.DepositRefund
            };

            // Use HandoverService to create handover (this will save to database including images)
            var (success, handoverId, message) = await _handoverService.CreateAsync(createRequest, staffId);
            
            if (!success)
            {
                return new HandoverResponse
                {
                    Success = false,
                    Message = message
                };
            }

            // Get the created handover details
            HandoverDto? handoverDto = null;
            if (request.ReservationId.HasValue)
            {
                var handover = await _handoverService.GetByReservationAsync(request.ReservationId.Value);
                if (handover != null)
                {
                    handoverDto = new HandoverDto
                    {
                        HandoverId = handover.HandoverId,
                        RentalId = handover.RentalId ?? 0,
                        StaffId = handover.StaffId,
                        Type = handover.Type,
                        ConditionNotes = handover.ConditionNotes,
                        ImageUrls = handover.ImageUrls != null 
                            ? System.Text.Json.JsonSerializer.Deserialize<List<string>>(handover.ImageUrls) 
                            : null,
                        CreatedAt = handover.CreatedAt
                    };
                }
            }

            return new HandoverResponse
            {
                Success = true,
                Message = message,
                Handover = handoverDto
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

            // Check if vehicle is pending - prevent editing
            // Allow editing if vehicle is rented AND we're setting status to "available" (returning vehicle)
            if (vehicle.Status?.ToLower() == "pending")
            {
                return new VehicleUpdateResponse 
                { 
                    Success = false, 
                    Message = "Cannot edit vehicle that is pending approval. Please approve or reject the vehicle first."
                };
            }
            
            // Allow update if vehicle is rented but we're changing status to available or awaiting_processing (return process)
            if (vehicle.Status?.ToLower() == "rented")
            {
                var requested = request.Status?.ToLower();
                var allowedDuringReturn = requested == "available" || requested == "awaiting_processing";
                if (!allowedDuringReturn)
                {
                    return new VehicleUpdateResponse 
                    { 
                        Success = false, 
                        Message = "Cannot edit vehicle that is currently rented. Please complete the return process first."
                    };
                }
            }

            // Guard: if FE requests 'available' but xe có biên bản trả có damages và chưa QC, buộc chuyển 'awaiting_processing'
            if ((request.Status?.ToLower() ?? "") == "available")
            {
                var hasPendingDamage = await _staffRepository.HasPendingDamageAsync(vehicleId);
                if (hasPendingDamage)
                {
                    request.Status = "awaiting_processing";
                }
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

    public async Task<List<StaffActivityLogDto>> GetTodayActivityLogsAsync(int staffId)
    {
        return await _staffRepository.GetTodayActivityLogsAsync(staffId);
    }

    public async Task<List<ReservationDto>> GetStationReservationsAsync(int staffId)
    {
        return await _staffRepository.GetStationReservationsAsync(staffId);
    }

    public async Task<List<StaffPaymentDto>> GetStationPaymentsAsync(int staffId)
    {
        return await _staffRepository.GetStationPaymentsAsync(staffId);
    }

    public async Task<IEnumerable<StaffDto>> GetAllStaffAsync()
    {
        var staff = await _staffRepository.GetAllStaffAsync();
        return staff.Select(MapToDto);
    }

    public async Task<StaffDetailDto?> GetStaffDetailAsync(int userId)
    {
        var staff = await _staffRepository.GetAllStaffAsync();
        var staffMember = staff.FirstOrDefault(s => ((dynamic)s).user_id == userId);
        if (staffMember == null) return null;

        var stats = await _staffRepository.GetStaffStatsAsync(userId);
        return MapToDetailDto(staffMember, stats);
    }

    private static StaffDto MapToDto(dynamic staff)
    {
        return new StaffDto
        {
            Id = staff.id,
            UserId = staff.user_id,
            Name = staff.name,
            Email = staff.email,
            Phone = staff.phone ?? "",
            Station = staff.station ?? "Unassigned",
            StationId = staff.station_id,
            Role = staff.role,
            Performance = staff.performance,
            Checkouts = staff.checkouts,
            IsActive = staff.is_active ?? true,
            CreatedAt = staff.created_at
        };
    }

    private static StaffDetailDto MapToDetailDto(dynamic staff, dynamic? stats)
    {
        var dto = new StaffDetailDto
        {
            Id = staff.id,
            UserId = staff.user_id,
            Name = staff.name,
            Email = staff.email,
            Phone = staff.phone ?? "",
            Station = staff.station ?? "Unassigned",
            StationId = staff.station_id,
            Role = staff.role,
            Checkouts = staff.checkouts,
            IsActive = staff.is_active ?? true,
            CreatedAt = staff.created_at,
            TotalHandovers = staff.total_handovers,
            ConfirmedReservations = staff.confirmed_reservations
        };

        if (stats != null)
        {
            dto.Performance = stats.performance;
            dto.Checkouts = stats.monthly_checkouts;
        }
        else
        {
            dto.Performance = staff.performance;
        }

        return dto;
    }

    public async Task<AdminCreateStaffResponse> CreateStaffAsync(AdminCreateStaffRequest request)
    {
        // Validate request
        if (string.IsNullOrWhiteSpace(request.FullName) || 
            string.IsNullOrWhiteSpace(request.Email) || 
            string.IsNullOrWhiteSpace(request.Phone) ||
            string.IsNullOrWhiteSpace(request.Password))
        {
            return new AdminCreateStaffResponse
            {
                Success = false,
                Message = "Full name, email, phone, and password are required"
            };
        }

        // Check if email already exists
        if (await _userRepository.EmailExistsAsync(request.Email))
        {
            return new AdminCreateStaffResponse
            {
                Success = false,
                Message = "Email already exists"
            };
        }

        // Hash password
        var passwordHash = HashPassword(request.Password);

        // Register staff
        var (success, userId) = await _userRepository.RegisterStaffAsync(
            request.FullName,
            request.Email,
            request.Phone,
            request.StationId,
            request.Role,
            passwordHash);

        if (!success || userId == 0)
        {
            return new AdminCreateStaffResponse
            {
                Success = false,
                Message = "Failed to create staff member"
            };
        }

        // Get created staff
        var staff = await _staffRepository.GetAllStaffAsync();
        var createdStaff = staff.FirstOrDefault(s => ((dynamic)s).user_id == userId);
        
        if (createdStaff == null)
        {
            return new AdminCreateStaffResponse
            {
                Success = false,
                Message = "Staff created but failed to retrieve details"
            };
        }

        return new AdminCreateStaffResponse
        {
            Success = true,
            Message = "Staff member created successfully",
            Staff = MapToDto(createdStaff)
        };
    }

    public async Task<AdminUpdateStaffResponse> UpdateStaffAsync(int userId, AdminUpdateStaffRequest request)
    {
        // Validate request
        if (request.FullName == null && 
            request.Phone == null && 
            !request.StationId.HasValue && 
            request.Role == null && 
            !request.IsActive.HasValue)
        {
            return new AdminUpdateStaffResponse
            {
                Success = false,
                Message = "No fields to update"
            };
        }

        // Update staff
        var updateRequest = new UpdateStaffRequest
        {
            FullName = request.FullName,
            Phone = request.Phone,
            StationId = request.StationId,
            Role = request.Role,
            IsActive = request.IsActive
        };

        var success = await _userRepository.UpdateStaffAsync(userId, updateRequest);

        if (!success)
        {
            return new AdminUpdateStaffResponse
            {
                Success = false,
                Message = "Failed to update staff member"
            };
        }

        // Get updated staff
        var staff = await _staffRepository.GetAllStaffAsync();
        var updatedStaff = staff.FirstOrDefault(s => ((dynamic)s).user_id == userId);
        
        if (updatedStaff == null)
        {
            return new AdminUpdateStaffResponse
            {
                Success = false,
                Message = "Staff updated but failed to retrieve details"
            };
        }

        return new AdminUpdateStaffResponse
        {
            Success = true,
            Message = "Staff member updated successfully",
            Staff = MapToDto(updatedStaff)
        };
    }

    private static string HashPassword(string password)
    {
        using var sha256 = System.Security.Cryptography.SHA256.Create();
        var hashedBytes = sha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(hashedBytes);
    }
}
