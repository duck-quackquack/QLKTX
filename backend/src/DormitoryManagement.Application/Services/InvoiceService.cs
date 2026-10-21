using DormitoryManagement.Application.Common;
using DormitoryManagement.Application.DTOs;
using DormitoryManagement.Application.Interfaces;
using DormitoryManagement.Domain.Entities;
using DormitoryManagement.Domain.Enums;
using DormitoryManagement.Domain.Interfaces;

namespace DormitoryManagement.Application.Services;

public class InvoiceService : IInvoiceService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public InvoiceService(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<PagedResult<InvoiceDto>> GetAllAsync(PaginationFilter filter, InvoiceStatus? status = null, int? month = null, int? year = null)
    {
        var query = _unitOfWork.Repository<Invoice>().Query();

        if (status.HasValue)
        {
            query = query.Where(i => i.Status == status.Value);
        }

        if (month.HasValue)
        {
            query = query.Where(i => i.Month == month.Value);
        }

        if (year.HasValue)
        {
            query = query.Where(i => i.Year == year.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
        {
            var search = filter.SearchTerm.Trim().ToLower();
            query = query.Where(i => i.InvoiceCode.ToLower().Contains(search) 
                                  || i.Student.FullName.ToLower().Contains(search) 
                                  || i.Student.StudentCode.ToLower().Contains(search));
        }

        var total = query.Count();

        var list = query
            .OrderByDescending(i => i.Year)
            .ThenByDescending(i => i.Month)
            .ThenByDescending(i => i.CreatedAt)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToList();

        var result = new List<InvoiceDto>();
        foreach (var inv in list)
        {
            result.Add(await MapToDtoAsync(inv));
        }

        return new PagedResult<InvoiceDto>(result, total, filter.Page, filter.PageSize);
    }

    public async Task<InvoiceDto> GetByIdAsync(int id)
    {
        var invoice = await _unitOfWork.Repository<Invoice>().GetByIdAsync(id);
        if (invoice == null) throw new NotFoundException("Hóa đơn", id);

        if (_currentUserService.IsStudent && _currentUserService.StudentId != invoice.StudentId)
        {
            throw new ForbiddenException();
        }

        return await MapToDtoAsync(invoice);
    }

    public async Task<List<InvoiceDto>> GetMyInvoicesAsync()
    {
        var studentId = _currentUserService.StudentId;
        if (!studentId.HasValue)
        {
            throw new UnauthorizedException("Chỉ tài khoản sinh viên mới có quyền xem hóa đơn của mình.");
        }

        var list = (await _unitOfWork.Repository<Invoice>().FindAsync(i => i.StudentId == studentId.Value))
            .OrderByDescending(i => i.Year)
            .ThenByDescending(i => i.Month)
            .ToList();

        var result = new List<InvoiceDto>();
        foreach (var inv in list)
        {
            result.Add(await MapToDtoAsync(inv));
        }
        return result;
    }

    public async Task<InvoiceDto> CreateAsync(CreateInvoiceDto request)
    {
        var contract = await _unitOfWork.Repository<Contract>().GetByIdAsync(request.ContractId);
        if (contract == null) throw new NotFoundException("Hợp đồng", request.ContractId);

        var existing = (await _unitOfWork.Repository<Invoice>()
            .FindAsync(i => i.ContractId == request.ContractId && i.Month == request.Month && i.Year == request.Year)).FirstOrDefault();
        if (existing != null)
        {
            throw new ConflictException($"Hóa đơn tháng {request.Month}/{request.Year} cho hợp đồng này đã được lập.");
        }

        var invoice = new Invoice
        {
            InvoiceCode = $"INV-{request.Year}{request.Month:D2}-{contract.StudentId:D4}",
            StudentId = contract.StudentId,
            ContractId = contract.Id,
            Month = request.Month,
            Year = request.Year,
            RoomFee = request.RoomFee > 0 ? request.RoomFee : contract.MonthlyRent,
            ElectricityFee = request.ElectricityFee,
            WaterFee = request.WaterFee,
            ServiceFee = request.ServiceFee,
            OtherFee = request.OtherFee,
            OtherFeeDescription = request.OtherFeeDescription,
            DueDate = request.DueDate,
            Status = InvoiceStatus.Unpaid,
            Notes = request.Notes
        };

        var created = await _unitOfWork.Repository<Invoice>().AddAsync(invoice);

        // Send notification to student
        var student = await _unitOfWork.Repository<Student>().GetByIdAsync(contract.StudentId);
        if (student?.UserId != null)
        {
            await _unitOfWork.Repository<Notification>().AddAsync(new Notification
            {
                UserId = student.UserId,
                Title = $"Hóa đơn tiền phòng tháng {request.Month}/{request.Year}",
                Content = $"Hóa đơn {created.InvoiceCode} với tổng số tiền {created.TotalAmount:N0}đ đã được phát hành. Hạn thanh toán: {created.DueDate:dd/MM/yyyy}.",
                Type = NotificationType.Invoice
            });
        }

        await _unitOfWork.SaveChangesAsync();
        return await MapToDtoAsync(created);
    }

    public async Task<int> GenerateMonthlyInvoicesAsync(GenerateMonthlyInvoicesDto request)
    {
        var activeContracts = await _unitOfWork.Repository<Contract>().FindAsync(c => c.Status == ContractStatus.Active);
        int count = 0;

        foreach (var contract in activeContracts)
        {
            var existing = (await _unitOfWork.Repository<Invoice>()
                .FindAsync(i => i.ContractId == contract.Id && i.Month == request.Month && i.Year == request.Year)).FirstOrDefault();

            if (existing == null)
            {
                // Check if meter reading exists for this room
                var meterReading = (await _unitOfWork.Repository<MeterReading>()
                    .FindAsync(m => m.RoomId == contract.RoomId && m.Month == request.Month && m.Year == request.Year)).FirstOrDefault();

                decimal elecFee = 0;
                decimal waterFee = 0;
                if (meterReading != null)
                {
                    var roomContracts = (await _unitOfWork.Repository<Contract>()
                        .FindAsync(c => c.RoomId == contract.RoomId && c.Status == ContractStatus.Active)).ToList();
                    int totalInRoom = roomContracts.Count > 0 ? roomContracts.Count : 1;
                    elecFee = Math.Round(meterReading.TotalElectricityCost / totalInRoom, 0);
                    waterFee = Math.Round(meterReading.TotalWaterCost / totalInRoom, 0);
                }

                var inv = new Invoice
                {
                    InvoiceCode = $"INV-{request.Year}{request.Month:D2}-{contract.StudentId:D4}",
                    StudentId = contract.StudentId,
                    ContractId = contract.Id,
                    Month = request.Month,
                    Year = request.Year,
                    RoomFee = contract.MonthlyRent,
                    ElectricityFee = elecFee,
                    WaterFee = waterFee,
                    ServiceFee = request.ServiceFee,
                    DueDate = request.DueDate,
                    Status = InvoiceStatus.Unpaid,
                    Notes = $"Hóa đơn tiền phòng tháng {request.Month}/{request.Year}"
                };

                await _unitOfWork.Repository<Invoice>().AddAsync(inv);

                var student = await _unitOfWork.Repository<Student>().GetByIdAsync(contract.StudentId);
                if (student?.UserId != null)
                {
                    await _unitOfWork.Repository<Notification>().AddAsync(new Notification
                    {
                        UserId = student.UserId,
                        Title = $"Hóa đơn KTX tháng {request.Month}/{request.Year}",
                        Content = $"Hóa đơn mới {inv.InvoiceCode} đã được tạo. Vui lòng thanh toán trước ngày {request.DueDate:dd/MM/yyyy}.",
                        Type = NotificationType.Invoice
                    });
                }

                count++;
            }
        }

        await _unitOfWork.SaveChangesAsync();
        return count;
    }

    public async Task<bool> CancelInvoiceAsync(int id, string? reason)
    {
        var invoice = await _unitOfWork.Repository<Invoice>().GetByIdAsync(id);
        if (invoice == null) throw new NotFoundException("Hóa đơn", id);

        if (invoice.Status == InvoiceStatus.Paid)
        {
            throw new ValidationException("Không thể hủy hóa đơn đã thanh toán hoàn tất.");
        }

        invoice.Status = InvoiceStatus.Cancelled;
        invoice.Notes = (invoice.Notes ?? "") + $" [Hủy: {reason}]";
        invoice.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.SaveChangesAsync();
        return true;
    }

    private async Task<InvoiceDto> MapToDtoAsync(Invoice i)
    {
        var student = await _unitOfWork.Repository<Student>().GetByIdAsync(i.StudentId);
        var contract = await _unitOfWork.Repository<Contract>().GetByIdAsync(i.ContractId);
        Room? room = null;
        Building? building = null;

        if (contract != null)
        {
            room = await _unitOfWork.Repository<Room>().GetByIdAsync(contract.RoomId);
            if (room != null)
            {
                building = await _unitOfWork.Repository<Building>().GetByIdAsync(room.BuildingId);
            }
        }

        var payments = (await _unitOfWork.Repository<Payment>().FindAsync(p => p.InvoiceId == i.Id))
            .Select(p => new PaymentDto
            {
                Id = p.Id,
                InvoiceId = p.InvoiceId,
                PaymentCode = p.PaymentCode,
                Amount = p.Amount,
                PaymentDate = p.PaymentDate,
                PaymentMethod = p.PaymentMethod,
                TransactionCode = p.TransactionCode,
                Status = p.Status,
                Notes = p.Notes,
                ReceivedBy = p.ReceivedBy
            }).ToList();

        return new InvoiceDto
        {
            Id = i.Id,
            InvoiceCode = i.InvoiceCode,
            StudentId = i.StudentId,
            StudentName = student?.FullName ?? string.Empty,
            StudentCode = student?.StudentCode ?? string.Empty,
            StudentPhone = student?.Phone ?? string.Empty,
            ContractId = i.ContractId,
            RoomNumber = room?.RoomNumber ?? string.Empty,
            BuildingName = building?.Name ?? string.Empty,
            Month = i.Month,
            Year = i.Year,
            RoomFee = i.RoomFee,
            ElectricityFee = i.ElectricityFee,
            WaterFee = i.WaterFee,
            ServiceFee = i.ServiceFee,
            OtherFee = i.OtherFee,
            OtherFeeDescription = i.OtherFeeDescription,
            TotalAmount = i.TotalAmount,
            PaidAmount = i.PaidAmount,
            RemainingAmount = i.RemainingAmount,
            DueDate = i.DueDate,
            Status = i.Status,
            Notes = i.Notes,
            CreatedAt = i.CreatedAt,
            Payments = payments
        };
    }
}

