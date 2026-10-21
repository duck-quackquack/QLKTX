using DormitoryManagement.Application.Common;

namespace DormitoryManagement.Application.DTOs;

public class StudentDto
{
    public int Id { get; set; }
    public int? UserId { get; set; }
    public string StudentCode { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public string Gender { get; set; } = "Nam";
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Faculty { get; set; } = string.Empty;
    public string ClassName { get; set; } = string.Empty;
    public string? CitizenId { get; set; }
    public string? AvatarUrl { get; set; }
    public bool IsStaying { get; set; }
    public DateTime CreatedAt { get; set; }

    // Current room/bed if staying
    public string? CurrentBuildingName { get; set; }
    public string? CurrentRoomNumber { get; set; }
    public string? CurrentBedNumber { get; set; }
    public int? CurrentContractId { get; set; }
}

public class CreateStudentDto
{
    public string StudentCode { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public string Gender { get; set; } = "Nam";
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Faculty { get; set; } = string.Empty;
    public string ClassName { get; set; } = string.Empty;
    public string? CitizenId { get; set; }
    public string? AvatarUrl { get; set; }
    public bool CreateAccount { get; set; } = true;
    public string? InitialPassword { get; set; }
}

public class UpdateStudentDto
{
    public string FullName { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public string Gender { get; set; } = "Nam";
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Faculty { get; set; } = string.Empty;
    public string ClassName { get; set; } = string.Empty;
    public string? CitizenId { get; set; }
    public string? AvatarUrl { get; set; }
}

public class StudentFilterDto : PaginationFilter
{
    public string? Faculty { get; set; }
    public string? Gender { get; set; }
    public bool? IsStaying { get; set; }
}
