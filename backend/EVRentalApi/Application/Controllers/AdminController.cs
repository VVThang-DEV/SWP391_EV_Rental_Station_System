using Microsoft.AspNetCore.Mvc;
using EVRentalApi.Application.Services;
using EVRentalApi.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace EVRentalApi.Application.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize]
    public class AdminController : ControllerBase
    {
        private readonly IVehicleService _vehicleService;
        private readonly IStaffService _staffService;

        public AdminController(IVehicleService vehicleService, IStaffService staffService)
        {
            _vehicleService = vehicleService;
            _staffService = staffService;
        }

        /// <summary>
        /// Create new vehicle without assigning to station (Admin only)
        /// </summary>
        [HttpPost("vehicles")]
        public async Task<IActionResult> CreateVehicle([FromBody] AdminCreateVehicleRequest request)
        {
            try
            {
                // Check if user is admin
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                if (userRole != "admin")
                {
                    return Forbid("Only admin can create vehicles");
                }

                var result = await _vehicleService.CreateVehicleAsync(request);
                if (!result.Success)
                {
                    return BadRequest(new { 
                        success = false,
                        message = result.Message,
                        error = result.Message
                    });
                }

                return Ok(new { 
                    success = true,
                    message = "Vehicle created successfully", 
                    vehicle = result.Vehicle 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        /// <summary>
        /// Get all staff members (Admin only)
        /// </summary>
        [HttpGet("staff")]
        public async Task<IActionResult> GetAllStaff()
        {
            try
            {
                // Check if user is admin
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                if (userRole != "admin")
                {
                    return Forbid("Only admin can view staff");
                }

                var staff = await _staffService.GetAllStaffAsync();
                return Ok(new { success = true, staff = staff });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving staff", error = ex.Message });
            }
        }

        /// <summary>
        /// Get staff by ID (Admin only)
        /// </summary>
        [HttpGet("staff/{userId}")]
        public async Task<IActionResult> GetStaffById(int userId)
        {
            try
            {
                // Check if user is admin
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                if (userRole != "admin")
                {
                    return Forbid("Only admin can view staff details");
                }

                var staff = await _staffService.GetStaffDetailAsync(userId);
                if (staff == null)
                {
                    return NotFound(new { message = "Staff not found" });
                }

                return Ok(new { success = true, staff = staff });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving staff", error = ex.Message });
            }
        }

        /// <summary>
        /// Create new staff member (Admin only)
        /// </summary>
        [HttpPost("staff")]
        public async Task<IActionResult> CreateStaff([FromBody] AdminCreateStaffRequest request)
        {
            try
            {
                // Check if user is admin
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                if (userRole != "admin")
                {
                    return Forbid("Only admin can create staff");
                }

                var result = await _staffService.CreateStaffAsync(request);
                if (!result.Success)
                {
                    return BadRequest(new { 
                        success = false,
                        message = result.Message,
                        error = result.Message
                    });
                }

                return Ok(new { 
                    success = true,
                    message = result.Message,
                    staff = result.Staff
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating staff", error = ex.Message });
            }
        }

        /// <summary>
        /// Update staff member (Admin only)
        /// </summary>
        [HttpPut("staff/{userId}")]
        public async Task<IActionResult> UpdateStaff(int userId, [FromBody] AdminUpdateStaffRequest request)
        {
            try
            {
                // Check if user is admin
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                if (userRole != "admin")
                {
                    return Forbid("Only admin can update staff");
                }

                var result = await _staffService.UpdateStaffAsync(userId, request);
                if (!result.Success)
                {
                    return BadRequest(new { 
                        success = false,
                        message = result.Message,
                        error = result.Message
                    });
                }

                return Ok(new { 
                    success = true,
                    message = result.Message,
                    staff = result.Staff
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating staff", error = ex.Message });
            }
        }
    }
}
