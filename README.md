# Hệ Thống Quản Lý Ký Túc Xá (QLKTX)

Hệ thống quản lý nội trú Ký túc xá toàn diện được xây dựng chuẩn kiến trúc doanh nghiệp:
- **Backend**: **ASP.NET Core Web API 8.0** theo mô hình **Clean Architecture** (Domain, Application, Infrastructure, API), Entity Framework Core (hỗ trợ **MongoDB**, SQLite, SQL Server), JWT Authentication, Global Exception Handling, Serilog logging.
- **Database**: **MongoDB Server 8.x** (Database name: `DormitoryDb` trên `mongodb://localhost:27017`), tự động đồng bộ hóa và tạo collections / Seed data.
- **Frontend**: **React 18 + TypeScript + Vite + Tailwind CSS**, Lucide Icons, Axios Interceptors, Sơ đồ phòng trực quan (Room Map), Bảng điều khiển phân tích số liệu (Dashboard).

---

## 👥 Tài khoản Mẫu Đăng Nhập (Demo Accounts)

| Vai trò | Tên đăng nhập | Mật khẩu | Chức năng chính |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin` | `Admin@123` | Quản lý toàn bộ hệ thống, phân quyền, sơ đồ phòng, doanh thu |
| **Nhân viên KTX (Staff)** | `staff` | `Staff@123` | Tiếp nhận sinh viên, duyệt đơn, xếp phòng, ghi điện nước |
| **Sinh viên (Student 1)** | `sv2026001` | `Ktx@123456` | Xem phòng (A101 - G01), hợp đồng, hóa đơn, báo hỏng thiết bị |
| **Sinh viên (Student 2)** | `sv2026002` | `Ktx@123456` | Xem phòng (B101 - G01), thanh toán tiền phòng |
| **Sinh viên mới** | `sv2026003` | `Ktx@123456` | Nộp đơn đăng ký phòng trực tuyến |

---

## 🍃 Quản Lý Cơ Sở Dữ Liệu MongoDB

- **Connection String**: `mongodb://localhost:27017`
- **Tên Database**: `DormitoryDb`
- **Các Collections**:
  - `users`: Quản lý tài khoản (Admin, Staff, Student)
  - `students`: Hồ sơ sinh viên nội trú
  - `buildings`: Danh sách các tòa nhà KTX (Tòa A, B, C)
  - `rooms`: Danh sách các phòng
  - `beds`: Danh sách các giường trong từng phòng
  - `contracts`: Hợp đồng lưu trú
  - `invoices`: Hóa đơn tiền phòng & dịch vụ
  - `payments`: Lịch sử thanh toán
  - `meter_readings`: Chỉ số điện / nước từng tháng
  - `registrations`: Đơn đăng ký phòng online
  - `repair_requests`: Yêu cầu sửa chữa thiết bị
  - `violations`: Biên bản vi phạm nội quy
  - `notifications`: Thông báo hệ thống

Bạn có thể mở **MongoDB Compass** hoặc terminal **mongosh** để xem toàn bộ dữ liệu trực quan:
```bash
mongosh "mongodb://localhost:27017/DormitoryDb"
```

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Khởi chạy Backend (.NET 8 Web API)
```bash
cd backend/src/DormitoryManagement.API
dotnet restore
dotnet run
```
- API Swagger UI: `http://localhost:5000` hoặc `https://localhost:5001`
- Dữ liệu mẫu (Seed Data) sẽ tự động khởi tạo vào database `dormitory.db` khi khởi động lần đầu.

### 2. Khởi chạy Frontend (React + TypeScript)
```bash
cd frontend
npm install
npm run dev
```
- Truy cập giao diện ứng dụng tại: `http://localhost:3000`

---

## 🐳 Khởi Chạy Bằng Docker Compose (Production Ready)
```bash
docker-compose up --build
```
- Ứng dụng chạy tại: `http://localhost:3000`

---

## 📁 Cấu Trúc Mã Nguồn

```
QLKTX/
├── backend/
│   ├── DormitoryManagement.sln
│   ├── src/
│   │   ├── DormitoryManagement.Domain/          # Core Entities, Enums, Interfaces
│   │   ├── DormitoryManagement.Application/     # Services, DTOs, Business Logic
│   │   ├── DormitoryManagement.Infrastructure/  # DbContext, Repository, JWT, Seed Data
│   │   └── DormitoryManagement.API/             # 13 Controllers, Middlewares, Program.cs
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── api/                                 # Axios API clients
│   │   ├── components/                          # UI components (Table, Modal, Badge, RoomMap)
│   │   ├── contexts/                            # AuthContext & RBAC
│   │   ├── pages/admin/                         # 12 Trang quản trị Admin & Staff
│   │   ├── pages/student/                       # 8 Trang Portal Sinh Viên
│   │   └── App.tsx                              # React Router v6 & Protected Routes
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml
└── plan.docx
```

