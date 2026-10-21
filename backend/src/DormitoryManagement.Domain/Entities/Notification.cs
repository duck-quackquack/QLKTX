using DormitoryManagement.Domain.Common;
using DormitoryManagement.Domain.Enums;

namespace DormitoryManagement.Domain.Entities;

public class Notification : BaseEntity
{
    public int? UserId { get; set; } // null = broadcast to all
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public NotificationType Type { get; set; } = NotificationType.General;
    public bool IsRead { get; set; } = false;
    public string? ActionUrl { get; set; }

    // Navigation
    public virtual User? User { get; set; }
}

