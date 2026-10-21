using DormitoryManagement.Domain.Common;
using DormitoryManagement.Domain.Enums;

namespace DormitoryManagement.Domain.Entities;

public class Contract : BaseEntity
{
    public string ContractNumber { get; set; } = string.Empty; // e.g. "HD-2026-001"
    public int StudentId { get; set; }
    public int RoomId { get; set; }
    public int BedId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal MonthlyRent { get; set; }
    public decimal DepositAmount { get; set; }
    public ContractStatus Status { get; set; } = ContractStatus.Active;
    public string? Terms { get; set; }
    public DateTime? TerminatedDate { get; set; }
    public string? TerminationReason { get; set; }

    // Navigation
    public virtual Student Student { get; set; } = null!;
    public virtual Room Room { get; set; } = null!;
    public virtual Bed Bed { get; set; } = null!;
    public virtual ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
}

