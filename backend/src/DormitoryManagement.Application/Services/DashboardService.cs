using DormitoryManagement.Application.DTOs;
using DormitoryManagement.Application.Interfaces;
using DormitoryManagement.Domain.Entities;
using DormitoryManagement.Domain.Enums;
using DormitoryManagement.Domain.Interfaces;

namespace DormitoryManagement.Application.Services;

public class DashboardService : IDashboardService
{
    private readonly IUnitOfWork _unitOfWork;

    public DashboardService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<DashboardStatisticsDto> GetStatisticsAsync()
    {
        var students = await _unitOfWork.Repository<Student>().GetAllAsync();
        var buildings = await _unitOfWork.Repository<Building>().GetAllAsync();
        var rooms = await _unitOfWork.Repository<Room>().GetAllAsync();
        var beds = await _unitOfWork.Repository<Bed>().GetAllAsync();
        var invoices = await _unitOfWork.Repository<Invoice>().GetAllAsync();
        var registrations = await _unitOfWork.Repository<Registration>().GetAllAsync();
        var repairs = await _unitOfWork.Repository<RepairRequest>().GetAllAsync();
        var violations = await _unitOfWork.Repository<Violation>().GetAllAsync();

        var totalBeds = beds.Count;
        var occupiedBeds = beds.Count(b => b.Status == BedStatus.Occupied);
        var availableBeds = beds.Count(b => b.Status == BedStatus.Available);
        var occupancyRate = totalBeds > 0 ? Math.Round((double)occupiedBeds / totalBeds * 100, 2) : 0;

        var currentMonth = DateTime.UtcNow.Month;
        var currentYear = DateTime.UtcNow.Year;

        var monthlyInvoices = invoices.Where(i => i.Month == currentMonth && i.Year == currentYear && i.Status != InvoiceStatus.Cancelled).ToList();
        var monthlyRevenue = monthlyInvoices.Sum(i => i.PaidAmount);
        var totalUnpaidAmount = invoices.Where(i => i.Status != InvoiceStatus.Paid && i.Status != InvoiceStatus.Cancelled).Sum(i => i.RemainingAmount);

        // Calculate 6 months trend
        var monthlyRevenues = new List<MonthlyRevenueItemDto>();
        for (int i = 5; i >= 0; i--)
        {
            var targetDate = DateTime.UtcNow.AddMonths(-i);
            var m = targetDate.Month;
            var y = targetDate.Year;
            var targetInvoices = invoices.Where(inv => inv.Month == m && inv.Year == y && inv.Status != InvoiceStatus.Cancelled).ToList();

            monthlyRevenues.Add(new MonthlyRevenueItemDto
            {
                MonthYear = $"{m:D2}/{y}",
                TotalBilled = targetInvoices.Sum(inv => inv.TotalAmount),
                TotalCollected = targetInvoices.Sum(inv => inv.PaidAmount)
            });
        }

        // Calculate occupancy per building
        var buildingOccupancies = buildings.Select(b =>
        {
            var bRoomIds = rooms.Where(r => r.BuildingId == b.Id).Select(r => r.Id).ToHashSet();
            var bBeds = beds.Where(bed => bRoomIds.Contains(bed.RoomId)).ToList();
            var bOccupied = bBeds.Count(bed => bed.Status == BedStatus.Occupied);
            var bTotal = bBeds.Count;
            var rate = bTotal > 0 ? Math.Round((double)bOccupied / bTotal * 100, 1) : 0;

            return new BuildingOccupancyDto
            {
                BuildingCode = b.Code,
                BuildingName = b.Name,
                TotalBeds = bTotal,
                OccupiedBeds = bOccupied,
                AvailableBeds = bBeds.Count(bed => bed.Status == BedStatus.Available),
                Rate = rate
            };
        }).ToList();

        // Recent activity
        var recent = new List<RecentActivityDto>();

        foreach (var reg in registrations.OrderByDescending(r => r.CreatedAt).Take(3))
        {
            recent.Add(new RecentActivityDto
            {
                Title = "Đăng ký mới",
                Description = $"Sinh viên {reg.Student?.FullName ?? "Mã " + reg.StudentId} nộp đơn đăng ký",
                Type = "registration",
                Time = reg.CreatedAt
            });
        }

        foreach (var rep in repairs.OrderByDescending(r => r.CreatedAt).Take(3))
        {
            recent.Add(new RecentActivityDto
            {
                Title = "Báo hỏng / Sửa chữa",
                Description = $"{rep.Title} (Phòng {rep.Room?.RoomNumber})",
                Type = "repair",
                Time = rep.CreatedAt
            });
        }

        return new DashboardStatisticsDto
        {
            TotalStudents = students.Count,
            ActiveStayingStudents = students.Count(s => s.IsStaying),
            TotalBuildings = buildings.Count,
            TotalRooms = rooms.Count,
            TotalBeds = totalBeds,
            OccupiedBeds = occupiedBeds,
            AvailableBeds = availableBeds,
            OccupancyRate = occupancyRate,
            MonthlyRevenue = monthlyRevenue,
            TotalUnpaidAmount = totalUnpaidAmount,
            PendingRegistrations = registrations.Count(r => r.Status == RegistrationStatus.Pending),
            PendingRepairs = repairs.Count(r => r.Status == RepairStatus.Pending),
            PendingViolations = violations.Count(v => v.Status == ViolationStatus.Pending),
            MonthlyRevenues = monthlyRevenues,
            BuildingOccupancies = buildingOccupancies,
            RecentActivities = recent.OrderByDescending(a => a.Time).Take(6).ToList()
        };
    }
}

