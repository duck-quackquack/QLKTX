using DormitoryManagement.Application.Common;
using DormitoryManagement.Application.DTOs;
using DormitoryManagement.Application.Interfaces;
using DormitoryManagement.Domain.Entities;
using DormitoryManagement.Domain.Enums;
using DormitoryManagement.Domain.Interfaces;

namespace DormitoryManagement.Application.Services;

public class MeterReadingService : IMeterReadingService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public MeterReadingService(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<PagedResult<MeterReadingDto>> GetAllAsync(PaginationFilter filter, int? roomId = null, int? month = null, int? year = null)
    {
        var query = _unitOfWork.Repository<MeterReading>().Query();

        if (roomId.HasValue)
        {
            query = query.Where(m => m.RoomId == roomId.Value);
        }

        if (month.HasValue)
        {
            query = query.Where(m => m.Month == month.Value);
        }

        if (year.HasValue)
        {
            query = query.Where(m => m.Year == year.Value);
        }

        var total = query.Count();

        var list = query
            .OrderByDescending(m => m.Year)
            .ThenByDescending(m => m.Month)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToList();

        var result = new List<MeterReadingDto>();
        foreach (var m in list)
        {
            result.Add(await MapToDtoAsync(m));
        }

        return new PagedResult<MeterReadingDto>(result, total, filter.Page, filter.PageSize);
    }

    public async Task<MeterReadingDto> GetByIdAsync(int id)
    {
        var reading = await _unitOfWork.Repository<MeterReading>().GetByIdAsync(id);
        if (reading == null) throw new NotFoundException("Chỉ số điện nước", id);

        return await MapToDtoAsync(reading);
    }

    public async Task<MeterReadingDto?> GetPreviousReadingAsync(int roomId, int currentMonth, int currentYear)
    {
        var previous = (await _unitOfWork.Repository<MeterReading>()
            .FindAsync(m => m.RoomId == roomId && (m.Year < currentYear || (m.Year == currentYear && m.Month < currentMonth))))
            .OrderByDescending(m => m.Year)
            .ThenByDescending(m => m.Month)
            .FirstOrDefault();

        if (previous == null) return null;
        return await MapToDtoAsync(previous);
    }

    public async Task<MeterReadingDto> RecordReadingAsync(CreateMeterReadingDto request)
    {
        var room = await _unitOfWork.Repository<Room>().GetByIdAsync(request.RoomId);
        if (room == null) throw new NotFoundException("Phòng", request.RoomId);

        if (request.ElectricityNew < request.ElectricityOld)
        {
            throw new ValidationException("Chỉ số điện mới không được nhỏ hơn chỉ số điện cũ.");
        }

        if (request.WaterNew < request.WaterOld)
        {
            throw new ValidationException("Chỉ số nước mới không được nhỏ hơn chỉ số nước cũ.");
        }

        // Check if existing reading for this month/year
        var existing = (await _unitOfWork.Repository<MeterReading>()
            .FindAsync(m => m.RoomId == request.RoomId && m.Month == request.Month && m.Year == request.Year)).FirstOrDefault();

        MeterReading reading;
        if (existing != null)
        {
            existing.ElectricityOld = request.ElectricityOld;
            existing.ElectricityNew = request.ElectricityNew;
            existing.WaterOld = request.WaterOld;
            existing.WaterNew = request.WaterNew;
            existing.ElectricityUnitPrice = request.ElectricityUnitPrice;
            existing.WaterUnitPrice = request.WaterUnitPrice;
            existing.RecordedDate = DateTime.UtcNow;
            existing.RecordedBy = _currentUserService.Username ?? "Admin";
            existing.UpdatedAt = DateTime.UtcNow;

            await _unitOfWork.Repository<MeterReading>().UpdateAsync(existing);
            reading = existing;
        }
        else
        {
            reading = new MeterReading
            {
                RoomId = request.RoomId,
                Month = request.Month,
                Year = request.Year,
                ElectricityOld = request.ElectricityOld,
                ElectricityNew = request.ElectricityNew,
                WaterOld = request.WaterOld,
                WaterNew = request.WaterNew,
                ElectricityUnitPrice = request.ElectricityUnitPrice,
                WaterUnitPrice = request.WaterUnitPrice,
                RecordedDate = DateTime.UtcNow,
                RecordedBy = _currentUserService.Username ?? "Admin"
            };

            reading = await _unitOfWork.Repository<MeterReading>().AddAsync(reading);
        }

        await _unitOfWork.SaveChangesAsync();

        // Optionally split and update / create invoices for students in this room
        if (request.AutoGenerateInvoicesForRoom)
        {
            var activeContracts = (await _unitOfWork.Repository<Contract>()
                .FindAsync(c => c.RoomId == request.RoomId && c.Status == ContractStatus.Active)).ToList();

            if (activeContracts.Count > 0)
            {
                var elecShare = Math.Round(reading.TotalElectricityCost / activeContracts.Count, 0);
                var waterShare = Math.Round(reading.TotalWaterCost / activeContracts.Count, 0);

                foreach (var contract in activeContracts)
                {
                    // Check if invoice already exists
                    var invoice = (await _unitOfWork.Repository<Invoice>()
                        .FindAsync(i => i.ContractId == contract.Id && i.Month == request.Month && i.Year == request.Year)).FirstOrDefault();

                    if (invoice != null)
                    {
                        invoice.ElectricityFee = elecShare;
                        invoice.WaterFee = waterShare;
                        invoice.UpdatedAt = DateTime.UtcNow;
                        await _unitOfWork.Repository<Invoice>().UpdateAsync(invoice);
                    }
                    else
                    {
                        var newInv = new Invoice
                        {
                            InvoiceCode = $"INV-{request.Year}{request.Month:D2}-{contract.StudentId:D4}",
                            StudentId = contract.StudentId,
                            ContractId = contract.Id,
                            Month = request.Month,
                            Year = request.Year,
                            RoomFee = contract.MonthlyRent,
                            ElectricityFee = elecShare,
                            WaterFee = waterShare,
                            ServiceFee = 30000,
                            DueDate = new DateTime(request.Year, request.Month, DateTime.DaysInMonth(request.Year, request.Month)),
                            Status = InvoiceStatus.Unpaid,
                            Notes = $"Hóa đơn tiền phòng và điện nước tháng {request.Month}/{request.Year}"
                        };
                        await _unitOfWork.Repository<Invoice>().AddAsync(newInv);
                    }
                }
                await _unitOfWork.SaveChangesAsync();
            }
        }

        return await MapToDtoAsync(reading);
    }

    private async Task<MeterReadingDto> MapToDtoAsync(MeterReading m)
    {
        var room = await _unitOfWork.Repository<Room>().GetByIdAsync(m.RoomId);
        var building = room != null ? await _unitOfWork.Repository<Building>().GetByIdAsync(room.BuildingId) : null;

        return new MeterReadingDto
        {
            Id = m.Id,
            RoomId = m.RoomId,
            RoomNumber = room?.RoomNumber ?? string.Empty,
            BuildingName = building?.Name ?? string.Empty,
            Month = m.Month,
            Year = m.Year,
            ElectricityOld = m.ElectricityOld,
            ElectricityNew = m.ElectricityNew,
            WaterOld = m.WaterOld,
            WaterNew = m.WaterNew,
            ElectricityUnitPrice = m.ElectricityUnitPrice,
            WaterUnitPrice = m.WaterUnitPrice,
            ElectricityUsage = m.ElectricityUsage,
            WaterUsage = m.WaterUsage,
            TotalElectricityCost = m.TotalElectricityCost,
            TotalWaterCost = m.TotalWaterCost,
            RecordedDate = m.RecordedDate,
            RecordedBy = m.RecordedBy
        };
    }
}

