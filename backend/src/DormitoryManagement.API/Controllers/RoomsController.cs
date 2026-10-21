using DormitoryManagement.Application.Common;
using DormitoryManagement.Application.DTOs;
using DormitoryManagement.Application.Interfaces;
using DormitoryManagement.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DormitoryManagement.API.Controllers;

[Authorize]
public class RoomsController : BaseApiController
{
    private readonly IRoomService _roomService;

    public RoomsController(IRoomService roomService)
    {
        _roomService = roomService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<PagedResult<RoomDto>>>> GetRooms([FromQuery] RoomFilterDto filter)
    {
        var result = await _roomService.GetRoomsAsync(filter);
        return HandleResult(result);
    }

    [HttpGet("building/{buildingId}")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<List<RoomDto>>>> GetRoomsByBuilding(int buildingId)
    {
        var result = await _roomService.GetRoomsByBuildingAsync(buildingId);
        return HandleResult(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<RoomDto>>> GetById(int id)
    {
        var result = await _roomService.GetByIdAsync(id);
        return HandleResult(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<ApiResponse<RoomDto>>> Create([FromBody] CreateRoomDto request)
    {
        var result = await _roomService.CreateAsync(request);
        return HandleCreated(result, "Tạo phòng thành công");
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<ApiResponse<RoomDto>>> Update(int id, [FromBody] UpdateRoomDto request)
    {
        var result = await _roomService.UpdateAsync(id, request);
        return HandleResult(result, "Cập nhật phòng thành công");
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(int id)
    {
        await _roomService.DeleteAsync(id);
        return HandleResult<object>(null!, "Xóa phòng thành công");
    }

    [HttpPost("{roomId}/beds")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<ApiResponse<BedDto>>> AddBed(int roomId, [FromQuery] string bedNumber, [FromQuery] string? notes)
    {
        var result = await _roomService.AddBedAsync(roomId, bedNumber, notes);
        return HandleCreated(result, "Thêm giường thành công");
    }

    [HttpPut("beds/{bedId}/status")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<ApiResponse<BedDto>>> UpdateBedStatus(int bedId, [FromQuery] BedStatus status, [FromQuery] string? notes)
    {
        var result = await _roomService.UpdateBedStatusAsync(bedId, status, notes);
        return HandleResult(result, "Cập nhật trạng thái giường thành công");
    }

    [HttpDelete("beds/{bedId}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteBed(int bedId)
    {
        await _roomService.DeleteBedAsync(bedId);
        return HandleResult<object>(null!, "Xóa giường thành công");
    }

    [HttpGet("available-beds")]
    public async Task<ActionResult<ApiResponse<List<BedDto>>>> GetAvailableBeds([FromQuery] int? buildingId)
    {
        var result = await _roomService.GetAvailableBedsAsync(buildingId);
        return HandleResult(result);
    }
}
