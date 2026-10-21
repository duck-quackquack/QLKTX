export const currentUser = {
  id: "U001",
  name: "Nguyễn Thị Mai",
  username: "admin.mai",
  email: "mai.nguyen@university.edu.vn",
  phone: "0901 234 567",
  role: "admin" as "admin" | "staff" | "student",
  avatar: "",
};

export const studentUser = {
  id: "SV2021001",
  name: "Nguyễn Văn An",
  username: "an.nguyen",
  email: "an.nguyen@student.edu.vn",
  phone: "0912 345 678",
  role: "student" as "admin" | "staff" | "student",
  mssv: "SV2021001",
  khoa: "Công nghệ thông tin",
  lop: "CNTT21A",
  toa: "A",
  phong: "A-305",
  giuong: "Giường 2",
  trangThaiNoiTru: "active" as "active" | "inactive" | "pending",
  avatar: "",
};

export const buildings = [
  { id: "A", name: "Tòa A", type: "Nam", floors: 8, totalRooms: 96, occupied: 84, available: 12, status: "active" },
  { id: "B", name: "Tòa B", type: "Nữ", floors: 8, totalRooms: 96, occupied: 90, available: 6, status: "active" },
  { id: "C", name: "Tòa C", type: "Nam", floors: 6, totalRooms: 72, occupied: 60, available: 12, status: "active" },
  { id: "D", name: "Tòa D", type: "Nữ", floors: 6, totalRooms: 72, occupied: 68, available: 4, status: "active" },
  { id: "E", name: "Tòa E", type: "Hỗn hợp", floors: 10, totalRooms: 120, occupied: 105, available: 15, status: "active" },
  { id: "F", name: "Tòa F", type: "Nam", floors: 5, totalRooms: 60, occupied: 45, available: 10, status: "maintenance" },
];

export const rooms = [
  { id: "A-101", building: "A", floor: 1, type: "4 người", capacity: 4, occupied: 4, available: 0, price: 450000, status: "full" },
  { id: "A-102", building: "A", floor: 1, type: "4 người", capacity: 4, occupied: 3, available: 1, price: 450000, status: "available" },
  { id: "A-201", building: "A", floor: 2, type: "6 người", capacity: 6, occupied: 5, available: 1, price: 380000, status: "available" },
  { id: "A-305", building: "A", floor: 3, type: "4 người", capacity: 4, occupied: 4, available: 0, price: 450000, status: "full" },
  { id: "B-101", building: "B", floor: 1, type: "2 người", capacity: 2, occupied: 2, available: 0, price: 650000, status: "full" },
  { id: "B-201", building: "B", floor: 2, type: "4 người", capacity: 4, occupied: 2, available: 2, price: 480000, status: "available" },
  { id: "C-101", building: "C", floor: 1, type: "6 người", capacity: 6, occupied: 0, available: 6, price: 350000, status: "available" },
  { id: "D-301", building: "D", floor: 3, type: "4 người", capacity: 4, occupied: 4, available: 0, price: 450000, status: "maintenance" },
];

export const students = [
  { id: "SV2021001", name: "Nguyễn Văn An", faculty: "CNTT", class: "CNTT21A", room: "A-305", bed: "Giường 2", phone: "0912 345 678", email: "an.nguyen@student.edu.vn", status: "active", avatar: "" },
  { id: "SV2021002", name: "Trần Thị Bình", faculty: "Kinh tế", class: "KT21B", room: "B-201", bed: "Giường 1", phone: "0923 456 789", email: "binh.tran@student.edu.vn", status: "active", avatar: "" },
  { id: "SV2021003", name: "Lê Minh Cường", faculty: "Cơ khí", class: "CK21A", room: "A-102", bed: "Giường 3", phone: "0934 567 890", email: "cuong.le@student.edu.vn", status: "active", avatar: "" },
  { id: "SV2020045", name: "Phạm Thị Dung", faculty: "CNTT", class: "CNTT20C", room: "B-101", bed: "Giường 1", phone: "0945 678 901", email: "dung.pham@student.edu.vn", status: "active", avatar: "" },
  { id: "SV2022010", name: "Hoàng Văn Em", faculty: "Xây dựng", class: "XD22A", room: "C-101", bed: "Giường 1", phone: "0956 789 012", email: "em.hoang@student.edu.vn", status: "pending", avatar: "" },
  { id: "SV2021018", name: "Ngô Thị Phương", faculty: "Y dược", class: "YD21A", room: "D-301", bed: "Giường 2", phone: "0967 890 123", email: "phuong.ngo@student.edu.vn", status: "active", avatar: "" },
  { id: "SV2020088", name: "Vũ Đình Giang", faculty: "Luật", class: "L20B", room: "A-201", bed: "Giường 4", phone: "0978 901 234", email: "giang.vu@student.edu.vn", status: "inactive", avatar: "" },
  { id: "SV2022055", name: "Đinh Thị Hoa", faculty: "Sư phạm", class: "SP22A", room: "B-201", bed: "Giường 2", phone: "0989 012 345", email: "hoa.dinh@student.edu.vn", status: "active", avatar: "" },
];

export const registrations = [
  { id: "DK001", student: "Trần Văn Hùng", mssv: "SV2023001", faculty: "CNTT", building: "A", room: "A-102", bed: "Giường 4", submitDate: "18/09/2026", status: "pending" },
  { id: "DK002", student: "Lê Thị Kim", mssv: "SV2023002", faculty: "Kinh tế", building: "B", room: "B-201", bed: "Giường 3", submitDate: "17/09/2026", status: "approved" },
  { id: "DK003", student: "Phạm Minh Long", mssv: "SV2023003", faculty: "Cơ khí", building: "A", room: "A-201", bed: "Giường 6", submitDate: "16/09/2026", status: "pending" },
  { id: "DK004", student: "Nguyễn Thị Mai", mssv: "SV2023004", faculty: "Y dược", building: "B", room: "B-101", bed: "Giường 2", submitDate: "15/09/2026", status: "rejected", reason: "Phòng đã đầy" },
  { id: "DK005", student: "Hoàng Quốc Nam", mssv: "SV2023005", faculty: "Xây dựng", building: "C", room: "C-101", bed: "Giường 2", submitDate: "14/09/2026", status: "approved" },
];

export const contracts = [
  { id: "HD001", student: "Nguyễn Văn An", mssv: "SV2021001", room: "A-305", bed: "Giường 2", startDate: "01/09/2024", endDate: "31/08/2025", rent: 450000, deposit: 900000, status: "active" },
  { id: "HD002", student: "Trần Thị Bình", mssv: "SV2021002", room: "B-201", bed: "Giường 1", startDate: "01/09/2024", endDate: "31/08/2025", rent: 480000, deposit: 960000, status: "active" },
  { id: "HD003", student: "Lê Minh Cường", mssv: "SV2021003", room: "A-102", bed: "Giường 3", startDate: "01/09/2024", endDate: "31/08/2025", rent: 450000, deposit: 900000, status: "active" },
  { id: "HD004", student: "Phạm Thị Dung", mssv: "SV2020045", room: "B-101", bed: "Giường 1", startDate: "01/09/2023", endDate: "31/08/2024", rent: 650000, deposit: 1300000, status: "expired" },
  { id: "HD005", student: "Vũ Đình Giang", mssv: "SV2020088", room: "A-201", bed: "Giường 4", startDate: "15/09/2024", endDate: "14/09/2025", rent: 380000, deposit: 760000, status: "terminated" },
];

export const invoices = [
  { id: "HĐ2609001", student: "Nguyễn Văn An", mssv: "SV2021001", room: "A-305", month: "09/2026", roomFee: 450000, electricity: 85000, water: 32000, serviceFee: 30000, total: 597000, paid: 597000, remaining: 0, dueDate: "15/10/2026", status: "paid" },
  { id: "HĐ2609002", student: "Trần Thị Bình", mssv: "SV2021002", room: "B-201", month: "09/2026", roomFee: 480000, electricity: 92000, water: 28000, serviceFee: 30000, total: 630000, paid: 0, remaining: 630000, dueDate: "15/10/2026", status: "unpaid" },
  { id: "HĐ2609003", student: "Lê Minh Cường", mssv: "SV2021003", room: "A-102", month: "09/2026", roomFee: 450000, electricity: 76000, water: 35000, serviceFee: 30000, total: 591000, paid: 300000, remaining: 291000, dueDate: "15/10/2026", status: "partial" },
  { id: "HĐ2608001", student: "Phạm Thị Dung", mssv: "SV2020045", room: "B-101", month: "08/2026", roomFee: 650000, electricity: 110000, water: 42000, serviceFee: 30000, total: 832000, paid: 0, remaining: 832000, dueDate: "15/09/2026", status: "overdue" },
  { id: "HĐ2609004", student: "Ngô Thị Phương", mssv: "SV2021018", room: "D-301", month: "09/2026", roomFee: 450000, electricity: 88000, water: 30000, serviceFee: 30000, total: 598000, paid: 598000, remaining: 0, dueDate: "15/10/2026", status: "paid" },
];

export const repairs = [
  { id: "SC001", student: "Nguyễn Văn An", room: "A-305", device: "Điều hòa", title: "Điều hòa không mát", description: "Điều hòa phòng A-305 chạy nhưng không ra khí lạnh.", priority: "high", status: "processing", submitDate: "20/09/2026", assignedTo: "Kỹ thuật viên Minh" },
  { id: "SC002", student: "Trần Thị Bình", room: "B-201", device: "Vòi nước", title: "Vòi nước bị rò rỉ", description: "Vòi nước trong phòng tắm bị rò rỉ.", priority: "normal", status: "received", submitDate: "19/09/2026", assignedTo: "" },
  { id: "SC003", student: "Lê Minh Cường", room: "A-102", device: "Ổ điện", title: "Ổ điện bị chập", description: "Ổ điện gần cửa sổ bị chập, không dùng được.", priority: "urgent", status: "pending", submitDate: "21/09/2026", assignedTo: "" },
  { id: "SC004", student: "Phạm Thị Dung", room: "B-101", device: "Đèn", title: "Đèn phòng ngủ hỏng", description: "Đèn trần phòng ngủ không bật được.", priority: "low", status: "completed", submitDate: "15/09/2026", assignedTo: "Kỹ thuật viên Hùng" },
];

export const violations = [
  { id: "VP001", student: "Lê Minh Cường", mssv: "SV2021003", room: "A-102", type: "Về muộn", description: "Về KTX lúc 00:45, quá giờ quy định.", date: "18/09/2026", fine: 100000, status: "pending" },
  { id: "VP002", student: "Hoàng Quốc Nam", mssv: "SV2023005", room: "C-101", type: "Gây ồn ào", description: "Mở nhạc to sau 22:00, làm ảnh hưởng đến các phòng xung quanh.", date: "17/09/2026", fine: 200000, status: "resolved" },
  { id: "VP003", student: "Vũ Đình Giang", mssv: "SV2020088", room: "A-201", type: "Nấu ăn trái phép", description: "Sử dụng bếp điện trong phòng trái quy định.", date: "16/09/2026", fine: 300000, status: "pending" },
];

export const notifications = [
  { id: "TB001", title: "Hóa đơn tháng 09/2026 đã được tạo", content: "Hóa đơn tháng 09/2026 cho phòng A-305 đã được tạo. Vui lòng thanh toán trước ngày 15/10/2026.", type: "invoice", date: "22/09/2026 08:00", read: false },
  { id: "TB002", title: "Yêu cầu sửa chữa #SC001 đang được xử lý", content: "Yêu cầu sửa chữa điều hòa của bạn đã được tiếp nhận và đang được xử lý.", type: "repair", date: "21/09/2026 14:30", read: false },
  { id: "TB003", title: "Thông báo kiểm tra phòng định kỳ", content: "Ban quản lý KTX thông báo sẽ tiến hành kiểm tra phòng định kỳ vào ngày 25/09/2026.", type: "general", date: "20/09/2026 09:00", read: true },
  { id: "TB004", title: "Đơn đăng ký nội trú đã được duyệt", content: "Đơn đăng ký nội trú của bạn đã được phê duyệt. Chào mừng đến KTX Đại học!", type: "registration", date: "01/09/2026 16:00", read: true },
];

export const revenueData = [
  { month: "T4", revenue: 285000000 },
  { month: "T5", revenue: 302000000 },
  { month: "T6", revenue: 298000000 },
  { month: "T7", revenue: 315000000 },
  { month: "T8", revenue: 328000000 },
  { month: "T9", revenue: 341000000 },
];

export const roomStatusData = [
  { name: "Còn chỗ", value: 59, color: "#16a34a" },
  { name: "Đầy", value: 407, color: "#2563eb" },
  { name: "Bảo trì", value: 50, color: "#d97706" },
];

export const buildingStudentData = [
  { toa: "Tòa A", soSV: 156 },
  { toa: "Tòa B", soSV: 180 },
  { toa: "Tòa C", soSV: 120 },
  { toa: "Tòa D", soSV: 136 },
  { toa: "Tòa E", soSV: 210 },
  { toa: "Tòa F", soSV: 90 },
];

export const invoiceStatusData = [
  { name: "Đã thanh toán", value: 68, color: "#16a34a" },
  { name: "Chưa thanh toán", value: 18, color: "#dc2626" },
  { name: "Một phần", value: 9, color: "#d97706" },
  { name: "Quá hạn", value: 5, color: "#7c3aed" },
];
