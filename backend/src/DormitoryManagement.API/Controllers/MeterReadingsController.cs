using DormitoryManagement.Application.Common;
using DormitoryManagement.Application.DTOs;
using DormitoryManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DormitoryManagement.API.Controllers;

[Authorize]
public class MeterReadingsController : BaseApiController
{
    private readonly IMeterReadingService _meterReadingService;

    public MeterReadingsController(IMeterReadingService meterReadingService)
    {
        _meterReadingService = meterReadingService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<ApiResponse<PagedResult<MeterReadingDto>>>> GetAll([FromQuery] PaginationFilter filter, [FromQuery] int? roomId, [FromQuery] int? month, [FromQuery] int? year)
    {
        var result = await _meterReadingService.GetAllAsync(filter, roomId, month, year);
        return HandleResult(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<MeterReadingDto>>> GetById(int id)
    {
        var result = await _meterReadingService.GetByIdAsync(id);
        return HandleResult(result);
    }

    [HttpGet("previous")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<ApiResponse<MeterReadingDto?>>> GetPrevious([FromQuery] int roomId, [FromQuery] int currentMonth, [FromQuery] int currentYear)
    {
        var result = await _meterReadingService.GetPreviousReadingAsync(roomId, currentMonth, currentYear);
        return HandleResult(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<ApiResponse<MeterReadingDto>>> RecordReading([FromBody] CreateMeterReadingDto request)
    {
        var result = await _meterReadingService.RecordReadingAsync(request);
        return HandleCreated(result, "Ghi chỉ số điện nước thành công");
    }
}
