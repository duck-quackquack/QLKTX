using DormitoryManagement.Domain.Entities;
using DormitoryManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace DormitoryManagement.Infrastructure.Data;

public static class DbInitializer
{
    public static async Task InitializeAsync(ApplicationDbContext context)
    {
        await context.Database.EnsureCreatedAsync();

        if (await context.Users.AnyAsync())
        {
            return; // DB has already been seeded
        }

        // 1. Seed Users
        var adminUser = new User
        {
            Id = 1,
            Username = "admin",
            Email = "admin@kytucxa.edu.vn",
            FullName = "Ban Quản Trị KTX",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
            Phone = "0901234567",
            Role = UserRole.Admin,
            IsActive = true
        };

        var staffUser = new User
        {
            Id = 2,
            Username = "staff",
            Email = "staff@kytucxa.edu.vn",
            FullName = "Nguyễn Thị Quản Lý",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Staff@123"),
            Phone = "0909876543",
            Role = UserRole.Staff,
            IsActive = true
        };

        var student1User = new User
        {
            Id = 3,
            Username = "sv2026001",
            Email = "nguyen.vana@sinhvien.edu.vn",
            FullName = "Nguyễn Văn An",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Ktx@123456"),
            Phone = "0911223344",
            Role = UserRole.Student,
            IsActive = true
        };

        var student2User = new User
        {
            Id = 4,
            Username = "sv2026002",
            Email = "tran.thib@sinhvien.edu.vn",
            FullName = "Trần Thị Bích",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Ktx@123456"),
            Phone = "0922334455",
            Role = UserRole.Student,
            IsActive = true
        };

        var student3User = new User
        {
            Id = 5,
            Username = "sv2026003",
            Email = "le.vanc@sinhvien.edu.vn",
            FullName = "Lê Văn Cường",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Ktx@123456"),
            Phone = "0933445566",
            Role = UserRole.Student,
            IsActive = true
        };

        await context.Users.AddRangeAsync(adminUser, staffUser, student1User, student2User, student3User);
        await context.SaveChangesAsync();

        // 2. Seed Students
        var student1 = new Student
        {
            Id = 1,
            UserId = adminUser.Id == 1 ? student1User.Id : 3,
            StudentCode = "SV2026001",
            FullName = "Nguyễn Văn An",
            DateOfBirth = new DateTime(2004, 5, 15),
            Gender = "Nam",
            Phone = "0911223344",
            Email = "nguyen.vana@sinhvien.edu.vn",
            Address = "Ba Đình, Hà Nội",
            Faculty = "Công nghệ Thông tin",
            ClassName = "CNTT-K18A",
            CitizenId = "001204001234",
            IsStaying = true
        };

        var student2 = new Student
        {
            Id = 2,
            UserId = student2User.Id,
            StudentCode = "SV2026002",
            FullName = "Trần Thị Bích",
            DateOfBirth = new DateTime(2004, 8, 20),
            Gender = "Nữ",
            Phone = "0922334455",
            Email = "tran.thib@sinhvien.edu.vn",
            Address = "Cầu Giấy, Hà Nội",
            Faculty = "Kinh tế & Quản trị",
            ClassName = "QTKD-K18B",
            CitizenId = "001204005678",
            IsStaying = true
        };

        var student3 = new Student
        {
            Id = 3,
            UserId = student3User.Id,
            StudentCode = "SV2026003",
            FullName = "Lê Văn Cường",
            DateOfBirth = new DateTime(2003, 11, 10),
            Gender = "Nam",
            Phone = "0933445566",
            Email = "le.vanc@sinhvien.edu.vn",
            Address = "TP. Bắc Ninh",
            Faculty = "Điện tử Viễn thông",
            ClassName = "DTVT-K17A",
            CitizenId = "001203009988",
            IsStaying = false
        };

        await context.Students.AddRangeAsync(student1, student2, student3);
        await context.SaveChangesAsync();

        // 3. Seed Buildings
        var buildingA = new Building
        {
            Id = 1,
            Code = "A",
            Name = "Tòa Nhà A (Nam)",
            Address = "Khu ký túc xá phía Đông",
            NumberOfFloors = 4,
            Description = "Dành riêng cho sinh viên Nam, đầy đủ điều hòa, ban công",
            GenderAllowed = "Nam"
        };

        var buildingB = new Building
        {
            Id = 2,
            Code = "B",
            Name = "Tòa Nhà B (Nữ)",
            Address = "Khu ký túc xá phía Tây",
            NumberOfFloors = 4,
            Description = "Dành riêng cho sinh viên Nữ, có camera an ninh 24/7",
            GenderAllowed = "Nữ"
        };

        var buildingC = new Building
        {
            Id = 3,
            Code = "C",
            Name = "Tòa Nhà C (Dịch vụ cao cấp)",
            Address = "Khu ký túc xá trung tâm",
            NumberOfFloors = 5,
            Description = "Phòng dịch vụ tiêu chuẩn 2 người / phòng khép kín",
            GenderAllowed = "Tất cả"
        };

        await context.Buildings.AddRangeAsync(buildingA, buildingB, buildingC);
        await context.SaveChangesAsync();

        // 4. Seed Rooms & Beds for Building A
        var rooms = new List<Room>();
        var beds = new List<Bed>();

        // Tòa A - Phòng A101, A102, A201, A202
        var rA101 = new Room { Id = 1, BuildingId = buildingA.Id, RoomNumber = "A101", Floor = 1, RoomType = "4 người", Capacity = 4, BasePrice = 650000, Status = RoomStatus.Available, GenderAllowed = "Nam" };
        var rA102 = new Room { Id = 2, BuildingId = buildingA.Id, RoomNumber = "A102", Floor = 1, RoomType = "4 người", Capacity = 4, BasePrice = 650000, Status = RoomStatus.Available, GenderAllowed = "Nam" };
        var rA201 = new Room { Id = 3, BuildingId = buildingA.Id, RoomNumber = "A201", Floor = 2, RoomType = "4 người", Capacity = 4, BasePrice = 600000, Status = RoomStatus.Available, GenderAllowed = "Nam" };
        var rA202 = new Room { Id = 4, BuildingId = buildingA.Id, RoomNumber = "A202", Floor = 2, RoomType = "4 người", Capacity = 4, BasePrice = 600000, Status = RoomStatus.Available, GenderAllowed = "Nam" };

        // Tòa B - Phòng B101, B102, B201
        var rB101 = new Room { Id = 5, BuildingId = buildingB.Id, RoomNumber = "B101", Floor = 1, RoomType = "4 người", Capacity = 4, BasePrice = 650000, Status = RoomStatus.Available, GenderAllowed = "Nữ" };
        var rB102 = new Room { Id = 6, BuildingId = buildingB.Id, RoomNumber = "B102", Floor = 1, RoomType = "4 người", Capacity = 4, BasePrice = 650000, Status = RoomStatus.Available, GenderAllowed = "Nữ" };
        var rB201 = new Room { Id = 7, BuildingId = buildingB.Id, RoomNumber = "B201", Floor = 2, RoomType = "4 người", Capacity = 4, BasePrice = 600000, Status = RoomStatus.Available, GenderAllowed = "Nữ" };

        // Tòa C - VIP 2 người
        var rC101 = new Room { Id = 8, BuildingId = buildingC.Id, RoomNumber = "C101", Floor = 1, RoomType = "2 người", Capacity = 2, BasePrice = 1200000, Status = RoomStatus.Available, GenderAllowed = "Nam" };

        rooms.AddRange(new[] { rA101, rA102, rA201, rA202, rB101, rB102, rB201, rC101 });
        await context.Rooms.AddRangeAsync(rooms);
        await context.SaveChangesAsync();

        int bedIdCounter = 1;
        foreach (var r in rooms)
        {
            for (int i = 1; i <= r.Capacity; i++)
            {
                beds.Add(new Bed
                {
                    Id = bedIdCounter++,
                    RoomId = r.Id,
                    BedNumber = $"G{i:D2}",
                    Status = BedStatus.Available
                });
            }
        }
        await context.Beds.AddRangeAsync(beds);
        await context.SaveChangesAsync();

        // 5. Seed Active Contract for Student 1 (A101 - G01) & Student 2 (B101 - G01)
        var bedA101_1 = beds.First(b => b.RoomId == rA101.Id && b.BedNumber == "G01");
        bedA101_1.Status = BedStatus.Occupied;

        var bedB101_1 = beds.First(b => b.RoomId == rB101.Id && b.BedNumber == "G01");
        bedB101_1.Status = BedStatus.Occupied;

        var contract1 = new Contract
        {
            Id = 1,
            ContractNumber = $"HD-202609-{student1.Id:D4}",
            StudentId = student1.Id,
            RoomId = rA101.Id,
            BedId = bedA101_1.Id,
            StartDate = new DateTime(2026, 9, 1),
            EndDate = new DateTime(2027, 2, 28),
            MonthlyRent = rA101.BasePrice,
            DepositAmount = 650000,
            Status = ContractStatus.Active,
            Terms = "Nội quy ký túc xá theo quy chế ban hành 2026."
        };

        var contract2 = new Contract
        {
            Id = 2,
            ContractNumber = $"HD-202609-{student2.Id:D4}",
            StudentId = student2.Id,
            RoomId = rB101.Id,
            BedId = bedB101_1.Id,
            StartDate = new DateTime(2026, 9, 1),
            EndDate = new DateTime(2027, 2, 28),
            MonthlyRent = rB101.BasePrice,
            DepositAmount = 650000,
            Status = ContractStatus.Active,
            Terms = "Nội quy ký túc xá theo quy chế ban hành 2026."
        };

        await context.Contracts.AddRangeAsync(contract1, contract2);
        await context.SaveChangesAsync();

        // 6. Seed Meter Reading for A101 & B101
        var meterA101 = new MeterReading
        {
            Id = 1,
            RoomId = rA101.Id,
            Month = 9,
            Year = 2026,
            ElectricityOld = 1200,
            ElectricityNew = 1280, // 80 kWh
            WaterOld = 310,
            WaterNew = 318, // 8 m3
            ElectricityUnitPrice = 3500,
            WaterUnitPrice = 15000,
            RecordedDate = DateTime.UtcNow,
            RecordedBy = "staff"
        };

        await context.MeterReadings.AddAsync(meterA101);
        await context.SaveChangesAsync();

        // 7. Seed Invoices & Payment
        var inv1 = new Invoice
        {
            Id = 1,
            InvoiceCode = $"INV-202609-{student1.Id:D4}",
            StudentId = student1.Id,
            ContractId = contract1.Id,
            Month = 9,
            Year = 2026,
            RoomFee = 650000,
            ElectricityFee = 280000,
            WaterFee = 120000,
            ServiceFee = 30000,
            PaidAmount = 1080000,
            DueDate = new DateTime(2026, 9, 30),
            Status = InvoiceStatus.Paid,
            Notes = "Hóa đơn tiền phòng tháng 09/2026"
        };

        var inv2 = new Invoice
        {
            Id = 2,
            InvoiceCode = $"INV-202609-{student2.Id:D4}",
            StudentId = student2.Id,
            ContractId = contract2.Id,
            Month = 9,
            Year = 2026,
            RoomFee = 650000,
            ElectricityFee = 150000,
            WaterFee = 80000,
            ServiceFee = 30000,
            PaidAmount = 0,
            DueDate = new DateTime(2026, 9, 30),
            Status = InvoiceStatus.Unpaid,
            Notes = "Hóa đơn tiền phòng tháng 09/2026"
        };

        await context.Invoices.AddRangeAsync(inv1, inv2);
        await context.SaveChangesAsync();

        var pay1 = new Payment
        {
            Id = 1,
            InvoiceId = inv1.Id,
            PaymentCode = "PAY-20260912-001",
            Amount = 1080000,
            PaymentDate = DateTime.UtcNow.AddDays(-1),
            PaymentMethod = PaymentMethod.BankTransfer,
            TransactionCode = "FT2625598129",
            Status = PaymentStatus.Completed,
            Notes = "Chuyển khoản qua MBBank",
            ReceivedBy = "staff"
        };

        await context.Payments.AddAsync(pay1);

        // 8. Seed Pending Registration for Student 3
        var reg3 = new Registration
        {
            Id = 1,
            StudentId = student3.Id,
            PreferredBuildingId = buildingA.Id,
            PreferredRoomType = "4 người",
            DesiredStartDate = new DateTime(2026, 10, 1),
            DurationMonths = 6,
            ReasonOrNote = "Em là sinh viên năm 4 cần ở KTX để tiện làm đồ án tốt nghiệp.",
            Status = RegistrationStatus.Pending
        };

        await context.Registrations.AddAsync(reg3);

        // 9. Seed Repair Request
        var repair1 = new RepairRequest
        {
            Id = 1,
            StudentId = student1.Id,
            RoomId = rA101.Id,
            Title = "Hỏng vòi nước bồn rửa mặt",
            Description = "Vòi nước bị rò rỉ liên tục từ tối qua, nhờ ban quản lý cho thợ đến sửa giúp phòng em.",
            Priority = RepairPriority.High,
            Status = RepairStatus.Processing,
            StaffNotes = "Đã báo thợ điện nước kiểm tra chiều nay"
        };

        await context.RepairRequests.AddAsync(repair1);

        // 10. Seed Notifications
        var notif1 = new Notification
        {
            Id = 1,
            UserId = student1User.Id,
            Title = "Chào mừng bạn đến với Ký túc xá!",
            Content = "Hồ sơ của bạn đã hoàn tất. Vui lòng xem kỹ nội quy ký túc xá và giữ gìn vệ sinh chung.",
            Type = NotificationType.General,
            IsRead = true
        };

        var notif2 = new Notification
        {
            Id = 2,
            UserId = student2User.Id,
            Title = "Thông báo hóa đơn tháng 09/2026",
            Content = "Hóa đơn tháng 09/2026 với số tiền 910.000đ đã được phát hành. Hạn nộp: 30/09/2026.",
            Type = NotificationType.Invoice,
            IsRead = false
        };

        await context.Notifications.AddRangeAsync(notif1, notif2);
        await context.SaveChangesAsync();
    }
}
