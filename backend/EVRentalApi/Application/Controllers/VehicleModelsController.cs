using Microsoft.AspNetCore.Mvc;
using EVRentalApi.Application.Services;
using EVRentalApi.Models;

namespace EVRentalApi.Application.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VehicleModelsController : ControllerBase
    {
        private readonly IVehicleModelService _vehicleModelService;

        public VehicleModelsController(IVehicleModelService vehicleModelService)
        {
            _vehicleModelService = vehicleModelService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<VehicleModelDto>>> GetVehicleModels()
        {
            try
            {
                var models = await _vehicleModelService.GetAllVehicleModelsAsync();
                return Ok(models);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving vehicle models", error = ex.Message });
            }
        }

        [HttpGet("{modelId}")]
        public async Task<ActionResult<VehicleModelDto>> GetVehicleModel(string modelId)
        {
            try
            {
                var model = await _vehicleModelService.GetVehicleModelByIdAsync(modelId);
                if (model == null)
                {
                    return NotFound(new { message = "Vehicle model not found" });
                }
                return Ok(model);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving vehicle model", error = ex.Message });
            }
        }

        [HttpGet("{modelId}/vehicles")]
        public async Task<ActionResult<IEnumerable<VehicleDto>>> GetVehiclesByModel(string modelId)
        {
            try
            {
                var vehicles = await _vehicleModelService.GetVehiclesByModelIdAsync(modelId);
                return Ok(vehicles);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving vehicles by model", error = ex.Message });
            }
        }
    }
}

