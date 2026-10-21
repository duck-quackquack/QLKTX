using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using DormitoryManagement.Application.Interfaces;
using DormitoryManagement.Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace DormitoryManagement.Infrastructure.Identity;

public class JwtService : IJwtService
{
    private readonly IConfiguration _configuration;

    public JwtService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateToken(User user, int? studentId = null, string? studentCode = null)
    {
        var secretKey = _configuration["Jwt:SecretKey"] ?? "DormitoryManagementSecretSuperKey2026!@#$%^&*()_+";
        var issuer = _configuration["Jwt:Issuer"] ?? "DormitoryManagementAPI";
        var audience = _configuration["Jwt:Audience"] ?? "DormitoryManagementClient";
        var expiryHours = double.TryParse(_configuration["Jwt:ExpiryHours"], out var h) ? h : 24;

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.Username),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Role, user.Role.ToString()),
            new("FullName", user.FullName)
        };

        if (studentId.HasValue)
        {
            claims.Add(new Claim("StudentId", studentId.Value.ToString()));
        }

        if (!string.IsNullOrEmpty(studentCode))
        {
            claims.Add(new Claim("StudentCode", studentCode));
        }

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(expiryHours),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        var randomNumber = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }
}

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    private ClaimsPrincipal? User => _httpContextAccessor.HttpContext?.User;

    public int? UserId
    {
        get
        {
            var idClaim = User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(idClaim, out var id) ? id : null;
        }
    }

    public string? Username => User?.FindFirst(ClaimTypes.Name)?.Value;

    public string? Role => User?.FindFirst(ClaimTypes.Role)?.Value;

    public int? StudentId
    {
        get
        {
            var sIdClaim = User?.FindFirst("StudentId")?.Value;
            return int.TryParse(sIdClaim, out var id) ? id : null;
        }
    }

    public bool IsAdmin => Role == "Admin";
    public bool IsStaff => Role == "Staff";
    public bool IsStudent => Role == "Student";
}

