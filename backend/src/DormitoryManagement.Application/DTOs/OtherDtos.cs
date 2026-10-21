using DormitoryManagement.Application.Common;
using DormitoryManagement.Domain.Enums;

namespace DormitoryManagement.Application.DTOs;

public class ViolationDto
{
    public int Id { get; set; }
    public int StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string StudentCode { get; set; } = string.Empty;
    public string StudentPhone { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ViolationType { get; set; } = string.Empty;
    public decimal PenaltyAmount { get; set; }
    public DateTime ViolationDate { get; set; }
    public ViolationStatus Status { get; set; }
    public string? ResolutionNotes { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateViolationDto
{
    public int StudentId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ViolationType { get; set; } = "Kỷ luật phòng";
    public decimal PenaltyAmount { get; set; } = 0;
    public DateTime ViolationDate { get; set; } = DateTime.UtcNow;
}

public class UpdateViolationStatusDto
{
    public ViolationStatus Status { get; set; }
    public string? ResolutionNotes { get; set; }
}

public class RepairRequestDto
{
    public int Id { get; set; }
    public int StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string StudentCode { get; set; } = string.Empty;
    public string StudentPhone { get; set; } = string.Empty;

    public int RoomId { get; set; }
    public string RoomNumber { get; set; } = string.Empty;
    public string BuildingName { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public RepairPriority Priority { get; set; }
    public RepairStatus Status { get; set; }
    public decimal RepairCost { get; set; }
    public string? StaffNotes { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateRepairRequestDto
{
    public int? RoomId { get; set; } // If null, auto-resolved from active student contract
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public RepairPriority Priority { get; set; } = RepairPriority.Medium;
}

public class UpdateRepairStatusDto
{
    public RepairStatus Status { get; set; }
    public decimal RepairCost { get; set; } = 0;
    public string? StaffNotes { get; set; }
}

public class NotificationDto
{
    public int Id { get; set; }
    public int? UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public NotificationType Type { get; set; }
    public bool IsRead { get; set; }
    public string? ActionUrl { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateNotificationDto
{
    public int? UserId { get; set; } // null = to all
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public NotificationType Type { get; set; } = NotificationType.General;
    public string? ActionUrl { get; set; }
}

public class DashboardStatisticsDto
{
    public int TotalStudents { get; set; }
    public int ActiveStayingStudents { get; set; }
    public int TotalBuildings { get; set; }
    public int TotalRooms { get; set; }
    public int TotalBeds { get; set; }
    public int OccupiedBeds { get; set; }
    public int AvailableBeds { get; set; }
    public double OccupancyRate { get; set; } // %

    public decimal MonthlyRevenue { get; set; }
    public decimal TotalUnpaidAmount { get; set; }
    public int PendingRegistrations { get; set; }
    public int PendingRepairs { get; set; }
    public int PendingViolations { get; set; }

    public List<MonthlyRevenueItemDto> MonthlyRevenues { get; set; } = new();
    public List<BuildingOccupancyDto> BuildingOccupancies { get; set; } = new();
    public List<RecentActivityDto> RecentActivities { get; set; } = new();
}

public class MonthlyRevenueItemDto
{
    public string MonthYear { get; set; } = string.Empty; // e.g. "09/2026"
    public decimal TotalBilled { get; set; }
    public decimal TotalCollected { get; set; }
}

public class BuildingOccupancyDto
{
    public string BuildingCode { get; set; } = string.Empty;
    public string BuildingName { get; set; } = string.Empty;
    public int TotalBeds { get; set; }
    public int OccupiedBeds { get; set; }
    public int AvailableBeds { get; set; }
    public double Rate { get; set; }
}

public class RecentActivityDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public DateTime Time { get; set; }
}
