using DormitoryManagement.Domain.Common;
using DormitoryManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using MongoDB.EntityFrameworkCore.Extensions;

namespace DormitoryManagement.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
        Database.AutoTransactionBehavior = AutoTransactionBehavior.Never;
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Student> Students => Set<Student>();
    public DbSet<Building> Buildings => Set<Building>();
    public DbSet<Room> Rooms => Set<Room>();
    public DbSet<Bed> Beds => Set<Bed>();
    public DbSet<Registration> Registrations => Set<Registration>();
    public DbSet<Contract> Contracts => Set<Contract>();
    public DbSet<MeterReading> MeterReadings => Set<MeterReading>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<Violation> Violations => Set<Violation>();
    public DbSet<RepairRequest> RepairRequests => Set<RepairRequest>();
    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // MongoDB Collection Mappings
        modelBuilder.Entity<User>().ToCollection("users");
        modelBuilder.Entity<Student>().ToCollection("students");
        modelBuilder.Entity<Building>().ToCollection("buildings");
        modelBuilder.Entity<Room>().ToCollection("rooms");
        modelBuilder.Entity<Bed>().ToCollection("beds");
        modelBuilder.Entity<Registration>().ToCollection("registrations");
        modelBuilder.Entity<Contract>().ToCollection("contracts");
        modelBuilder.Entity<MeterReading>().ToCollection("meter_readings");
        modelBuilder.Entity<Invoice>().ToCollection("invoices");
        modelBuilder.Entity<Payment>().ToCollection("payments");
        modelBuilder.Entity<Violation>().ToCollection("violations");
        modelBuilder.Entity<RepairRequest>().ToCollection("repair_requests");
        modelBuilder.Entity<Notification>().ToCollection("notifications");

        // User
        modelBuilder.Entity<User>(b =>
        {
            b.HasIndex(u => u.Username).IsUnique();
            b.HasIndex(u => u.Email).IsUnique();
            b.Property(u => u.Username).HasMaxLength(50).IsRequired();
            b.Property(u => u.Email).HasMaxLength(100).IsRequired();
            b.Property(u => u.FullName).HasMaxLength(100).IsRequired();
        });

        // Student
        modelBuilder.Entity<Student>(b =>
        {
            b.HasIndex(s => s.StudentCode).IsUnique();
            b.Property(s => s.StudentCode).HasMaxLength(20).IsRequired();
            b.Property(s => s.FullName).HasMaxLength(100).IsRequired();
            b.Property(s => s.Phone).HasMaxLength(20).IsRequired();
            b.Property(s => s.Email).HasMaxLength(100).IsRequired();

            b.HasOne(s => s.User)
             .WithOne(u => u.Student)
             .HasForeignKey<Student>(s => s.UserId)
             .OnDelete(DeleteBehavior.SetNull);
        });

        // Building
        modelBuilder.Entity<Building>(b =>
        {
            b.HasIndex(x => x.Code).IsUnique();
            b.Property(x => x.Code).HasMaxLength(20).IsRequired();
            b.Property(x => x.Name).HasMaxLength(100).IsRequired();
        });

        // Room
        modelBuilder.Entity<Room>(b =>
        {
            b.Property(r => r.RoomNumber).HasMaxLength(20).IsRequired();
            b.Property(r => r.BasePrice).HasColumnType("decimal(18,2)");
            b.HasOne(r => r.Building)
             .WithMany(bg => bg.Rooms)
             .HasForeignKey(r => r.BuildingId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // Bed
        modelBuilder.Entity<Bed>(b =>
        {
            b.Property(bd => bd.BedNumber).HasMaxLength(20).IsRequired();
            b.HasOne(bd => bd.Room)
             .WithMany(r => r.Beds)
             .HasForeignKey(bd => bd.RoomId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // Registration
        modelBuilder.Entity<Registration>(b =>
        {
            b.HasOne(r => r.Student)
             .WithMany(s => s.Registrations)
             .HasForeignKey(r => r.StudentId)
             .OnDelete(DeleteBehavior.Cascade);

            b.HasOne(r => r.PreferredBuilding)
             .WithMany()
             .HasForeignKey(r => r.PreferredBuildingId)
             .OnDelete(DeleteBehavior.SetNull);

            b.HasOne(r => r.ApprovedRoom)
             .WithMany()
             .HasForeignKey(r => r.ApprovedRoomId)
             .OnDelete(DeleteBehavior.SetNull);

            b.HasOne(r => r.ApprovedBed)
             .WithMany()
             .HasForeignKey(r => r.ApprovedBedId)
             .OnDelete(DeleteBehavior.SetNull);
        });

        // Contract
        modelBuilder.Entity<Contract>(b =>
        {
            b.HasIndex(c => c.ContractNumber).IsUnique();
            b.Property(c => c.ContractNumber).HasMaxLength(50).IsRequired();
            b.Property(c => c.MonthlyRent).HasColumnType("decimal(18,2)");
            b.Property(c => c.DepositAmount).HasColumnType("decimal(18,2)");

            b.HasOne(c => c.Student)
             .WithMany(s => s.Contracts)
             .HasForeignKey(c => c.StudentId)
             .OnDelete(DeleteBehavior.Restrict);

            b.HasOne(c => c.Room)
             .WithMany(r => r.Contracts)
             .HasForeignKey(c => c.RoomId)
             .OnDelete(DeleteBehavior.Restrict);

            b.HasOne(c => c.Bed)
             .WithMany(bd => bd.Contracts)
             .HasForeignKey(c => c.BedId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // MeterReading
        modelBuilder.Entity<MeterReading>(b =>
        {
            b.Property(m => m.ElectricityUnitPrice).HasColumnType("decimal(18,2)");
            b.Property(m => m.WaterUnitPrice).HasColumnType("decimal(18,2)");
            b.Property(m => m.ElectricityOld).HasColumnType("decimal(18,2)");
            b.Property(m => m.ElectricityNew).HasColumnType("decimal(18,2)");
            b.Property(m => m.WaterOld).HasColumnType("decimal(18,2)");
            b.Property(m => m.WaterNew).HasColumnType("decimal(18,2)");

            b.HasOne(m => m.Room)
             .WithMany(r => r.MeterReadings)
             .HasForeignKey(m => m.RoomId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // Invoice
        modelBuilder.Entity<Invoice>(b =>
        {
            b.HasIndex(i => i.InvoiceCode).IsUnique();
            b.Property(i => i.InvoiceCode).HasMaxLength(50).IsRequired();
            b.Property(i => i.RoomFee).HasColumnType("decimal(18,2)");
            b.Property(i => i.ElectricityFee).HasColumnType("decimal(18,2)");
            b.Property(i => i.WaterFee).HasColumnType("decimal(18,2)");
            b.Property(i => i.ServiceFee).HasColumnType("decimal(18,2)");
            b.Property(i => i.OtherFee).HasColumnType("decimal(18,2)");
            b.Property(i => i.PaidAmount).HasColumnType("decimal(18,2)");

            b.HasOne(i => i.Student)
             .WithMany(s => s.Invoices)
             .HasForeignKey(i => i.StudentId)
             .OnDelete(DeleteBehavior.Restrict);

            b.HasOne(i => i.Contract)
             .WithMany(c => c.Invoices)
             .HasForeignKey(i => i.ContractId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // Payment
        modelBuilder.Entity<Payment>(b =>
        {
            b.HasIndex(p => p.PaymentCode).IsUnique();
            b.Property(p => p.PaymentCode).HasMaxLength(50).IsRequired();
            b.Property(p => p.Amount).HasColumnType("decimal(18,2)");

            b.HasOne(p => p.Invoice)
             .WithMany(i => i.Payments)
             .HasForeignKey(p => p.InvoiceId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // Violation
        modelBuilder.Entity<Violation>(b =>
        {
            b.Property(v => v.PenaltyAmount).HasColumnType("decimal(18,2)");
            b.Property(v => v.Title).HasMaxLength(200).IsRequired();

            b.HasOne(v => v.Student)
             .WithMany(s => s.Violations)
             .HasForeignKey(v => v.StudentId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // RepairRequest
        modelBuilder.Entity<RepairRequest>(b =>
        {
            b.Property(r => r.Title).HasMaxLength(200).IsRequired();
            b.Property(r => r.RepairCost).HasColumnType("decimal(18,2)");

            b.HasOne(r => r.Student)
             .WithMany(s => s.RepairRequests)
             .HasForeignKey(r => r.StudentId)
             .OnDelete(DeleteBehavior.Cascade);

            b.HasOne(r => r.Room)
             .WithMany(rm => rm.RepairRequests)
             .HasForeignKey(r => r.RoomId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // Notification
        modelBuilder.Entity<Notification>(b =>
        {
            b.Property(n => n.Title).HasMaxLength(200).IsRequired();
            b.HasOne(n => n.User)
             .WithMany(u => u.Notifications)
             .HasForeignKey(n => n.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var entries = ChangeTracker.Entries<BaseEntity>().ToList();
        foreach (var entry in entries)
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAt = DateTime.UtcNow;
                if (entry.Entity.Id == 0)
                {
                    entry.Entity.Id = entry.Entity switch
                    {
                        User => GetNextId(Users),
                        Student => GetNextId(Students),
                        Building => GetNextId(Buildings),
                        Room => GetNextId(Rooms),
                        Bed => GetNextId(Beds),
                        Registration => GetNextId(Registrations),
                        Contract => GetNextId(Contracts),
                        MeterReading => GetNextId(MeterReadings),
                        Invoice => GetNextId(Invoices),
                        Payment => GetNextId(Payments),
                        Violation => GetNextId(Violations),
                        RepairRequest => GetNextId(RepairRequests),
                        Notification => GetNextId(Notifications),
                        _ => 1
                    };
                }
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = DateTime.UtcNow;
            }
        }
        return await base.SaveChangesAsync(cancellationToken);
    }

    private int GetNextId<T>(DbSet<T> dbSet) where T : BaseEntity
    {
        try
        {
            var ids = dbSet.Select(e => e.Id).ToList();
            return ids.Count > 0 ? ids.Max() + 1 : 1;
        }
        catch
        {
            return 1;
        }
    }
}

