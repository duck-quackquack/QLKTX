using DormitoryManagement.Domain.Common;
using DormitoryManagement.Domain.Enums;

namespace DormitoryManagement.Domain.Entities;

public class Invoice : BaseEntity
{
    public string InvoiceCode { get; set; } = string.Empty; // e.g. "INV-202609-001"
    public int StudentId { get; set; }
    public int ContractId { get; set; }
    public int Month { get; set; }
    public int Year { get; set; }

    public decimal RoomFee { get; set; }
    public decimal ElectricityFee { get; set; }
    public decimal WaterFee { get; set; }
    public decimal ServiceFee { get; set; } = 30000; // Internet / rác
    public decimal OtherFee { get; set; } = 0;
    public string? OtherFeeDescription { get; set; }

    public decimal TotalAmount => RoomFee + ElectricityFee + WaterFee + ServiceFee + OtherFee;
    public decimal PaidAmount { get; set; } = 0;
    public decimal RemainingAmount => Math.Max(0, TotalAmount - PaidAmount);

    public DateTime DueDate { get; set; }
    public InvoiceStatus Status { get; set; } = InvoiceStatus.Unpaid;
    public string? Notes { get; set; }

    // Navigation
    public virtual Student Student { get; set; } = null!;
    public virtual Contract Contract { get; set; } = null!;
    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();
}

