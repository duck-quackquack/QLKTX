using DormitoryManagement.Application.Common;
using DormitoryManagement.Application.DTOs;
using DormitoryManagement.Application.Interfaces;
using DormitoryManagement.Domain.Entities;
using DormitoryManagement.Domain.Enums;
using DormitoryManagement.Domain.Interfaces;

namespace DormitoryManagement.Application.Services;

public class BuildingService : IBuildingService
{
    private readonly IUnitOfWork _unitOfWork;

    public BuildingService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<BuildingDto>> GetAllAsync()
    {
        var buildings = await _unitOfWork.Repository<Building>().GetAllAsync();
        var allRooms = await _unitOfWork.Repository<Room>().GetAllAsync();
        var allBeds = await _unitOfWork.Repository<Bed>().GetAllAsync();

        return buildings.Select(b =>
        {
            var bRooms = allRooms.Where(r => r.BuildingId == b.Id).ToList();
            var bRoomIds = bRooms.Select(r => r.Id).ToHashSet();
            var bBeds = allBeds.Where(bed => bRoomIds.Contains(bed.RoomId)).ToList();

            return new BuildingDto
            {
                Id = b.Id,
                Code = b.Code,
                Name = b.Name,
                Address = b.Address,
                NumberOfFloors = b.NumberOfFloors,
                Description = b.Description,
                GenderAllowed = b.GenderAllowed,
                TotalRooms = bRooms.Count,
                TotalBeds = bBeds.Count,
                OccupiedBeds = bBeds.Count(bed => bed.Status == BedStatus.Occupied),
                AvailableBeds = bBeds.Count(bed => bed.Status == BedStatus.Available)
            };
        }).ToList();
    }

    public async Task<BuildingDto> GetByIdAsync(int id)
    {
        var b = await _unitOfWork.Repository<Building>().GetByIdAsync(id);
        if (b == null) throw new NotFoundException("Tòa nhà", id);

        var bRooms = await _unitOfWork.Repository<Room>().FindAsync(r => r.BuildingId == b.Id);
        var bRoomIds = bRooms.Select(r => r.Id).ToHashSet();
        var allBeds = await _unitOfWork.Repository<Bed>().GetAllAsync();
        var bBeds = allBeds.Where(bed => bRoomIds.Contains(bed.RoomId)).ToList();

        return new BuildingDto
        {
            Id = b.Id,
            Code = b.Code,
            Name = b.Name,
            Address = b.Address,
            NumberOfFloors = b.NumberOfFloors,
            Description = b.Description,
            GenderAllowed = b.GenderAllowed,
            TotalRooms = bRooms.Count,
            TotalBeds = bBeds.Count,
            OccupiedBeds = bBeds.Count(bed => bed.Status == BedStatus.Occupied),
            AvailableBeds = bBeds.Count(bed => bed.Status == BedStatus.Available)
        };
    }

    public async Task<BuildingDto> CreateAsync(CreateBuildingDto request)
    {
        var existing = await _unitOfWork.Repository<Building>().FindAsync(b => b.Code.ToLower() == request.Code.Trim().ToLower());
        if (existing.Any())
        {
            throw new ConflictException($"Mã tòa nhà {request.Code} đã tồn tại.");
        }

        var building = new Building
        {
            Code = request.Code.Trim().ToUpper(),
            Name = request.Name.Trim(),
            Address = request.Address.Trim(),
            NumberOfFloors = request.NumberOfFloors,
            Description = request.Description,
            GenderAllowed = request.GenderAllowed
        };

        var created = await _unitOfWork.Repository<Building>().AddAsync(building);
        await _unitOfWork.SaveChangesAsync();

        return await GetByIdAsync(created.Id);
    }

    public async Task<BuildingDto> UpdateAsync(int id, UpdateBuildingDto request)
    {
        var building = await _unitOfWork.Repository<Building>().GetByIdAsync(id);
        if (building == null) throw new NotFoundException("Tòa nhà", id);

        building.Name = request.Name.Trim();
        building.Address = request.Address.Trim();
        building.NumberOfFloors = request.NumberOfFloors;
        building.Description = request.Description;
        building.GenderAllowed = request.GenderAllowed;
        building.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Repository<Building>().UpdateAsync(building);
        await _unitOfWork.SaveChangesAsync();

        return await GetByIdAsync(building.Id);
    }

    public async Task DeleteAsync(int id)
    {
        var building = await _unitOfWork.Repository<Building>().GetByIdAsync(id);
        if (building == null) throw new NotFoundException("Tòa nhà", id);

        var rooms = await _unitOfWork.Repository<Room>().FindAsync(r => r.BuildingId == id);
        if (rooms.Any())
        {
            throw new ValidationException("Không thể xóa tòa nhà đang có phòng. Vui lòng xóa hoặc di chuyển các phòng trước.");
        }

        await _unitOfWork.Repository<Building>().DeleteAsync(building);
        await _unitOfWork.SaveChangesAsync();
    }
}

