using DormitoryManagement.Application.Common;
using DormitoryManagement.Application.DTOs;
using DormitoryManagement.Application.Interfaces;
using DormitoryManagement.Domain.Entities;
using DormitoryManagement.Domain.Enums;
using DormitoryManagement.Domain.Interfaces;

namespace DormitoryManagement.Application.Services;

public class RegistrationService : IRegistrationService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public RegistrationService(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<PagedResult<RegistrationDto>> GetAllAsync(PaginationFilter filter, RegistrationStatus? status = null)
    {
        var query = _unitOfWork.Repository<Registration>().Query();

        if (status.HasValue)
        {
            query = query.Where(r => r.Status == status.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
        {
            var search = filter.SearchTerm.Trim().ToLower();
            query = query.Where(r => r.Student.FullName.ToLower().Contains(search) 
                                  || r.Student.StudentCode.ToLower().Contains(search));
        }

        var total = query.Count();

        var list = query
            .OrderByDescending(r => r.CreatedAt)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToList();

        var result = new List<RegistrationDto>();
        foreach (var r in list)
        {
            result.Add(await MapToDtoAsync(r));
        }

        return new PagedResult<RegistrationDto>(result, total, filter.Page, filter.PageSize);
    }

    public async Task<List<RegistrationDto>> GetMyRegistrationsAsync()
    {
        var studentId = _currentUserService.StudentId;
        if (!studentId.HasValue)
        {
            throw new UnauthorizedException("Chỉ tài khoản sinh viên mới có quyền xem đơn đăng ký của mình.");
        }

        var list = (await _unitOfWork.Repository<Registration>().FindAsync(r => r.StudentId == studentId.Value))
            .OrderByDescending(r => r.CreatedAt)
            .ToList();

        var result = new List<RegistrationDto>();
        foreach (var r in list)
        {
            result.Add(await MapToDtoAsync(r));
        }
        return result;
    }

    public async Task<RegistrationDto> GetByIdAsync(int id)
    {
        var reg = await _unitOfWork.Repository<Registration>().GetByIdAsync(id);
        if (reg == null) throw new NotFoundException("Đơn đăng ký", id);

        // Security check for student
        if (_currentUserService.IsStudent && _currentUserService.StudentId != reg.StudentId)
        {
            throw new ForbiddenException();
        }

        return await MapToDtoAsync(reg);
    }

    public async Task<RegistrationDto> SubmitRegistrationAsync(CreateRegistrationDto request)
    {
        int studentId;
        if (_currentUserService.IsStudent)
        {
            studentId = _currentUserService.StudentId ?? throw new UnauthorizedException("Không tìm thấy thông tin sinh viên.");
        }
        else
        {
            studentId = request.StudentId ?? throw new ValidationException("Cần chỉ định mã sinh viên.");
        }

        var student = await _unitOfWork.Repository<Student>().GetByIdAsync(studentId);
        if (student == null) throw new NotFoundException("Sinh viên", studentId);

        if (student.IsStaying)
        {
            throw new ValidationException("Sinh viên hiện tại đã có phòng ở trong ký túc xá.");
        }

        // Check pending requests
        var existingPending = await _unitOfWork.Repository<Registration>()
            .FindAsync(r => r.StudentId == studentId && r.Status == RegistrationStatus.Pending);
        if (existingPending.Any())
        {
            throw new ConflictException("Bạn đã có một đơn đăng ký đang chờ xét duyệt.");
        }

        var reg = new Registration
        {
            StudentId = studentId,
            PreferredBuildingId = request.PreferredBuildingId,
            PreferredRoomType = request.PreferredRoomType,
            DesiredStartDate = request.DesiredStartDate,
            DurationMonths = request.DurationMonths > 0 ? request.DurationMonths : 6,
            ReasonOrNote = request.ReasonOrNote,
            Status = RegistrationStatus.Pending
        };

        var created = await _unitOfWork.Repository<Registration>().AddAsync(reg);
        await _unitOfWork.SaveChangesAsync();

        return await MapToDtoAsync(created);
    }

    public async Task<RegistrationDto> ReviewRegistrationAsync(int id, ReviewRegistrationDto request)
    {
        var reg = await _unitOfWork.Repository<Registration>().GetByIdAsync(id);
        if (reg == null) throw new NotFoundException("Đơn đăng ký", id);

        if (reg.Status != RegistrationStatus.Pending)
        {
            throw new ValidationException("Đơn đăng ký này đã được xử lý trước đó.");
        }

        reg.Status = request.Status;
        reg.AdminNote = request.AdminNote;
        reg.ReviewedAt = DateTime.UtcNow;

        if (request.Status == RegistrationStatus.Approved)
        {
            if (!request.ApprovedRoomId.HasValue || !request.ApprovedBedId.HasValue)
            {
                throw new ValidationException("Khi duyệt đơn, bạn phải phân bổ Phòng và Giường cho sinh viên.");
            }

            var room = await _unitOfWork.Repository<Room>().GetByIdAsync(request.ApprovedRoomId.Value);
            var bed = await _unitOfWork.Repository<Bed>().GetByIdAsync(request.ApprovedBedId.Value);

            if (room == null || bed == null || bed.RoomId != room.Id)
            {
                throw new ValidationException("Phòng hoặc giường được chọn không hợp lệ.");
            }

            if (bed.Status != BedStatus.Available)
            {
                throw new ConflictException($"Giường {bed.BedNumber} tại phòng {room.RoomNumber} hiện không còn trống.");
            }

            reg.ApprovedRoomId = room.Id;
            reg.ApprovedBedId = bed.Id;

            // Update Bed status
            bed.Status = BedStatus.Occupied;
            bed.UpdatedAt = DateTime.UtcNow;

            // Check if all beds in room are occupied
            var allRoomBeds = await _unitOfWork.Repository<Bed>().FindAsync(b => b.RoomId == room.Id);
            if (allRoomBeds.All(b => b.Id == bed.Id || b.Status == BedStatus.Occupied))
            {
                room.Status = RoomStatus.Full;
            }

            // Update Student isStaying
            var student = await _unitOfWork.Repository<Student>().GetByIdAsync(reg.StudentId);
            if (student != null)
            {
                student.IsStaying = true;
                student.UpdatedAt = DateTime.UtcNow;
            }

            // Automatically create Contract
            var startDate = reg.DesiredStartDate > DateTime.UtcNow ? reg.DesiredStartDate : DateTime.UtcNow;
            var endDate = startDate.AddMonths(reg.DurationMonths);
            var contract = new Contract
            {
                ContractNumber = $"HD-{DateTime.UtcNow:yyyyMM}-{reg.StudentId:D4}",
                StudentId = reg.StudentId,
                RoomId = room.Id,
                BedId = bed.Id,
                StartDate = startDate,
                EndDate = endDate,
                MonthlyRent = room.BasePrice,
                DepositAmount = request.DepositAmount ?? room.BasePrice,
                Status = ContractStatus.Active,
                Terms = "Tuân thủ nội quy ký túc xá và đóng tiền phòng đúng hạn hàng tháng."
            };

            await _unitOfWork.Repository<Contract>().AddAsync(contract);

            // Send notification to student user
            if (student?.UserId != null)
            {
                await _unitOfWork.Repository<Notification>().AddAsync(new Notification
                {
                    UserId = student.UserId,
                    Title = "Đơn đăng ký ở KTX đã được duyệt thành công!",
                    Content = $"Bạn đã được phân vào Tòa {room.Building?.Name ?? ""}, Phòng {room.RoomNumber}, Giường {bed.BedNumber}. Hợp đồng {contract.ContractNumber} đã được kích hoạt.",
                    Type = NotificationType.Registration
                });
            }
        }
        else if (request.Status == RegistrationStatus.Rejected)
        {
            var student = await _unitOfWork.Repository<Student>().GetByIdAsync(reg.StudentId);
            if (student?.UserId != null)
            {
                await _unitOfWork.Repository<Notification>().AddAsync(new Notification
                {
                    UserId = student.UserId,
                    Title = "Đơn đăng ký KTX chưa được phê duyệt",
                    Content = $"Lý do: {request.AdminNote ?? "Số lượng chỗ ở hiện tại không đủ hoặc hồ sơ chưa phù hợp."}",
                    Type = NotificationType.Registration
                });
            }
        }

        await _unitOfWork.SaveChangesAsync();
        return await MapToDtoAsync(reg);
    }

    public async Task<bool> CancelRegistrationAsync(int id)
    {
        var reg = await _unitOfWork.Repository<Registration>().GetByIdAsync(id);
        if (reg == null) throw new NotFoundException("Đơn đăng ký", id);

        if (_currentUserService.IsStudent && _currentUserService.StudentId != reg.StudentId)
        {
            throw new ForbiddenException();
        }

        if (reg.Status != RegistrationStatus.Pending)
        {
            throw new ValidationException("Chỉ có thể hủy đơn đang ở trạng thái chờ duyệt.");
        }

        reg.Status = RegistrationStatus.Cancelled;
        reg.UpdatedAt = DateTime.UtcNow;
        await _unitOfWork.SaveChangesAsync();
        return true;
    }

    private async Task<RegistrationDto> MapToDtoAsync(Registration r)
    {
        var student = await _unitOfWork.Repository<Student>().GetByIdAsync(r.StudentId);
        var building = r.PreferredBuildingId.HasValue ? await _unitOfWork.Repository<Building>().GetByIdAsync(r.PreferredBuildingId.Value) : null;
        var approvedRoom = r.ApprovedRoomId.HasValue ? await _unitOfWork.Repository<Room>().GetByIdAsync(r.ApprovedRoomId.Value) : null;
        var approvedBed = r.ApprovedBedId.HasValue ? await _unitOfWork.Repository<Bed>().GetByIdAsync(r.ApprovedBedId.Value) : null;

        return new RegistrationDto
        {
            Id = r.Id,
            StudentId = r.StudentId,
            StudentName = student?.FullName ?? string.Empty,
            StudentCode = student?.StudentCode ?? string.Empty,
            StudentPhone = student?.Phone ?? string.Empty,
            StudentGender = student?.Gender ?? string.Empty,
            StudentFaculty = student?.Faculty ?? string.Empty,
            StudentClassName = student?.ClassName ?? string.Empty,
            PreferredBuildingId = r.PreferredBuildingId,
            PreferredBuildingName = building?.Name,
            PreferredRoomType = r.PreferredRoomType,
            DesiredStartDate = r.DesiredStartDate,
            DurationMonths = r.DurationMonths,
            ReasonOrNote = r.ReasonOrNote,
            Status = r.Status,
            AdminNote = r.AdminNote,
            ApprovedRoomId = r.ApprovedRoomId,
            ApprovedRoomNumber = approvedRoom?.RoomNumber,
            ApprovedBedId = r.ApprovedBedId,
            ApprovedBedNumber = approvedBed?.BedNumber,
            ReviewedAt = r.ReviewedAt,
            CreatedAt = r.CreatedAt
        };
    }
}

