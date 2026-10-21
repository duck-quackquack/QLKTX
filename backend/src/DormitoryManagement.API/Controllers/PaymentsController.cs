using DormitoryManagement.Application.Common;
using DormitoryManagement.Application.DTOs;
using DormitoryManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DormitoryManagement.API.Controllers;

[Authorize]
public class PaymentsController : BaseApiController
{
    private readonly IPaymentService _paymentService;

    public PaymentsController(IPaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<ApiResponse<PagedResult<PaymentDto>>>> GetAll([FromQuery] PaginationFilter filter)
    {
        var result = await _paymentService.GetAllAsync(filter);
        return HandleResult(result);
    }

    [HttpGet("my")]
    public async Task<ActionResult<ApiResponse<List<PaymentDto>>>> GetMyPayments()
    {
        var result = await _paymentService.GetMyPaymentsAsync();
        return HandleResult(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<PaymentDto>>> GetById(int id)
    {
        var result = await _paymentService.GetByIdAsync(id);
        return HandleResult(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<ApiResponse<PaymentDto>>> RecordPayment([FromBody] CreatePaymentDto request)
    {
        var result = await _paymentService.RecordPaymentAsync(request);
        return HandleCreated(result, "Ghi nhận thanh toán thành công");
    }
}
