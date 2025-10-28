using Microsoft.AspNetCore.Mvc;
using EVRentalApi.Application.Services;
using EVRentalApi.Models;

namespace EVRentalApi.Application.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VehiclesController : ControllerBase
    {
        private readonly IVehicleService _vehicleService;

        public VehiclesController(IVehicleService vehicleService)
        {
            _vehicleService = vehicleService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<VehicleDto>>> GetVehicles()
        {
            try
            {
                var vehicles = await _vehicleService.GetAllVehiclesAsync();
                return Ok(vehicles);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving vehicles", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<VehicleDto>> GetVehicle(int id)
        {
            try
            {
                var vehicle = await _vehicleService.GetVehicleByIdAsync(id);
                if (vehicle == null)
                {
                    return NotFound(new { message = "Vehicle not found" });
                }
                return Ok(vehicle);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving vehicle", error = ex.Message });
            }
        }

        [HttpGet("available")]
        public async Task<ActionResult<IEnumerable<VehicleDto>>> GetAvailableVehicles()
        {
            try
            {
                var vehicles = await _vehicleService.GetAvailableVehiclesAsync();
                return Ok(vehicles);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving available vehicles", error = ex.Message });
            }
        }

        [HttpGet("model/{modelId}")]
        public async Task<ActionResult<IEnumerable<VehicleDto>>> GetVehiclesByModel(string modelId)
        {
            try
            {
                var vehicles = await _vehicleService.GetVehiclesByModelIdAsync(modelId);
                return Ok(vehicles);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving vehicles by model", error = ex.Message });
            }
        }

        [HttpGet("station/{stationId}")]
        public async Task<ActionResult<IEnumerable<VehicleDto>>> GetVehiclesByStation(int stationId)
        {
            try
            {
                var vehicles = await _vehicleService.GetVehiclesByStationIdAsync(stationId);
                return Ok(vehicles);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving vehicles by station", error = ex.Message });
            }
        }

        [HttpGet("unassigned")]
        public async Task<ActionResult<IEnumerable<VehicleDto>>> GetUnassignedVehicles()
        {
            try
            {
                var vehicles = await _vehicleService.GetUnassignedVehiclesAsync();
                return Ok(vehicles);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving unassigned vehicles", error = ex.Message });
            }
        }

        [HttpPost("assign-to-station")]
        public async Task<ActionResult> AssignVehicleToStation([FromBody] AssignVehicleToStationRequest request)
        {
            try
            {
                var success = await _vehicleService.AssignVehicleToStationAsync(
                    request.VehicleId, 
                    request.StationId, 
                    request.Location
                );
                
                if (success)
                {
                    return Ok(new { message = "Vehicle assigned to station successfully" });
                }
                else
                {
                    return BadRequest(new { message = "Failed to assign vehicle to station" });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error assigning vehicle to station", error = ex.Message });
            }
        }
    }
}

