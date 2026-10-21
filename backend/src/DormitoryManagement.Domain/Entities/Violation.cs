using DormitoryManagement.Domain.Common;
using DormitoryManagement.Domain.Enums;

namespace DormitoryManagement.Domain.Entities;

public class Violation : BaseEntity
{
    public int StudentId { get; set; }
    public string Title { get; set; } = string.Empty; // e.g. "Gây ồn ào sau 23h"
    public string Description { get; set; } = string.Empty;
    public string ViolationType { get; set; } = "Kỷ luật phòng";
    public decimal PenaltyAmount { get; set; } = 0;
    public DateTime ViolationDate { get; set; } = DateTime.UtcNow;
    public ViolationStatus Status { get; set; } = ViolationStatus.Pending;
    public string? ResolutionNotes { get; set; }
    public string? CreatedBy { get; set; }

    // Navigation
    public virtual Student Student { get; set; } = null!;
}

