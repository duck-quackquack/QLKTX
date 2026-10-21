using DormitoryManagement.Application.Common;
using DormitoryManagement.Domain.Enums;

namespace DormitoryManagement.Application.DTOs;

public class BuildingDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public int NumberOfFloors { get; set; }
    public string? Description { get; set; }
    public string? GenderAllowed { get; set; }
    public int TotalRooms { get; set; }
    public int TotalBeds { get; set; }
    public int OccupiedBeds { get; set; }
    public int AvailableBeds { get; set; }
}

public class CreateBuildingDto
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public int NumberOfFloors { get; set; } = 4;
    public string? Description { get; set; }
    public string? GenderAllowed { get; set; }
}

public class UpdateBuildingDto : CreateBuildingDto
{
}

public class BedDto
{
    public int Id { get; set; }
    public int RoomId { get; set; }
    public string BedNumber { get; set; } = string.Empty;
    public BedStatus Status { get; set; }
    public string? Notes { get; set; }

    // Student residing if any
    public int? StudentId { get; set; }
    public string? StudentName { get; set; }
    public string? StudentCode { get; set; }
    public int? ContractId { get; set; }
}

public class RoomDto
{
    public int Id { get; set; }
    public int BuildingId { get; set; }
    public string BuildingName { get; set; } = string.Empty;
    public string BuildingCode { get; set; } = string.Empty;
    public string RoomNumber { get; set; } = string.Empty;
    public int Floor { get; set; }
    public string RoomType { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public decimal BasePrice { get; set; }
    public RoomStatus Status { get; set; }
    public string? Description { get; set; }
    public string? GenderAllowed { get; set; }

    public int OccupiedCount { get; set; }
    public int AvailableCount { get; set; }
    public List<BedDto> Beds { get; set; } = new();
}

public class CreateRoomDto
{
    public int BuildingId { get; set; }
    public string RoomNumber { get; set; } = string.Empty;
    public int Floor { get; set; } = 1;
    public string RoomType { get; set; } = "4 người";
    public int Capacity { get; set; } = 4;
    public decimal BasePrice { get; set; } = 600000;
    public string? Description { get; set; }
    public string? GenderAllowed { get; set; }
    public bool AutoGenerateBeds { get; set; } = true;
}

public class UpdateRoomDto
{
    public string RoomNumber { get; set; } = string.Empty;
    public int Floor { get; set; }
    public string RoomType { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public decimal BasePrice { get; set; }
    public RoomStatus Status { get; set; }
    public string? Description { get; set; }
    public string? GenderAllowed { get; set; }
}

public class RoomFilterDto : PaginationFilter
{
    public int? BuildingId { get; set; }
    public int? Floor { get; set; }
    public RoomStatus? Status { get; set; }
    public string? GenderAllowed { get; set; }
    public bool? HasAvailableBeds { get; set; }
}
