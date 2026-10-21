using DormitoryManagement.Domain.Common;
using DormitoryManagement.Domain.Enums;

namespace DormitoryManagement.Domain.Entities;

public class Room : BaseEntity
{
    public int BuildingId { get; set; }
    public string RoomNumber { get; set; } = string.Empty; // e.g. "A101"
    public int Floor { get; set; } = 1;
    public string RoomType { get; set; } = "4 người"; // "2 người", "4 người", "6 người", "8 người"
    public int Capacity { get; set; } = 4;
    public decimal BasePrice { get; set; } = 600000; // Monthly price in VND
    public RoomStatus Status { get; set; } = RoomStatus.Available;
    public string? Description { get; set; }
    public string? GenderAllowed { get; set; } // "Nam", "Nữ"

    // Navigation
    public virtual Building Building { get; set; } = null!;
    public virtual ICollection<Bed> Beds { get; set; } = new List<Bed>();
    public virtual ICollection<Contract> Contracts { get; set; } = new List<Contract>();
    public virtual ICollection<MeterReading> MeterReadings { get; set; } = new List<MeterReading>();
    public virtual ICollection<RepairRequest> RepairRequests { get; set; } = new List<RepairRequest>();
}

