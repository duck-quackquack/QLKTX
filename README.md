# 🏫 Hệ Thống Quản Lý Ký Túc Xá (Dormitory Management System - QLKTX)

![Node.js](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/Frontend-React%2018%20%7C%20TypeScript-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Vite](https://img.shields.io/badge/Build-Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

Hệ thống Quản lý Ký túc xá toàn diện được thiết kế theo tiêu chuẩn hiện đại, phục vụ 2 nhóm người dùng chính: **Ban Quản Lý Ký Túc Xá** (Cán bộ & Nhân viên) và **Sinh Viên Nội Trú**. Ứng dụng tích hợp các giải pháp chuyển đổi số thông minh như Thẻ sinh viên điện tử QR Code, Thanh toán tự động chuẩn VietQR và Đăng nhập một chạm qua Google / Facebook.

---

## 👥 Tài khoản Mẫu Đăng Nhập (Demo Accounts)

| Vai trò | Tên đăng nhập | Mật khẩu | Chức năng chính |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin` | `Admin@123` | Quản lý toàn bộ hệ thống, phân quyền, cấu hình STK ngân hàng, sơ đồ phòng, doanh thu, quản lý Khoa/Viện |
| **Nhân viên KTX (Staff)** | `staff` | `Staff@123` | Tiếp nhận sinh viên, duyệt đơn xếp phòng, ghi điện nước, xử lý báo hỏng, lập biên bản kỷ luật |
| **Sinh viên nội trú** | `sv2026001` | `Ktx@123456` | Xem thông tin phòng (A101 - G01), thẻ SV QR, hợp đồng, báo hỏng, thanh toán hóa đơn |
| **Sinh viên (Đang nộp đơn)** | `sv2026003` | `Ktx@123456` | Theo dõi tiến độ duyệt đơn đăng ký phòng trực tuyến |

---

## ✨ Tính Năng Nổi Bật

### 🎓 1. Cổng Thông Tin Sinh Viên (Student Portal)
- **Thẻ Sinh Viên Điện Tử & Mã QR Cá Nhân:** Tích hợp mã QR chuẩn hóa cho phép sinh viên quét mã kiểm tra hồ sơ lưu trú, thông tin phòng ở, trạng thái hợp đồng ngay trên thiết bị di động.
- **Trung Tâm Thanh Toán Trực Tuyến Đa Khoản (Unified Payables):** Cho phép sinh viên thanh toán tập trung tất cả các khoản chi phí (tiền phòng, tiền điện, tiền nước, phí dịch vụ, phí sửa chữa hư hại, tiền phạt vi phạm nội quy) qua mã **VietQR** động (tự động điền số tài khoản KTX, số tiền và nội dung chuyển khoản).
- **Đăng Ký Lưu Trú Trực Tuyến:** Sinh viên mới có thể nộp đơn trực tuyến, chọn nguyện vọng tòa nhà, loại phòng và số phòng mong muốn.
- **Báo Hỏng & Sửa Chữa Thiết Bị:** Gửi yêu cầu sửa chữa cơ sở vật chất kèm mô tả và theo dõi trạng thái tiếp nhận, hoàn tất từ kỹ thuật viên.
- **Đăng Nhập & Liên Kết Mạng Xã Hội:** Đăng nhập 1 chạm tiện lợi bằng Google hoặc Facebook (SDK hỗ trợ nhận diện và liên kết an toàn vào tài khoản KTX).

### 🏢 2. Cổng Quản Trị (Admin & Staff Dashboard)
- **Bảng Điều Khiển Tổng Quan (Dashboard):** Thống kê số lượng sinh viên, tỷ lệ lấp đầy phòng ở, công nợ cần thu, doanh thu thực tế và biểu đồ phân tích trực quan.
- **Sơ Đồ Phòng & Giường Trực Quan (Room Matrix):** Quản lý chi tiết từng Tòa nhà, Tầng, Phòng và từng Giường (Trống, Đang ở, Bảo trì).
- **Duyệt Đơn & Xếp Phòng Thông Minh:** Kiểm tra đối soát giới tính, sức chứa phòng, tự động kích hoạt hợp đồng và phát hành hóa đơn phòng ban đầu.
- **Ghi Chỉ Số Điện & Nước Hàng Tháng:** Nhập chỉ số công tơ điện nước theo phòng, hệ thống tự động tính thành tiền theo đơn giá bậc thang và tự phân bổ vào hóa đơn tháng của các sinh viên cùng phòng.
- **Quản Lý Danh Mục Khoa / Viện:** Hỗ trợ Admin thêm khoa mới, đổi tên hoặc gộp các khoa khi trường có thay đổi về cơ cấu đào tạo (tự động cập nhật đồng bộ hồ sơ cho toàn bộ sinh viên thuộc khoa).
- **Cấu Hình Tài Khoản Ngân Hàng KTX:** Quản lý danh sách STK ngân hàng của KTX để tự động sinh mã VietQR nhận tiền chuyển khoản của sinh viên.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

- **Frontend:**
  - React 18, TypeScript, Vite
  - Tailwind CSS (Giao diện tùy biến theo thiết kế hiện đại, tương thích đa thiết bị)
  - Lucide React (Bộ icon tối giản, sắc nét)
  - Axios (Tự động đính kèm JWT Bearer Token qua Interceptors)
- **Backend:**
  - Node.js (ES Modules), Express.js
  - Mongoose ODM (Mô hình hóa dữ liệu MongoDB)
  - JWT (JSON Web Token) & Bcrypt (Bảo mật & mã hóa mật khẩu một chiều)
  - Middleware bảo vệ phân quyền (RBAC) & chống tấn công IDOR
- **Database:**
  - MongoDB Atlas (Cloud Database) / MongoDB Community Server (`DormitoryDb`)
- **Tích Hợp Bên Thứ 3:**
  - Chuẩn tạo mã VietQR theo tiêu chuẩn ngân hàng Việt Nam
  - Google Identity Services & Facebook Login SDK

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Ứng Dụng

### Yêu Cầu Tiên Quyết
- [Node.js](https://nodejs.org/) phiên bản 18.x trở lên.
- Trình quản lý gói `npm` (đi kèm Node.js).
- Cơ sở dữ liệu MongoDB (MongoDB Atlas hoặc MongoDB Local).

### 1. Cài Đặt & Khởi Chạy Backend
```bash
# Di chuyển vào thư mục backend
cd backend

# Cài đặt các gói phụ thuộc
npm install

# Tạo file .env dựa trên file .env.example (xem mục Cấu hình môi trường)
# Khởi chạy server API
npm run dev
# Hoặc chạy trực tiếp
node server.js
```
API sẽ hoạt động tại: `http://localhost:5000`  
*(Cơ sở dữ liệu mẫu Seed Data sẽ tự động được khởi tạo trong lần đầu chạy).*

### 2. Cài Đặt & Khởi Chạy Frontend
```bash
# Mở một cửa sổ terminal mới và di chuyển vào frontend
cd frontend

# Cài đặt thư viện
npm install

# Khởi chạy giao diện ứng dụng với Vite
npm run dev
```
Giao diện ứng dụng sẽ chạy tại: `http://localhost:3000`

---

## ⚙️ Cấu Hình Môi Trường (.env)

Tạo file `.env` bên trong thư mục `backend/` dựa trên mẫu:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/DormitoryDb?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h
NODE_ENV=development
```

---

## 🧪 Kiểm Thử Tự Động (Automated Test Suite)

Dự án đi kèm bộ kịch bản kiểm thử toàn diện gồm **40 kịch bản test** (Authentication, RBAC, IDOR Protection, Room Capacity, VietQR Payment, Overdue Synchronization):
```bash
cd backend
node test_suite.js
```
Kết quả kiểm thử: **40/40 PASSED (100%)**.

---

## 📁 Cấu Trúc Mã Nguồn (Project Structure)

```
QLKTX/
├── backend/
│   ├── config/              # Cấu hình kết nối Database (MongoDB)
│   ├── controllers/         # Xử lý logic nghiệp vụ (Auth, Room, Invoice, Payment,...)
│   ├── middleware/          # Xác thực JWT, phân quyền (RBAC), xử lý lỗi toàn cục
│   ├── models/              # Schema Mongoose (Student, Contract, Invoice, Room,...)
│   ├── routes/              # Khai báo các API Endpoints
│   ├── seed/                # Dữ liệu mẫu khởi tạo hệ thống ban đầu
│   ├── test_suite.js        # Kịch bản kiểm thử tự động 40 test cases
│   ├── server.js            # Điểm khởi chạy Backend Express Server
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios API client cấu hình sẵn
│   │   ├── components/      # UI components tái sử dụng (Button, Input, Modal, Badge,...)
│   │   ├── contexts/        # Quản lý State toàn cục (AuthContext, SidebarContext)
│   │   ├── pages/
│   │   │   ├── admin/       # Các trang quản trị (Dashboard, Rooms, Invoices, Students,...)
│   │   │   ├── auth/        # Đăng nhập, Đăng ký, Quên mật khẩu, Profile
│   │   │   ├── student/     # Cổng sinh viên (Thẻ SV, Hóa đơn VietQR, Phòng ở,...)
│   │   │   └── public/      # Trang tra cứu thẻ sinh viên điện tử công khai
│   │   ├── types/           # Định nghĩa TypeScript interfaces
│   │   └── App.tsx          # React Router v6 & Điều hướng phân quyền
│   ├── package.json
│   └── vite.config.ts
│
├── .gitignore               # Cấu hình loại trừ file rác & file môi trường
└── README.md                # Tài liệu hướng dẫn dự án
```
