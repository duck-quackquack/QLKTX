using DormitoryManagement.Application.Common;
using DormitoryManagement.Application.DTOs;
using DormitoryManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DormitoryManagement.API.Controllers;

[Authorize]
public class StudentsController : BaseApiController
{
    private readonly IStudentService _studentService;

    public StudentsController(IStudentService studentService)
    {
        _studentService = studentService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<ApiResponse<PagedResult<StudentDto>>>> GetStudents([FromQuery] StudentFilterDto filter)
    {
        var result = await _studentService.GetStudentsAsync(filter);
        return HandleResult(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<StudentDto>>> GetById(int id)
    {
        var result = await _studentService.GetByIdAsync(id);
        return HandleResult(result);
    }

    [HttpGet("code/{studentCode}")]
    public async Task<ActionResult<ApiResponse<StudentDto>>> GetByCode(string studentCode)
    {
        var result = await _studentService.GetByStudentCodeAsync(studentCode);
        return HandleResult(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<ApiResponse<StudentDto>>> Create([FromBody] CreateStudentDto request)
    {
        var result = await _studentService.CreateAsync(request);
        return HandleCreated(result, "Thêm mới sinh viên thành công");
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<ApiResponse<StudentDto>>> Update(int id, [FromBody] UpdateStudentDto request)
    {
        var result = await _studentService.UpdateAsync(id, request);
        return HandleResult(result, "Cập nhật sinh viên thành công");
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(int id)
    {
        await _studentService.DeleteAsync(id);
        return HandleResult<object>(null!, "Xóa sinh viên thành công");
    }

    [HttpGet("active-staying")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<ApiResponse<List<StudentDto>>>> GetActiveStaying()
    {
        var result = await _studentService.GetAllActiveStayingAsync();
        return HandleResult(result);
    }
}
