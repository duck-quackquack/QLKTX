using DormitoryManagement.Application.Common;
using DormitoryManagement.Application.DTOs;
using DormitoryManagement.Application.Interfaces;
using DormitoryManagement.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DormitoryManagement.API.Controllers;

[Authorize]
public class RegistrationsController : BaseApiController
{
    private readonly IRegistrationService _registrationService;

    public RegistrationsController(IRegistrationService registrationService)
    {
        _registrationService = registrationService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<ApiResponse<PagedResult<RegistrationDto>>>> GetAll([FromQuery] PaginationFilter filter, [FromQuery] RegistrationStatus? status)
    {
        var result = await _registrationService.GetAllAsync(filter, status);
        return HandleResult(result);
    }

    [HttpGet("my")]
    public async Task<ActionResult<ApiResponse<List<RegistrationDto>>>> GetMyRegistrations()
    {
        var result = await _registrationService.GetMyRegistrationsAsync();
        return HandleResult(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<RegistrationDto>>> GetById(int id)
    {
        var result = await _registrationService.GetByIdAsync(id);
        return HandleResult(result);
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<RegistrationDto>>> SubmitRegistration([FromBody] CreateRegistrationDto request)
    {
        var result = await _registrationService.SubmitRegistrationAsync(request);
        return HandleCreated(result, "Gửi đơn đăng ký phòng thành công");
    }

    [HttpPut("{id}/review")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<ApiResponse<RegistrationDto>>> ReviewRegistration(int id, [FromBody] ReviewRegistrationDto request)
    {
        var result = await _registrationService.ReviewRegistrationAsync(id, request);
        return HandleResult(result, "Duyệt đơn đăng ký thành công");
    }

    [HttpPut("{id}/cancel")]
    public async Task<ActionResult<ApiResponse<bool>>> CancelRegistration(int id)
    {
        var result = await _registrationService.CancelRegistrationAsync(id);
        return HandleResult(result, "Đã hủy đơn đăng ký");
    }
}
