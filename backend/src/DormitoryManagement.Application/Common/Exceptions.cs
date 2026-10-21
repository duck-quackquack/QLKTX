using System.Net;

namespace DormitoryManagement.Application.Common;

public class AppException : Exception
{
    public HttpStatusCode StatusCode { get; }
    public List<string> Errors { get; }

    public AppException(string message, HttpStatusCode statusCode = HttpStatusCode.BadRequest, List<string>? errors = null) 
        : base(message)
    {
        StatusCode = statusCode;
        Errors = errors ?? new List<string>();
    }
}

public class NotFoundException : AppException
{
    public NotFoundException(string message) : base(message, HttpStatusCode.NotFound) { }
    public NotFoundException(string entityName, object key) : base($"Không tìm thấy {entityName} với mã {key}", HttpStatusCode.NotFound) { }
}

public class ValidationException : AppException
{
    public ValidationException(string message, List<string>? errors = null) : base(message, HttpStatusCode.UnprocessableEntity, errors) { }
}

public class UnauthorizedException : AppException
{
    public UnauthorizedException(string message = "Yêu cầu đăng nhập hoặc phiên đăng nhập đã hết hạn") : base(message, HttpStatusCode.Unauthorized) { }
}

public class ForbiddenException : AppException
{
    public ForbiddenException(string message = "Bạn không có quyền thực hiện thao tác này") : base(message, HttpStatusCode.Forbidden) { }
}

public class ConflictException : AppException
{
    public ConflictException(string message) : base(message, HttpStatusCode.Conflict) { }
}
