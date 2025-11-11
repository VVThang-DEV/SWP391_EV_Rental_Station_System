using Microsoft.AspNetCore.Mvc;
using EVRentalApi.Application.Services;
using EVRentalApi.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using EVRentalApi.Application.Services;

namespace EVRentalApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DocumentsController : ControllerBase
    {
        private readonly PersonalInfoService _personalInfoService;
        private readonly ILogger<DocumentsController> _logger;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;
        private readonly Func<SqlConnection> _getConnection;
        private readonly IHandoverService _handoverService;

        public DocumentsController(
            PersonalInfoService personalInfoService, 
            ILogger<DocumentsController> logger,
            IEmailService emailService,
            IConfiguration configuration,
            Func<SqlConnection> getConnection,
            IHandoverService handoverService)
        {
            _personalInfoService = personalInfoService;
            _logger = logger;
            _emailService = emailService;
            _configuration = configuration;
            _getConnection = getConnection;
            _handoverService = handoverService;
        }

        [HttpPost("upload-avatar")]
        public async Task<IActionResult> UploadAvatar([FromBody] UpdatePersonalInfoRequest request)
        {
            var response = await _personalInfoService.UpdatePersonalInfoAsync(request);
            if (response.Success)
                return Ok(response);
            return BadRequest(response);
        }

        [HttpPost("upload-document")]
        public async Task<IActionResult> UploadDocument(IFormFile file, [FromForm] string email, [FromForm] string documentType)
        {
            _logger.LogInformation("Received document upload request for email: {Email}, documentType: {DocumentType}", email, documentType);
            
            try
            {
                if (file == null || file.Length == 0)
                {
                    _logger.LogWarning("No file received or file is empty");
                    return BadRequest(new { success = false, message = "No file uploaded" });
                }

                if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(documentType))
                {
                    _logger.LogWarning("Email or document type is missing. Email: {Email}, DocumentType: {DocumentType}", email, documentType);
                    return BadRequest(new { success = false, message = "Email and document type are required" });
                }

                // Validate file size (5MB max)
                if (file.Length > 5 * 1024 * 1024)
                {
                    return BadRequest(new { success = false, message = "File size too large. Maximum 5MB allowed." });
                }

                // Validate file type
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".pdf" };
                var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (!allowedExtensions.Contains(fileExtension))
                {
                    return BadRequest(new { success = false, message = "Invalid file type. Only JPG, PNG, and PDF are allowed." });
                }

                // Create uploads directory if it doesn't exist
                var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "documents");
                if (!Directory.Exists(uploadsPath))
                {
                    Directory.CreateDirectory(uploadsPath);
                }

                // Generate unique filename
                var fileName = $"{Guid.NewGuid()}_{file.FileName}";
                var filePath = Path.Combine(uploadsPath, fileName);

                // Save file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Generate file URL
                var fileUrl = $"/uploads/documents/{fileName}";

                // Save to database
                var request = new UpdatePersonalInfoRequest(
                    Email: email,
                    Cccd: null,
                    LicenseNumber: null,
                    Address: null,
                    Gender: null,
                    DateOfBirth: null,
                    Phone: null,
                    AvatarUrl: null,
                    DocumentUrl: fileUrl,
                    DocumentType: documentType
                );

                _logger.LogInformation("Saving document to database. FileUrl: {FileUrl}, Email: {Email}", fileUrl, email);
                
                var response = await _personalInfoService.UpdateDocumentAsync(request);
                if (response.Success)
                {
                    _logger.LogInformation("Document saved successfully to database");
                    return Ok(new { 
                        success = true, 
                        message = "Document uploaded successfully",
                        fileUrl = fileUrl,
                        documentType = documentType
                    });
                }

                _logger.LogError("Failed to save document to database: {Message}", response.Message);
                return BadRequest(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading file for email: {Email}, documentType: {DocumentType}", email, documentType);
                return StatusCode(500, new { success = false, message = $"Error uploading file: {ex.Message}" });
            }
        }

        [HttpPost("upload-incident-photo")]
        [Microsoft.AspNetCore.Authorization.Authorize]
        public async Task<IActionResult> UploadIncidentPhoto(IFormFile file)
        {
            _logger.LogInformation("Received incident photo upload request");
            
            try
            {
                if (file == null || file.Length == 0)
                {
                    _logger.LogWarning("No file received or file is empty");
                    return BadRequest(new { success = false, message = "No file uploaded" });
                }

                // Validate file size (5MB max)
                if (file.Length > 5 * 1024 * 1024)
                {
                    return BadRequest(new { success = false, message = "File size too large. Maximum 5MB allowed." });
                }

                // Validate file type - only images
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
                var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (!allowedExtensions.Contains(fileExtension))
                {
                    return BadRequest(new { success = false, message = "Invalid file type. Only JPG and PNG images are allowed." });
                }

                // Create uploads directory if it doesn't exist
                var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "incidents");
                if (!Directory.Exists(uploadsPath))
                {
                    Directory.CreateDirectory(uploadsPath);
                }

                // Generate unique filename
                var fileName = $"{Guid.NewGuid()}_{file.FileName}";
                var filePath = Path.Combine(uploadsPath, fileName);

                // Save file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Generate file URL
                var fileUrl = $"/uploads/incidents/{fileName}";

                _logger.LogInformation("Incident photo saved successfully. FileUrl: {FileUrl}", fileUrl);
                
                return Ok(new { 
                    success = true, 
                    message = "Incident photo uploaded successfully",
                    fileUrl = fileUrl
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading incident photo");
                return StatusCode(500, new { success = false, message = $"Error uploading file: {ex.Message}" });
            }
        }

        [HttpPost("upload-inspection-images")]
        [Microsoft.AspNetCore.Authorization.Authorize]
        public async Task<IActionResult> UploadInspectionImages(List<IFormFile> files, [FromForm] string customerEmail, [FromForm] string? reservationId = null, [FromForm] string? vehicleId = null, [FromForm] string? inspectionNotes = null)
        {
            _logger.LogInformation("Received inspection images upload request for customer: {Email}", customerEmail);
            
            try
            {
                if (files == null || files.Count == 0)
                {
                    return BadRequest(new { success = false, message = "No files uploaded" });
                }

                if (string.IsNullOrEmpty(customerEmail))
                {
                    return BadRequest(new { success = false, message = "Customer email is required" });
                }

                // Validate files
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
                var uploadedFiles = new List<string>();

                foreach (var file in files)
                {
                    if (file.Length == 0) continue;

                    // Validate file size (5MB max per file)
                    if (file.Length > 5 * 1024 * 1024)
                    {
                        return BadRequest(new { success = false, message = $"File {file.FileName} is too large. Maximum 5MB per file." });
                    }

                    // Validate file type
                    var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
                    if (!allowedExtensions.Contains(fileExtension))
                    {
                        return BadRequest(new { success = false, message = $"Invalid file type for {file.FileName}. Only JPG and PNG images are allowed." });
                    }
                }

                // Create uploads directory if it doesn't exist
                var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "inspections");
                if (!Directory.Exists(uploadsPath))
                {
                    Directory.CreateDirectory(uploadsPath);
                }

                // Save all files
                var savedFiles = new List<(string FilePath, string FileName, string ContentType)>();
                var savedFileUrls = new List<string>();
                foreach (var file in files)
                {
                    if (file.Length == 0) continue;

                    var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
                    var fileName = $"{Guid.NewGuid()}_{file.FileName}";
                    var filePath = Path.Combine(uploadsPath, fileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }

                    var contentType = fileExtension == ".png" ? "image/png" : "image/jpeg";
                    savedFiles.Add((filePath, file.FileName, contentType));
                    uploadedFiles.Add(fileName);
                    savedFileUrls.Add($"/uploads/inspections/{fileName}");
                }

                // Persist images to handover record if reservationId is provided
                int? parsedReservationId = null;
                if (!string.IsNullOrWhiteSpace(reservationId) && int.TryParse(reservationId, out var resId))
                {
                    parsedReservationId = resId;
                }

                var staffId = GetUserIdFromToken();
                if (parsedReservationId.HasValue && staffId.HasValue)
                {
                    var createReq = new CreateHandoverRequest
                    {
                        ReservationId = parsedReservationId.Value,
                        Type = "return",
                        ConditionNotes = string.IsNullOrWhiteSpace(inspectionNotes) ? null : inspectionNotes,
                        ImageUrlList = savedFileUrls
                    };

                    var createResult = await _handoverService.CreateAsync(createReq, staffId.Value);
                    if (!createResult.Success)
                    {
                        _logger.LogWarning("Failed to create handover while uploading inspection images. ReservationId={ReservationId}. Reason={Reason}", parsedReservationId.Value, createResult.Message);
                    }
                    else
                    {
                        _logger.LogInformation("Handover created successfully from inspection images. HandoverId={HandoverId}", createResult.HandoverId);
                    }
                }
                else
                {
                    _logger.LogInformation("Skip saving to handover (reservationId or staffId missing). ReservationId={ReservationId}, StaffId={StaffId}", reservationId, staffId);
                }

                // Get customer information
                string customerName = "Customer";
                using (var conn = _getConnection())
                {
                    await conn.OpenAsync();
                    var cmd = new SqlCommand("SELECT full_name FROM dbo.users WHERE email = @email", conn);
                    cmd.Parameters.AddWithValue("@email", customerEmail);
                    var reader = await cmd.ExecuteReaderAsync();
                    if (await reader.ReadAsync())
                    {
                        customerName = reader.IsDBNull(0) ? "Customer" : reader.GetString(0);
                    }
                }

                // Prepare email with attachments
                var subject = $"Vehicle Inspection Report - EVRentals";
                var htmlBody = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
        .content {{ background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }}
        .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
        .info-box {{ background-color: #e3f2fd; padding: 15px; border-left: 4px solid #2196F3; margin: 15px 0; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>EVRentals - Vehicle Inspection Report</h1>
        </div>
        <div class='content'>
            <p>Xin chào <strong>{customerName}</strong>,</p>
            <p>Chúng tôi đã hoàn tất kiểm tra xe của bạn và gửi kèm các hình ảnh kiểm tra.</p>
            
            {(string.IsNullOrEmpty(reservationId) ? "" : $"<div class='info-box'><strong>Mã đặt xe:</strong> {reservationId}</div>")}
            {(string.IsNullOrEmpty(vehicleId) ? "" : $"<div class='info-box'><strong>Mã xe:</strong> {vehicleId}</div>")}
            
            {(string.IsNullOrEmpty(inspectionNotes) ? "" : $"<div class='info-box'><strong>Ghi chú kiểm tra:</strong><br>{inspectionNotes.Replace("\n", "<br>")}</div>")}
            
            <p>Vui lòng xem các hình ảnh đính kèm để biết thêm chi tiết về tình trạng xe.</p>
            <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi.</p>
        </div>
        <div class='footer'>
            <p>Trân trọng,<br>Đội ngũ EVRentals</p>
            <p>Đây là email tự động, vui lòng không trả lời email này.</p>
        </div>
    </div>
</body>
</html>";

                // Prepare attachments
                var attachments = savedFiles.Select(f => new EmailAttachment
                {
                    FilePath = f.FilePath,
                    FileName = f.FileName,
                    ContentType = f.ContentType
                }).ToList();

                // Send email with attachments
                var overrideTo = _configuration.GetSection("Smtp")["OverrideToEmail"];
                var recipient = string.IsNullOrWhiteSpace(overrideTo) ? customerEmail : overrideTo;

                await _emailService.SendWithAttachmentsAsync(recipient, subject, htmlBody, attachments);
                _logger.LogInformation("Inspection images email sent successfully to {Email}", customerEmail);

                return Ok(new { 
                    success = true, 
                    message = "Inspection images uploaded and sent to customer successfully",
                    filesCount = uploadedFiles.Count,
                    customerEmail = customerEmail
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading and sending inspection images to {Email}", customerEmail);
                return StatusCode(500, new { success = false, message = $"Error: {ex.Message}" });
            }
        }

        private int? GetUserIdFromToken()
        {
            var userIdClaim = HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return null;
            return int.TryParse(userIdClaim.Value, out var id) ? id : null;
        }

    }
}
