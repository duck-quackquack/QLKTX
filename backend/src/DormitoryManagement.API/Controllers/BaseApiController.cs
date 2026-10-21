using DormitoryManagement.Application.Common;
using Microsoft.AspNetCore.Mvc;

namespace DormitoryManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public abstract class BaseApiController : ControllerBase
{
    protected ActionResult<ApiResponse<T>> HandleResult<T>(T data, string message = "Thành công")
    {
        return Ok(ApiResponse<T>.Ok(data, message));
    }

    protected ActionResult<ApiResponse<T>> HandleCreated<T>(T data, string message = "Tạo mới thành công")
    {
        return StatusCode(StatusCodes.Status201Created, ApiResponse<T>.Ok(data, message));
    }
}

