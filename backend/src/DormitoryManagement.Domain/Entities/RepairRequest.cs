using DormitoryManagement.Domain.Common;
using DormitoryManagement.Domain.Enums;

namespace DormitoryManagement.Domain.Entities;

public class RepairRequest : BaseEntity
{
    public int StudentId { get; set; }
    public int RoomId { get; set; }
    public string Title { get; set; } = string.Empty; // e.g. "Hỏng bóng đèn tuýp"
    public string Description { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public RepairPriority Priority { get; set; } = RepairPriority.Medium;
    public RepairStatus Status { get; set; } = RepairStatus.Pending;
    public decimal RepairCost { get; set; } = 0;
    public string? StaffNotes { get; set; }
    public DateTime? CompletedAt { get; set; }

    // Navigation
    public virtual Student Student { get; set; } = null!;
    public virtual Room Room { get; set; } = null!;
}

