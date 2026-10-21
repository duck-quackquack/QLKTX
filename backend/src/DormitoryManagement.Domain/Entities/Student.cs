using DormitoryManagement.Domain.Common;

namespace DormitoryManagement.Domain.Entities;

public class Student : BaseEntity
{
    public int? UserId { get; set; }
    public string StudentCode { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public string Gender { get; set; } = "Nam"; // "Nam", "Nữ"
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Faculty { get; set; } = string.Empty;
    public string ClassName { get; set; } = string.Empty;
    public string? CitizenId { get; set; }
    public string? AvatarUrl { get; set; }
    public bool IsStaying { get; set; } = false;

    // Navigation
    public virtual User? User { get; set; }
    public virtual ICollection<Registration> Registrations { get; set; } = new List<Registration>();
    public virtual ICollection<Contract> Contracts { get; set; } = new List<Contract>();
    public virtual ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
    public virtual ICollection<Violation> Violations { get; set; } = new List<Violation>();
    public virtual ICollection<RepairRequest> RepairRequests { get; set; } = new List<RepairRequest>();
}

