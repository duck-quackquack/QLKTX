using DormitoryManagement.Application.Common;
using DormitoryManagement.Application.DTOs;
using DormitoryManagement.Application.Interfaces;
using DormitoryManagement.Domain.Entities;
using DormitoryManagement.Domain.Enums;
using DormitoryManagement.Domain.Interfaces;

namespace DormitoryManagement.Application.Services;

public class StudentService : IStudentService
{
    private readonly IUnitOfWork _unitOfWork;

    public StudentService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<PagedResult<StudentDto>> GetStudentsAsync(StudentFilterDto filter)
    {
        var query = _unitOfWork.Repository<Student>().Query();

        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
        {
            var search = filter.SearchTerm.Trim().ToLower();
            query = query.Where(s => s.FullName.ToLower().Contains(search) 
                                  || s.StudentCode.ToLower().Contains(search) 
                                  || s.Email.ToLower().Contains(search) 
                                  || s.Phone.Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(filter.Faculty))
        {
            query = query.Where(s => s.Faculty.ToLower() == filter.Faculty.Trim().ToLower());
        }

        if (!string.IsNullOrWhiteSpace(filter.Gender))
        {
            query = query.Where(s => s.Gender.ToLower() == filter.Gender.Trim().ToLower());
        }

        if (filter.IsStaying.HasValue)
        {
            query = query.Where(s => s.IsStaying == filter.IsStaying.Value);
        }

        var total = query.Count();

        // Ordering
        query = query.OrderByDescending(s => s.CreatedAt);

        // Pagination
        var items = query
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .Select(s => new StudentDto
            {
                Id = s.Id,
                UserId = s.UserId,
                StudentCode = s.StudentCode,
                FullName = s.FullName,
                DateOfBirth = s.DateOfBirth,
                Gender = s.Gender,
                Phone = s.Phone,
                Email = s.Email,
                Address = s.Address,
                Faculty = s.Faculty,
                ClassName = s.ClassName,
                CitizenId = s.CitizenId,
                AvatarUrl = s.AvatarUrl,
                IsStaying = s.IsStaying,
                CreatedAt = s.CreatedAt,
                CurrentContractId = s.Contracts.Where(c => c.Status == ContractStatus.Active).Select(c => (int?)c.Id).FirstOrDefault(),
                CurrentBuildingName = s.Contracts.Where(c => c.Status == ContractStatus.Active).Select(c => c.Room.Building.Name).FirstOrDefault(),
                CurrentRoomNumber = s.Contracts.Where(c => c.Status == ContractStatus.Active).Select(c => c.Room.RoomNumber).FirstOrDefault(),
                CurrentBedNumber = s.Contracts.Where(c => c.Status == ContractStatus.Active).Select(c => c.Bed.BedNumber).FirstOrDefault()
            })
            .ToList();

        return new PagedResult<StudentDto>(items, total, filter.Page, filter.PageSize);
    }

    public async Task<StudentDto> GetByIdAsync(int id)
    {
        var student = await _unitOfWork.Repository<Student>().GetByIdAsync(id);
        if (student == null) throw new NotFoundException("Sinh viên", id);

        var activeContract = (await _unitOfWork.Repository<Contract>()
            .FindAsync(c => c.StudentId == id && c.Status == ContractStatus.Active)).FirstOrDefault();

        Room? room = null;
        Bed? bed = null;
        Building? building = null;

        if (activeContract != null)
        {
            room = await _unitOfWork.Repository<Room>().GetByIdAsync(activeContract.RoomId);
            bed = await _unitOfWork.Repository<Bed>().GetByIdAsync(activeContract.BedId);
            if (room != null)
            {
                building = await _unitOfWork.Repository<Building>().GetByIdAsync(room.BuildingId);
            }
        }

        return new StudentDto
        {
            Id = student.Id,
            UserId = student.UserId,
            StudentCode = student.StudentCode,
            FullName = student.FullName,
            DateOfBirth = student.DateOfBirth,
            Gender = student.Gender,
            Phone = student.Phone,
            Email = student.Email,
            Address = student.Address,
            Faculty = student.Faculty,
            ClassName = student.ClassName,
            CitizenId = student.CitizenId,
            AvatarUrl = student.AvatarUrl,
            IsStaying = student.IsStaying,
            CreatedAt = student.CreatedAt,
            CurrentContractId = activeContract?.Id,
            CurrentBuildingName = building?.Name,
            CurrentRoomNumber = room?.RoomNumber,
            CurrentBedNumber = bed?.BedNumber
        };
    }

    public async Task<StudentDto> GetByStudentCodeAsync(string studentCode)
    {
        var students = await _unitOfWork.Repository<Student>().FindAsync(s => s.StudentCode.ToLower() == studentCode.ToLower());
        var student = students.FirstOrDefault();
        if (student == null) throw new NotFoundException($"Không tìm thấy sinh viên có mã {studentCode}");

        return await GetByIdAsync(student.Id);
    }

    public async Task<StudentDto> CreateAsync(CreateStudentDto request)
    {
        var existing = await _unitOfWork.Repository<Student>().FindAsync(s => s.StudentCode.ToLower() == request.StudentCode.Trim().ToLower());
        if (existing.Any())
        {
            throw new ConflictException($"Mã sinh viên {request.StudentCode} đã tồn tại trong hệ thống.");
        }

        int? userId = null;
        if (request.CreateAccount)
        {
            var existingUser = await _unitOfWork.Repository<User>().FindAsync(u => u.Username.ToLower() == request.StudentCode.Trim().ToLower());
            if (!existingUser.Any())
            {
                var user = new User
                {
                    Username = request.StudentCode.Trim(),
                    Email = request.Email.Trim(),
                    FullName = request.FullName.Trim(),
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.InitialPassword ?? "Ktx@123456"),
                    Phone = request.Phone,
                    Role = UserRole.Student,
                    IsActive = true
                };
                var createdUser = await _unitOfWork.Repository<User>().AddAsync(user);
                await _unitOfWork.SaveChangesAsync();
                userId = createdUser.Id;
            }
        }

        var student = new Student
        {
            UserId = userId,
            StudentCode = request.StudentCode.Trim(),
            FullName = request.FullName.Trim(),
            DateOfBirth = request.DateOfBirth,
            Gender = request.Gender,
            Phone = request.Phone,
            Email = request.Email,
            Address = request.Address,
            Faculty = request.Faculty,
            ClassName = request.ClassName,
            CitizenId = request.CitizenId,
            AvatarUrl = request.AvatarUrl,
            IsStaying = false
        };

        var created = await _unitOfWork.Repository<Student>().AddAsync(student);
        await _unitOfWork.SaveChangesAsync();

        return await GetByIdAsync(created.Id);
    }

    public async Task<StudentDto> UpdateAsync(int id, UpdateStudentDto request)
    {
        var student = await _unitOfWork.Repository<Student>().GetByIdAsync(id);
        if (student == null) throw new NotFoundException("Sinh viên", id);

        student.FullName = request.FullName.Trim();
        student.DateOfBirth = request.DateOfBirth;
        student.Gender = request.Gender;
        student.Phone = request.Phone;
        student.Email = request.Email;
        student.Address = request.Address;
        student.Faculty = request.Faculty;
        student.ClassName = request.ClassName;
        student.CitizenId = request.CitizenId;
        if (!string.IsNullOrEmpty(request.AvatarUrl))
        {
            student.AvatarUrl = request.AvatarUrl;
        }
        student.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Repository<Student>().UpdateAsync(student);
        await _unitOfWork.SaveChangesAsync();

        return await GetByIdAsync(student.Id);
    }

    public async Task DeleteAsync(int id)
    {
        var student = await _unitOfWork.Repository<Student>().GetByIdAsync(id);
        if (student == null) throw new NotFoundException("Sinh viên", id);

        if (student.IsStaying)
        {
            throw new ValidationException("Không thể xóa sinh viên đang lưu trú trong ký túc xá. Cần trả phòng và chấm dứt hợp đồng trước.");
        }

        await _unitOfWork.Repository<Student>().DeleteAsync(student);

        if (student.UserId.HasValue)
        {
            var user = await _unitOfWork.Repository<User>().GetByIdAsync(student.UserId.Value);
            if (user != null)
            {
                await _unitOfWork.Repository<User>().DeleteAsync(user);
            }
        }

        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<List<StudentDto>> GetAllActiveStayingAsync()
    {
        var students = await _unitOfWork.Repository<Student>().FindAsync(s => s.IsStaying);
        return students.Select(s => new StudentDto
        {
            Id = s.Id,
            StudentCode = s.StudentCode,
            FullName = s.FullName,
            Phone = s.Phone,
            Email = s.Email,
            Faculty = s.Faculty,
            ClassName = s.ClassName,
            IsStaying = s.IsStaying
        }).ToList();
    }
}

