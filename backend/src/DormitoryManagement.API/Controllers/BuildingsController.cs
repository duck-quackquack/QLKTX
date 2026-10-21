using DormitoryManagement.Application.Common;
using DormitoryManagement.Application.DTOs;
using DormitoryManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DormitoryManagement.API.Controllers;

[Authorize]
public class BuildingsController : BaseApiController
{
    private readonly IBuildingService _buildingService;

    public BuildingsController(IBuildingService buildingService)
    {
        _buildingService = buildingService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<List<BuildingDto>>>> GetAll()
    {
        var result = await _buildingService.GetAllAsync();
        return HandleResult(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<BuildingDto>>> GetById(int id)
    {
        var result = await _buildingService.GetByIdAsync(id);
        return HandleResult(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<BuildingDto>>> Create([FromBody] CreateBuildingDto request)
    {
        var result = await _buildingService.CreateAsync(request);
        return HandleCreated(result, "Tạo tòa nhà thành công");
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<BuildingDto>>> Update(int id, [FromBody] UpdateBuildingDto request)
    {
        var result = await _buildingService.UpdateAsync(id, request);
        return HandleResult(result, "Cập nhật thông tin tòa nhà thành công");
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(int id)
    {
        await _buildingService.DeleteAsync(id);
        return HandleResult<object>(null!, "Xóa tòa nhà thành công");
    }
}

