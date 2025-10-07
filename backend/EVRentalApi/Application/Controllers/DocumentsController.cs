using Microsoft.AspNetCore.Mvc;
using EVRentalApi.Application.Services;
using EVRentalApi.Models;
using Microsoft.Extensions.Logging;

namespace EVRentalApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DocumentsController : ControllerBase
    {
        private readonly PersonalInfoService _personalInfoService;
        private readonly ILogger<DocumentsController> _logger;

        public DocumentsController(PersonalInfoService personalInfoService, ILogger<DocumentsController> logger)
        {
            _personalInfoService = personalInfoService;
            _logger = logger;
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

    }
}
