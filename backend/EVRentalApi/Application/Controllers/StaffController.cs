using Microsoft.AspNetCore.Mvc;
using EVRentalApi.Application.Services;
using EVRentalApi.Models;

namespace EVRentalApi.Application.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StaffController : ControllerBase
{
    private readonly IStaffService _staffService;

    public StaffController(IStaffService staffService)
    {
        _staffService = staffService;
    }

    /// <summary>
    /// Get staff profile information
    /// </summary>
    [HttpGet("profile")]
    public async Task<IActionResult> GetStaffProfile()
    {
        try
        {
            // Get staff ID from JWT token (you'll need to implement this)
            var staffId = GetStaffIdFromToken();
            if (staffId == null)
            {
                return Unauthorized("Invalid staff token");
            }

            var staff = await _staffService.GetStaffProfileAsync(staffId.Value);
            if (staff == null)
            {
                return NotFound("Staff not found");
            }

            return Ok(staff);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Internal server error", error = ex.Message });
        }
    }

    /// <summary>
    /// Get vehicles at staff's station
    /// </summary>
    [HttpGet("vehicles")]
    public async Task<IActionResult> GetStationVehicles()
    {
        try
        {
            var staffId = GetStaffIdFromToken();
            if (staffId == null)
            {
                return Unauthorized("Invalid staff token");
            }

            var vehicles = await _staffService.GetStationVehiclesAsync(staffId.Value);
            return Ok(vehicles);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Internal server error", error = ex.Message });
        }
    }

    /// <summary>
    /// Get specific vehicle details
    /// </summary>
    [HttpGet("vehicles/{vehicleId}")]
    public async Task<IActionResult> GetVehicle(int vehicleId)
    {
        try
        {
            var staffId = GetStaffIdFromToken();
            if (staffId == null)
            {
                return Unauthorized("Invalid staff token");
            }

            var vehicle = await _staffService.GetVehicleAsync(vehicleId, staffId.Value);
            if (vehicle == null)
            {
                return NotFound("Vehicle not found or not accessible");
            }

            return Ok(vehicle);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Internal server error", error = ex.Message });
        }
    }

    /// <summary>
    /// Update vehicle information
    /// </summary>
    [HttpPut("vehicles/{vehicleId}")]
    public async Task<IActionResult> UpdateVehicle(int vehicleId, [FromBody] UpdateVehicleRequest request)
    {
        try
        {
            var staffId = GetStaffIdFromToken();
            if (staffId == null)
            {
                return Unauthorized("Invalid staff token");
            }

            var result = await _staffService.UpdateVehicleByStaffAsync(staffId.Value, vehicleId, request);
            if (!result.Success)
            {
                return BadRequest(new { message = result.Message });
            }

            return Ok(new { message = "Vehicle updated successfully", vehicle = result.Vehicle });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Internal server error", error = ex.Message });
        }
    }

    /// <summary>
    /// Add new vehicle to station
    /// </summary>
    [HttpPost("vehicles")]
    public async Task<IActionResult> AddVehicle([FromBody] AddVehicleRequest request)
    {
        try
        {
            var staffId = GetStaffIdFromToken();
            if (staffId == null)
            {
                return Unauthorized("Invalid staff token");
            }

            var result = await _staffService.AddVehicleAsync(staffId.Value, request);
            if (!result.Success)
            {
                return BadRequest(new { message = result.Message });
            }

            return Ok(new { message = "Vehicle added successfully", vehicle = result.Vehicle });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Internal server error", error = ex.Message });
        }
    }

    /// <summary>
    /// Record maintenance for vehicle
    /// </summary>
    [HttpPost("vehicles/{vehicleId}/maintenance")]
    public async Task<IActionResult> RecordMaintenance(int vehicleId, [FromBody] MaintenanceRecordRequest request)
    {
        try
        {
            var staffId = GetStaffIdFromToken();
            if (staffId == null)
            {
                return Unauthorized("Invalid staff token");
            }

            var result = await _staffService.RecordMaintenanceAsync(vehicleId, staffId.Value, request);
            if (!result.Success)
            {
                return BadRequest(new { message = result.Message });
            }

            return Ok(new { message = "Maintenance recorded successfully", record = result.Record });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Internal server error", error = ex.Message });
        }
    }

    /// <summary>
    /// Get maintenance records for station vehicles
    /// </summary>
    [HttpGet("maintenance")]
    public async Task<IActionResult> GetMaintenanceRecords()
    {
        try
        {
            var staffId = GetStaffIdFromToken();
            if (staffId == null)
            {
                return Unauthorized("Invalid staff token");
            }

            var records = await _staffService.GetMaintenanceRecordsAsync(staffId.Value);
            return Ok(records);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Internal server error", error = ex.Message });
        }
    }

    /// <summary>
    /// Get station information
    /// </summary>
    [HttpGet("station")]
    public async Task<IActionResult> GetStationInfo()
    {
        try
        {
            var staffId = GetStaffIdFromToken();
            if (staffId == null)
            {
                return Unauthorized("Invalid staff token");
            }

            var station = await _staffService.GetStationInfoAsync(staffId.Value);
            if (station == null)
            {
                return NotFound("Station not found");
            }

            return Ok(station);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Internal server error", error = ex.Message });
        }
    }

    /// <summary>
    /// Get customers for verification
    /// </summary>
    [HttpGet("customers")]
    public async Task<IActionResult> GetCustomersForVerification()
    {
        try
        {
            var staffId = GetStaffIdFromToken();
            if (staffId == null)
            {
                return Unauthorized("Invalid staff token");
            }

            var customers = await _staffService.GetCustomersForVerificationAsync(staffId.Value);
            return Ok(customers);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Internal server error", error = ex.Message });
        }
    }

    /// <summary>
    /// Verify customer documents
    /// </summary>
    [HttpPost("customers/{customerId}/verify")]
    public async Task<IActionResult> VerifyCustomer(int customerId, [FromBody] CustomerVerificationRequest request)
    {
        try
        {
            var staffId = GetStaffIdFromToken();
            if (staffId == null)
            {
                return Unauthorized("Invalid staff token");
            }

            var result = await _staffService.VerifyCustomerAsync(customerId, staffId.Value, request);
            if (!result.Success)
            {
                return BadRequest(new { message = result.Message });
            }

            return Ok(new { message = "Customer verified successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Internal server error", error = ex.Message });
        }
    }

    /// <summary>
    /// Get handover records
    /// </summary>
    [HttpGet("handovers")]
    public async Task<IActionResult> GetHandovers()
    {
        try
        {
            var staffId = GetStaffIdFromToken();
            if (staffId == null)
            {
                return Unauthorized("Invalid staff token");
            }

            var handovers = await _staffService.GetHandoversAsync(staffId.Value);
            return Ok(handovers);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Internal server error", error = ex.Message });
        }
    }

    /// <summary>
    /// Record vehicle handover
    /// </summary>
    [HttpPost("handovers")]
    public async Task<IActionResult> RecordHandover([FromBody] HandoverRequest request)
    {
        try
        {
            var staffId = GetStaffIdFromToken();
            if (staffId == null)
            {
                return Unauthorized("Invalid staff token");
            }

            var result = await _staffService.RecordHandoverAsync(staffId.Value, request);
            if (!result.Success)
            {
                return BadRequest(new { message = result.Message });
            }

            return Ok(new { message = "Handover recorded successfully", handover = result.Handover });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Internal server error", error = ex.Message });
        }
    }

    /// <summary>
    /// Helper method to get staff ID from JWT token
    /// </summary>
    private int? GetStaffIdFromToken()
    {
        // This is a placeholder - you'll need to implement JWT token parsing
        // For now, return a hardcoded staff ID for testing
        return 2; // staff@ev.local user_id
    }
}
