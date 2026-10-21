using DormitoryManagement.Application.Common;
using DormitoryManagement.Application.DTOs;
using DormitoryManagement.Application.Interfaces;
using DormitoryManagement.Domain.Entities;
using DormitoryManagement.Domain.Enums;
using DormitoryManagement.Domain.Interfaces;

namespace DormitoryManagement.Application.Services;

public class RepairRequestService : IRepairRequestService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public RepairRequestService(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<PagedResult<RepairRequestDto>> GetAllAsync(PaginationFilter filter, RepairStatus? status = null)
    {
        var query = _unitOfWork.Repository<RepairRequest>().Query();

        if (status.HasValue)
        {
            query = query.Where(r => r.Status == status.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
        {
            var search = filter.SearchTerm.Trim().ToLower();
            query = query.Where(r => r.Title.ToLower().Contains(search) 
                                  || r.Room.RoomNumber.ToLower().Contains(search) 
                                  || r.Student.FullName.ToLower().Contains(search));
        }

        var total = query.Count();

        var list = query
            .OrderByDescending(r => r.CreatedAt)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToList();

        var result = new List<RepairRequestDto>();
        foreach (var r in list)
        {
            result.Add(await MapToDtoAsync(r));
        }

        return new PagedResult<RepairRequestDto>(result, total, filter.Page, filter.PageSize);
    }

    public async Task<RepairRequestDto> GetByIdAsync(int id)
    {
        var req = await _unitOfWork.Repository<RepairRequest>().GetByIdAsync(id);
        if (req == null) throw new NotFoundException("Yêu cầu sửa chữa", id);

        if (_currentUserService.IsStudent && _currentUserService.StudentId != req.StudentId)
        {
            throw new ForbiddenException();
        }

        return await MapToDtoAsync(req);
    }

    public async Task<List<RepairRequestDto>> GetMyRequestsAsync()
    {
        var studentId = _currentUserService.StudentId;
        if (!studentId.HasValue)
        {
            throw new UnauthorizedException("Chỉ sinh viên mới có quyền xem yêu cầu sửa chữa của mình.");
        }

        var list = (await _unitOfWork.Repository<RepairRequest>().FindAsync(r => r.StudentId == studentId.Value))
            .OrderByDescending(r => r.CreatedAt)
            .ToList();

        var result = new List<RepairRequestDto>();
        foreach (var r in list)
        {
            result.Add(await MapToDtoAsync(r));
        }
        return result;
    }

    public async Task<RepairRequestDto> CreateAsync(CreateRepairRequestDto request)
    {
        int studentId;
        int roomId;

        if (_currentUserService.IsStudent)
        {
            studentId = _currentUserService.StudentId ?? throw new UnauthorizedException();
            var activeContracts = await _unitOfWork.Repository<Contract>()
                .FindAsync(c => c.StudentId == studentId && c.Status == ContractStatus.Active);
            var contract = activeContracts.FirstOrDefault();
            if (contract == null)
            {
                throw new ValidationException("Bạn hiện tại không có phòng ở đang hoạt động trong ký túc xá.");
            }
            roomId = contract.RoomId;
        }
        else
        {
            if (!request.RoomId.HasValue) throw new ValidationException("Cần chỉ định phòng cần sửa chữa.");
            roomId = request.RoomId.Value;
            var contracts = await _unitOfWork.Repository<Contract>()
                .FindAsync(c => c.RoomId == roomId && c.Status == ContractStatus.Active);
            studentId = contracts.FirstOrDefault()?.StudentId ?? 1;
        }

        var repair = new RepairRequest
        {
            StudentId = studentId,
            RoomId = roomId,
            Title = request.Title.Trim(),
            Description = request.Description.Trim(),
            ImageUrl = request.ImageUrl,
            Priority = request.Priority,
            Status = RepairStatus.Pending
        };

        var created = await _unitOfWork.Repository<RepairRequest>().AddAsync(repair);
        await _unitOfWork.SaveChangesAsync();

        return await MapToDtoAsync(created);
    }

    public async Task<RepairRequestDto> UpdateStatusAsync(int id, UpdateRepairStatusDto request)
    {
        var repair = await _unitOfWork.Repository<RepairRequest>().GetByIdAsync(id);
        if (repair == null) throw new NotFoundException("Yêu cầu sửa chữa", id);

        repair.Status = request.Status;
        repair.RepairCost = request.RepairCost;
        if (!string.IsNullOrEmpty(request.StaffNotes))
        {
            repair.StaffNotes = request.StaffNotes;
        }

        if (request.Status == RepairStatus.Completed)
        {
            repair.CompletedAt = DateTime.UtcNow;
        }
        repair.UpdatedAt = DateTime.UtcNow;

        var student = await _unitOfWork.Repository<Student>().GetByIdAsync(repair.StudentId);
        if (student?.UserId != null)
        {
            await _unitOfWork.Repository<Notification>().AddAsync(new Notification
            {
                UserId = student.UserId,
                Title = $"Cập nhật yêu cầu sửa chữa: {repair.Title}",
                Content = $"Yêu cầu của bạn hiện có trạng thái: {(request.Status == RepairStatus.Completed ? "Đã hoàn thành" : request.Status == RepairStatus.Processing ? "Đang xử lý" : "Đã tiếp nhận")}.",
                Type = NotificationType.Repair
            });
        }

        await _unitOfWork.SaveChangesAsync();
        return await MapToDtoAsync(repair);
    }

    private async Task<RepairRequestDto> MapToDtoAsync(RepairRequest r)
    {
        var student = await _unitOfWork.Repository<Student>().GetByIdAsync(r.StudentId);
        var room = await _unitOfWork.Repository<Room>().GetByIdAsync(r.RoomId);
        var building = room != null ? await _unitOfWork.Repository<Building>().GetByIdAsync(room.BuildingId) : null;

        return new RepairRequestDto
        {
            Id = r.Id,
            StudentId = r.StudentId,
            StudentName = student?.FullName ?? string.Empty,
            StudentCode = student?.StudentCode ?? string.Empty,
            StudentPhone = student?.Phone ?? string.Empty,
            RoomId = r.RoomId,
            RoomNumber = room?.RoomNumber ?? string.Empty,
            BuildingName = building?.Name ?? string.Empty,
            Title = r.Title,
            Description = r.Description,
            ImageUrl = r.ImageUrl,
            Priority = r.Priority,
            Status = r.Status,
            RepairCost = r.RepairCost,
            StaffNotes = r.StaffNotes,
            CompletedAt = r.CompletedAt,
            CreatedAt = r.CreatedAt
        };
    }
}

