# BÁO CÁO TỔNG QUAN ĐỀ TÀI: HỆ THỐNG QUẢN LÝ KÝ TÚC XÁ (QLKTX)
**Môn học:** Mẫu Thiết Kế Phần Mềm (Software Engineering Project - SEP)  
**Nhóm thực hiện:** Nhóm 06  
**Khách hàng giả định:** Ban Quản Lý Ký Túc Xá Đại Học  
**Nền tảng triển khai:** Web Application (MERN Stack: ReactJS + Node.js/Express + MongoDB) & Clean Architecture API (.NET 8)

---

## BẢNG PHÂN CÔNG THÀNH VIÊN VÀ NHIỆM VỤ – NHÓM 06

| STT | Họ và tên | Vai trò | Trách nhiệm chính trong dự án | Tài liệu / Sản phẩm phụ trách |
|:---:|---|:---:|---|---|
| 1 | **Dương Minh Hùng** | **Frontend (FE)** | Thiết kế UI/UX theo Figma, xây dựng giao diện ReactJS/Tailwind CSS cho phân hệ Admin và Sinh viên; xử lý state, gọi API client. | UI Prototype, Frontend Source, Responsive Design, Hỗ trợ Sprint Backlog. |
| 2 | **Tống Nhật Phát** | **Backend (BE)** | Xây dựng RESTful API Node.js/Express; thiết kế MongoDB Schema; phụ trách module Cơ sở hạ tầng (Tòa, Phòng, Giường), Hóa đơn, Điện nước. | Database Design, API Cơ sở hạ tầng & Hóa đơn, Architecture Design. |
| 3 | **Đỗ Thành Đức** | **Backend (BE)** | Xây dựng API Xác thực & Phân quyền (RBAC/JWT); Module Sinh viên, Đăng ký lưu trú, Hợp đồng, Vi phạm; Tích hợp hệ thống (Integration). | Architecture Driver/Design, API Auth/Student, Logic Nghiệp vụ & Tích hợp. |
| 4 | **Phạm Nhật Đăng** | **BA & Documentation** | Thu thập và phân tích yêu cầu; viết Product Backlog; xây dựng Business Rules, Ma trận truy vết (Traceability Matrix); quản lý tài liệu. | Team Charter, Project Plan, Function List, Business Rules, Traceability Matrix. |
| 5 | **Vũ Thành Tâm** | **Tester & QA** | Lập kế hoạch kiểm thử (Test Plan); viết Test Cases; thực thi kiểm thử (Test Execution); ghi nhận lỗi (Defect Report); báo cáo UAT. | Toàn bộ tài liệu Testing (Test Plan, Test Cases, Defect Report, Test Report, UAT). |

---

# MỤC LỤC BÁO CÁO

- [CHƯƠNG 1: TỔNG QUAN ĐỀ TÀI VÀ QUẢN LÝ DỰ ÁN](#chương-1-tổng-quan-đề-tài-và-quản-lý-dự-án)
  - [1.1 Lý do chọn đề tài và tính cấp thiết](#11-lý-do-chọn-đề-tài-và-tính-cấp-thiết)
  - [1.2 Mục tiêu đề tài](#12-mục-tiêu-đề-tài)
  - [1.3 Đối tượng người dùng (Actors)](#13-đối-tượng-người-dùng-actors)
  - [1.4 Phương pháp và quy trình phát triển](#14-phương-pháp-và-quy-trình-phát-triển)
- [CHƯƠNG 2: PHÂN TÍCH YÊU CẦU NGHIỆP VỤ](#chương-2-phân-tích-yêu-cầu-nghiệp-vụ)
  - [2.1 Danh sách chức năng hệ thống (Function List)](#21-danh-sách-chức-năng-hệ-thống-function-list)
  - [2.2 Ràng buộc nghiệp vụ (Business Rules)](#22-ràng-buộc-nghiệp-vụ-business-rules)
  - [2.3 Yêu cầu phi chức năng (Non-Functional Requirements)](#23-yêu-cầu-phi-chức-năng-non-functional-requirements)
  - [2.4 Ma trận truy vết yêu cầu (Traceability Matrix)](#24-ma-trận-truy-vết-yêu-cầu-traceability-matrix)
- [CHƯƠNG 3: THIẾT KẾ KIẾN TRÚC VÀ CÔNG NGHỆ](#chương-3-thiết-kế-kiến-trúc-và-công-nghệ)
  - [3.1 Mô hình kiến trúc phân tầng (Layered Architecture)](#31-mô-hình-kiến-trúc-phân-tầng-layered-architecture)
  - [3.2 Sơ đồ ngữ cảnh hệ thống (Context Diagram)](#32-sơ-đồ-ngữ-cảnh-hệ-thống-context-diagram)
  - [3.3 Chi tiết ngăn xếp công nghệ (Tech Stack)](#33-chi-tiết-ngăn-xếp-công-nghệ-tech-stack)
  - [3.4 Cơ chế bảo mật và phân quyền (RBAC & JWT)](#34-cơ-chế-bảo-mật-và-phân-quyền-rbac--jwt)
- [CHƯƠNG 4: ÁP DỤNG CÁC MẪU THIẾT KẾ (DESIGN PATTERNS)](#chương-4-áp-dụng-các-mẫu-thiết-kế-design-patterns)
  - [4.1 Creational Patterns (Mẫu khởi tạo)](#41-creational-patterns-mẫu-khởi-tạo)
  - [4.2 Structural Patterns (Mẫu cấu trúc)](#42-structural-patterns-mẫu-cấu-trúc)
  - [4.3 Behavioral Patterns (Mẫu hành vi)](#43-behavioral-patterns-mẫu-hành-vi)
- [CHƯƠNG 5: MÔ HÌNH HÓA THIẾT KẾ CHI TIẾT (UML & DATA DESIGN)](#chương-5-mô-hình-hóa-thiết-kế-chi-tiết-uml--data-design)
  - [5.1 Sơ đồ Use Case tổng quát và đặc tả](#51-sơ-đồ-use-case-tổng-quát-và-đặc-tả)
  - [5.2 Sơ đồ lớp hệ thống (Class Diagram)](#52-sơ-đồ-lớp-hệ-thống-class-diagram)
  - [5.3 Thiết kế cơ sở dữ liệu (Database Schema / ERD)](#53-thiết-kế-cơ-sở-dữ-liệu-database-schema--erd)
  - [5.4 Sơ đồ tuần tự (Sequence Diagram)](#54-sơ-đồ-tuần-tự-sequence-diagram)
  - [5.5 Sơ đồ hoạt động (Activity Diagram)](#55-sơ-đồ-hoạt-động-activity-diagram)
- [CHƯƠNG 6: THIẾT KẾ VÀ TRẢI NGHIỆM GIAO DIỆN (UI/UX)](#chương-6-thiết-kế-và-trải-nghiệm-giao-diện-uiux)
  - [6.1 Nguyên tắc thiết kế Figma](#61-nguyên-tắc-thiết-kế-figma)
  - [6.2 Phân hệ Quản trị (Admin / Staff Portal)](#62-phân-hệ-quản-trị-admin--staff-portal)
  - [6.3 Phân hệ Sinh viên (Student Portal)](#63-phân-hệ-sinh-viên-student-portal)
- [CHƯƠNG 7: KIỂM THỬ VÀ ĐÁNH GIÁ CHẤT LƯỢNG HỆ THỐNG](#chương-7-kiểm-thử-và-đánh-giá-chất-lượng-hệ-thống)
  - [7.1 Chiến lược kiểm thử (Testing Strategy)](#71-chiến-lược-kiểm-thử-testing-strategy)
  - [7.2 Bảng mẫu Test Cases tiêu biểu](#72-bảng-mẫu-test-cases-tiêu-biểu)
  - [7.3 Kết quả thực thi kiểm thử và UAT](#73-kết-quả-thực-thi-kiểm-thử-và-uat)
- [CHƯƠNG 8: KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN](#chương-8-kết-luận-và-hướng-phát-triển)
  - [8.1 Các kết quả đã đạt được](#81-các-kết-quả-đã-đạt-được)
  - [8.2 Một số hạn chế hiện tại](#82-một-số-hạn-chế-hiện-tại)
  - [8.3 Hướng phát triển trong tương lai](#83-hướng-phát-triển-trong-tương-lai)

---

# CHƯƠNG 1: TỔNG QUAN ĐỀ TÀI VÀ QUẢN LÝ DỰ ÁN

## 1.1 Lý do chọn đề tài và tính cấp thiết
Ký túc xá đại học là môi trường lưu trú của hàng ngàn sinh viên mỗi năm học. Công tác quản lý ký túc xá truyền thống thường xuyên gặp phải những khó khăn, bất cập:
- **Quản lý phân phòng thủ công:** Gây mất thời gian, dễ nhầm lẫn thông tin giường trống, phân phòng sai giới tính hoặc trùng lặp sinh viên.
- **Tính toán điện, nước và hóa đơn phức tạp:** Hàng tháng cán bộ phải đi ghi chỉ số đồng hồ giấy, nhập excel thủ công, dễ sai sót chỉ số đầu/cuối kỳ và khó khăn trong việc đối chiếu, theo dõi công nợ sinh viên.
- **Tiếp nhận yêu cầu và vi phạm chậm trễ:** Sinh viên báo hỏng hóc cơ sở vật chất qua sổ trực, cán bộ quản lý khó theo dõi tiến độ sửa chữa; các biên bản vi phạm nội quy lưu trữ rời rạc, khó đánh giá điểm rèn luyện.
- **Thiếu cổng tương tác trực tuyến cho sinh viên:** Sinh viên khó theo dõi tình trạng phòng, hóa đơn nộp phí, thông báo từ ban quản lý.

**Hệ thống Quản lý Ký túc xá (QLKTX)** được nghiên cứu và xây dựng nhằm số hóa toàn diện quy trình vận hành ký túc xá, kết nối minh bạch giữa Ban Quản lý (Admin/Staff) và Sinh viên (Student).

## 1.2 Mục tiêu đề tài
- **Mục tiêu tổng quát:** Xây dựng một ứng dụng web quản lý ký túc xá hoàn chỉnh, hiện đại, vận hành ổn định trên nền tảng MERN Stack (ReactJS, Node.js/Express, MongoDB) và hỗ trợ mở rộng với kiến trúc Clean Architecture (.NET 8).
- **Mục tiêu cụ thể:**
  1. Tự động hóa quy trình đăng ký, xét duyệt và xếp phòng/giường cho sinh viên theo đúng giới tính, tòa nhà và loại phòng.
  2. Quản lý chặt chẽ hợp đồng lưu trú, gia hạn, thanh lý và tính toán tiền cọc.
  3. Quản lý chỉ số điện nước định kỳ, tự động sinh hóa đơn hàng tháng và đối chiếu thanh toán.
  4. Quản lý tiếp nhận phản ánh, yêu cầu sửa chữa thiết bị theo mô hình vòng đời trạng thái.
  5. Cung cấp Dashboard biểu đồ phân tích thống kê trực quan: tỷ lệ lấp đầy giường, doanh thu, nợ phí.
  6. Áp dụng chuẩn mực các mẫu thiết kế phần mềm (Design Patterns) để hệ thống đạt độ tin cậy, bảo trì và mở rộng cao.

## 1.3 Đối tượng người dùng (Actors)
Hệ thống xác định 3 nhóm người dùng chính tương ứng với cơ chế phân quyền (Role-Based Access Control):
1. **Admin (Quản trị viên hệ thống):** Toàn quyền cấu hình hệ thống, quản lý tài khoản người dùng, phân quyền cán bộ, quản lý danh mục tòa nhà, phòng, đơn giá dịch vụ và xem toàn bộ báo cáo doanh thu.
2. **Staff (Cán bộ / Quản lý ký túc xá):** Tiếp nhận hồ sơ đăng ký, xếp phòng sinh viên, ký/duyệt hợp đồng, ghi chỉ số điện nước, duyệt hóa đơn, tiếp nhận và điều phối sửa chữa cơ sở vật chất, lập biên bản vi phạm nội quy.
3. **Student (Sinh viên nội trú):** Đăng nhập tài khoản cá nhân, xem thông tin phòng/giường hiện tại, nộp đơn đăng ký phòng mới/gia hạn, xem và thanh toán hóa đơn điện nước/tiền phòng, gửi yêu cầu báo hỏng thiết bị, theo dõi lịch sử vi phạm và nhận thông báo KTX.

## 1.4 Phương pháp và quy trình phát triển
- Áp dụng mô hình **Agile/Scrum**: Chia dự án thành các Sprint (chu kỳ 2 tuần), có Product Backlog, Sprint Backlog, họp giao ban và họp rút kinh nghiệm (Sprint Retrospective).
- Quản lý mã nguồn tập trung qua **Git / GitHub** (phân nhánh `main` và nhánh phát triển `Do-Thanh-Duc`).

---

# CHƯƠNG 2: PHÂN TÍCH YÊU CẦU NGHIỆP VỤ

## 2.1 Danh sách chức năng hệ thống (Function List)

| Mã Function | Tên chức năng | Phân hệ (Module) | Actor | Mức độ ưu tiên |
|---|---|---|---|:---:|
| **F.1.1** | Đăng nhập hệ thống (JWT Authentication) | Xác thực & Tài khoản | All | High |
| **F.1.2** | Đăng xuất & Đổi mật khẩu cá nhân | Xác thực & Tài khoản | All | Medium |
| **F.1.3** | Quản lý danh sách tài khoản & Phân vai trò | Quản trị người dùng | Admin | High |
| **F.2.1** | Quản lý danh mục Tòa nhà KTX (Tên tòa, giới tính, số tầng) | Cơ sở hạ tầng | Admin, Staff | High |
| **F.2.2** | Quản lý danh mục Phòng (Loại phòng, đơn giá, sức chứa) | Cơ sở hạ tầng | Admin, Staff | High |
| **F.2.3** | Quản lý Giường trong phòng (Mã giường, tình trạng trống/đã ở) | Cơ sở hạ tầng | Admin, Staff | High |
| **F.3.1** | Quản lý hồ sơ thông tin sinh viên nội trú | Quản lý Sinh viên | Admin, Staff | High |
| **F.3.2** | Xem hồ sơ cá nhân và thông tin phòng ở của mình | Cổng Sinh viên | Student | High |
| **F.4.1** | Đăng ký phòng KTX trực tuyến | Đăng ký lưu trú | Student | High |
| **F.4.2** | Tiếp nhận, duyệt đơn đăng ký & Xếp phòng thủ công/tự động | Xếp phòng | Staff, Admin | High |
| **F.5.1** | Lập hợp đồng lưu trú (Thời hạn, tiền cọc, ngày bắt đầu/kết thúc) | Quản lý Hợp đồng | Staff, Admin | High |
| **F.5.2** | Gia hạn hợp đồng & Thanh lý hợp đồng KTX | Quản lý Hợp đồng | Staff, Admin | Medium |
| **F.5.3** | Sinh viên tra cứu hợp đồng lưu trú cá nhân | Cổng Sinh viên | Student | Medium |
| **F.6.1** | Nhập chỉ số điện, nước hàng tháng theo phòng | Điện nước | Staff, Admin | High |
| **F.6.2** | Tra cứu lịch sử tiêu thụ điện nước theo phòng/tháng | Điện nước | All | Medium |
| **F.7.1** | Tự động phát hành hóa đơn (Tiền phòng + Tiền điện + Tiền nước) | Quản lý Hóa đơn | Staff, Admin | High |
| **F.7.2** | Xem chi tiết hóa đơn và thanh toán (Ghi nhận thanh toán) | Quản lý Hóa đơn | All | High |
| **F.7.3** | Quản lý công nợ và cảnh báo hóa đơn quá hạn | Quản lý Hóa đơn | Staff, Admin | Medium |
| **F.8.1** | Gửi yêu cầu sửa chữa cơ sở vật chất | Sửa chữa & Bảo trì | Student | High |
| **F.8.2** | Tiếp nhận, phân công thợ và cập nhật trạng thái sửa chữa | Sửa chữa & Bảo trì | Staff, Admin | High |
| **F.9.1** | Lập biên bản và theo dõi vi phạm nội quy KTX | Kỷ luật & Vi phạm | Staff, Admin | Medium |
| **F.9.2** | Sinh viên xem biên bản vi phạm và điểm kỷ luật | Cổng Sinh viên | Student | Low |
| **F.10.1** | Đăng tải và gửi thông báo chung/theo phòng/theo tòa | Thông báo KTX | Staff, Admin | High |
| **F.10.2** | Nhận và xem bảng tin thông báo | Cổng Sinh viên | Student | High |
| **F.11.1** | Dashboard phân tích thống kê (Doanh thu, phòng trống, tỷ lệ lấp đầy) | Báo cáo & Thống kê | Admin, Staff | High |

---

## 2.2 Ràng buộc nghiệp vụ (Business Rules - BR)

1. **BR-01 (Giới tính phòng & Tòa nhà):** Sinh viên chỉ được phân vào phòng hoặc giường thuộc tòa nhà phù hợp với giới tính trong hồ sơ (Nam xếp phòng Nam, Nữ xếp phòng Nữ).
2. **BR-02 (Tình trạng giường trống):** Giường chỉ có thể được xếp cho sinh viên mới khi trạng thái hiện tại là `Available` (Trống). Một giường không thể có 2 sinh viên ở cùng lúc.
3. **BR-03 (Duy nhất 1 Hợp đồng hiệu lực):** Tại một thời điểm, mỗi sinh viên chỉ được phép có duy nhất **01 Hợp đồng lưu trú** có trạng thái `Active`.
4. **BR-04 (Ràng buộc chỉ số Điện - Nước):** Chỉ số điện/nước cuối kỳ của tháng hiện tại phải lớn hơn hoặc bằng (`>=`) chỉ số đầu kỳ (chỉ số cuối kỳ của tháng liền trước). Lượng tiêu thụ được tính tự động bằng `Chỉ số mới - Chỉ số cũ`.
5. **BR-05 (Quy tắc tính Hóa đơn tổng hợp):**
   $$\text{Tổng tiền hóa đơn} = \text{Tiền phòng} + (\text{Tiêu thụ Điện} \times \text{Đơn giá Điện}) + (\text{Tiêu thụ Nước} \times \text{Đơn giá Nước}) + \text{Phí dịch vụ}$$
6. **BR-06 (Hạn thanh toán & Trạng thái):** Hóa đơn phát hành có thời hạn thanh toán cụ thể (mặc định 10 ngày). Quá thời hạn này mà chưa thanh toán, hệ thống tự động gắn cờ `Overdue` (Quá hạn) và kích hoạt gửi thông báo nhắc nợ.
7. **BR-07 (Quy trình tiếp nhận sửa chữa):** Yêu cầu sửa chữa bắt buộc tuân theo máy trạng thái tuần tự: `Pending` (Chờ duyệt) $\rightarrow$ `Approved/InProgress` (Đang sửa) $\rightarrow$ `Completed` (Đã hoàn thành) hoặc `Rejected` (Từ chối).
8. **BR-08 (Điều kiện trả phòng / Thanh lý hợp đồng):** Sinh viên chỉ được duyệt thanh lý hợp đồng khi tất cả các hóa đơn tiền phòng, điện nước và các khoản phạt vi phạm đã được thanh toán hết (`status = Paid`).

---

## 2.3 Yêu cầu phi chức năng (Non-Functional Requirements)
- **Hiệu năng (Performance):** Thời gian phản hồi của các RESTful API trung bình $< 200\text{ms}$ đối với các truy vấn danh sách cơ bản; xử lý đồng thời ít nhất 100 kết nối người dùng.
- **Bảo mật (Security):** Mật khẩu người dùng được băm 1 chiều bằng thuật toán `BCrypt` với Salt rounds = 10; phiên đăng nhập được xác thực bằng JWT Token có hạn sử dụng 24 giờ; ngăn chặn triệt để SQL/NoSQL Injection qua kiểm tra kiểu dữ liệu Mongoose Schema.
- **Độ tin cậy và Khả dụng (Availability):** Cơ sở dữ liệu hỗ trợ cơ chế Backup tự động, tính nhất quán dữ liệu cao; hệ thống sẵn sàng hoạt động 24/7.
- **Tính khả dụng và UI/UX (Usability):** Giao diện tương thích hoàn toàn trên Desktop, Tablet và Mobile (Responsive Web Design), thiết kế chuẩn Figma với tone màu chuyên nghiệp, thông tin hiển thị rõ ràng.

---

## 2.4 Ma trận truy vết yêu cầu (Traceability Matrix)

| Function ID | Tên chức năng | RESTful API Endpoint | Database Collection | React Component tương ứng |
|---|---|---|---|---|
| F.1.1, F.1.2 | Đăng nhập / Đổi mật khẩu | `POST /api/auth/login`, `POST /api/auth/change-password` | `users` | `LoginPage.tsx`, `ProfilePage.tsx` |
| F.1.3 | Quản lý người dùng | `GET, POST, PUT, DELETE /api/auth/users` | `users` | `ProfilePage.tsx`, `AdminLayout.tsx` |
| F.2.1, F.2.2 | Quản lý Tòa nhà & Phòng | `GET, POST, PUT, DELETE /api/buildings`, `/api/rooms` | `buildings`, `rooms` | `BuildingsPage.tsx`, `RoomsPage.tsx` |
| F.2.3 | Quản lý Giường | `GET, POST, PUT, DELETE /api/rooms/:id/beds` | `beds`, `rooms` | `RoomsPage.tsx` |
| F.3.1, F.3.2 | Quản lý Sinh viên | `GET, POST, PUT, DELETE /api/students` | `students`, `users` | `StudentsPage.tsx`, `StudentDashboardPage.tsx` |
| F.4.1, F.4.2 | Đăng ký & Xếp phòng | `GET, POST, PUT /api/registrations` | `registrations`, `beds` | `RegistrationsPage.tsx`, `StudentRegisterPage.tsx` |
| F.5.1, F.5.2 | Quản lý Hợp đồng KTX | `GET, POST, PUT /api/contracts` | `contracts`, `students` | `ContractsPage.tsx`, `StudentContractsPage.tsx` |
| F.6.1, F.6.2 | Quản lý Điện nước | `GET, POST, PUT /api/meter-readings` | `meterreadings`, `rooms`| `MeterReadingsPage.tsx` |
| F.7.1, F.7.2 | Hóa đơn & Thanh toán | `GET, POST, PUT /api/invoices`, `/api/payments` | `invoices`, `payments` | `InvoicesPage.tsx`, `PaymentsPage.tsx` |
| F.8.1, F.8.2 | Yêu cầu sửa chữa | `GET, POST, PUT /api/repairs` | `repairrequests` | `RepairsPage.tsx`, `StudentRepairsPage.tsx` |
| F.9.1, F.9.2 | Kỷ luật & Vi phạm | `GET, POST, PUT /api/violations` | `violations` | `ViolationsPage.tsx`, `StudentViolationsPage.tsx` |
| F.10.1, F.10.2 | Thông báo KTX | `GET, POST, PUT /api/notifications` | `notifications` | `NotificationsPage.tsx`, `StudentNotificationsPage.tsx` |
| F.11.1 | Báo cáo & Dashboard | `GET /api/dashboard/stats` | Aggregation Pipeline | `DashboardPage.tsx`, `StudentDashboardPage.tsx` |

---

# CHƯƠNG 3: THIẾT KẾ KIẾN TRÚC VÀ CÔNG NGHỆ

## 3.1 Mô hình kiến trúc phân tầng (Layered Architecture)
Hệ thống QLKTX được thiết kế theo mô hình **Client - Server Phân Tầng (3-Tier Layered Architecture)**:

```
+--------------------------------------------------------------------------+
|                     PRESENTATION LAYER (FRONTEND)                        |
|   ReactJS 18 + TypeScript + Vite + Tailwind CSS + Lucide React Icons    |
|   - Admin Portal: Dashboard, Rooms, Students, Invoices, Contracts,...    |
|   - Student Portal: My Room, Bills, Requests, Violations,...             |
+--------------------------------------------------------------------------+
                                     |  HTTP REST / JSON (JWT Auth)
                                     v
+--------------------------------------------------------------------------+
|                     APPLICATION & BUSINESS LOGIC (BACKEND)               |
|   Node.js / Express.js (Hỗ trợ song song ASP.NET Core 8 Web API)         |
|   +------------------------------------------------------------------+   |
|   | Routing Layer: Định tuyến API theo từng resource                 |   |
|   | Middleware Layer: Auth (JWT), RBAC (Role Check), Error Handling   |   |
|   | Controller Layer: Tiếp nhận Request, điều phối Logic Nghiệp vụ   |   |
|   | Service Layer / Pattern: Factory, Strategy, State, Observer       |   |
|   | Data Access Layer: Mongoose Models & ODM Validation              |   |
|   +------------------------------------------------------------------+   |
+--------------------------------------------------------------------------+
                                     |  Mongoose ODM / TCP 27017
                                     v
+--------------------------------------------------------------------------+
|                           DATABASE LAYER (DATA)                          |
|   MongoDB Database (DormitoryDb)                                         |
|   - Collections: users, students, buildings, rooms, beds, contracts,...  |
+--------------------------------------------------------------------------+
```

## 3.2 Sơ đồ ngữ cảnh hệ thống (Context Diagram)

```
               [ Ban Quản Lý (Admin / Staff) ]
                              |
     Quản lý tòa, phòng, sinh viên | Cập nhật điện nước, hóa đơn
     Phê duyệt đăng ký, sửa chữa  | Xem báo cáo thống kê
                              v
                 +--------------------------+
                 |                          |
                 |    HỆ THỐNG QUẢN LÝ      |
                 |     KÝ TÚC XÁ (QLKTX)    |
                 |                          |
                 +--------------------------+
                              ^
     Nộp đơn đăng ký ở KTX        | Xem hóa đơn, lịch sử thanh toán
     Gửi yêu cầu sửa chữa thiết bị| Nhận thông báo từ KTX
                              |
                   [ Sinh Viên (Student) ]
```

## 3.3 Chi tiết ngăn xếp công nghệ (Tech Stack)

### Phía Frontend (Client):
- **Framework & Ngôn ngữ:** React 18, TypeScript (Đảm bảo Type-safety, tránh lỗi runtime).
- **Build tool:** Vite (Tốc độ khởi động siêu tốc và Hot Module Replacement cực nhanh).
- **CSS Framework:** Tailwind CSS v3 (Thiết kế Utility-first, responsive đa thiết bị).
- **Icon Library:** Lucide React (Bộ icon hiện đại, đồng nhất).
- **HTTP Client:** Axios (Cấu hình Interceptor tự động gán Bearer Token vào Header).
- **Router:** React Router DOM v6 (Phân luồng định tuyến được bảo vệ - Protected Routes theo Role).

### Phía Backend (Server):
- **Môi trường & Framework:** Node.js v20+, Express.js v4.
- **Kiến trúc mã nguồn:** RESTful API chuẩn REST (GET, POST, PUT, DELETE).
- **Thư viện tương tác CSDL:** Mongoose ODM (Object Data Modeling) với Schema định nghĩa chặt chẽ.
- **Hỗ trợ phiên bản .NET:** Solution `DormitoryManagement.sln` chạy trên .NET 8 Web API áp dụng Clean Architecture (Domain, Application, Infrastructure, API).

### Phía Cơ sở dữ liệu (Database):
- **Hệ quản trị CSDL:** MongoDB (NoSQL Document Store).
- **Môi trường vận hành:** MongoDB Server cục bộ (port 27017) hoặc MongoDB Atlas Cloud.
- **Tên cơ sở dữ liệu:** `DormitoryDb`.

## 3.4 Cơ chế bảo mật và phân quyền (RBAC & JWT)
- **Cơ chế xác thực (Authentication):** Sử dụng chuẩn **JSON Web Token (JWT)**. Khi đăng nhập thành công, máy chủ cấp cho client chuỗi token chứa payload `{ id, username, role, studentId }` được ký bởi `JWT_SECRET`. Client lưu token trong `localStorage` và gửi kèm trong header `Authorization: Bearer <token>`.
- **Cơ chế phân quyền (Authorization - RBAC):** Sử dụng Middleware kiểm tra quyền truy cập:
  - `verifyToken`: Kiểm tra token hợp lệ và còn hạn sử dụng.
  - `authorizeRoles('admin', 'staff')`: Chỉ cho phép Quản trị viên và Cán bộ truy cập vào các tính năng cấu hình, duyệt đơn, tạo hóa đơn.
  - Học sinh (`student`) chỉ được truy cập vào tài nguyên thuộc sở hữu của chính mình (thông tin phòng ở, hóa đơn của mình, yêu cầu sửa chữa của mình).
- **Mã hóa mật khẩu:** Mật khẩu được mã hóa an toàn bằng hàm băm một chiều `bcryptjs` với 10 vòng sinh muối (Salt rounds).

---

# CHƯƠNG 4: ÁP DỤNG CÁC MẪU THIẾT KẾ (DESIGN PATTERNS)

Là đề tài thuộc môn học **Mẫu Thiết Kế Phần Mềm (SEP)**, nhóm 06 đã nghiên cứu và áp dụng bài bản các mẫu thiết kế hướng đối tượng thuộc cả 3 nhóm chính:

## 4.1 Creational Patterns (Mẫu khởi tạo)

### 1. Singleton Pattern (Mẫu cá thể duy nhất)
- **Vị trí áp dụng:** Module kết nối cơ sở dữ liệu MongoDB (`backend/config/db.js`).
- **Ý nghĩa & Giải pháp:** Đảm bảo toàn bộ ứng dụng Backend chỉ duy nhất tồn tại một Connection Pool duy nhất tới máy chủ cơ sở dữ liệu MongoDB trong suốt vòng đời chạy server, tránh lãng phí bộ nhớ và tránh lỗi quá tải số lượng kết nối đồng thời (`Connection Pool Exhaustion`).

```javascript
// Minh họa Singleton trong kết nối Database (db.js)
let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    console.log("Using existing MongoDB connection (Singleton instance).");
    return;
  }
  const conn = await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
  console.log(`MongoDB Connected: ${conn.connection.host}`);
};
```

### 2. Factory Method Pattern (Mẫu nhà máy)
- **Vị trí áp dụng:** Module khởi tạo hóa đơn (`Invoice Controller` / `Invoice Service`).
- **Ý nghĩa & Giải pháp:** Ký túc xá có nhiều loại hóa đơn khác nhau: Hóa đơn tiền phòng định kỳ (`ROOM_FEE`), Hóa đơn điện nước hàng tháng (`UTILITY_FEE`), Hóa đơn phí sửa chữa bồi thường hư hại (`REPAIR_FINE`). Thay vì viết hàng loạt câu lệnh `if-else` phức tạp, hệ thống sử dụng **InvoiceFactory** để tạo đối tượng hóa đơn phù hợp theo từng loại nghiệp vụ.

---

## 4.2 Structural Patterns (Mẫu cấu trúc)

### 1. Facade Pattern & Adapter Pattern (Mẫu mặt tiền & Mẫu thích ứng)
- **Vị trí áp dụng:** Module gọi API phía Frontend (`frontend/src/api/axiosClient.ts` và `frontend/src/api/index.ts`).
- **Ý nghĩa & Giải pháp:** Che giấu toàn bộ sự phức tạp của thư viện HTTP Axios (xử lý gắn token Bearer, xử lý chuyển đổi kiểu dữ liệu, bắt lỗi mạng HTTP 401/403/500, thiết lập baseURL). Các trang màn hình UI chỉ cần gọi hàm nghiệp vụ trực quan như `buildingApi.getAll()`, `invoiceApi.pay(id)` mà không cần biết cách thức thực thi chi tiết bên dưới.

### 2. Middleware / Decorator Pattern
- **Vị trí áp dụng:** Các Middleware bảo vệ Endpoint trong Express (`verifyToken`, `checkRole`, `errorHandler`).
- **Ý nghĩa & Giải pháp:** Đóng gói các hành vi xác thực, phân quyền và bắt lỗi thành các lớp bộ lọc gắn vào trước khi Request được xử lý bởi Controller chính. Giúp mã nguồn tách biệt, tăng tính tái sử dụng và dễ kiểm thử.

---

## 4.3 Behavioral Patterns (Mẫu hành vi)

### 1. Strategy Pattern (Mẫu chiến lược)
- **Vị trí áp dụng:** Công thức tính toán chi phí điện, nước và đơn giá phòng.
- **Ý nghĩa & Giải pháp:** Ký túc xá áp dụng các chiến lược giá khác nhau:
  - *Chiến lược giá điện nước bậc thang* (dành cho sinh viên dùng vượt định mức).
  - *Chiến lược giá điện nước đồng giá cố định*.
  - *Chiến lược giá phòng dịch vụ chất lượng cao vs phòng tiêu chuẩn*.
- Pattern này cho phép thay đổi thuật toán tính toán giá một cách linh hoạt tại thời điểm chạy mà không cần sửa đổi mã nguồn xử lý hóa đơn.

### 2. Observer Pattern (Mẫu quan sát)
- **Vị trí áp dụng:** Hệ thống phát thông báo sự kiện (`Notification Service`).
- **Ý nghĩa & Giải pháp:** Khi một sự kiện nghiệp vụ xảy ra trong hệ thống (Ví dụ: Cán bộ phê duyệt đơn đăng ký phòng, Kế toán phát hành hóa đơn mới, Trạng thái sửa chữa được hoàn thành), module nghiệp vụ đóng vai trò là `Subject` phát tín hiệu. Các `Observer` (Service gửi thông báo web, Service gửi email) tự động tiếp nhận sự kiện và tạo thông báo tương ứng đến từng sinh viên.

### 3. State Pattern (Mẫu trạng thái)
- **Vị trí áp dụng:** Quản lý vòng đời Trạng thái Hợp đồng lưu trú (`Contract`) và Yêu cầu sửa chữa (`Repair Request`).
- **Ý nghĩa & Giải pháp:** Trạng thái của một hợp đồng quyết định hành vi hợp lệ của nó:
  - Hợp đồng ở trạng thái `Draft` có thể chỉnh sửa thông tin.
  - Hợp đồng ở trạng thái `Active` không được xóa, chỉ được gia hạn hoặc làm thủ tục thanh lý.
  - Hợp đồng ở trạng thái `Terminated` thì giường liên kết sẽ tự động chuyển về trạng thái `Available`.

```
Vòng đời Hợp đồng:
[Draft] ---> [PendingApproval] ---> [Active] ---> [Expired / Terminated]
                                        |
                                        +---> [Extended (Gia hạn)]
```

---

# CHƯƠNG 5: MÔ HÌNH HÓA THIẾT KẾ CHI TIẾT (UML & DATA DESIGN)

## 5.1 Sơ đồ Use Case tổng quát và đặc tả

### Bảng tóm tắt các Use Case chính theo Actor:

| Actor | Các Use Case chính |
|---|---|
| **Sinh viên (Student)** | - Đăng nhập / Đổi mật khẩu cá nhân.<br>- Xem thông tin phòng ở hiện tại & danh sách bạn cùng phòng.<br>- Đăng ký nguyện vọng phòng KTX mới.<br>- Xem danh sách hóa đơn & thực hiện xác nhận thanh toán.<br>- Gửi yêu cầu sửa chữa cơ sở vật chất bị hỏng.<br>- Xem biên bản vi phạm kỷ luật & nhận thông báo KTX. |
| **Cán bộ KTX (Staff)** | - Xem Dashboard tổng quan KTX.<br>- Quản lý danh sách sinh viên nội trú.<br>- Tiếp nhận và duyệt đơn đăng ký phòng; xếp giường.<br>- Lập hợp đồng, gia hạn và thanh lý hợp đồng lưu trú.<br>- Nhập chỉ số đồng hồ điện, nước định kỳ.<br>- Phát hành hóa đơn tháng và quản lý thu tiền.<br>- Điều phối, xử lý yêu cầu sửa chữa thiết bị.<br>- Lập biên bản vi phạm nội quy & gửi thông báo. |
| **Quản trị viên (Admin)** | - Toàn quyền của Cán bộ KTX (Staff).<br>- Quản lý danh mục Tòa nhà, Phòng, Giường, Bảng giá.<br>- Quản lý tài khoản người dùng và phân quyền hệ thống.<br>- Cấu hình thông số hệ thống và xem báo cáo tài chính cấp cao. |

---

## 5.2 Sơ đồ lớp hệ thống (Class Diagram)
Hệ thống thiết kế theo mô hình hướng đối tượng với các lớp thực thể chính:
- **`User`**: Đại diện tài khoản hệ thống (`username`, `passwordHash`, `role`, `fullName`, `email`, `phone`, `isActive`).
- **`Student`**: Đại diện hồ sơ sinh viên (`studentCode`, `gender`, `dob`, `faculty`, `className`, `citizenId`, `currentBedId`).
- **`Building`**: Đại diện tòa nhà KTX (`buildingCode`, `name`, `genderType`, `totalFloors`, `description`).
- **`Room`**: Đại diện phòng ở (`roomNumber`, `buildingId`, `floor`, `roomType`, `capacity`, `price`, `status`).
- **`Bed`**: Đại diện giường trong phòng (`bedNumber`, `roomId`, `isOccupied`, `currentStudentId`).
- **`Contract`**: Đại diện hợp đồng ở (`contractCode`, `studentId`, `bedId`, `startDate`, `endDate`, `deposit`, `status`).
- **`MeterReading`**: Chỉ số điện nước (`roomId`, `month`, `year`, `electricityOld`, `electricityNew`, `waterOld`, `waterNew`).
- **`Invoice`**: Hóa đơn tiền phòng & dịch vụ (`invoiceCode`, `roomId`, `month`, `year`, `roomFee`, `electricityFee`, `waterFee`, `totalAmount`, `status`).
- **`Payment`**: Phiếu thu thanh toán (`invoiceId`, `amount`, `paymentMethod`, `paymentDate`, `transactionCode`).
- **`RepairRequest`**: Đơn báo sửa chữa (`studentId`, `roomId`, `title`, `description`, `priority`, `status`).
- **`Violation`**: Biên bản vi phạm (`studentId`, `title`, `violationDate`, `penaltyAmount`, `status`).
- **`Notification`**: Bản tin thông báo (`title`, `content`, `targetType`, `senderId`, `createdAt`).

---

## 5.3 Thiết kế cơ sở dữ liệu (Database Schema / ERD)

Dữ liệu được lưu trữ trong CSDL MongoDB (`DormitoryDb`) với 14 bộ sưu tập (Collections):

```
+------------------+         +------------------+         +------------------+
|    buildings     | 1     n |      rooms       | 1     n |       beds       |
+------------------+---------+------------------+---------+------------------+
| _id (PK)         |         | _id (PK)         |         | _id (PK)         |
| buildingCode     |         | roomNumber       |         | bedNumber        |
| name             |         | buildingId (FK)  |         | roomId (FK)      |
| genderType       |         | floor            |         | isOccupied       |
| totalFloors      |         | capacity         |         | currentStudentId |
+------------------+         | price            |         +------------------+
                             | status           |                  |
                             +------------------+                  |
                                     | 1                           | 1
                                     |                             |
                                     | n                           | n
                             +------------------+         +------------------+
                             |  meterreadings   |         |    contracts     |
                             +------------------+         +------------------+
                             | _id (PK)         |         | _id (PK)         |
                             | roomId (FK)      |         | studentId (FK)   |
                             | month, year      |         | bedId (FK)       |
                             | electricityOld   |         | startDate        |
                             | electricityNew   |         | endDate          |
                             | waterOld         |         | depositAmount    |
                             | waterNew         |         | status           |
                             +------------------+         +------------------+
                                     |                             |
                                     | sinh ra                     | liên kết
                                     v                             v
+------------------+         +------------------+         +------------------+
|      users       | 1     1 |     invoices     | 1     n |     students     |
+------------------+---------+------------------+---------+------------------+
| _id (PK)         |         | _id (PK)         |         | _id (PK)         |
| username         |         | invoiceCode      |         | studentCode (UQ) |
| passwordHash     |         | roomId (FK)      |         | userId (FK)      |
| role             |         | month, year      |         | fullName         |
| fullName         |         | totalAmount      |         | gender           |
| email, phone     |         | status           |         | faculty, class   |
+------------------+         +------------------+         +------------------+
                                     |                             |
                                     | 1                           | 1
                                     v n                           v n
                             +------------------+         +------------------+
                             |     payments     |         |  repairrequests  |
                             +------------------+         +------------------+
                             | _id (PK)         |         |  violations      |
                             | invoiceId (FK)   |         |  registrations   |
                             | amount           |         +------------------+
                             | paymentDate      |
                             +------------------+
```

---

## 5.4 Sơ đồ tuần tự (Sequence Diagram)

### Luồng 1: Đăng ký phòng & Cán bộ xếp phòng

```
Sinh viên (Client)              Máy chủ (Backend API)             Cơ sở dữ liệu (MongoDB)
       |                                  |                                  |
       |-- 1. POST /api/registrations --->|                                  |
       |   (chọn tòa, loại phòng mong muốn) |                                  |
       |                                  |-- 2. Validate & lưu đơn -------->|
       |                                  |<-- 3. Tạo đơn thành công (Pending)-|
       |<-- 4. Trả về kết quả đăng ký ----|                                  |
       |                                  |                                  |
  (Cán bộ KTX duyệt đơn)                  |                                  |
       |-- 5. PUT /api/registrations/:id->|                                  |
       |   (Action: Approve, chọn BedId)  |                                  |
       |                                  |-- 6. Kiểm tra giường còn trống?->|
       |                                  |<-- 7. Giường hợp lệ -------------|
       |                                  |-- 8. Tạo Hợp đồng (Active) ----->|
       |                                  |-- 9. Cập nhật Bed.isOccupied=true|
       |                                  |-- 10. Tạo thông báo xếp phòng -->|
       |<-- 11. Thông báo duyệt thành công|                                  |
```

### Luồng 2: Nhập chỉ số điện nước và tự động tính hóa đơn

```
Cán bộ KTX (Staff)              Máy chủ (Backend API)             Cơ sở dữ liệu (MongoDB)
       |                                  |                                  |
       |-- 1. POST /api/meter-readings -->|                                  |
       |   (roomId, điện mới, nước mới)   |                                  |
       |                                  |-- 2. Lấy chỉ số cũ tháng trước ->|
       |                                  |<-- 3. Chỉ số cũ -----------------|
       |                                  |-- 4. Tính tiêu thụ & validate ---|
       |                                  |-- 5. Lưu MeterReading ---------->|
       |                                  |-- 6. Gọi InvoiceFactory ---------|
       |                                  |   (tính tiền phòng + điện nước)  |
       |                                  |-- 7. Lưu Invoice (Unpaid) ------>|
       |                                  |-- 8. Gửi thông báo nộp tiền ---->|
       |<-- 9. Phản hồi phát hành hóa đơn-|                                  |
```

---

# CHƯƠNG 6: THIẾT KẾ VÀ TRẢI NGHIỆM GIAO DIỆN (UI/UX)

## 6.1 Nguyên tắc thiết kế Figma
Giao diện ứng dụng được thiết kế trên tinh thần hiện đại, trực quan hóa cao theo chuẩn Figma:
- **Bố cục khoa học:** Thanh điều hướng cạnh bên (Sidebar Navigation) cố định; phần tiêu đề đầu trang (Header) hiển thị avatar, tên người dùng, vai trò và chuông thông báo; khu vực nội dung chính hiển thị các Thẻ thống kê (StatCards) và Bảng dữ liệu (Data Table) chuẩn chỉ.
- **Màu sắc & Phông chữ:** Sử dụng gam màu xanh chủ đạo (Primary Blue `#2563EB` và Indigo `#4F46E5`), kết hợp các màu trạng thái chuẩn: Xanh lá (`Success`), Vàng cam (`Warning`), Đỏ (`Danger`), Xám trung tính (`Muted`).
- **Thành phần dùng chung (Reusable Components):**
  - `StatCard`: Thẻ thống kê số liệu có icon và phần trăm tăng trưởng.
  - `Table`: Bảng phân trang, tìm kiếm từ khóa và lọc dữ liệu đa tiêu chí.
  - `Badge`: Huy hiệu trạng thái màu sắc (`Paid`, `Unpaid`, `Active`, `Occupied`).
  - `Modal`: Hộp thoại popup tạo mới, chỉnh sửa và xác nhận xóa thông tin.

## 6.2 Phân hệ Quản trị (Admin / Staff Portal)
Gồm 12 trang chức năng chuyên sâu:
1. **Tổng quan (Dashboard):** Biểu đồ doanh thu, số giường đã lấp đầy, số yêu cầu sửa chữa cần giải quyết.
2. **Quản lý Tòa nhà (Buildings):** Xem danh sách tòa, thêm tòa mới, quản lý số tầng và giới tính phân bổ.
3. **Quản lý Phòng (Rooms):** Lưới hiển thị phòng theo tầng, xem nhanh sức chứa, phòng đầy/phòng trống.
4. **Hồ sơ Sinh viên (Students):** Tra cứu sinh viên theo MSSV, lớp, khoa, số phòng hiện tại.
5. **Duyệt Đăng ký (Registrations):** Danh sách sinh viên nộp hồ sơ, chọn phòng xếp chỗ bằng một cú click.
6. **Hợp đồng lưu trú (Contracts):** Quản lý thời hạn hợp đồng, gia hạn và in hợp đồng.
7. **Ghi chỉ số Điện nước (Meter Readings):** Bảng nhập chỉ số nhanh theo từng phòng, cảnh báo chỉ số bất thường.
8. **Quản lý Hóa đơn (Invoices):** Danh sách hóa đơn, in hóa đơn PDF, đổi trạng thái thanh toán.
9. **Lịch sử Thanh toán (Payments):** Báo cáo dòng tiền thu từ sinh viên.
10. **Xử lý Sửa chữa (Repairs):** Danh sách báo hỏng, cập nhật tiến độ sửa và chi phí vật tư.
11. **Quản lý Vi phạm (Violations):** Ghi nhận vi phạm, trừ điểm rèn luyện và tiền phạt.
12. **Bản tin Thông báo (Notifications):** Soạn thảo và gửi thông báo toàn KTX.

## 6.3 Phân hệ Sinh viên (Student Portal)
Giao diện thân thiện dành riêng cho sinh viên:
- **Trang chủ sinh viên:** Hiển thị thẻ thông tin phòng ở hiện tại, giường số mấy, bạn cùng phòng là ai.
- **Đăng ký phòng trực tuyến:** Lựa chọn tòa, loại phòng mong muốn và theo dõi tiến độ duyệt hồ sơ.
- **Hóa đơn cá nhân:** Xem chi tiết tiền phòng, số kWh điện, số khối nước và hướng dẫn chuyển khoản.
- **Gửi phản ánh/Sửa chữa:** Chụp ảnh/mô tả vị trí thiết bị hỏng (bóng đèn, vòi nước, khóa cửa).
- **Xem thông báo & Nội quy:** Xem các sự kiện, lịch cắt điện nước định kỳ từ Ban Quản Lý.

---

# CHƯƠNG 7: KIỂM THỬ VÀ ĐÁNH GIÁ CHẤT LƯỢNG HỆ THỐNG

## 7.1 Chiến lược kiểm thử (Testing Strategy)
Nhóm áp dụng chiến lược kiểm thử đa tầng:
1. **Kiểm thử đơn vị (Unit Testing):** Kiểm thử tính chính xác của các hàm tính toán độc lập (tính lượng điện nước tiêu thụ, tính tiền phòng theo ngày, băm mật khẩu, mã hóa JWT).
2. **Kiểm thử tích hợp (Integration Testing):** Kiểm tra sự kết nối giữa các tầng: `API Route -> Controller -> Database`, đảm bảo dữ liệu ghi vào MongoDB đúng định dạng và ràng buộc Schema.
3. **Kiểm thử chức năng người dùng (Functional & E2E Testing):** Thực hiện kịch bản người dùng từ giao diện: Sinh viên đăng ký $\rightarrow$ Cán bộ xếp phòng $\rightarrow$ Sinh hợp đồng $\rightarrow$ Tạo hóa đơn $\rightarrow$ Thanh toán.

---

## 7.2 Bảng mẫu Test Cases tiêu biểu

| Test Case ID | Tên ca kiểm thử | Dữ liệu đầu vào (Input) | Kết quả mong đợi (Expected Output) | Trạng thái |
|:---:|---|---|---|:---:|
| **TC-AUTH-01** | Đăng nhập đúng tài khoản Admin | Username: `admin`, Password: `Admin@123` | Đăng nhập thành công, nhận JWT token, điều hướng tới `/admin/dashboard`. | **PASS** |
| **TC-AUTH-02** | Đăng nhập sai mật khẩu | Username: `admin`, Password: `WrongPassword` | Báo lỗi `401 Unauthorized: Sai tên tài khoản hoặc mật khẩu`. | **PASS** |
| **TC-ROOM-01** | Tạo phòng mới với số phòng hợp lệ | Tòa A1, Tầng 2, Phòng 201, Sức chứa 4, Giá 600.000đ | Phòng được tạo mới trong DB, sinh tự động 4 giường trạng thái `Available`. | **PASS** |
| **TC-REG-01** | Sinh viên Nam đăng ký vào Tòa Nữ | Sinh viên giới tính Nam chọn Tòa Nữ B2 | Hệ thống chặn lại và thông báo: `Giới tính không phù hợp với tòa nhà đã chọn`. | **PASS** |
| **TC-METER-01** | Nhập chỉ số điện mới nhỏ hơn chỉ số cũ | Điện cũ: 150 kWh, Điện mới nhập: 140 kWh | Báo lỗi nghiệp vụ: `Chỉ số điện mới phải lớn hơn hoặc bằng chỉ số cũ (150)`. | **PASS** |
| **TC-INV-01** | Tự động tính tiền hóa đơn | Phòng 201: Tiền phòng 600k, 50 số điện (3.000đ/số), 10 khối nước (10.000đ/khối) | Tổng tiền hóa đơn tự động tính chính xác: $600.000 + 150.000 + 100.000 = 850.000$ VNĐ. | **PASS** |
| **TC-REPAIR-01**| Sinh viên gửi yêu cầu sửa chữa | Chọn Phòng 201, Tiêu đề: "Hỏng bóng đèn trần", Ưu tiên: "Cao" | Yêu cầu được lưu vào DB với trạng thái `Pending`, hiển thị tức thời trên Dashboard Admin. | **PASS** |

---

## 7.3 Hướng dẫn cài đặt và vận hành hệ thống

Dự án đã được đóng gói các script tiện ích để khởi chạy toàn bộ chỉ với **1 cú click chuột**:

1. **Khởi động Database MongoDB:**
   - Dịch vụ MongoDB cục bộ luôn chạy ngầm trên Windows (cổng 27017).
   - Để mở công cụ quản trị dữ liệu: Nhấp đúp file [open_mongosh.bat](file:///D:/QLKTX/open_mongosh.bat).
2. **Khởi chạy đồng thời cả Backend và Frontend:**
   - Nhấp đúp file script [run_all.bat](file:///D:/QLKTX/run_all.bat).
   - Backend API chạy tại: `http://localhost:5000/api/health`
   - Giao diện Frontend chạy tại: `http://localhost:3000`
3. **Tài khoản đăng nhập dùng thử có sẵn (Seed Data):**
   - **Tài khoản Quản trị (Admin):** `admin` / Mật khẩu: `Admin@123`
   - **Tài khoản Cán bộ (Staff):** `staff` / Mật khẩu: `Staff@123`
   - **Tài khoản Sinh viên (Student):** `sv2026001` / Mật khẩu: `Ktx@123456`

---

# CHƯƠNG 8: KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN

## 8.1 Các kết quả đã đạt được
1. **Về mặt lý thuyết & kiến trúc:**
   - Hoàn thành đầy đủ bộ tài liệu chuẩn kỹ nghệ phần mềm (SEP): Function List, Business Rules, Traceability Matrix, Architecture Drivers, Database Design và Test Suite.
   - Ứng dụng thành công các mẫu thiết kế phần mềm kinh điển: **Singleton, Factory Method, Strategy, Observer, State, Facade/Middleware**.
2. **Về mặt sản phẩm phần mềm:**
   - Xây dựng hoàn chỉnh hệ thống Web App Full-Stack gồm Backend RESTful API và Frontend React hiện đại.
   - Giải quyết triệt để các bài toán thực tế: Phân phòng đúng quy chuẩn giới tính, tự động chốt điện nước, phát hành hóa đơn minh bạch, quản lý sửa chữa khép kín.
   - Giao diện người dùng được nâng cấp chuẩn Figma: Thân thiện, đẹp mắt, có phản hồi trạng thái rõ ràng.

## 8.2 Một số hạn chế hiện tại
- Chưa tích hợp cổng thanh toán trực tuyến tự động (mới dừng ở mức ghi nhận phiếu thu hoặc quét mã QR chuyển khoản thủ công).
- Hệ thống gửi email thông báo mới chỉ ở dạng mô phỏng (cần cấu hình dịch vụ SMTP bên ngoài như Gmail App Password hoặc SendGrid).

## 8.3 Hướng phát triển trong tương lai
1. **Tích hợp cổng thanh toán trực tuyến (Payment Gateway):** Liên kết cổng VNPay, MoMo, ZaloPay để gạch nợ hóa đơn tự động 24/7 khi sinh viên quét mã thanh toán.
2. **Tích hợp phần cứng IoT & Nhận diện khuôn mặt:** Kết nối hệ thống điểm danh vào/ra cổng KTX bằng thẻ từ RFID hoặc Camera AI nhận diện khuôn mặt sinh viên.
3. **Phát triển ứng dụng di động (Mobile App):** Xây dựng ứng dụng Flutter / React Native để sinh viên nhận thông báo đẩy (Push Notification) tức thời trên điện thoại thông minh.

---
*(Hết tài liệu tổng quan dự án - Biên soạn bởi Nhóm 06)*


