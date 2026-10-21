using DormitoryManagement.Application.Common;
using DormitoryManagement.Application.DTOs;
using DormitoryManagement.Application.Interfaces;
using DormitoryManagement.Domain.Entities;
using DormitoryManagement.Domain.Enums;
using DormitoryManagement.Domain.Interfaces;

namespace DormitoryManagement.Application.Services;

public class NotificationService : INotificationService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public NotificationService(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<List<NotificationDto>> GetMyNotificationsAsync()
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue) return new List<NotificationDto>();

        var notifications = (await _unitOfWork.Repository<Notification>()
            .FindAsync(n => n.UserId == userId.Value || n.UserId == null))
            .OrderByDescending(n => n.CreatedAt)
            .Take(50)
            .ToList();

        return notifications.Select(n => new NotificationDto
        {
            Id = n.Id,
            UserId = n.UserId,
            Title = n.Title,
            Content = n.Content,
            Type = n.Type,
            IsRead = n.IsRead,
            ActionUrl = n.ActionUrl,
            CreatedAt = n.CreatedAt
        }).ToList();
    }

    public async Task<int> GetUnreadCountAsync()
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue) return 0;

        var unread = await _unitOfWork.Repository<Notification>()
            .FindAsync(n => (n.UserId == userId.Value || n.UserId == null) && !n.IsRead);

        return unread.Count;
    }

    public async Task<bool> MarkAsReadAsync(int id)
    {
        var notif = await _unitOfWork.Repository<Notification>().GetByIdAsync(id);
        if (notif == null) return false;

        notif.IsRead = true;
        notif.UpdatedAt = DateTime.UtcNow;
        await _unitOfWork.Repository<Notification>().UpdateAsync(notif);
        await _unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<bool> MarkAllAsReadAsync()
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue) return false;

        var notifications = await _unitOfWork.Repository<Notification>()
            .FindAsync(n => (n.UserId == userId.Value || n.UserId == null) && !n.IsRead);

        foreach (var n in notifications)
        {
            n.IsRead = true;
            n.UpdatedAt = DateTime.UtcNow;
            await _unitOfWork.Repository<Notification>().UpdateAsync(n);
        }

        await _unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<NotificationDto> CreateNotificationAsync(CreateNotificationDto request)
    {
        var notif = new Notification
        {
            UserId = request.UserId,
            Title = request.Title.Trim(),
            Content = request.Content.Trim(),
            Type = request.Type,
            IsRead = false,
            ActionUrl = request.ActionUrl
        };

        var created = await _unitOfWork.Repository<Notification>().AddAsync(notif);
        await _unitOfWork.SaveChangesAsync();

        return new NotificationDto
        {
            Id = created.Id,
            UserId = created.UserId,
            Title = created.Title,
            Content = created.Content,
            Type = created.Type,
            IsRead = created.IsRead,
            ActionUrl = created.ActionUrl,
            CreatedAt = created.CreatedAt
        };
    }
}

