using DormitoryManagement.Application.Interfaces;
using DormitoryManagement.Domain.Interfaces;
using DormitoryManagement.Infrastructure.Data;
using DormitoryManagement.Infrastructure.Identity;
using DormitoryManagement.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace DormitoryManagement.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection") 
                               ?? "Data Source=dormitory.db";

        var dbProvider = configuration["DatabaseProvider"] ?? "MongoDB";

        if (dbProvider.Equals("MongoDB", StringComparison.OrdinalIgnoreCase))
        {
            var mongoConnection = configuration.GetConnectionString("MongoConnection") 
                                  ?? "mongodb://localhost:27017";
            var mongoDbName = configuration["MongoDatabaseName"] ?? "DormitoryDb";

            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseMongoDB(mongoConnection, mongoDbName));
        }
        else if (dbProvider.Equals("SqlServer", StringComparison.OrdinalIgnoreCase))
        {
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlServer(connectionString));
        }
        else
        {
            // Fallback to SQLite
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlite(connectionString));
        }

        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IJwtService, JwtService>();
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddHttpContextAccessor();

        return services;
    }
}

