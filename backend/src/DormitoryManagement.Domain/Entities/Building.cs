using DormitoryManagement.Domain.Common;

namespace DormitoryManagement.Domain.Entities;

public class Building : BaseEntity
{
    public string Code { get; set; } = string.Empty; // e.g. "A", "B", "C"
    public string Name { get; set; } = string.Empty; // e.g. "Tòa nhà A (Nam)"
    public string Address { get; set; } = string.Empty;
    public int NumberOfFloors { get; set; } = 4;
    public string? Description { get; set; }
    public string? GenderAllowed { get; set; } // "Nam", "Nữ", "Tất cả"

    // Navigation
    public virtual ICollection<Room> Rooms { get; set; } = new List<Room>();
}

