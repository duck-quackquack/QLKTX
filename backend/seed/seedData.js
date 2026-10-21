import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Student } from '../models/Student.js';
import { Building } from '../models/Building.js';
import { Room } from '../models/Room.js';
import { Bed } from '../models/Bed.js';
import { Contract } from '../models/Contract.js';
import { MeterReading } from '../models/MeterReading.js';
import { Invoice } from '../models/Invoice.js';
import { Payment } from '../models/Payment.js';
import { Registration } from '../models/Registration.js';
import { RepairRequest } from '../models/RepairRequest.js';
import { Violation } from '../models/Violation.js';
import { Notification } from '../models/Notification.js';
import { Counter } from '../models/Counter.js';

export const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('Database already contains data, skipping seed.');
      return;
    }

    console.log('Seeding initial MongoDB database with clean Vietnamese UTF-8 data...');

    // 1. Seed Users
    const salt = await bcrypt.genSalt(10);
    const adminPass = await bcrypt.hash('Admin@123', salt);
    const staffPass = await bcrypt.hash('Staff@123', salt);
    const studentPass = await bcrypt.hash('Ktx@123456', salt);

    const users = [
      {
        id: 1,
        username: 'admin',
        email: 'admin@kytucxa.edu.vn',
        fullName: 'Ban Quản Trị KTX',
        passwordHash: adminPass,
        phone: '0901234567',
        role: 1, // Admin
        isActive: true,
      },
      {
        id: 2,
        username: 'staff',
        email: 'staff@kytucxa.edu.vn',
        fullName: 'Nguyễn Thị Quản Lý',
        passwordHash: staffPass,
        phone: '0909876543',
        role: 2, // Staff
        isActive: true,
      },
      {
        id: 3,
        username: 'sv2026001',
        email: 'nguyen.vana@sinhvien.edu.vn',
        fullName: 'Nguyễn Văn An',
        passwordHash: studentPass,
        phone: '0911223344',
        role: 3, // Student
        isActive: true,
      },
      {
        id: 4,
        username: 'sv2026002',
        email: 'tran.thib@sinhvien.edu.vn',
        fullName: 'Trần Thị Bích',
        passwordHash: studentPass,
        phone: '0922334455',
        role: 3, // Student
        isActive: true,
      },
      {
        id: 5,
        username: 'sv2026003',
        email: 'le.vanc@sinhvien.edu.vn',
        fullName: 'Lê Văn Cường',
        passwordHash: studentPass,
        phone: '0933445566',
        role: 3, // Student
        isActive: true,
      },
      {
        id: 6,
        username: 'sv2026004',
        email: 'hoang.minhtuan@sinhvien.edu.vn',
        fullName: 'Hoàng Minh Tuấn',
        passwordHash: studentPass,
        phone: '0977112233',
        role: 3, // Student
        isActive: true,
      },
      {
        id: 7,
        username: 'sv2026005',
        email: 'pham.thaomy@sinhvien.edu.vn',
        fullName: 'Phạm Thảo My',
        passwordHash: studentPass,
        phone: '0966554433',
        role: 3, // Student
        isActive: true,
      },
    ];
    await User.insertMany(users);

    // 2. Seed Students
    const students = [
      {
        id: 1,
        userId: 3,
        studentCode: 'SV2026001',
        fullName: 'Nguyễn Văn An',
        dateOfBirth: new Date('2004-05-15'),
        gender: 'Nam',
        phone: '0911223344',
        email: 'nguyen.vana@sinhvien.edu.vn',
        address: 'Ba Đình, Hà Nội',
        faculty: 'Công nghệ Thông tin',
        className: 'CNTT-K18A',
        citizenId: '001204001234',
        isStaying: true,
      },
      {
        id: 2,
        userId: 4,
        studentCode: 'SV2026002',
        fullName: 'Trần Thị Bích',
        dateOfBirth: new Date('2004-08-20'),
        gender: 'Nữ',
        phone: '0922334455',
        email: 'tran.thib@sinhvien.edu.vn',
        address: 'Cầu Giấy, Hà Nội',
        faculty: 'Kinh tế & Quản trị',
        className: 'QTKD-K18B',
        citizenId: '001204005678',
        isStaying: true,
      },
      {
        id: 3,
        userId: 5,
        studentCode: 'SV2026003',
        fullName: 'Lê Văn Cường',
        dateOfBirth: new Date('2003-11-10'),
        gender: 'Nam',
        phone: '0933445566',
        email: 'le.vanc@sinhvien.edu.vn',
        address: 'TP. Bắc Ninh',
        faculty: 'Điện tử Viễn thông',
        className: 'DTVT-K17A',
        citizenId: '001203009988',
        isStaying: false,
      },
      {
        id: 4,
        userId: 6,
        studentCode: 'SV2026004',
        fullName: 'Hoàng Minh Tuấn',
        dateOfBirth: new Date('2004-03-22'),
        gender: 'Nam',
        phone: '0977112233',
        email: 'hoang.minhtuan@sinhvien.edu.vn',
        address: 'Đống Đa, Hà Nội',
        faculty: 'Công nghệ Thông tin',
        className: 'CNTT-K18B',
        citizenId: '001204007788',
        isStaying: true,
      },
      {
        id: 5,
        userId: 7,
        studentCode: 'SV2026005',
        fullName: 'Phạm Thảo My',
        dateOfBirth: new Date('2004-12-05'),
        gender: 'Nữ',
        phone: '0966554433',
        email: 'pham.thaomy@sinhvien.edu.vn',
        address: 'Hải Phòng',
        faculty: 'Kinh tế & Quản trị',
        className: 'QTKD-K18A',
        citizenId: '001204003344',
        isStaying: false,
      },
    ];
    await Student.insertMany(students);

    // 3. Seed Buildings
    const buildings = [
      {
        id: 1,
        code: 'A',
        name: 'Tòa Nhà A (Nam)',
        address: 'Khu ký túc xá phía Đông',
        numberOfFloors: 4,
        description: 'Dành riêng cho sinh viên Nam, đầy đủ điều hòa, ban công',
        genderAllowed: 'Nam',
      },
      {
        id: 2,
        code: 'B',
        name: 'Tòa Nhà B (Nữ)',
        address: 'Khu ký túc xá phía Tây',
        numberOfFloors: 4,
        description: 'Dành riêng cho sinh viên Nữ, có camera an ninh 24/7',
        genderAllowed: 'Nữ',
      },
      {
        id: 3,
        code: 'C',
        name: 'Tòa Nhà C (Dịch vụ cao cấp)',
        address: 'Khu ký túc xá trung tâm',
        numberOfFloors: 5,
        description: 'Phòng dịch vụ tiêu chuẩn 2 người / phòng khép kín',
        genderAllowed: 'Tất cả',
      },
    ];
    await Building.insertMany(buildings);

    // 4. Seed Rooms & Beds
    const roomsData = [
      { id: 1, buildingId: 1, roomNumber: 'A101', floor: 1, roomType: '4 người', capacity: 4, basePrice: 650000, status: 2, genderAllowed: 'Nam' },
      { id: 2, buildingId: 1, roomNumber: 'A102', floor: 1, roomType: '4 người', capacity: 4, basePrice: 650000, status: 1, genderAllowed: 'Nam' },
      { id: 3, buildingId: 1, roomNumber: 'A201', floor: 2, roomType: '4 người', capacity: 4, basePrice: 600000, status: 1, genderAllowed: 'Nam' },
      { id: 4, buildingId: 1, roomNumber: 'A202', floor: 2, roomType: '4 người', capacity: 4, basePrice: 600000, status: 1, genderAllowed: 'Nam' },
      { id: 5, buildingId: 2, roomNumber: 'B101', floor: 1, roomType: '4 người', capacity: 4, basePrice: 650000, status: 2, genderAllowed: 'Nữ' },
      { id: 6, buildingId: 2, roomNumber: 'B102', floor: 1, roomType: '4 người', capacity: 4, basePrice: 650000, status: 1, genderAllowed: 'Nữ' },
      { id: 7, buildingId: 2, roomNumber: 'B201', floor: 2, roomType: '4 người', capacity: 4, basePrice: 600000, status: 1, genderAllowed: 'Nữ' },
      { id: 8, buildingId: 3, roomNumber: 'C101', floor: 1, roomType: '2 người', capacity: 2, basePrice: 1200000, status: 1, genderAllowed: 'Nam' },
    ];
    await Room.insertMany(roomsData);

    let bedIdCounter = 1;
    const beds = [];
    for (const r of roomsData) {
      for (let i = 1; i <= r.capacity; i++) {
        // Bed 1 of A101 (Student 1), Bed 2 of A101 (Student 4), Bed 1 of B101 (Student 2)
        const isOccupied = (r.id === 1 && (i === 1 || i === 2)) || (r.id === 5 && i === 1);
        beds.push({
          id: bedIdCounter++,
          roomId: r.id,
          bedNumber: `G${String(i).padStart(2, '0')}`,
          status: isOccupied ? 2 : 1,
          isOccupied,
        });
      }
    }
    await Bed.insertMany(beds);

    // 5. Seed Contracts
    const contracts = [
      {
        id: 1,
        contractNumber: 'HD-202609-0001',
        studentId: 1,
        roomId: 1,
        bedId: 1,
        startDate: new Date('2026-09-01'),
        endDate: new Date('2027-02-28'),
        monthlyRent: 650000,
        depositAmount: 650000,
        status: 2, // Active
        terms: 'Nội quy ký túc xá theo quy chế ban hành 2026.',
      },
      {
        id: 2,
        contractNumber: 'HD-202609-0002',
        studentId: 2,
        roomId: 5,
        bedId: 17, // Bed G01 in Room B101
        startDate: new Date('2026-09-01'),
        endDate: new Date('2027-02-28'),
        monthlyRent: 650000,
        depositAmount: 650000,
        status: 2, // Active
        terms: 'Nội quy ký túc xá theo quy chế ban hành 2026.',
      },
      {
        id: 3,
        contractNumber: 'HD-202609-0003',
        studentId: 4,
        roomId: 1,
        bedId: 2, // Bed G02 in Room A101
        startDate: new Date('2026-09-01'),
        endDate: new Date('2027-02-28'),
        monthlyRent: 650000,
        depositAmount: 650000,
        status: 2, // Active
        terms: 'Nội quy ký túc xá theo quy chế ban hành 2026.',
      },
    ];
    await Contract.insertMany(contracts);

    // 6. Seed Meter Reading
    const meterReadings = [
      {
        id: 1,
        roomId: 1,
        month: 9,
        year: 2026,
        electricityOld: 1200,
        electricityNew: 1280,
        waterOld: 310,
        waterNew: 318,
        electricityUnitPrice: 3500,
        waterUnitPrice: 15000,
        electricityUsage: 80,
        waterUsage: 8,
        totalElectricityCost: 280000,
        totalWaterCost: 120000,
        recordedDate: new Date(),
        recordedBy: 'staff',
      },
    ];
    await MeterReading.insertMany(meterReadings);

    // 7. Seed Invoices & Payments
    const invoices = [
      {
        id: 1,
        invoiceCode: 'INV-202609-0001',
        studentId: 1,
        contractId: 1,
        month: 9,
        year: 2026,
        roomFee: 650000,
        electricityFee: 280000,
        waterFee: 120000,
        serviceFee: 30000,
        otherFee: 0,
        totalAmount: 1080000,
        paidAmount: 1080000,
        remainingAmount: 0,
        dueDate: new Date('2026-09-30'),
        status: 3, // Paid
        notes: 'Hóa đơn tiền phòng tháng 09/2026',
      },
      {
        id: 2,
        invoiceCode: 'INV-202609-0002',
        studentId: 2,
        contractId: 2,
        month: 9,
        year: 2026,
        roomFee: 650000,
        electricityFee: 150000,
        waterFee: 80000,
        serviceFee: 30000,
        otherFee: 0,
        totalAmount: 910000,
        paidAmount: 0,
        remainingAmount: 910000,
        dueDate: new Date('2026-09-30'),
        status: 1, // Unpaid
        notes: 'Hóa đơn tiền phòng tháng 09/2026',
      },
    ];
    await Invoice.insertMany(invoices);

    const payments = [
      {
        id: 1,
        invoiceId: 1,
        paymentCode: 'PAY-20260912-001',
        amount: 1080000,
        paymentDate: new Date(Date.now() - 86400000),
        paymentMethod: 2, // BankTransfer
        transactionCode: 'FT2625598129',
        status: 2, // Completed
        notes: 'Chuyển khoản qua MBBank',
        receivedBy: 'staff',
      },
    ];
    await Payment.insertMany(payments);

    // 8. Seed Registrations
    const registrations = [
      {
        id: 1,
        registrationCode: 'REG-20260912-0001',
        studentId: 3,
        preferredBuildingId: 1,
        preferredRoomType: '4 người',
        desiredStartDate: new Date('2026-10-01'),
        durationMonths: 6,
        reasonOrNote: 'Em là sinh viên năm 4 cần ở KTX để tiện làm đồ án tốt nghiệp.',
        status: 1, // Pending
      },
      {
        id: 2,
        registrationCode: 'REG-20260915-0002',
        studentId: 5,
        preferredBuildingId: 2,
        preferredRoomType: '4 người',
        desiredStartDate: new Date('2026-10-01'),
        durationMonths: 6,
        reasonOrNote: 'Em là sinh viên năm nhất ngoại tỉnh đăng ký nội trú.',
        status: 1, // Pending
      },
      {
        id: 3,
        registrationCode: 'REG-20260901-0003',
        studentId: 4,
        preferredBuildingId: 1,
        preferredRoomType: '4 người',
        desiredStartDate: new Date('2026-09-01'),
        durationMonths: 6,
        reasonOrNote: 'Đăng ký phòng học tập.',
        status: 2, // Approved
        approvedRoomId: 1,
        approvedBedId: 2,
        adminNote: 'Hồ sơ đạt tiêu chuẩn',
        reviewedAt: new Date('2026-09-01'),
      },
    ];
    await Registration.insertMany(registrations);

    // 9. Seed Repair Requests
    const repairs = [
      {
        id: 1,
        studentId: 1,
        roomId: 1,
        title: 'Hỏng vòi nước bồn rửa mặt',
        description: 'Vòi nước bị rò rỉ liên tục từ tối qua, nhờ ban quản lý cho thợ đến sửa giúp phòng em.',
        priority: 3, // High
        status: 2, // Processing
        staffNotes: 'Đã báo thợ điện nước kiểm tra chiều nay',
      },
      {
        id: 2,
        studentId: 4,
        roomId: 1,
        title: 'Thay bóng đèn LED bàn học',
        description: 'Bóng đèn bàn học góc trái phòng A101 bị chớp nháy.',
        priority: 2, // Medium
        status: 1, // Pending
        staffNotes: '',
      },
    ];
    await RepairRequest.insertMany(repairs);

    // 10. Seed Violations
    const violations = [
      {
        id: 1,
        studentId: 3,
        title: 'Về phòng muộn sau giờ giới nghiêm',
        description: 'Về phòng sau 23h30 không có lý do chính đáng.',
        violationType: 'Nội quy giờ giấc',
        penaltyAmount: 50000,
        violationDate: new Date(Date.now() - 3 * 86400000),
        status: 1, // Pending
        createdBy: 'Ban Quản Trị KTX',
      },
    ];
    await Violation.insertMany(violations);

    // 11. Seed Notifications
    const notifications = [
      {
        id: 1,
        userId: 3,
        title: 'Chào mừng bạn đến với Ký túc xá!',
        content: 'Hồ sơ của bạn đã hoàn tất. Vui lòng xem kỹ nội quy ký túc xá và giữ gìn vệ sinh chung.',
        type: 1, // General
        isRead: true,
      },
      {
        id: 2,
        userId: 4,
        title: 'Thông báo hóa đơn tháng 09/2026',
        content: 'Hóa đơn tháng 09/2026 với số tiền 910.000đ đã được phát hành. Hạn nộp: 30/09/2026.',
        type: 2, // Invoice
        isRead: false,
      },
      {
        id: 3,
        userId: 6,
        title: 'Hợp đồng lưu trú đã có hiệu lực',
        content: 'Hợp đồng lưu trú phòng A101 (Giường G02) của bạn đã được kích hoạt thành công.',
        type: 1,
        isRead: true,
      },
    ];
    await Notification.insertMany(notifications);

    // 12. Set Sequence Counters
    const counters = [
      { name: 'user_id', seq: 7 },
      { name: 'student_id', seq: 5 },
      { name: 'building_id', seq: 3 },
      { name: 'room_id', seq: 8 },
      { name: 'bed_id', seq: bedIdCounter },
      { name: 'contract_id', seq: 3 },
      { name: 'meter_reading_id', seq: 1 },
      { name: 'invoice_id', seq: 2 },
      { name: 'payment_id', seq: 1 },
      { name: 'registration_id', seq: 3 },
      { name: 'repair_id', seq: 2 },
      { name: 'violation_id', seq: 1 },
      { name: 'notification_id', seq: 3 },
    ];
    await Counter.insertMany(counters);

    console.log('MongoDB database seeded successfully with pristine Vietnamese UTF-8 data!');
  } catch (error) {
    console.error('Error during database seed:', error);
  }
};
