using DormitoryManagement.Application.Common;
using DormitoryManagement.Application.DTOs;
using DormitoryManagement.Domain.Entities;
using DormitoryManagement.Domain.Enums;

namespace DormitoryManagement.Application.Interfaces;

public interface ICurrentUserService
{
    int? UserId { get; }
    string? Username { get; }
    string? Role { get; }
    int? StudentId { get; }
    bool IsAdmin { get; }
    bool IsStaff { get; }
    bool IsStudent { get; }
}

public interface IJwtService
{
    string GenerateToken(User user, int? studentId = null, string? studentCode = null);
    string GenerateRefreshToken();
}

public interface IAuthService
{
    Task<AuthResponseDto> LoginAsync(LoginRequestDto request);
    Task<AuthResponseDto> RegisterStudentAsync(RegisterRequestDto request);
    Task<AuthResponseDto> RefreshTokenAsync(string token, string refreshToken);
    Task<UserDto> GetCurrentUserAsync();
    Task<bool> ChangePasswordAsync(ChangePasswordDto request);
    Task<UserDto> UpdateProfileAsync(UpdateProfileDto request);
}

public interface IStudentService
{
    Task<PagedResult<StudentDto>> GetStudentsAsync(StudentFilterDto filter);
    Task<StudentDto> GetByIdAsync(int id);
    Task<StudentDto> GetByStudentCodeAsync(string studentCode);
    Task<StudentDto> CreateAsync(CreateStudentDto request);
    Task<StudentDto> UpdateAsync(int id, UpdateStudentDto request);
    Task DeleteAsync(int id);
    Task<List<StudentDto>> GetAllActiveStayingAsync();
}

public interface IBuildingService
{
    Task<List<BuildingDto>> GetAllAsync();
    Task<BuildingDto> GetByIdAsync(int id);
    Task<BuildingDto> CreateAsync(CreateBuildingDto request);
    Task<BuildingDto> UpdateAsync(int id, UpdateBuildingDto request);
    Task DeleteAsync(int id);
}

public interface IRoomService
{
    Task<PagedResult<RoomDto>> GetRoomsAsync(RoomFilterDto filter);
    Task<List<RoomDto>> GetRoomsByBuildingAsync(int buildingId);
    Task<RoomDto> GetByIdAsync(int id);
    Task<RoomDto> CreateAsync(CreateRoomDto request);
    Task<RoomDto> UpdateAsync(int id, UpdateRoomDto request);
    Task DeleteAsync(int id);
    Task<BedDto> AddBedAsync(int roomId, string bedNumber, string? notes);
    Task<BedDto> UpdateBedStatusAsync(int bedId, BedStatus status, string? notes);
    Task DeleteBedAsync(int bedId);
    Task<List<BedDto>> GetAvailableBedsAsync(int? buildingId = null);
}

public interface IRegistrationService
{
    Task<PagedResult<RegistrationDto>> GetAllAsync(PaginationFilter filter, RegistrationStatus? status = null);
    Task<List<RegistrationDto>> GetMyRegistrationsAsync();
    Task<RegistrationDto> GetByIdAsync(int id);
    Task<RegistrationDto> SubmitRegistrationAsync(CreateRegistrationDto request);
    Task<RegistrationDto> ReviewRegistrationAsync(int id, ReviewRegistrationDto request);
    Task<bool> CancelRegistrationAsync(int id);
}

public interface IContractService
{
    Task<PagedResult<ContractDto>> GetAllAsync(PaginationFilter filter, ContractStatus? status = null);
    Task<ContractDto> GetByIdAsync(int id);
    Task<ContractDto?> GetMyActiveContractAsync();
    Task<List<ContractDto>> GetMyContractsAsync();
    Task<ContractDto> CreateAsync(CreateContractDto request);
    Task<ContractDto> TerminateAsync(int id, TerminateContractDto request);
    Task<ContractDto> RenewAsync(int id, DateTime newEndDate);
}

public interface IMeterReadingService
{
    Task<PagedResult<MeterReadingDto>> GetAllAsync(PaginationFilter filter, int? roomId = null, int? month = null, int? year = null);
    Task<MeterReadingDto> GetByIdAsync(int id);
    Task<MeterReadingDto> RecordReadingAsync(CreateMeterReadingDto request);
    Task<MeterReadingDto?> GetPreviousReadingAsync(int roomId, int currentMonth, int currentYear);
}

public interface IInvoiceService
{
    Task<PagedResult<InvoiceDto>> GetAllAsync(PaginationFilter filter, InvoiceStatus? status = null, int? month = null, int? year = null);
    Task<InvoiceDto> GetByIdAsync(int id);
    Task<List<InvoiceDto>> GetMyInvoicesAsync();
    Task<InvoiceDto> CreateAsync(CreateInvoiceDto request);
    Task<int> GenerateMonthlyInvoicesAsync(GenerateMonthlyInvoicesDto request);
    Task<bool> CancelInvoiceAsync(int id, string? reason);
}

public interface IPaymentService
{
    Task<PagedResult<PaymentDto>> GetAllAsync(PaginationFilter filter);
    Task<PaymentDto> GetByIdAsync(int id);
    Task<List<PaymentDto>> GetMyPaymentsAsync();
    Task<PaymentDto> RecordPaymentAsync(CreatePaymentDto request);
}

public interface IViolationService
{
    Task<PagedResult<ViolationDto>> GetAllAsync(PaginationFilter filter, ViolationStatus? status = null);
    Task<ViolationDto> GetByIdAsync(int id);
    Task<List<ViolationDto>> GetMyViolationsAsync();
    Task<ViolationDto> CreateAsync(CreateViolationDto request);
    Task<ViolationDto> UpdateStatusAsync(int id, UpdateViolationStatusDto request);
    Task DeleteAsync(int id);
}

public interface IRepairRequestService
{
    Task<PagedResult<RepairRequestDto>> GetAllAsync(PaginationFilter filter, RepairStatus? status = null);
    Task<RepairRequestDto> GetByIdAsync(int id);
    Task<List<RepairRequestDto>> GetMyRequestsAsync();
    Task<RepairRequestDto> CreateAsync(CreateRepairRequestDto request);
    Task<RepairRequestDto> UpdateStatusAsync(int id, UpdateRepairStatusDto request);
}

public interface INotificationService
{
    Task<List<NotificationDto>> GetMyNotificationsAsync();
    Task<int> GetUnreadCountAsync();
    Task<bool> MarkAsReadAsync(int id);
    Task<bool> MarkAllAsReadAsync();
    Task<NotificationDto> CreateNotificationAsync(CreateNotificationDto request);
}

public interface IDashboardService
{
    Task<DashboardStatisticsDto> GetStatisticsAsync();
}
