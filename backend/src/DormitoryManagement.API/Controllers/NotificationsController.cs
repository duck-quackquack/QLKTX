using DormitoryManagement.Application.Common;
using DormitoryManagement.Application.DTOs;
using DormitoryManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DormitoryManagement.API.Controllers;

[Authorize]
public class NotificationsController : BaseApiController
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpGet("my")]
    public async Task<ActionResult<ApiResponse<List<NotificationDto>>>> GetMyNotifications()
    {
        var result = await _notificationService.GetMyNotificationsAsync();
        return HandleResult(result);
    }

    [HttpGet("unread-count")]
    public async Task<ActionResult<ApiResponse<int>>> GetUnreadCount()
    {
        var result = await _notificationService.GetUnreadCountAsync();
        return HandleResult(result);
    }

    [HttpPut("{id}/mark-read")]
    public async Task<ActionResult<ApiResponse<bool>>> MarkRead(int id)
    {
        var result = await _notificationService.MarkAsReadAsync(id);
        return HandleResult(result);
    }

    [HttpPut("mark-all-read")]
    public async Task<ActionResult<ApiResponse<bool>>> MarkAllRead()
    {
        var result = await _notificationService.MarkAllAsReadAsync();
        return HandleResult(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<ApiResponse<NotificationDto>>> Create([FromBody] CreateNotificationDto request)
    {
        var result = await _notificationService.CreateNotificationAsync(request);
        return HandleCreated(result, "Gửi thông báo thành công");
    }
}
