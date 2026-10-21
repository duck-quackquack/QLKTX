using DormitoryManagement.Application.Common;
using DormitoryManagement.Application.DTOs;
using DormitoryManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DormitoryManagement.API.Controllers;

public class AuthController : BaseApiController
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Login([FromBody] LoginRequestDto request)
    {
        var result = await _authService.LoginAsync(request);
        return HandleResult(result, "Đăng nhập thành công");
    }

    [HttpPost("register")]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Register([FromBody] RegisterRequestDto request)
    {
        var result = await _authService.RegisterStudentAsync(request);
        return HandleCreated(result, "Đăng ký tài khoản thành công");
    }

    [HttpPost("refresh-token")]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> RefreshToken([FromQuery] string token, [FromQuery] string refreshToken)
    {
        var result = await _authService.RefreshTokenAsync(token, refreshToken);
        return HandleResult(result, "Làm mới phiên thành công");
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<ApiResponse<UserDto>>> GetCurrentUser()
    {
        var result = await _authService.GetCurrentUserAsync();
        return HandleResult(result);
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<ActionResult<ApiResponse<bool>>> ChangePassword([FromBody] ChangePasswordDto request)
    {
        var result = await _authService.ChangePasswordAsync(request);
        return HandleResult(result, "Đổi mật khẩu thành công");
    }

    [Authorize]
    [HttpPut("profile")]
    public async Task<ActionResult<ApiResponse<UserDto>>> UpdateProfile([FromBody] UpdateProfileDto request)
    {
        var result = await _authService.UpdateProfileAsync(request);
        return HandleResult(result, "Cập nhật thông tin cá nhân thành công");
    }
}

