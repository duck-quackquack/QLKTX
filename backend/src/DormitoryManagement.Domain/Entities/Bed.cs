using DormitoryManagement.Domain.Common;
using DormitoryManagement.Domain.Enums;

namespace DormitoryManagement.Domain.Entities;

public class Bed : BaseEntity
{
    public int RoomId { get; set; }
    public string BedNumber { get; set; } = string.Empty; // e.g. "G01", "G02"
    public BedStatus Status { get; set; } = BedStatus.Available;
    public string? Notes { get; set; }

    // Navigation
    public virtual Room Room { get; set; } = null!;
    public virtual ICollection<Contract> Contracts { get; set; } = new List<Contract>();
}

