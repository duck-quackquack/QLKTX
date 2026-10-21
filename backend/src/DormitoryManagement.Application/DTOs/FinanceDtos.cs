using DormitoryManagement.Application.Common;
using DormitoryManagement.Domain.Enums;

namespace DormitoryManagement.Application.DTOs;

public class MeterReadingDto
{
    public int Id { get; set; }
    public int RoomId { get; set; }
    public string RoomNumber { get; set; } = string.Empty;
    public string BuildingName { get; set; } = string.Empty;
    public int Month { get; set; }
    public int Year { get; set; }

    public decimal ElectricityOld { get; set; }
    public decimal ElectricityNew { get; set; }
    public decimal WaterOld { get; set; }
    public decimal WaterNew { get; set; }

    public decimal ElectricityUnitPrice { get; set; }
    public decimal WaterUnitPrice { get; set; }

    public decimal ElectricityUsage { get; set; }
    public decimal WaterUsage { get; set; }
    public decimal TotalElectricityCost { get; set; }
    public decimal TotalWaterCost { get; set; }

    public DateTime RecordedDate { get; set; }
    public string? RecordedBy { get; set; }
}

public class CreateMeterReadingDto
{
    public int RoomId { get; set; }
    public int Month { get; set; }
    public int Year { get; set; }
    public decimal ElectricityOld { get; set; }
    public decimal ElectricityNew { get; set; }
    public decimal WaterOld { get; set; }
    public decimal WaterNew { get; set; }
    public decimal ElectricityUnitPrice { get; set; } = 3500;
    public decimal WaterUnitPrice { get; set; } = 15000;
    public bool AutoGenerateInvoicesForRoom { get; set; } = true;
}

public class InvoiceDto
{
    public int Id { get; set; }
    public string InvoiceCode { get; set; } = string.Empty;
    public int StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string StudentCode { get; set; } = string.Empty;
    public string StudentPhone { get; set; } = string.Empty;

    public int ContractId { get; set; }
    public string RoomNumber { get; set; } = string.Empty;
    public string BuildingName { get; set; } = string.Empty;

    public int Month { get; set; }
    public int Year { get; set; }

    public decimal RoomFee { get; set; }
    public decimal ElectricityFee { get; set; }
    public decimal WaterFee { get; set; }
    public decimal ServiceFee { get; set; }
    public decimal OtherFee { get; set; }
    public string? OtherFeeDescription { get; set; }

    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal RemainingAmount { get; set; }

    public DateTime DueDate { get; set; }
    public InvoiceStatus Status { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }

    public List<PaymentDto> Payments { get; set; } = new();
}

public class CreateInvoiceDto
{
    public int ContractId { get; set; }
    public int Month { get; set; }
    public int Year { get; set; }
    public decimal RoomFee { get; set; }
    public decimal ElectricityFee { get; set; } = 0;
    public decimal WaterFee { get; set; } = 0;
    public decimal ServiceFee { get; set; } = 30000;
    public decimal OtherFee { get; set; } = 0;
    public string? OtherFeeDescription { get; set; }
    public DateTime DueDate { get; set; }
    public string? Notes { get; set; }
}

public class GenerateMonthlyInvoicesDto
{
    public int Month { get; set; }
    public int Year { get; set; }
    public DateTime DueDate { get; set; }
    public decimal ServiceFee { get; set; } = 30000;
}

public class PaymentDto
{
    public int Id { get; set; }
    public int InvoiceId { get; set; }
    public string InvoiceCode { get; set; } = string.Empty;
    public string PaymentCode { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime PaymentDate { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public string? TransactionCode { get; set; }
    public PaymentStatus Status { get; set; }
    public string? Notes { get; set; }
    public string? ReceivedBy { get; set; }
}

public class CreatePaymentDto
{
    public int InvoiceId { get; set; }
    public decimal Amount { get; set; }
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.BankTransfer;
    public string? TransactionCode { get; set; }
    public string? Notes { get; set; }
}
