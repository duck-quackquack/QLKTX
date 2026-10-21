using DormitoryManagement.Domain.Common;

namespace DormitoryManagement.Domain.Entities;

public class MeterReading : BaseEntity
{
    public int RoomId { get; set; }
    public int Month { get; set; }
    public int Year { get; set; }
    public decimal ElectricityOld { get; set; }
    public decimal ElectricityNew { get; set; }
    public decimal WaterOld { get; set; }
    public decimal WaterNew { get; set; }

    public decimal ElectricityUnitPrice { get; set; } = 3500; // VND/kWh
    public decimal WaterUnitPrice { get; set; } = 15000; // VND/m3

    public decimal ElectricityUsage => Math.Max(0, ElectricityNew - ElectricityOld);
    public decimal WaterUsage => Math.Max(0, WaterNew - WaterOld);
    public decimal TotalElectricityCost => ElectricityUsage * ElectricityUnitPrice;
    public decimal TotalWaterCost => WaterUsage * WaterUnitPrice;

    public DateTime RecordedDate { get; set; } = DateTime.UtcNow;
    public string? RecordedBy { get; set; }

    // Navigation
    public virtual Room Room { get; set; } = null!;
}

