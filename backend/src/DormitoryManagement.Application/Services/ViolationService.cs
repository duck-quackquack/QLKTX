using DormitoryManagement.Application.Common;
using DormitoryManagement.Application.DTOs;
using DormitoryManagement.Application.Interfaces;
using DormitoryManagement.Domain.Entities;
using DormitoryManagement.Domain.Enums;
using DormitoryManagement.Domain.Interfaces;

namespace DormitoryManagement.Application.Services;

public class ViolationService : IViolationService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public ViolationService(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<PagedResult<ViolationDto>> GetAllAsync(PaginationFilter filter, ViolationStatus? status = null)
    {
        var query = _unitOfWork.Repository<Violation>().Query();

        if (status.HasValue)
        {
            query = query.Where(v => v.Status == status.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
        {
            var search = filter.SearchTerm.Trim().ToLower();
            query = query.Where(v => v.Title.ToLower().Contains(search) 
                                  || v.Student.FullName.ToLower().Contains(search) 
                                  || v.Student.StudentCode.ToLower().Contains(search));
        }

        var total = query.Count();

        var list = query
            .OrderByDescending(v => v.ViolationDate)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToList();

        var result = new List<ViolationDto>();
        foreach (var v in list)
        {
            result.Add(await MapToDtoAsync(v));
        }

        return new PagedResult<ViolationDto>(result, total, filter.Page, filter.PageSize);
    }

    public async Task<ViolationDto> GetByIdAsync(int id)
    {
        var violation = await _unitOfWork.Repository<Violation>().GetByIdAsync(id);
        if (violation == null) throw new NotFoundException("Biên bản vi phạm", id);

        if (_currentUserService.IsStudent && _currentUserService.StudentId != violation.StudentId)
        {
            throw new ForbiddenException();
        }

        return await MapToDtoAsync(violation);
    }

    public async Task<List<ViolationDto>> GetMyViolationsAsync()
    {
        var studentId = _currentUserService.StudentId;
        if (!studentId.HasValue)
        {
            throw new UnauthorizedException("Chỉ sinh viên mới có quyền xem vi phạm của mình.");
        }

        var list = (await _unitOfWork.Repository<Violation>().FindAsync(v => v.StudentId == studentId.Value))
            .OrderByDescending(v => v.ViolationDate)
            .ToList();

        var result = new List<ViolationDto>();
        foreach (var v in list)
        {
            result.Add(await MapToDtoAsync(v));
        }
        return result;
    }

    public async Task<ViolationDto> CreateAsync(CreateViolationDto request)
    {
        var student = await _unitOfWork.Repository<Student>().GetByIdAsync(request.StudentId);
        if (student == null) throw new NotFoundException("Sinh viên", request.StudentId);

        var violation = new Violation
        {
            StudentId = request.StudentId,
            Title = request.Title.Trim(),
            Description = request.Description.Trim(),
            ViolationType = request.ViolationType.Trim(),
            PenaltyAmount = request.PenaltyAmount,
            ViolationDate = request.ViolationDate,
            Status = ViolationStatus.Pending,
            CreatedBy = _currentUserService.Username ?? "Ban quản lý"
        };

        var created = await _unitOfWork.Repository<Violation>().AddAsync(violation);

        if (student.UserId.HasValue)
        {
            await _unitOfWork.Repository<Notification>().AddAsync(new Notification
            {
                UserId = student.UserId,
                Title = "Thông báo kỷ luật vi phạm nội quy KTX",
                Content = $"Bạn có biên bản vi phạm mới: '{violation.Title}'. Hình thức / mức phạt: {(violation.PenaltyAmount > 0 ? violation.PenaltyAmount.ToString("N0") + "đ" : "Nhắc nhở")}.",
                Type = NotificationType.Violation
            });
        }

        await _unitOfWork.SaveChangesAsync();
        return await MapToDtoAsync(created);
    }

    public async Task<ViolationDto> UpdateStatusAsync(int id, UpdateViolationStatusDto request)
    {
        var violation = await _unitOfWork.Repository<Violation>().GetByIdAsync(id);
        if (violation == null) throw new NotFoundException("Biên bản vi phạm", id);

        violation.Status = request.Status;
        if (!string.IsNullOrEmpty(request.ResolutionNotes))
        {
            violation.ResolutionNotes = request.ResolutionNotes;
        }
        violation.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Repository<Violation>().UpdateAsync(violation);
        await _unitOfWork.SaveChangesAsync();

        return await MapToDtoAsync(violation);
    }

    public async Task DeleteAsync(int id)
    {
        var violation = await _unitOfWork.Repository<Violation>().GetByIdAsync(id);
        if (violation == null) throw new NotFoundException("Biên bản vi phạm", id);

        await _unitOfWork.Repository<Violation>().DeleteAsync(violation);
        await _unitOfWork.SaveChangesAsync();
    }

    private async Task<ViolationDto> MapToDtoAsync(Violation v)
    {
        var student = await _unitOfWork.Repository<Student>().GetByIdAsync(v.StudentId);

        return new ViolationDto
        {
            Id = v.Id,
            StudentId = v.StudentId,
            StudentName = student?.FullName ?? string.Empty,
            StudentCode = student?.StudentCode ?? string.Empty,
            StudentPhone = student?.Phone ?? string.Empty,
            Title = v.Title,
            Description = v.Description,
            ViolationType = v.ViolationType,
            PenaltyAmount = v.PenaltyAmount,
            ViolationDate = v.ViolationDate,
            Status = v.Status,
            ResolutionNotes = v.ResolutionNotes,
            CreatedBy = v.CreatedBy,
            CreatedAt = v.CreatedAt
        };
    }
}

