using DormitoryManagement.Application.Common;
using DormitoryManagement.Application.DTOs;
using DormitoryManagement.Application.Interfaces;
using DormitoryManagement.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DormitoryManagement.API.Controllers;

[Authorize]
public class RepairsController : BaseApiController
{
    private readonly IRepairRequestService _repairService;

    public RepairsController(IRepairRequestService repairService)
    {
        _repairService = repairService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<ApiResponse<PagedResult<RepairRequestDto>>>> GetAll([FromQuery] PaginationFilter filter, [FromQuery] RepairStatus? status)
    {
        var result = await _repairService.GetAllAsync(filter, status);
        return HandleResult(result);
    }

    [HttpGet("my")]
    public async Task<ActionResult<ApiResponse<List<RepairRequestDto>>>> GetMyRequests()
    {
        var result = await _repairService.GetMyRequestsAsync();
        return HandleResult(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<RepairRequestDto>>> GetById(int id)
    {
        var result = await _repairService.GetByIdAsync(id);
        return HandleResult(result);
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<RepairRequestDto>>> Create([FromBody] CreateRepairRequestDto request)
    {
        var result = await _repairService.CreateAsync(request);
        return HandleCreated(result, "Gửi yêu cầu sửa chữa thành công");
    }

    [HttpPut("{id}/status")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<ApiResponse<RepairRequestDto>>> UpdateStatus(int id, [FromBody] UpdateRepairStatusDto request)
    {
        var result = await _repairService.UpdateStatusAsync(id, request);
        return HandleResult(result, "Cập nhật yêu cầu sửa chữa thành công");
    }
}
