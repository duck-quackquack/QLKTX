using DormitoryManagement.Domain.Common;
using DormitoryManagement.Domain.Enums;

namespace DormitoryManagement.Domain.Entities;

public class Payment : BaseEntity
{
    public int InvoiceId { get; set; }
    public string PaymentCode { get; set; } = string.Empty; // e.g. "PAY-2026-001"
    public decimal Amount { get; set; }
    public DateTime PaymentDate { get; set; } = DateTime.UtcNow;
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.BankTransfer;
    public string? TransactionCode { get; set; }
    public PaymentStatus Status { get; set; } = PaymentStatus.Completed;
    public string? Notes { get; set; }
    public string? ReceivedBy { get; set; }

    // Navigation
    public virtual Invoice Invoice { get; set; } = null!;
}

