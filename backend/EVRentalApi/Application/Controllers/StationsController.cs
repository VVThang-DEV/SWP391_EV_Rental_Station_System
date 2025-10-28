using Microsoft.AspNetCore.Mvc;
using EVRentalApi.Application.Services;
using EVRentalApi.Models;

namespace EVRentalApi.Application.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StationsController : ControllerBase
    {
        private readonly IStationService _stationService;

        public StationsController(IStationService stationService)
        {
            _stationService = stationService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<StationDto>>> GetStations()
        {
            try
            {
                var stations = await _stationService.GetAllStationsAsync();
                return Ok(stations);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving stations", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<StationDto>> GetStation(int id)
        {
            try
            {
                var station = await _stationService.GetStationByIdAsync(id);
                if (station == null)
                {
                    return NotFound(new { message = "Station not found" });
                }
                return Ok(station);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving station", error = ex.Message });
            }
        }

        [HttpGet("{id}/vehicles")]
        public async Task<ActionResult<IEnumerable<VehicleDto>>> GetStationVehicles(int id)
        {
            try
            {
                var vehicles = await _stationService.GetVehiclesByStationIdAsync(id);
                return Ok(vehicles);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving station vehicles", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<StationDto>> UpdateStation(int id, [FromBody] StationUpdateRequest request)
        {
            try
            {
                var updatedStation = await _stationService.UpdateStationAsync(id, request);
                if (updatedStation == null)
                {
                    return NotFound(new { message = "Station not found" });
                }
                return Ok(updatedStation);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating station", error = ex.Message });
            }
        }

        [HttpPut("{id}/update-available-vehicles")]
        public async Task<ActionResult<StationDto>> UpdateAvailableVehicles(int id)
        {
            try
            {
                var updatedStation = await _stationService.UpdateAvailableVehiclesAsync(id);
                if (updatedStation == null)
                {
                    return NotFound(new { message = "Station not found" });
                }
                return Ok(updatedStation);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating available vehicles", error = ex.Message });
            }
        }
    }
}

