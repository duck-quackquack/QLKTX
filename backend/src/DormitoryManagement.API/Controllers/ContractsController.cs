using DormitoryManagement.Application.Common;
using DormitoryManagement.Application.DTOs;
using DormitoryManagement.Application.Interfaces;
using DormitoryManagement.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DormitoryManagement.API.Controllers;

[Authorize]
public class ContractsController : BaseApiController
{
    private readonly IContractService _contractService;

    public ContractsController(IContractService contractService)
    {
        _contractService = contractService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<ApiResponse<PagedResult<ContractDto>>>> GetAll([FromQuery] PaginationFilter filter, [FromQuery] ContractStatus? status)
    {
        var result = await _contractService.GetAllAsync(filter, status);
        return HandleResult(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<ContractDto>>> GetById(int id)
    {
        var result = await _contractService.GetByIdAsync(id);
        return HandleResult(result);
    }

    [HttpGet("my-active")]
    public async Task<ActionResult<ApiResponse<ContractDto?>>> GetMyActiveContract()
    {
        var result = await _contractService.GetMyActiveContractAsync();
        return HandleResult(result);
    }

    [HttpGet("my")]
    public async Task<ActionResult<ApiResponse<List<ContractDto>>>> GetMyContracts()
    {
        var result = await _contractService.GetMyContractsAsync();
        return HandleResult(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<ApiResponse<ContractDto>>> Create([FromBody] CreateContractDto request)
    {
        var result = await _contractService.CreateAsync(request);
        return HandleCreated(result, "Tạo hợp đồng thành công");
    }

    [HttpPut("{id}/terminate")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<ApiResponse<ContractDto>>> Terminate(int id, [FromBody] TerminateContractDto request)
    {
        var result = await _contractService.TerminateAsync(id, request);
        return HandleResult(result, "Chấm dứt hợp đồng và trả phòng thành công");
    }

    [HttpPut("{id}/renew")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<ApiResponse<ContractDto>>> Renew(int id, [FromQuery] DateTime newEndDate)
    {
        var result = await _contractService.RenewAsync(id, newEndDate);
        return HandleResult(result, "Gia hạn hợp đồng thành công");
    }
}

