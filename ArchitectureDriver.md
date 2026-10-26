# ARCHITECTURE DRIVER
## Website Quản lý Ký túc xá (QLKTX)

---

### LỊCH SỬ CHỈNH SỬA

| Phiên bản | Ngày | Người thực hiện | Ghi chú |
|:---:|:---:|---|---|
| 1.0 | 21/09/2026 | Nhóm 06 | Khởi tạo tài liệu Architecture Driver sơ bộ |
| 1.1 | 26/10/2026 | Đỗ Thành Đức, Dương Minh Hùng, Tống Nhật Phát | Chuẩn hóa toàn bộ FR, Entities, Use Case, Quality Attributes và Constraints cho dự án QLKTX |

---

## I. Giới thiệu

### 1. Mục đích
Tài liệu này liệt kê và mô tả chi tiết các **Architectural Driver** cho **Website Quản lý Ký túc xá (QLKTX)**, bao gồm:
* Yêu cầu chức năng ở mức cao (High-level Functional Requirements).
* Các thuộc tính chất lượng (Quality Attributes).
* Các ràng buộc kỹ thuật và ràng buộc nghiệp vụ (Constraints).

Tài liệu này đóng vai trò là kim chỉ nam và nguồn tham chiếu chính để đội ngũ phát triển tiến hành thiết kế kiến trúc phần mềm (**Architecture Design**), thiết kế cơ sở dữ liệu (**Database Design**) và xây dựng kịch bản kiểm thử (**Test Cases**).

### 2. Đối tượng đọc

| Đối tượng đọc | Vai trò | Gợi ý đọc |
|---|---|---|
| **Dương Minh Hùng** | Frontend Developer (FE) | Toàn bộ tài liệu, trọng tâm phần UI Usability và Use Case Sinh viên |
| **Tống Nhật Phát** | Backend Developer (BE) | Toàn bộ tài liệu, trọng tâm phần FR Cơ sở hạ tầng, Hóa đơn và DB Constraints |
| **Đỗ Thành Đức** | Backend & Architecture (BE) | Toàn bộ tài liệu, trọng tâm phần Security, Data Integrity và Quy trình nghiệp vụ |
| **Phạm Nhật Đăng** | Business Analyst & Documentation | Toàn bộ tài liệu, đối chiếu Traceability Matrix và Product Backlog |
| **Vũ Thành Tâm** | Tester & QA | Toàn bộ tài liệu, trọng tâm phần Quality Scenarios và Use Cases để viết Test Plan |
| **[Giảng viên hướng dẫn]** | Mentor môn học | Toàn bộ tài liệu để đánh giá đồ án |
| **Ban Quản lý Ký túc xá** | Khách hàng giả định | Đọc phần Tổng quan, Yêu cầu chức năng và Nghiệp vụ |

---

## II. Tổng quan

Xây dựng ứng dụng web giúp **Ban Quản lý Ký túc xá** số hóa toàn diện quy trình tiếp nhận và vận hành ký túc xá:
* Cho phép sinh viên nộp đơn đăng ký nguyện vọng phòng ở trực tuyến, theo dõi tiến độ xét duyệt, tra cứu thông tin phòng/giường, xem và nộp hóa đơn điện nước định kỳ, gửi yêu cầu báo hỏng cơ sở vật chất.
* Giúp Cán bộ KTX loại bỏ hoàn toàn quy trình ghi sổ tay thủ công và nhập liệu bảng tính rời rạc; tự động hóa việc xếp giường theo đúng giới tính, chốt chỉ số điện nước hàng tháng, tự động tính toán phát hành hóa đơn tổng hợp và quản lý hợp đồng lưu trú minh bạch.

---

## III. Architectural Driver

### 1. Yêu cầu chức năng (Functional Requirements)

#### a. Đặc tả yêu cầu chức năng mức cao

| Chức năng | ID | Độ ưu tiên | Mô tả chi tiết |
|---|:---:|:---:|---|
| **Đăng nhập / Đăng xuất & Xác thực** | FR01 | 1 | Sinh viên, Cán bộ KTX và Admin đăng nhập/đăng xuất hệ thống bằng tài khoản (Username/Email); phiên làm việc được bảo vệ bằng JWT Token với thời hạn 24 giờ. |
| **Quản lý tài khoản & Phân quyền (RBAC)** | FR02 | 1 | Admin có thể: xem danh sách tài khoản, tìm kiếm, tạo mới, chỉnh sửa thông tin, đặt lại mật khẩu, kích hoạt/khóa tài khoản và phân vai trò (`1: Admin`, `2: Staff`, `3: Student`). |
| **Quản lý Cơ sở hạ tầng KTX** | FR03 | 1 | Admin và Staff có thể: quản lý danh mục Tòa nhà (mã, tên, số tầng, giới tính phân bổ), danh mục Phòng ở (số phòng, tầng, loại phòng, sức chứa, đơn giá thuê) và Giường (mã giường, tình trạng trống/đã ở/hỏng). |
| **Quản lý Hồ sơ Sinh viên nội trú** | FR04 | 1 | Staff và Admin có thể: tra cứu, thêm mới, cập nhật hồ sơ cá nhân sinh viên (MSSV, Họ tên, Giới tính, Ngày sinh, Khoa, Lớp, CCCD, trạng thái đang ở KTX). Sinh viên có thể xem hồ sơ của mình. |
| **Đăng ký lưu trú & Xếp phòng** | FR05 | 1 | Sinh viên nộp đơn đăng ký chọn tòa nhà và loại phòng mong muốn. Staff tiếp nhận, duyệt đơn và phân phòng/giường trống phù hợp với giới tính sinh viên. |
| **Quản lý Hợp đồng lưu trú** | FR06 | 1 | Tự động sinh hoặc lập hợp đồng khi duyệt đơn; quản lý thời hạn hợp đồng, tiền đặt cọc, gia hạn hợp đồng và thực hiện thủ tục thanh lý khi sinh viên trả phòng. |
| **Ghi nhận Chỉ số Điện - Nước** | FR07 | 1 | Staff ghi nhận chỉ số công tơ điện và đồng hồ nước định kỳ hàng tháng theo từng phòng; hệ thống kiểm tra ràng buộc `chỉ số mới >= chỉ số cũ` và tính toán lượng tiêu thụ. |
| **Quản lý Hóa đơn & Thu phí** | FR08 | 1 | Hệ thống tự động phát hành hóa đơn tổng hợp (Tiền phòng + Tiền điện + Tiền nước + Phụ phí); Staff ghi nhận phiếu thu thanh toán; theo dõi trạng thái công nợ và cảnh báo trễ hạn. |
| **Tiếp nhận & Xử lý Sửa chữa thiết bị** | FR09 | 2 | Sinh viên gửi yêu cầu báo hỏng cơ sở vật chất kèm mô tả và mức độ khẩn cấp. Staff tiếp nhận, điều phối thợ sửa chữa, cập nhật chi phí và xác nhận hoàn thành. |
| **Quản lý Kỷ luật & Vi phạm nội quy** | FR10 | 2 | Staff lập biên bản ghi nhận hành vi vi phạm nội quy KTX, áp dụng mức phạt tiền hoặc trừ điểm rèn luyện; Sinh viên tra cứu lịch sử vi phạm của mình. |
| **Bản tin & Thông báo KTX** | FR11 | 3 | Ban Quản lý đăng thông báo chung toàn KTX hoặc gửi thông báo riêng đến từng cá nhân (thông báo hóa đơn, nhắc nợ, lịch cắt điện nước). |
| **Báo cáo & Thống kê (Dashboard)** | FR12 | 2 | Admin và Staff theo dõi Dashboard trực quan: tổng doanh thu thu phí, số giường đã lấp đầy, tỷ lệ phòng trống, số yêu cầu sửa chữa chờ giải quyết và công nợ quá hạn. |

---

#### b. Thực thể (Entities)

| Thực thể | Mô tả |
|---|---|
| **Admin (E01)** | Quản trị viên hệ thống, toàn quyền quản lý tài khoản người dùng, phân quyền vai trò và quản lý danh mục cấu hình KTX (tòa nhà, phòng, bảng giá). |
| **Cán bộ KTX (E02)** | Cán bộ quản lý tiếp nhận hồ sơ đăng ký, xét duyệt và xếp phòng/giường cho sinh viên, quản lý hợp đồng lưu trú, lập biên bản kỷ luật và điều phối sửa chữa cơ sở vật chất. |
| **Kế toán KTX (E03)** | Cán bộ kế toán phụ trách ghi nhận chỉ số điện nước định kỳ, tự động phát hành hóa đơn hàng tháng, theo dõi công nợ, xác nhận thanh toán và báo cáo doanh thu. |
| **Sinh viên (E04)** | Người dùng sinh viên nộp đơn đăng ký lưu trú trực tuyến, tra cứu thông tin phòng/giường, xem và nộp tiền hóa đơn, gửi yêu cầu báo hỏng thiết bị và nhận thông báo. |

---

#### c. Danh sách Use Case

| STT | Phân hệ (Module) | Use Case ID | Tên Use Case | Phục vụ FR |
|:---:|---|---|---|:---:|
| 1 | **Xác thực & Tài khoản** | UC.1.1 | Đăng nhập hệ thống (JWT Auth) | FR01 |
| | | UC.1.2 | Đăng xuất hệ thống | FR01 |
| | | UC.1.3 | Đổi mật khẩu cá nhân | FR01 |
| 2 | **Quản lý Tài khoản (Admin)** | UC.2.1 | Xem danh sách tài khoản | FR02 |
| | | UC.2.2 | Tìm kiếm & lọc tài khoản theo vai trò | FR02 |
| | | UC.2.3 | Tạo mới tài khoản Cán bộ / Sinh viên | FR02 |
| | | UC.2.4 | Cập nhật thông tin & Khóa tài khoản | FR02 |
| | | UC.2.5 | Đặt lại mật khẩu tài khoản | FR02 |
| 3 | **Cơ sở hạ tầng KTX** | UC.3.1 - 3.3 | Thêm / Sửa / Xóa Tòa nhà KTX | FR03 |
| | | UC.3.4 - 3.6 | Thêm / Sửa / Xóa Phòng ở | FR03 |
| | | UC.3.7 - 3.9 | Xem sơ đồ phòng & Danh sách giường trống | FR03 |
| 4 | **Hồ sơ Sinh viên** | UC.4.1 | Tra cứu hồ sơ sinh viên theo MSSV / Lớp | FR04 |
| | | UC.4.2 | Thêm mới hồ sơ sinh viên | FR04 |
| | | UC.4.3 | Cập nhật thông tin sinh viên | FR04 |
| | | UC.4.4 | Sinh viên xem thông tin phòng ở cá nhân | FR04 |
| 5 | **Đăng ký & Xếp phòng** | UC.5.1 | Sinh viên nộp đơn đăng ký phòng trực tuyến | FR05 |
| | | UC.5.2 | Sinh viên theo dõi trạng thái đơn đăng ký | FR05 |
| | | UC.5.3 | Cán bộ duyệt đơn & Chọn xếp giường phù hợp | FR05 |
| | | UC.5.4 | Cán bộ từ chối đơn đăng ký kèm lý do | FR05 |
| 6 | **Quản lý Hợp đồng** | UC.6.1 | Lập hợp đồng lưu trú mới | FR06 |
| | | UC.6.2 | Tra cứu hợp đồng theo sinh viên / phòng | FR06 |
| | | UC.6.3 | Gia hạn thời hạn hợp đồng | FR06 |
| | | UC.6.4 | Thanh lý hợp đồng & Trả phòng | FR06 |
| 7 | **Điện - Nước** | UC.7.1 | Ghi nhận chỉ số điện nước hàng tháng | FR07 |
| | | UC.7.2 | Tra cứu lịch sử tiêu thụ điện nước của phòng | FR07 |
| | | UC.7.3 | Cảnh báo chỉ số bất thường (số mới < số cũ) | FR07 |
| 8 | **Hóa đơn & Thu phí** | UC.8.1 | Tự động phát hành hóa đơn hàng tháng | FR08 |
| | | UC.8.2 | Xem danh sách hóa đơn theo phòng / sinh viên | FR08 |
| | | UC.8.3 | Ghi nhận phiếu thu thanh toán | FR08 |
| | | UC.8.4 | Theo dõi danh sách công nợ quá hạn | FR08 |
| 9 | **Sửa chữa cơ sở vật chất** | UC.9.1 | Sinh viên gửi yêu cầu báo hỏng thiết bị | FR09 |
| | | UC.9.2 | Cán bộ tiếp nhận & Cập nhật tiến độ sửa | FR09 |
| | | UC.9.3 | Hoàn thành sửa chữa & Ghi nhận chi phí | FR09 |
| 10 | **Kỷ luật & Vi phạm** | UC.10.1 | Lập biên bản xử phạt vi phạm | FR10 |
| | | UC.10.2 | Tra cứu lịch sử vi phạm của sinh viên | FR10 |
| 11 | **Bản tin & Thông báo** | UC.11.1 | Ban Quản lý đăng thông báo mới | FR11 |
| | | UC.11.2 | Sinh viên xem bảng tin & thông báo cá nhân | FR11 |
| 12 | **Báo cáo & Thống kê** | UC.12.1 | Thống kê tỷ lệ lấp đầy phòng / giường | FR12 |
| | | UC.12.2 | Thống kê doanh thu tiền phòng và điện nước | FR12 |

---

### 2. Yêu cầu thuộc tính chất lượng (Quality Attributes)

#### a. Danh sách thuộc tính chất lượng

| STT | Thuộc tính chất lượng | Mô tả chi tiết | Độ ưu tiên |
|:---:|---|---|:---:|
| 1 | **Usability (Tính khả dụng)** | Giao diện hiện đại theo chuẩn Figma, tương thích hoàn toàn (responsive) trên cả máy tính để bàn và điện thoại di động vì sinh viên thường xuyên nộp đơn và tra cứu bằng smartphone. | **High** |
| 2 | **Performance (Hiệu năng)** | Thời gian phản hồi của các thao tác nghiệp vụ thông thường (đăng ký, tra cứu, thanh toán) dưới 2 giây; API truy vấn danh sách phản hồi dưới 1 giây. | **High** |
| 3 | **Security (Bảo mật)** | Mật khẩu người dùng được băm an toàn bằng thuật toán BCrypt; xác thực bằng JWT Token; kiểm soát chặt chẽ quyền truy cập (sinh viên tuyệt đối không thể xem hoặc sửa đổi thông tin của sinh viên khác). | **High** |
| 4 | **Data Integrity (Toàn vẹn dữ liệu)** | Đảm bảo các ràng buộc nghiệp vụ cốt lõi không bị vi phạm: Không bao giờ xếp trùng 2 sinh viên vào cùng 1 giường; chỉ số điện nước mới phải lớn hơn hoặc bằng chỉ số cũ; tổng tiền hóa đơn phải khớp chính xác với công thức tính toán. | **High** |
| 5 | **Availability (Độ sẵn sàng)** | Hệ thống hoạt động ổn định, liên tục 24/7 để phục vụ sinh viên nộp đơn đăng ký và tra cứu hóa đơn mọi lúc mọi nơi. | **Medium** |

---

#### b. Các kịch bản thuộc tính chất lượng tiêu biểu (Quality Scenarios)

##### Kịch bản 1: QAs1 – Hiệu năng khi mở cổng đăng ký KTX (Performance)
* **Title:** QAs1 - Sinh viên nộp đơn đăng ký phản hồi nhanh trong giờ cao điểm mở đợt đăng ký phòng.
* **Quality Attribute:** Performance
* **Source of Stimulus:** Sinh viên (Student)
* **Stimulus:** Hàng trăm sinh viên đồng thời truy cập và bấm nút "Gửi đơn đăng ký KTX".
* **Environment:** Đợt mở cổng đăng ký đầu năm học, tải hệ thống tăng đột biến.
* **System Response:** Hệ thống tiếp nhận đơn, kiểm tra tính hợp lệ, lưu vào cơ sở dữ liệu và trả về thông báo mã đơn đăng ký thành công.
* **Response Measure:** Thời gian phản hồi hoàn tất dưới 2 giây; không xảy ra hiện tượng treo máy chủ hoặc nghẽn kết nối cơ sở dữ liệu.

##### Kịch bản 2: QAs2 – Kiểm soát truy cập và bảo vệ dữ liệu cá nhân (Security)
* **Title:** QAs2 - Chặn truy cập trái phép vào dữ liệu phòng và hóa đơn của người khác.
* **Quality Attribute:** Security
* **Source of Stimulus:** Người dùng sinh viên cố tình can thiệp API (truy cập hóa đơn hoặc hồ sơ của sinh viên khác).
* **Stimulus:** Gửi yêu cầu HTTP kèm ID hóa đơn hoặc ID sinh viên không thuộc sở hữu của mình.
* **Environment:** Hệ thống đang vận hành bình thường qua mạng Internet.
* **System Response:** Middleware xác thực JWT kiểm tra quyền sở hữu (`req.user.studentId`); hệ thống từ chối yêu cầu và trả về mã lỗi `403 Forbidden`.
* **Response Measure:** 100% các truy vấn vượt quyền bị chặn đứng; không làm rò rỉ dữ liệu cá nhân.

##### Kịch bản 3: QAs3 – Đảm bảo toàn vẹn dữ liệu xếp giường (Data Integrity)
* **Title:** QAs3 - Ngăn chặn tình trạng xếp trùng giường khi hai cán bộ cùng duyệt phòng.
* **Quality Attribute:** Data Integrity
* **Source of Stimulus:** Cán bộ KTX (Staff)
* **Stimulus:** Hai cán bộ cùng lúc bấm duyệt và chọn cùng một giường cho 2 sinh viên khác nhau.
* **Environment:** Giờ làm việc bình thường của văn phòng ban quản lý KTX.
* **System Response:** Hệ thống sử dụng cơ chế kiểm tra trạng thái giường (`Bed.status === 1: Available`) trước khi lưu hợp đồng. Đơn đầu tiên được duyệt thành công; đơn thứ hai nhận thông báo lỗi: "Giường này vừa được xếp cho người khác, vui lòng chọn giường trống khác".
* **Response Measure:** Tuyệt đối không bao giờ xảy ra tình trạng 1 giường có 2 sinh viên cùng lưu trú (`100% Zero Double-Booking`).

---

### 3. Ràng buộc hệ thống (Constraints)

#### a. Ràng buộc kỹ thuật (Technical Constraints)

| ID | Ràng buộc kỹ thuật | Mô tả chi tiết |
|:---:|---|---|
| **TC1** | **Frontend Framework** | Sử dụng ReactJS v18, TypeScript, Tailwind CSS và công cụ build Vite. Thiết kế giao diện tuân thủ nguyên mẫu trên Figma. |
| **TC2** | **Backend Framework** | Xây dựng RESTful API bằng Node.js v20+ với Express.js framework; hỗ trợ cấu trúc phân tầng Clean Architecture song song với .NET 8 Web API. |
| **TC3** | **Cơ sở dữ liệu (Database)** | Sử dụng cơ sở dữ liệu MongoDB (`DormitoryDb`) và thư viện Mongoose ODM để thao tác dữ liệu qua Schema chặt chẽ. |
| **TC4** | **Cơ chế xác thực & Bảo mật** | Sử dụng chuẩn JSON Web Token (JWT) cho các API có phân quyền và thuật toán băm một chiều BCrypt để lưu trữ mật khẩu người dùng. |
| **TC5** | **Giao thức truyền thông** | Toàn bộ giao tiếp giữa Frontend và Backend sử dụng giao thức HTTP/HTTPS với định dạng dữ liệu trao đổi chuẩn JSON. |

#### b. Ràng buộc nghiệp vụ & Dự án (Business Constraints)

| ID | Ràng buộc nghiệp vụ | Mô tả chi tiết |
|:---:|---|---|
| **BC1** | **Nhân sự thực hiện** | Nhóm 06 gồm 5 thành viên (Dương Minh Hùng, Tống Nhật Phát, Đỗ Thành Đức, Phạm Nhật Đăng, Vũ Thành Tâm) chia sẻ các vai trò FE, BE, BA và QA. |
| **BC2** | **Thời lượng dự án** | Triển khai trong khuôn khổ 12 tuần của học kỳ môn học Mẫu Thiết Kế Phần Mềm (SEP), chia thành các Sprint theo quy trình Scrum. |
| **BC3** | **Khách hàng & Nghiệp vụ KTX** | Thiết kế phải bám sát quy chế quản lý ký túc xá thực tế của các trường đại học tại Việt Nam (phân chia tòa nam/nữ, tính điện nước bậc thang/cố định, quản lý kỷ luật). |

---

*(Tài liệu Architecture Driver - Hệ thống Quản lý Ký túc xá - Nhóm 06)*


