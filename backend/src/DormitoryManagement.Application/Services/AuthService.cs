using DormitoryManagement.Application.Common;
using DormitoryManagement.Application.DTOs;
using DormitoryManagement.Application.Interfaces;
using DormitoryManagement.Domain.Entities;
using DormitoryManagement.Domain.Enums;
using DormitoryManagement.Domain.Interfaces;

namespace DormitoryManagement.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IJwtService _jwtService;
    private readonly ICurrentUserService _currentUserService;

    public AuthService(IUnitOfWork unitOfWork, IJwtService jwtService, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _jwtService = jwtService;
        _currentUserService = currentUserService;
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request)
    {
        var allUsers = await _unitOfWork.Repository<User>().GetAllAsync();
        var user = allUsers.FirstOrDefault(u => string.Equals(u.Username, request.Username.Trim(), StringComparison.OrdinalIgnoreCase));

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedException("Tên đăng nhập hoặc mật khẩu không chính xác.");
        }

        if (!user.IsActive)
        {
            throw new UnauthorizedException("Tài khoản đã bị khóa. Vui lòng liên hệ ban quản lý.");
        }

        var allStudents = await _unitOfWork.Repository<Student>().GetAllAsync();
        var student = allStudents.FirstOrDefault(s => s.UserId == user.Id);

        var token = _jwtService.GenerateToken(user, student?.Id, student?.StudentCode);
        var refreshToken = _jwtService.GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        await _unitOfWork.SaveChangesAsync();

        return new AuthResponseDto
        {
            Token = token,
            RefreshToken = refreshToken,
            Expiry = DateTime.UtcNow.AddHours(12),
            User = new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                FullName = user.FullName,
                Phone = user.Phone,
                AvatarUrl = user.AvatarUrl,
                Role = user.Role,
                StudentId = student?.Id,
                StudentCode = student?.StudentCode
            }
        };
    }

    public async Task<AuthResponseDto> RegisterStudentAsync(RegisterRequestDto request)
    {
        var username = request.Username.Trim();
        var email = request.Email.Trim();
        var studentCode = request.StudentCode.Trim();

        var allUsers = await _unitOfWork.Repository<User>().GetAllAsync();
        if (allUsers.Any(u => string.Equals(u.Username, username, StringComparison.OrdinalIgnoreCase) || 
                              string.Equals(u.Email, email, StringComparison.OrdinalIgnoreCase)))
        {
            throw new ConflictException("Tên đăng nhập hoặc Email đã tồn tại trong hệ thống.");
        }

        var allStudents = await _unitOfWork.Repository<Student>().GetAllAsync();
        if (allStudents.Any(s => string.Equals(s.StudentCode, studentCode, StringComparison.OrdinalIgnoreCase)))
        {
            throw new ConflictException("Mã sinh viên này đã được đăng ký trong hệ thống.");
        }

        var user = new User
        {
            Username = username,
            Email = email,
            FullName = request.FullName.Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Phone = request.Phone?.Trim(),
            Role = UserRole.Student,
            IsActive = true
        };

        var createdUser = await _unitOfWork.Repository<User>().AddAsync(user);
        await _unitOfWork.SaveChangesAsync();

        var student = new Student
        {
            UserId = createdUser.Id,
            StudentCode = studentCode,
            FullName = request.FullName.Trim(),
            DateOfBirth = request.DateOfBirth,
            Gender = request.Gender,
            Phone = request.Phone?.Trim() ?? string.Empty,
            Email = email,
            Address = request.Address?.Trim() ?? string.Empty,
            Faculty = request.Faculty?.Trim() ?? string.Empty,
            ClassName = request.ClassName?.Trim() ?? string.Empty,
            IsStaying = false
        };

        var createdStudent = await _unitOfWork.Repository<Student>().AddAsync(student);
        await _unitOfWork.SaveChangesAsync();

        var token = _jwtService.GenerateToken(createdUser, createdStudent.Id, createdStudent.StudentCode);
        var refreshToken = _jwtService.GenerateRefreshToken();

        createdUser.RefreshToken = refreshToken;
        createdUser.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        await _unitOfWork.SaveChangesAsync();

        return new AuthResponseDto
        {
            Token = token,
            RefreshToken = refreshToken,
            Expiry = DateTime.UtcNow.AddHours(12),
            User = new UserDto
            {
                Id = createdUser.Id,
                Username = createdUser.Username,
                Email = createdUser.Email,
                FullName = createdUser.FullName,
                Phone = createdUser.Phone,
                Role = createdUser.Role,
                StudentId = createdStudent.Id,
                StudentCode = createdStudent.StudentCode
            }
        };
    }

    public async Task<AuthResponseDto> RefreshTokenAsync(string token, string refreshToken)
    {
        var users = await _unitOfWork.Repository<User>().FindAsync(u => u.RefreshToken == refreshToken && u.RefreshTokenExpiryTime > DateTime.UtcNow);
        var user = users.FirstOrDefault();
        if (user == null)
        {
            throw new UnauthorizedException("Phiên làm việc hoặc refresh token không hợp lệ.");
        }

        var students = await _unitOfWork.Repository<Student>().FindAsync(s => s.UserId == user.Id);
        var student = students.FirstOrDefault();

        var newToken = _jwtService.GenerateToken(user, student?.Id, student?.StudentCode);
        var newRefreshToken = _jwtService.GenerateRefreshToken();

        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        await _unitOfWork.SaveChangesAsync();

        return new AuthResponseDto
        {
            Token = newToken,
            RefreshToken = newRefreshToken,
            Expiry = DateTime.UtcNow.AddHours(12),
            User = new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                FullName = user.FullName,
                Phone = user.Phone,
                AvatarUrl = user.AvatarUrl,
                Role = user.Role,
                StudentId = student?.Id,
                StudentCode = student?.StudentCode
            }
        };
    }

    public async Task<UserDto> GetCurrentUserAsync()
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            throw new UnauthorizedException();
        }

        var user = await _unitOfWork.Repository<User>().GetByIdAsync(userId.Value);
        if (user == null)
        {
            throw new NotFoundException("Người dùng không tồn tại.");
        }

        var students = await _unitOfWork.Repository<Student>().FindAsync(s => s.UserId == user.Id);
        var student = students.FirstOrDefault();

        return new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            FullName = user.FullName,
            Phone = user.Phone,
            AvatarUrl = user.AvatarUrl,
            Role = user.Role,
            StudentId = student?.Id,
            StudentCode = student?.StudentCode
        };
    }

    public async Task<bool> ChangePasswordAsync(ChangePasswordDto request)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue) throw new UnauthorizedException();

        var user = await _unitOfWork.Repository<User>().GetByIdAsync(userId.Value);
        if (user == null) throw new NotFoundException("Người dùng không tồn tại.");

        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
        {
            throw new ValidationException("Mật khẩu hiện tại không đúng.");
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await _unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<UserDto> UpdateProfileAsync(UpdateProfileDto request)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue) throw new UnauthorizedException();

        var user = await _unitOfWork.Repository<User>().GetByIdAsync(userId.Value);
        if (user == null) throw new NotFoundException("Người dùng không tồn tại.");

        user.FullName = request.FullName;
        user.Email = request.Email;
        user.Phone = request.Phone;
        if (!string.IsNullOrEmpty(request.AvatarUrl))
        {
            user.AvatarUrl = request.AvatarUrl;
        }
        user.UpdatedAt = DateTime.UtcNow;

        var students = await _unitOfWork.Repository<Student>().FindAsync(s => s.UserId == user.Id);
        var student = students.FirstOrDefault();
        if (student != null)
        {
            student.FullName = request.FullName;
            student.Email = request.Email;
            student.Phone = request.Phone ?? student.Phone;
            if (!string.IsNullOrEmpty(request.AvatarUrl))
            {
                student.AvatarUrl = request.AvatarUrl;
            }
            student.UpdatedAt = DateTime.UtcNow;
        }

        await _unitOfWork.SaveChangesAsync();

        return new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            FullName = user.FullName,
            Phone = user.Phone,
            AvatarUrl = user.AvatarUrl,
            Role = user.Role,
            StudentId = student?.Id,
            StudentCode = student?.StudentCode
        };
    }
}
