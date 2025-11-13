using EVRentalApi.Models;
using EVRentalApi.Infrastructure.Repositories;
using Microsoft.Data.SqlClient;

namespace EVRentalApi.Application.Services
{
    public class VehicleService : IVehicleService
    {
        private readonly IVehicleRepository _vehicleRepository;

        public VehicleService(IVehicleRepository vehicleRepository)
        {
            _vehicleRepository = vehicleRepository;
        }

        public async Task<IEnumerable<VehicleDto>> GetAllVehiclesAsync()
        {
            var vehicles = await _vehicleRepository.GetAllVehiclesAsync();
            return vehicles.Select(MapToDto);
        }

        public async Task<VehicleDto?> GetVehicleByIdAsync(int id)
        {
            var vehicle = await _vehicleRepository.GetVehicleByIdAsync(id);
            return vehicle != null ? MapToDto(vehicle) : null;
        }

        public async Task<IEnumerable<VehicleDto>> GetAvailableVehiclesAsync()
        {
            var vehicles = await _vehicleRepository.GetAvailableVehiclesAsync();
            return vehicles.Select(MapToDto);
        }

        public async Task<IEnumerable<VehicleDto>> GetVehiclesByModelIdAsync(string modelId)
        {
            var vehicles = await _vehicleRepository.GetVehiclesByModelIdAsync(modelId);
            return vehicles.Select(MapToDto);
        }

        public async Task<IEnumerable<VehicleDto>> GetVehiclesByStationIdAsync(int stationId)
        {
            var vehicles = await _vehicleRepository.GetVehiclesByStationIdAsync(stationId);
            return vehicles.Select(MapToDto);
        }

        public async Task<IEnumerable<VehicleDto>> GetUnassignedVehiclesAsync()
        {
            var vehicles = await _vehicleRepository.GetUnassignedVehiclesAsync();
            return vehicles.Select(MapToDto);
        }

        public async Task<bool> AssignVehicleToStationAsync(int vehicleId, int stationId, string location)
        {
            return await _vehicleRepository.AssignVehicleToStationAsync(vehicleId, stationId, location);
        }

        public async Task<AdminCreateVehicleResponse> CreateVehicleAsync(AdminCreateVehicleRequest request)
        {
            try
            {
                // Validate required fields
                if (string.IsNullOrWhiteSpace(request.ModelId))
                {
                    return new AdminCreateVehicleResponse
                    {
                        Success = false,
                        Message = "Model ID is required. Please select a vehicle model."
                    };
                }

                // Validate License Plate - check for duplicates
                if (!string.IsNullOrWhiteSpace(request.LicensePlate))
                {
                    var isDuplicateLicensePlate = await _vehicleRepository.CheckDuplicateLicensePlateAsync(request.LicensePlate);
                    if (isDuplicateLicensePlate)
                    {
                        return new AdminCreateVehicleResponse
                        {
                            Success = false,
                            Message = $"License Plate Number '{request.LicensePlate}' already exists. Please use a different license plate."
                        };
                    }
                }
                else
                {
                    // License Plate is required
                    return new AdminCreateVehicleResponse
                    {
                        Success = false,
                        Message = "License Plate Number is required. Please enter a license plate number."
                    };
                }

                // Validate VIN (Unique Vehicle ID) - check for duplicates
                if (!string.IsNullOrWhiteSpace(request.UniqueVehicleId))
                {
                    var isDuplicateVIN = await _vehicleRepository.CheckDuplicateVINAsync(request.UniqueVehicleId);
                    if (isDuplicateVIN)
                    {
                        return new AdminCreateVehicleResponse
                        {
                            Success = false,
                            Message = $"VIN (Vehicle Identification Number) '{request.UniqueVehicleId}' already exists. Please use a different VIN."
                        };
                    }
                }
                else
                {
                    // VIN is required
                    return new AdminCreateVehicleResponse
                    {
                        Success = false,
                        Message = "VIN (Vehicle Identification Number) is required. Please enter a VIN."
                    };
                }

                var newVehicle = await _vehicleRepository.CreateVehicleAsync(request);
                if (newVehicle == null)
                {
                    return new AdminCreateVehicleResponse
                    {
                        Success = false,
                        Message = $"Failed to create vehicle. The vehicle model '{request.ModelId}' may not exist in the system. Please check the model ID and try again."
                    };
                }

                return new AdminCreateVehicleResponse
                {
                    Success = true,
                    Message = "Vehicle created successfully",
                    Vehicle = MapToDto(newVehicle)
                };
            }
            catch (InvalidOperationException invalidOpEx)
            {
                // Handle validation errors from repository
                return new AdminCreateVehicleResponse
                {
                    Success = false,
                    Message = invalidOpEx.Message
                };
            }
            catch (SqlException sqlEx)
            {
                // Handle SQL-specific errors
                string errorMessage = "An error occurred while creating the vehicle.";
                
                if (sqlEx.Number == 2627 || sqlEx.Number == 2601) // Unique constraint violation
                {
                    if (sqlEx.Message.Contains("license_plate"))
                    {
                        errorMessage = $"License Plate Number already exists. Please use a different license plate.";
                    }
                    else if (sqlEx.Message.Contains("unique_vehicle_id"))
                    {
                        errorMessage = $"VIN (Vehicle Identification Number) already exists. Please use a different VIN.";
                    }
                    else
                    {
                        errorMessage = "A duplicate entry was detected. Please check License Plate and VIN are unique.";
                    }
                }
                else if (sqlEx.Number == 547) // Foreign key constraint violation
                {
                    errorMessage = $"The vehicle model '{request.ModelId}' does not exist. Please select a valid model.";
                }
                else
                {
                    errorMessage = $"Database error: {sqlEx.Message}";
                }

                return new AdminCreateVehicleResponse
                {
                    Success = false,
                    Message = errorMessage
                };
            }
            catch (Exception ex)
            {
                return new AdminCreateVehicleResponse
                {
                    Success = false,
                    Message = $"Error creating vehicle: {ex.Message}"
                };
            }
        }

        private static VehicleDto MapToDto(dynamic vehicle)
        {
            return new VehicleDto
            {
                VehicleId = vehicle.vehicle_id,
                ModelId = vehicle.model_id,
                StationId = vehicle.station_id,
                UniqueVehicleId = vehicle.unique_vehicle_id,
                BatteryLevel = vehicle.battery_level,
                MaxRangeKm = vehicle.max_range_km,
                Status = vehicle.status,
                PricePerHour = vehicle.price_per_hour,
                PricePerDay = vehicle.price_per_day,
                Rating = vehicle.rating,
                ReviewCount = vehicle.review_count,
                Trips = vehicle.trips,
                Mileage = vehicle.mileage,
                LastMaintenance = vehicle.last_maintenance,
                InspectionDate = vehicle.inspection_date,
                InsuranceExpiry = vehicle.insurance_expiry,
                Condition = vehicle.condition,
                Image = vehicle.image,
                LicensePlate = vehicle.license_plate,
                FuelEfficiency = vehicle.fuel_efficiency,
                Location = vehicle.location,
                CreatedAt = vehicle.created_at,
                UpdatedAt = vehicle.updated_at
            };
        }
    }
}
