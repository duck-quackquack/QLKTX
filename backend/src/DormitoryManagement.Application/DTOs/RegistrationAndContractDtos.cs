using DormitoryManagement.Application.Common;
using DormitoryManagement.Domain.Enums;

namespace DormitoryManagement.Application.DTOs;

public class RegistrationDto
{
    public int Id { get; set; }
    public int StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string StudentCode { get; set; } = string.Empty;
    public string StudentPhone { get; set; } = string.Empty;
    public string StudentGender { get; set; } = string.Empty;
    public string StudentFaculty { get; set; } = string.Empty;
    public string StudentClassName { get; set; } = string.Empty;

    public int? PreferredBuildingId { get; set; }
    public string? PreferredBuildingName { get; set; }
    public string? PreferredRoomType { get; set; }
    public DateTime DesiredStartDate { get; set; }
    public int DurationMonths { get; set; }
    public string? ReasonOrNote { get; set; }
    public RegistrationStatus Status { get; set; }
    public string? AdminNote { get; set; }

    public int? ApprovedRoomId { get; set; }
    public string? ApprovedRoomNumber { get; set; }
    public int? ApprovedBedId { get; set; }
    public string? ApprovedBedNumber { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateRegistrationDto
{
    public int? StudentId { get; set; } // If admin creates on behalf; otherwise resolved from JWT
    public int? PreferredBuildingId { get; set; }
    public string? PreferredRoomType { get; set; } = "4 người";
    public DateTime DesiredStartDate { get; set; } = DateTime.UtcNow.AddDays(1);
    public int DurationMonths { get; set; } = 6;
    public string? ReasonOrNote { get; set; }
}

public class ReviewRegistrationDto
{
    public RegistrationStatus Status { get; set; } // Approved or Rejected
    public int? ApprovedRoomId { get; set; }
    public int? ApprovedBedId { get; set; }
    public string? AdminNote { get; set; }
    public decimal? DepositAmount { get; set; }
}

public class ContractDto
{
    public int Id { get; set; }
    public string ContractNumber { get; set; } = string.Empty;
    public int StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string StudentCode { get; set; } = string.Empty;
    public string StudentPhone { get; set; } = string.Empty;

    public int RoomId { get; set; }
    public string RoomNumber { get; set; } = string.Empty;
    public string BuildingName { get; set; } = string.Empty;

    public int BedId { get; set; }
    public string BedNumber { get; set; } = string.Empty;

    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal MonthlyRent { get; set; }
    public decimal DepositAmount { get; set; }
    public ContractStatus Status { get; set; }
    public string? Terms { get; set; }
    public DateTime? TerminatedDate { get; set; }
    public string? TerminationReason { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateContractDto
{
    public int StudentId { get; set; }
    public int RoomId { get; set; }
    public int BedId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal MonthlyRent { get; set; }
    public decimal DepositAmount { get; set; }
    public string? Terms { get; set; }
}

public class TerminateContractDto
{
    public DateTime TerminatedDate { get; set; } = DateTime.UtcNow;
    public string Reason { get; set; } = string.Empty;
    public bool RefundDeposit { get; set; } = true;
}
