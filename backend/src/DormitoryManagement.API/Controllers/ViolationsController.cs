using DormitoryManagement.Application.Common;
using DormitoryManagement.Application.DTOs;
using DormitoryManagement.Application.Interfaces;
using DormitoryManagement.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DormitoryManagement.API.Controllers;

[Authorize]
public class ViolationsController : BaseApiController
{
    private readonly IViolationService _violationService;

    public ViolationsController(IViolationService violationService)
    {
        _violationService = violationService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<ApiResponse<PagedResult<ViolationDto>>>> GetAll([FromQuery] PaginationFilter filter, [FromQuery] ViolationStatus? status)
    {
        var result = await _violationService.GetAllAsync(filter, status);
        return HandleResult(result);
    }

    [HttpGet("my")]
    public async Task<ActionResult<ApiResponse<List<ViolationDto>>>> GetMyViolations()
    {
        var result = await _violationService.GetMyViolationsAsync();
        return HandleResult(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<ViolationDto>>> GetById(int id)
    {
        var result = await _violationService.GetByIdAsync(id);
        return HandleResult(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<ApiResponse<ViolationDto>>> Create([FromBody] CreateViolationDto request)
    {
        var result = await _violationService.CreateAsync(request);
        return HandleCreated(result, "Lập biên bản vi phạm thành công");
    }

    [HttpPut("{id}/status")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<ApiResponse<ViolationDto>>> UpdateStatus(int id, [FromBody] UpdateViolationStatusDto request)
    {
        var result = await _violationService.UpdateStatusAsync(id, request);
        return HandleResult(result, "Cập nhật trạng thái vi phạm thành công");
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(int id)
    {
        await _violationService.DeleteAsync(id);
        return HandleResult<object>(null!, "Xóa vi phạm thành công");
    }
}
