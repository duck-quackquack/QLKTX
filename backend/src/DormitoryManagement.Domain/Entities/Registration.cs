using DormitoryManagement.Domain.Common;
using DormitoryManagement.Domain.Enums;

namespace DormitoryManagement.Domain.Entities;

public class Registration : BaseEntity
{
    public int StudentId { get; set; }
    public int? PreferredBuildingId { get; set; }
    public string? PreferredRoomType { get; set; } // "2 người", "4 người", "6 người"
    public DateTime DesiredStartDate { get; set; }
    public int DurationMonths { get; set; } = 6;
    public string? ReasonOrNote { get; set; }
    public RegistrationStatus Status { get; set; } = RegistrationStatus.Pending;
    public string? AdminNote { get; set; }
    public int? ApprovedRoomId { get; set; }
    public int? ApprovedBedId { get; set; }
    public DateTime? ReviewedAt { get; set; }

    // Navigation
    public virtual Student Student { get; set; } = null!;
    public virtual Building? PreferredBuilding { get; set; }
    public virtual Room? ApprovedRoom { get; set; }
    public virtual Bed? ApprovedBed { get; set; }
}

