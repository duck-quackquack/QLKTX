using DormitoryManagement.Application.Common;
using DormitoryManagement.Application.DTOs;
using DormitoryManagement.Application.Interfaces;
using DormitoryManagement.Domain.Entities;
using DormitoryManagement.Domain.Enums;
using DormitoryManagement.Domain.Interfaces;

namespace DormitoryManagement.Application.Services;

public class RoomService : IRoomService
{
    private readonly IUnitOfWork _unitOfWork;

    public RoomService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<PagedResult<RoomDto>> GetRoomsAsync(RoomFilterDto filter)
    {
        var query = _unitOfWork.Repository<Room>().Query();

        if (filter.BuildingId.HasValue)
        {
            query = query.Where(r => r.BuildingId == filter.BuildingId.Value);
        }

        if (filter.Floor.HasValue)
        {
            query = query.Where(r => r.Floor == filter.Floor.Value);
        }

        if (filter.Status.HasValue)
        {
            query = query.Where(r => r.Status == filter.Status.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.GenderAllowed))
        {
            query = query.Where(r => r.GenderAllowed == filter.GenderAllowed);
        }

        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
        {
            var search = filter.SearchTerm.Trim().ToLower();
            query = query.Where(r => r.RoomNumber.ToLower().Contains(search) || r.Building.Name.ToLower().Contains(search));
        }

        var total = query.Count();

        var rooms = query
            .OrderBy(r => r.Building.Code)
            .ThenBy(r => r.RoomNumber)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToList();

        var roomDtos = new List<RoomDto>();
        foreach (var r in rooms)
        {
            roomDtos.Add(await MapToRoomDtoAsync(r));
        }

        return new PagedResult<RoomDto>(roomDtos, total, filter.Page, filter.PageSize);
    }

    public async Task<List<RoomDto>> GetRoomsByBuildingAsync(int buildingId)
    {
        var rooms = (await _unitOfWork.Repository<Room>().FindAsync(r => r.BuildingId == buildingId))
            .OrderBy(r => r.Floor)
            .ThenBy(r => r.RoomNumber)
            .ToList();

        var result = new List<RoomDto>();
        foreach (var r in rooms)
        {
            result.Add(await MapToRoomDtoAsync(r));
        }
        return result;
    }

    public async Task<RoomDto> GetByIdAsync(int id)
    {
        var room = await _unitOfWork.Repository<Room>().GetByIdAsync(id);
        if (room == null) throw new NotFoundException("Phòng", id);

        return await MapToRoomDtoAsync(room);
    }

    public async Task<RoomDto> CreateAsync(CreateRoomDto request)
    {
        var building = await _unitOfWork.Repository<Building>().GetByIdAsync(request.BuildingId);
        if (building == null) throw new NotFoundException("Tòa nhà", request.BuildingId);

        var existing = await _unitOfWork.Repository<Room>()
            .FindAsync(r => r.BuildingId == request.BuildingId && r.RoomNumber.ToLower() == request.RoomNumber.Trim().ToLower());
        if (existing.Any())
        {
            throw new ConflictException($"Phòng {request.RoomNumber} đã tồn tại trong tòa {building.Name}.");
        }

        var room = new Room
        {
            BuildingId = request.BuildingId,
            RoomNumber = request.RoomNumber.Trim().ToUpper(),
            Floor = request.Floor,
            RoomType = request.RoomType,
            Capacity = request.Capacity,
            BasePrice = request.BasePrice,
            Status = RoomStatus.Available,
            Description = request.Description,
            GenderAllowed = request.GenderAllowed ?? building.GenderAllowed
        };

        var created = await _unitOfWork.Repository<Room>().AddAsync(room);
        await _unitOfWork.SaveChangesAsync();

        if (request.AutoGenerateBeds && request.Capacity > 0)
        {
            for (int i = 1; i <= request.Capacity; i++)
            {
                var bed = new Bed
                {
                    RoomId = created.Id,
                    BedNumber = $"G{i:D2}",
                    Status = BedStatus.Available
                };
                await _unitOfWork.Repository<Bed>().AddAsync(bed);
            }
            await _unitOfWork.SaveChangesAsync();
        }

        return await GetByIdAsync(created.Id);
    }

    public async Task<RoomDto> UpdateAsync(int id, UpdateRoomDto request)
    {
        var room = await _unitOfWork.Repository<Room>().GetByIdAsync(id);
        if (room == null) throw new NotFoundException("Phòng", id);

        room.RoomNumber = request.RoomNumber.Trim().ToUpper();
        room.Floor = request.Floor;
        room.RoomType = request.RoomType;
        room.Capacity = request.Capacity;
        room.BasePrice = request.BasePrice;
        room.Status = request.Status;
        room.Description = request.Description;
        room.GenderAllowed = request.GenderAllowed;
        room.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Repository<Room>().UpdateAsync(room);
        await _unitOfWork.SaveChangesAsync();

        return await GetByIdAsync(room.Id);
    }

    public async Task DeleteAsync(int id)
    {
        var room = await _unitOfWork.Repository<Room>().GetByIdAsync(id);
        if (room == null) throw new NotFoundException("Phòng", id);

        var beds = await _unitOfWork.Repository<Bed>().FindAsync(b => b.RoomId == id);
        if (beds.Any(b => b.Status == BedStatus.Occupied))
        {
            throw new ValidationException("Không thể xóa phòng đang có sinh viên cư trú.");
        }

        foreach (var bed in beds)
        {
            await _unitOfWork.Repository<Bed>().DeleteAsync(bed);
        }

        await _unitOfWork.Repository<Room>().DeleteAsync(room);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<BedDto> AddBedAsync(int roomId, string bedNumber, string? notes)
    {
        var room = await _unitOfWork.Repository<Room>().GetByIdAsync(roomId);
        if (room == null) throw new NotFoundException("Phòng", roomId);

        var bed = new Bed
        {
            RoomId = roomId,
            BedNumber = bedNumber.Trim().ToUpper(),
            Status = BedStatus.Available,
            Notes = notes
        };

        var created = await _unitOfWork.Repository<Bed>().AddAsync(bed);
        await _unitOfWork.SaveChangesAsync();

        return new BedDto
        {
            Id = created.Id,
            RoomId = created.RoomId,
            BedNumber = created.BedNumber,
            Status = created.Status,
            Notes = created.Notes
        };
    }

    public async Task<BedDto> UpdateBedStatusAsync(int bedId, BedStatus status, string? notes)
    {
        var bed = await _unitOfWork.Repository<Bed>().GetByIdAsync(bedId);
        if (bed == null) throw new NotFoundException("Giường", bedId);

        bed.Status = status;
        if (notes != null) bed.Notes = notes;
        bed.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Repository<Bed>().UpdateAsync(bed);
        await _unitOfWork.SaveChangesAsync();

        // Update parent room status if all beds are occupied or full
        var roomBeds = await _unitOfWork.Repository<Bed>().FindAsync(b => b.RoomId == bed.RoomId);
        var room = await _unitOfWork.Repository<Room>().GetByIdAsync(bed.RoomId);
        if (room != null)
        {
            if (roomBeds.All(b => b.Status == BedStatus.Occupied))
            {
                room.Status = RoomStatus.Full;
            }
            else if (room.Status == RoomStatus.Full && roomBeds.Any(b => b.Status == BedStatus.Available))
            {
                room.Status = RoomStatus.Available;
            }
            await _unitOfWork.SaveChangesAsync();
        }

        return new BedDto
        {
            Id = bed.Id,
            RoomId = bed.RoomId,
            BedNumber = bed.BedNumber,
            Status = bed.Status,
            Notes = bed.Notes
        };
    }

    public async Task DeleteBedAsync(int bedId)
    {
        var bed = await _unitOfWork.Repository<Bed>().GetByIdAsync(bedId);
        if (bed == null) throw new NotFoundException("Giường", bedId);

        if (bed.Status == BedStatus.Occupied)
        {
            throw new ValidationException("Không thể xóa giường đang có sinh viên ở.");
        }

        await _unitOfWork.Repository<Bed>().DeleteAsync(bed);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<List<BedDto>> GetAvailableBedsAsync(int? buildingId = null)
    {
        var availableBeds = await _unitOfWork.Repository<Bed>().FindAsync(b => b.Status == BedStatus.Available);
        var result = new List<BedDto>();

        foreach (var bed in availableBeds)
        {
            var room = await _unitOfWork.Repository<Room>().GetByIdAsync(bed.RoomId);
            if (room != null && (!buildingId.HasValue || room.BuildingId == buildingId.Value))
            {
                result.Add(new BedDto
                {
                    Id = bed.Id,
                    RoomId = bed.RoomId,
                    BedNumber = $"{room.RoomNumber} - {bed.BedNumber}",
                    Status = bed.Status,
                    Notes = bed.Notes
                });
            }
        }

        return result;
    }

    private async Task<RoomDto> MapToRoomDtoAsync(Room room)
    {
        var building = await _unitOfWork.Repository<Building>().GetByIdAsync(room.BuildingId);
        var beds = (await _unitOfWork.Repository<Bed>().FindAsync(b => b.RoomId == room.Id)).ToList();
        var contracts = await _unitOfWork.Repository<Contract>().FindAsync(c => c.RoomId == room.Id && c.Status == ContractStatus.Active);
        var students = await _unitOfWork.Repository<Student>().GetAllAsync();

        var bedDtos = beds.Select(b =>
        {
            var activeContract = contracts.FirstOrDefault(c => c.BedId == b.Id);
            var student = activeContract != null ? students.FirstOrDefault(s => s.Id == activeContract.StudentId) : null;

            return new BedDto
            {
                Id = b.Id,
                RoomId = b.RoomId,
                BedNumber = b.BedNumber,
                Status = b.Status,
                Notes = b.Notes,
                StudentId = student?.Id,
                StudentName = student?.FullName,
                StudentCode = student?.StudentCode,
                ContractId = activeContract?.Id
            };
        }).ToList();

        return new RoomDto
        {
            Id = room.Id,
            BuildingId = room.BuildingId,
            BuildingName = building?.Name ?? string.Empty,
            BuildingCode = building?.Code ?? string.Empty,
            RoomNumber = room.RoomNumber,
            Floor = room.Floor,
            RoomType = room.RoomType,
            Capacity = room.Capacity,
            BasePrice = room.BasePrice,
            Status = room.Status,
            Description = room.Description,
            GenderAllowed = room.GenderAllowed,
            OccupiedCount = bedDtos.Count(b => b.Status == BedStatus.Occupied),
            AvailableCount = bedDtos.Count(b => b.Status == BedStatus.Available),
            Beds = bedDtos
        };
    }
}

