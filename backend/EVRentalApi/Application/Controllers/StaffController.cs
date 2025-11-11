using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using EVRentalApi.Application.Services;
using EVRentalApi.Models;
using Microsoft.Data.SqlClient;

namespace EVRentalApi.Application.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StaffController : ControllerBase
{
    private readonly IStaffService _staffService;
    private readonly Func<SqlConnection> _getConnection;

    public StaffController(IStaffService staffService, Func<SqlConnection> getConnection)
    {
        _staffService = staffService;
        _getConnection = getConnection;
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
    /// Submit post-return check (QC) for a vehicle, optionally set back to available
    /// </summary>
    [HttpPost("vehicles/{vehicleId}/post-return-check")]
    [RequestSizeLimit(20_000_000)]
    public async Task<IActionResult> SubmitPostReturnCheck(
        int vehicleId,
        List<IFormFile>? images,
        [FromForm] int? reservationId,
        [FromForm] string? notes,
        [FromForm] bool clearDamages = false
    )
    {
        try
        {
            var staffId = GetStaffIdFromToken();
            if (staffId == null)
            {
                return Unauthorized("Invalid staff token");
            }

            // Resolve reservationId by vehicle if missing (pick the most recent reservation)
            int? resolvedReservationId = reservationId;
            if (!resolvedReservationId.HasValue)
            {
                try
                {
                    await using var conn = _getConnection();
                    await conn.OpenAsync();
                    const string findResSql = @"
SELECT TOP 1 reservation_id
FROM dbo.reservations
WHERE vehicle_id = @VehicleId
ORDER BY ISNULL(end_time, created_at) DESC, created_at DESC";
                    await using var cmd = new SqlCommand(findResSql, conn);
                    cmd.Parameters.AddWithValue("@VehicleId", vehicleId);
                    var obj = await cmd.ExecuteScalarAsync();
                    if (obj != null && obj != DBNull.Value)
                    {
                        resolvedReservationId = (int)obj;
                    }
                }
                catch { /* best-effort */ }
            }

            // Save images (optional)
            var imageUrls = new List<string>();
            if (images != null && images.Count > 0)
            {
                var allowed = new[] { ".jpg", ".jpeg", ".png" };
                var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "inspections");
                if (!Directory.Exists(uploadsPath))
                {
                    Directory.CreateDirectory(uploadsPath);
                }
                foreach (var file in images)
                {
                    if (file == null || file.Length == 0) continue;
                    if (file.Length > 5 * 1024 * 1024) return BadRequest(new { message = $"File {file.FileName} exceeds 5MB." });
                    var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
                    if (!allowed.Contains(ext)) return BadRequest(new { message = $"Invalid file type for {file.FileName}. Only JPG/PNG allowed." });

                    var fileName = $"{Guid.NewGuid()}_{file.FileName}";
                    var filePath = Path.Combine(uploadsPath, fileName);
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }
                    imageUrls.Add($"/uploads/inspections/{fileName}");
                }
            }

            // Create a 'qc' handover record to log post-return check
            var qcRequest = new CreateHandoverRequest
            {
                ReservationId = resolvedReservationId,
                Type = "qc",
                ConditionNotes = string.IsNullOrWhiteSpace(notes) ? null : notes,
                ImageUrlList = imageUrls.Count > 0 ? imageUrls : null
            };

            // Reuse handover service via staff service wrapper call
            // We don't have direct access here; route through RecordHandoverAsync-like flow if needed
            // Simplest: call _staffService.RecordHandoverAsync with mapped request
            var mapped = new HandoverRequest
            {
                ReservationId = resolvedReservationId,
                Type = "qc",
                ConditionNotes = qcRequest.ConditionNotes,
                ImageUrlList = qcRequest.ImageUrlList
            };

            var createResult = await _staffService.RecordHandoverAsync(staffId.Value, mapped);
            if (!createResult.Success)
            {
                return BadRequest(new { message = $"Failed to save QC handover: {createResult.Message}" });
            }

            // Optionally set vehicle to available
            if (clearDamages)
                {
                    var update = await _staffService.UpdateVehicleByStaffAsync(staffId.Value, vehicleId, new UpdateVehicleRequest
                    {
                        Status = "available"
                    });
                if (!update.Success)
                {
                    // Not fatal to QC, but report back
                    return Ok(new { success = true, message = "QC saved. Failed to set vehicle available.", handover = createResult.Handover });
                }
            }

            return Ok(new { success = true, message = "Post-return check saved successfully.", handover = createResult.Handover });
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
    /// Get vehicles by status at staff's station
    /// </summary>
    [HttpGet("vehicles/status/{status}")]
    public async Task<IActionResult> GetVehiclesByStatus(string status)
    {
        try
        {
            var staffId = GetStaffIdFromToken();
            if (staffId == null)
            {
                return Unauthorized("Invalid staff token");
            }

            var vehicles = await _staffService.GetVehiclesByStatusAsync(staffId.Value, status);
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
    /// Confirm reservation and unlock vehicle
    /// </summary>
    [HttpPost("reservations/{reservationId}/confirm")]
    public async Task<IActionResult> ConfirmReservation(int reservationId)
    {
        try
        {
            var staffId = GetStaffIdFromToken();
            if (staffId == null)
            {
                return Unauthorized("Invalid staff token");
            }

            Console.WriteLine($"[ConfirmReservation] Staff {staffId} confirming reservation {reservationId}");

            var result = await _staffService.ConfirmReservationAsync(reservationId, staffId.Value);
            if (!result.Success)
            {
                return BadRequest(new { message = result.Message });
            }

            return Ok(new { message = "Reservation confirmed and vehicle unlocked successfully" });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ConfirmReservation] Error: {ex.Message}");
            return StatusCode(500, new { message = "Internal server error", error = ex.Message });
        }
    }

    /// <summary>
    /// Get all reservations for staff's station
    /// </summary>
    [HttpGet("reservations")]
    public async Task<IActionResult> GetStationReservations()
    {
        try
        {
            var staffId = GetStaffIdFromToken();
            if (staffId == null)
            {
                return Unauthorized("Invalid staff token");
            }

            var reservations = await _staffService.GetStationReservationsAsync(staffId.Value);
            return Ok(new { success = true, reservations = reservations });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[GetStationReservations] Error: {ex.Message}");
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
    /// Record vehicle handover with inspection images (multipart)
    /// </summary>
    [HttpPost("handovers-with-images")]
    [RequestSizeLimit(20_000_000)] // 20MB total
    public async Task<IActionResult> RecordHandoverWithImages(
        List<IFormFile> inspectionImages,
        [FromForm] int? rentalId,
        [FromForm] int? reservationId,
        [FromForm] string type,
        [FromForm] string? conditionNotes,
        [FromForm] string? returnTimeStatus,
        [FromForm] int? lateHours,
        [FromForm] int? batteryLevel,
        [FromForm] int? mileage,
        [FromForm] string? exteriorCondition,
        [FromForm] string? interiorCondition,
        [FromForm] string? tiresCondition,
        [FromForm] string? damagesCsv,
        [FromForm] decimal? lateFee,
        [FromForm] decimal? damageFee,
        [FromForm] decimal? totalDue,
        [FromForm] decimal? depositRefund
    )
    {
        try
        {
            var staffId = GetStaffIdFromToken();
            if (staffId == null)
            {
                return Unauthorized("Invalid staff token");
            }

            // Validate and save images if any
            var imageUrlList = new List<string>();
            if (inspectionImages != null && inspectionImages.Count > 0)
            {
                var allowed = new[] { ".jpg", ".jpeg", ".png" };
                var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "inspections");
                if (!Directory.Exists(uploadsPath))
                {
                    Directory.CreateDirectory(uploadsPath);
                }

                foreach (var file in inspectionImages)
                {
                    if (file == null || file.Length == 0) continue;
                    if (file.Length > 5 * 1024 * 1024) return BadRequest(new { message = $"File {file.FileName} exceeds 5MB." });
                    var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
                    if (!allowed.Contains(ext)) return BadRequest(new { message = $"Invalid file type for {file.FileName}. Only JPG/PNG allowed." });

                    var fileName = $"{Guid.NewGuid()}_{file.FileName}";
                    var filePath = Path.Combine(uploadsPath, fileName);
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }
                    imageUrlList.Add($"/uploads/inspections/{fileName}");
                }
            }

            // Parse damages if provided as CSV from form
            List<string>? damagesList = null;
            if (!string.IsNullOrWhiteSpace(damagesCsv))
            {
                damagesList = damagesCsv
                    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                    .ToList();
            }

            var request = new HandoverRequest
            {
                RentalId = rentalId,
                ReservationId = reservationId,
                Type = string.IsNullOrWhiteSpace(type) ? "return" : type,
                ConditionNotes = conditionNotes,
                ImageUrlList = imageUrlList.Count > 0 ? imageUrlList : null,
                ReturnTimeStatus = returnTimeStatus,
                LateHours = lateHours,
                BatteryLevel = batteryLevel,
                Mileage = mileage,
                ExteriorCondition = exteriorCondition,
                InteriorCondition = interiorCondition,
                TiresCondition = tiresCondition,
                DamagesList = damagesList,
                LateFee = lateFee,
                DamageFee = damageFee,
                TotalDue = totalDue,
                DepositRefund = depositRefund
            };

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
    /// Get today's activity logs
    /// </summary>
    [HttpGet("activities/today")]
    public async Task<IActionResult> GetTodayActivityLogs()
    {
        try
        {
            var staffId = GetStaffIdFromToken();
            if (staffId == null)
            {
                return Unauthorized("Invalid staff token");
            }

            var activities = await _staffService.GetTodayActivityLogsAsync(staffId.Value);
            return Ok(activities);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Internal server error", error = ex.Message });
        }
    }

    /// <summary>
    /// Get payment history for staff's station
    /// </summary>
    [HttpGet("payments")]
    public async Task<IActionResult> GetStationPayments()
    {
        try
        {
            var staffId = GetStaffIdFromToken();
            if (staffId == null)
            {
                return Unauthorized("Invalid staff token");
            }

            var payments = await _staffService.GetStationPaymentsAsync(staffId.Value);
            return Ok(new { success = true, payments = payments });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[GetStationPayments] Error: {ex.Message}");
            return StatusCode(500, new { message = "Internal server error", error = ex.Message });
        }
    }

    /// <summary>
    /// Helper method to get staff ID from JWT token
    /// </summary>
    private int? GetStaffIdFromToken()
    {
        // Get user ID from JWT token
        var userIdClaim = HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
        {
            return null;
        }

        if (!int.TryParse(userIdClaim.Value, out int userId))
        {
            return null;
        }

        return userId;
    }
}
