using DormitoryManagement.Application.Common;
using DormitoryManagement.Application.DTOs;
using DormitoryManagement.Application.Interfaces;
using DormitoryManagement.Domain.Entities;
using DormitoryManagement.Domain.Enums;
using DormitoryManagement.Domain.Interfaces;

namespace DormitoryManagement.Application.Services;

public class PaymentService : IPaymentService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public PaymentService(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<PagedResult<PaymentDto>> GetAllAsync(PaginationFilter filter)
    {
        var query = _unitOfWork.Repository<Payment>().Query();

        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
        {
            var search = filter.SearchTerm.Trim().ToLower();
            query = query.Where(p => p.PaymentCode.ToLower().Contains(search) 
                                  || p.Invoice.InvoiceCode.ToLower().Contains(search) 
                                  || p.TransactionCode!.ToLower().Contains(search));
        }

        var total = query.Count();

        var list = query
            .OrderByDescending(p => p.PaymentDate)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToList();

        var result = new List<PaymentDto>();
        foreach (var p in list)
        {
            result.Add(await MapToDtoAsync(p));
        }

        return new PagedResult<PaymentDto>(result, total, filter.Page, filter.PageSize);
    }

    public async Task<PaymentDto> GetByIdAsync(int id)
    {
        var payment = await _unitOfWork.Repository<Payment>().GetByIdAsync(id);
        if (payment == null) throw new NotFoundException("Giao dịch thanh toán", id);

        return await MapToDtoAsync(payment);
    }

    public async Task<List<PaymentDto>> GetMyPaymentsAsync()
    {
        var studentId = _currentUserService.StudentId;
        if (!studentId.HasValue)
        {
            throw new UnauthorizedException("Chỉ tài khoản sinh viên mới có quyền xem lịch sử thanh toán của mình.");
        }

        var studentInvoices = await _unitOfWork.Repository<Invoice>().FindAsync(i => i.StudentId == studentId.Value);
        var invoiceIds = studentInvoices.Select(i => i.Id).ToHashSet();

        var payments = (await _unitOfWork.Repository<Payment>().FindAsync(p => invoiceIds.Contains(p.InvoiceId)))
            .OrderByDescending(p => p.PaymentDate)
            .ToList();

        var result = new List<PaymentDto>();
        foreach (var p in payments)
        {
            result.Add(await MapToDtoAsync(p));
        }
        return result;
    }

    public async Task<PaymentDto> RecordPaymentAsync(CreatePaymentDto request)
    {
        var invoice = await _unitOfWork.Repository<Invoice>().GetByIdAsync(request.InvoiceId);
        if (invoice == null) throw new NotFoundException("Hóa đơn", request.InvoiceId);

        if (invoice.Status == InvoiceStatus.Paid)
        {
            throw new ValidationException("Hóa đơn này đã được thanh toán đầy đủ.");
        }

        if (request.Amount <= 0)
        {
            throw new ValidationException("Số tiền thanh toán phải lớn hơn 0.");
        }

        if (request.Amount > invoice.RemainingAmount)
        {
            throw new ValidationException($"Số tiền thanh toán ({request.Amount:N0}đ) vượt quá số tiền còn nợ ({invoice.RemainingAmount:N0}đ).");
        }

        var payment = new Payment
        {
            InvoiceId = invoice.Id,
            PaymentCode = $"PAY-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}",
            Amount = request.Amount,
            PaymentDate = DateTime.UtcNow,
            PaymentMethod = request.PaymentMethod,
            TransactionCode = request.TransactionCode ?? Guid.NewGuid().ToString("N")[..10].ToUpper(),
            Status = PaymentStatus.Completed,
            Notes = request.Notes,
            ReceivedBy = _currentUserService.Username ?? "Admin"
        };

        var created = await _unitOfWork.Repository<Payment>().AddAsync(payment);

        // Update invoice paid amount & status
        invoice.PaidAmount += request.Amount;
        if (invoice.PaidAmount >= invoice.TotalAmount)
        {
            invoice.Status = InvoiceStatus.Paid;
        }
        else
        {
            invoice.Status = InvoiceStatus.PartiallyPaid;
        }
        invoice.UpdatedAt = DateTime.UtcNow;

        // Send notification to student
        var student = await _unitOfWork.Repository<Student>().GetByIdAsync(invoice.StudentId);
        if (student?.UserId != null)
        {
            await _unitOfWork.Repository<Notification>().AddAsync(new Notification
            {
                UserId = student.UserId,
                Title = "Xác nhận thanh toán thành công",
                Content = $"Đã nhận thanh toán {request.Amount:N0}đ cho hóa đơn {invoice.InvoiceCode}. Trạng thái hiện tại: {(invoice.Status == InvoiceStatus.Paid ? "Đã thanh toán đủ" : "Còn nợ " + invoice.RemainingAmount.ToString("N0") + "đ")}.",
                Type = NotificationType.Invoice
            });
        }

        await _unitOfWork.SaveChangesAsync();
        return await MapToDtoAsync(created);
    }

    private async Task<PaymentDto> MapToDtoAsync(Payment p)
    {
        var invoice = await _unitOfWork.Repository<Invoice>().GetByIdAsync(p.InvoiceId);

        return new PaymentDto
        {
            Id = p.Id,
            InvoiceId = p.InvoiceId,
            InvoiceCode = invoice?.InvoiceCode ?? string.Empty,
            PaymentCode = p.PaymentCode,
            Amount = p.Amount,
            PaymentDate = p.PaymentDate,
            PaymentMethod = p.PaymentMethod,
            TransactionCode = p.TransactionCode,
            Status = p.Status,
            Notes = p.Notes,
            ReceivedBy = p.ReceivedBy
        };
    }
}

