using DormitoryManagement.Application.Common;
using DormitoryManagement.Application.DTOs;
using DormitoryManagement.Application.Interfaces;
using DormitoryManagement.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DormitoryManagement.API.Controllers;

[Authorize]
public class InvoicesController : BaseApiController
{
    private readonly IInvoiceService _invoiceService;

    public InvoicesController(IInvoiceService invoiceService)
    {
        _invoiceService = invoiceService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<ApiResponse<PagedResult<InvoiceDto>>>> GetAll([FromQuery] PaginationFilter filter, [FromQuery] InvoiceStatus? status, [FromQuery] int? month, [FromQuery] int? year)
    {
        var result = await _invoiceService.GetAllAsync(filter, status, month, year);
        return HandleResult(result);
    }

    [HttpGet("my")]
    public async Task<ActionResult<ApiResponse<List<InvoiceDto>>>> GetMyInvoices()
    {
        var result = await _invoiceService.GetMyInvoicesAsync();
        return HandleResult(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<InvoiceDto>>> GetById(int id)
    {
        var result = await _invoiceService.GetByIdAsync(id);
        return HandleResult(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<ApiResponse<InvoiceDto>>> Create([FromBody] CreateInvoiceDto request)
    {
        var result = await _invoiceService.CreateAsync(request);
        return HandleCreated(result, "Tạo hóa đơn thành công");
    }

    [HttpPost("generate-monthly")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<ApiResponse<int>>> GenerateMonthlyInvoices([FromBody] GenerateMonthlyInvoicesDto request)
    {
        var count = await _invoiceService.GenerateMonthlyInvoicesAsync(request);
        return HandleResult(count, $"Đã tạo tự động {count} hóa đơn cho toàn bộ hợp đồng đang hoạt động.");
    }

    [HttpPut("{id}/cancel")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<ApiResponse<bool>>> CancelInvoice(int id, [FromQuery] string? reason)
    {
        var result = await _invoiceService.CancelInvoiceAsync(id, reason);
        return HandleResult(result, "Đã hủy hóa đơn");
    }
}

