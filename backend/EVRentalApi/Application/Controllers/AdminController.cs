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

        public AdminController(IVehicleService vehicleService)
        {
            _vehicleService = vehicleService;
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
                    return BadRequest(new { message = result.Message });
                }

                return Ok(new { message = "Vehicle created successfully", vehicle = result.Vehicle });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }
    }
}
