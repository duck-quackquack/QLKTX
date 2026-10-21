using DormitoryManagement.Application.Common;
using DormitoryManagement.Application.DTOs;
using DormitoryManagement.Application.Interfaces;
using DormitoryManagement.Domain.Entities;
using DormitoryManagement.Domain.Enums;
using DormitoryManagement.Domain.Interfaces;

namespace DormitoryManagement.Application.Services;

public class ContractService : IContractService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public ContractService(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<PagedResult<ContractDto>> GetAllAsync(PaginationFilter filter, ContractStatus? status = null)
    {
        var query = _unitOfWork.Repository<Contract>().Query();

        if (status.HasValue)
        {
            query = query.Where(c => c.Status == status.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
        {
            var search = filter.SearchTerm.Trim().ToLower();
            query = query.Where(c => c.ContractNumber.ToLower().Contains(search) 
                                  || c.Student.FullName.ToLower().Contains(search) 
                                  || c.Student.StudentCode.ToLower().Contains(search));
        }

        var total = query.Count();

        var list = query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToList();

        var result = new List<ContractDto>();
        foreach (var c in list)
        {
            result.Add(await MapToDtoAsync(c));
        }

        return new PagedResult<ContractDto>(result, total, filter.Page, filter.PageSize);
    }

    public async Task<ContractDto> GetByIdAsync(int id)
    {
        var contract = await _unitOfWork.Repository<Contract>().GetByIdAsync(id);
        if (contract == null) throw new NotFoundException("Hợp đồng", id);

        if (_currentUserService.IsStudent && _currentUserService.StudentId != contract.StudentId)
        {
            throw new ForbiddenException();
        }

        return await MapToDtoAsync(contract);
    }

    public async Task<ContractDto?> GetMyActiveContractAsync()
    {
        var studentId = _currentUserService.StudentId;
        if (!studentId.HasValue) return null;

        var contracts = await _unitOfWork.Repository<Contract>()
            .FindAsync(c => c.StudentId == studentId.Value && c.Status == ContractStatus.Active);
        var contract = contracts.FirstOrDefault();
        if (contract == null) return null;

        return await MapToDtoAsync(contract);
    }

    public async Task<List<ContractDto>> GetMyContractsAsync()
    {
        var studentId = _currentUserService.StudentId;
        if (!studentId.HasValue)
        {
            throw new UnauthorizedException("Chỉ tài khoản sinh viên mới có quyền xem danh sách hợp đồng của mình.");
        }

        var contracts = (await _unitOfWork.Repository<Contract>()
            .FindAsync(c => c.StudentId == studentId.Value))
            .OrderByDescending(c => c.CreatedAt)
            .ToList();

        var result = new List<ContractDto>();
        foreach (var c in contracts)
        {
            result.Add(await MapToDtoAsync(c));
        }
        return result;
    }

    public async Task<ContractDto> CreateAsync(CreateContractDto request)
    {
        var student = await _unitOfWork.Repository<Student>().GetByIdAsync(request.StudentId);
        if (student == null) throw new NotFoundException("Sinh viên", request.StudentId);

        var room = await _unitOfWork.Repository<Room>().GetByIdAsync(request.RoomId);
        if (room == null) throw new NotFoundException("Phòng", request.RoomId);

        var bed = await _unitOfWork.Repository<Bed>().GetByIdAsync(request.BedId);
        if (bed == null || bed.RoomId != room.Id) throw new ValidationException("Giường được chọn không hợp lệ.");

        if (bed.Status != BedStatus.Available)
        {
            throw new ConflictException("Giường này hiện đang có người ở hoặc đang bảo trì.");
        }

        var contract = new Contract
        {
            ContractNumber = $"HD-{DateTime.UtcNow:yyyyMM}-{request.StudentId:D4}",
            StudentId = request.StudentId,
            RoomId = request.RoomId,
            BedId = request.BedId,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            MonthlyRent = request.MonthlyRent,
            DepositAmount = request.DepositAmount,
            Status = ContractStatus.Active,
            Terms = request.Terms ?? "Tuân thủ đầy đủ quy định của ký túc xá."
        };

        var created = await _unitOfWork.Repository<Contract>().AddAsync(contract);

        // Update bed
        bed.Status = BedStatus.Occupied;
        bed.UpdatedAt = DateTime.UtcNow;

        student.IsStaying = true;
        student.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.SaveChangesAsync();
        return await MapToDtoAsync(created);
    }

    public async Task<ContractDto> TerminateAsync(int id, TerminateContractDto request)
    {
        var contract = await _unitOfWork.Repository<Contract>().GetByIdAsync(id);
        if (contract == null) throw new NotFoundException("Hợp đồng", id);

        if (contract.Status == ContractStatus.Terminated || contract.Status == ContractStatus.Expired)
        {
            throw new ValidationException("Hợp đồng này đã kết thúc trước đó.");
        }

        contract.Status = ContractStatus.Terminated;
        contract.TerminatedDate = request.TerminatedDate;
        contract.TerminationReason = request.Reason;
        contract.UpdatedAt = DateTime.UtcNow;

        // Free the bed
        var bed = await _unitOfWork.Repository<Bed>().GetByIdAsync(contract.BedId);
        if (bed != null)
        {
            bed.Status = BedStatus.Available;
            bed.UpdatedAt = DateTime.UtcNow;
        }

        // Free room full status if applicable
        var room = await _unitOfWork.Repository<Room>().GetByIdAsync(contract.RoomId);
        if (room != null && room.Status == RoomStatus.Full)
        {
            room.Status = RoomStatus.Available;
            room.UpdatedAt = DateTime.UtcNow;
        }

        // Check if student has any other active contracts
        var otherActive = await _unitOfWork.Repository<Contract>()
            .FindAsync(c => c.StudentId == contract.StudentId && c.Id != id && c.Status == ContractStatus.Active);
        if (!otherActive.Any())
        {
            var student = await _unitOfWork.Repository<Student>().GetByIdAsync(contract.StudentId);
            if (student != null)
            {
                student.IsStaying = false;
                student.UpdatedAt = DateTime.UtcNow;
            }
        }

        await _unitOfWork.SaveChangesAsync();
        return await MapToDtoAsync(contract);
    }

    public async Task<ContractDto> RenewAsync(int id, DateTime newEndDate)
    {
        var contract = await _unitOfWork.Repository<Contract>().GetByIdAsync(id);
        if (contract == null) throw new NotFoundException("Hợp đồng", id);

        if (newEndDate <= contract.EndDate)
        {
            throw new ValidationException("Ngày gia hạn mới phải sau ngày kết thúc hiện tại.");
        }

        contract.EndDate = newEndDate;
        contract.Status = ContractStatus.Active;
        contract.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.SaveChangesAsync();
        return await MapToDtoAsync(contract);
    }

    private async Task<ContractDto> MapToDtoAsync(Contract c)
    {
        var student = await _unitOfWork.Repository<Student>().GetByIdAsync(c.StudentId);
        var room = await _unitOfWork.Repository<Room>().GetByIdAsync(c.RoomId);
        var bed = await _unitOfWork.Repository<Bed>().GetByIdAsync(c.BedId);
        var building = room != null ? await _unitOfWork.Repository<Building>().GetByIdAsync(room.BuildingId) : null;

        return new ContractDto
        {
            Id = c.Id,
            ContractNumber = c.ContractNumber,
            StudentId = c.StudentId,
            StudentName = student?.FullName ?? string.Empty,
            StudentCode = student?.StudentCode ?? string.Empty,
            StudentPhone = student?.Phone ?? string.Empty,
            RoomId = c.RoomId,
            RoomNumber = room?.RoomNumber ?? string.Empty,
            BuildingName = building?.Name ?? string.Empty,
            BedId = c.BedId,
            BedNumber = bed?.BedNumber ?? string.Empty,
            StartDate = c.StartDate,
            EndDate = c.EndDate,
            MonthlyRent = c.MonthlyRent,
            DepositAmount = c.DepositAmount,
            Status = c.Status,
            Terms = c.Terms,
            TerminatedDate = c.TerminatedDate,
            TerminationReason = c.TerminationReason,
            CreatedAt = c.CreatedAt
        };
    }
}

