using Microsoft.AspNetCore.Mvc;
using EVRentalApi.Application.Services;
using EVRentalApi.Models;

namespace EVRentalApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DocumentsController : ControllerBase
    {
        private readonly PersonalInfoService _personalInfoService;

        public DocumentsController(PersonalInfoService personalInfoService)
        {
            _personalInfoService = personalInfoService;
        }

        [HttpPost("upload-avatar")]
public async Task<IActionResult> UploadAvatar([FromBody] UpdatePersonalInfoRequest request)
{
    var response = await _personalInfoService.UpdatePersonalInfoAsync(request);
    if (response.Success)
        return Ok(response);
    return BadRequest(response);
}

    }
}
