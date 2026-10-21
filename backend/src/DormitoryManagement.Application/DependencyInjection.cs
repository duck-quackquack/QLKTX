using DormitoryManagement.Application.Interfaces;
using DormitoryManagement.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace DormitoryManagement.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IStudentService, StudentService>();
        services.AddScoped<IBuildingService, BuildingService>();
        services.AddScoped<IRoomService, RoomService>();
        services.AddScoped<IRegistrationService, RegistrationService>();
        services.AddScoped<IContractService, ContractService>();
        services.AddScoped<IMeterReadingService, MeterReadingService>();
        services.AddScoped<IInvoiceService, InvoiceService>();
        services.AddScoped<IPaymentService, PaymentService>();
        services.AddScoped<IViolationService, ViolationService>();
        services.AddScoped<IRepairRequestService, RepairRequestService>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<IDashboardService, DashboardService>();

        return services;
    }
}
