# PHÂN TÍCH VÀ THIẾT KẾ CƠ SỞ DỮ LIỆU (DATABASE ANALYSIS & DESIGN)
**Dự án:** Hệ Thống Quản Lý Ký Túc Xá (QLKTX)  
**Hệ quản trị CSDL:** MongoDB (NoSQL Document Database)  
**Tên cơ sở dữ liệu:** `DormitoryDb`  
**Thư viện ORM/ODM:** Mongoose v8  

---

## 1. DANH SÁCH CÁC COLLECTIONS VÀ MÔ TẢ TỔNG QUAN

Cơ sở dữ liệu của hệ thống gồm **14 collections**, được tổ chức khoa học theo các nhóm nghiệp vụ vận hành ký túc xá:

| STT | Tên Collection | Mongoose Model | Mô tả chức năng |
|:---:|---|---|---|
| 1 | **`users`** | `User` | Lưu trữ tài khoản đăng nhập của toàn bộ hệ thống gồm Quản trị viên (Admin), Cán bộ KTX (Staff) và Sinh viên (Student). Quản lý mật khẩu băm, phân quyền vai trò (RBAC) và phiên làm việc JWT. |
| 2 | **`students`** | `Student` | Lưu trữ hồ sơ lý lịch cá nhân chi tiết của sinh viên nội trú (MSSV, Họ tên, Giới tính, Ngày sinh, Khoa, Lớp, CCCD, thông tin liên lạc và trạng thái lưu trú). |
| 3 | **`buildings`** | `Building` | Quản lý danh mục các Tòa nhà KTX trong khuôn viên (Ký hiệu tòa, tên tòa, số tầng, quy định giới tính phân bổ: Nam / Nữ / Tất cả). |
| 4 | **`rooms`** | `Room` | Quản lý danh mục Phòng ở thuộc các tòa nhà (Số phòng, tầng, loại phòng, sức chứa tối đa, đơn giá thuê hàng tháng, trạng thái: Còn chỗ / Đã đầy / Bảo trì). |
| 5 | **`beds`** | `Bed` | Quản lý vị trí từng Giường cụ thể trong mỗi phòng (Ký hiệu giường, tình trạng: Trống / Đã có người ở / Hỏng hóc). |
| 6 | **`registrations`** | `Registration` | Lưu trữ đơn đăng ký nguyện vọng xin vào KTX của sinh viên (Tòa nhà mong muốn, loại phòng, thời hạn thuê, trạng thái duyệt: Chờ duyệt / Đã duyệt / Từ chối). |
| 7 | **`contracts`** | `Contract` | Quản lý Hợp đồng lưu trú chính thức giữa KTX và sinh viên (Mã hợp đồng, ngày bắt đầu, ngày kết thúc, giá thuê thỏa thuận, tiền đặt cọc, trạng thái: Đang hiệu lực / Thanh lý / Hết hạn). |
| 8 | **`meterreadings`** | `MeterReading` | Lưu trữ chỉ số đồng hồ điện và nước hàng tháng của từng phòng (Chỉ số cũ, chỉ số mới, đơn giá điện/kWh, đơn giá nước/m³, ngày chốt chỉ số). |
| 9 | **`invoices`** | `Invoice` | Quản lý hóa đơn thu tiền định kỳ hàng tháng (Tiền phòng, tiền điện tiêu thụ, tiền nước tiêu thụ, phụ phí dịch vụ, tổng tiền phải nộp, hạn thanh toán và trạng thái nợ). |
| 10 | **`payments`** | `Payment` | Lưu trữ phiếu thu và lịch sử các giao dịch đóng tiền hóa đơn (Mã phiếu thu, số tiền nộp, hình thức thanh toán: Tiền mặt / Chuyển khoản, mã giao dịch, thời điểm nộp). |
| 11 | **`repairrequests`** | `RepairRequest` | Tiếp nhận và theo dõi tiến độ xử lý phản ánh hỏng hóc cơ sở vật chất từ sinh viên (Tiêu đề sự cố, mô tả, mức độ ưu tiên, chi phí sửa chữa, trạng thái xử lý). |
| 12 | **`violations`** | `Violation` | Quản lý biên bản kỷ luật và ghi nhận các hành vi vi phạm nội quy KTX của sinh viên (Hành vi vi phạm, số tiền phạt, ngày lập biên bản, hướng xử lý). |
| 13 | **`notifications`** | `Notification` | Lưu trữ các bản tin, thông báo từ Ban quản lý (Thông báo phát hành hóa đơn, lịch chốt điện nước, thông báo chung toàn KTX hoặc gửi riêng từng cá nhân). |
| 14 | **`counters`** | `Counter` | Bảng tiện ích quản lý bộ đếm tự tăng (Auto-increment Sequence) để sinh mã ID số nguyên tuần tự (`1, 2, 3...`) cho tất cả các collections trên. |

---

## 2. QUAN HỆ CHÍNH GIỮA CÁC COLLECTIONS (RELATIONSHIPS)

Hệ thống thiết lập các mối quan hệ toàn vẹn dữ liệu thông qua các trường khóa ngoại (Foreign Keys) liên kết giữa các bảng như sau:

* **`students.userId → users.id`**: Quan hệ 1 - 1 giữa Hồ sơ sinh viên và Tài khoản đăng nhập tương ứng.
* **`rooms.buildingId → buildings.id`**: Quan hệ N - 1, mỗi Phòng thuộc về duy nhất một Tòa nhà KTX.
* **`beds.roomId → rooms.id`**: Quan hệ N - 1, mỗi Giường nằm trong một Phòng cụ thể.
* **`registrations.studentId → students.id`**: Quan hệ N - 1, một Sinh viên có thể nộp nhiều đơn đăng ký qua các học kỳ.
* **`registrations.preferredBuildingId → buildings.id`**: Quan hệ N - 1, đơn đăng ký chỉ định Tòa nhà nguyện vọng.
* **`registrations.approvedRoomId → rooms.id`**: Quan hệ N - 1, phòng được Cán bộ chỉ định sau khi duyệt đơn.
* **`registrations.approvedBedId → beds.id`**: Quan hệ N - 1, giường được Cán bộ xếp chỗ cho sinh viên.
* **`contracts.studentId → students.id`**: Quan hệ N - 1, Hợp đồng lưu trú ký kết với một Sinh viên.
* **`contracts.roomId → rooms.id`**: Quan hệ N - 1, Hợp đồng xác định Phòng ở của sinh viên.
* **`contracts.bedId → beds.id`**: Quan hệ N - 1, Hợp đồng xác định Giường cụ thể được thuê.
* **`meterreadings.roomId → rooms.id`**: Quan hệ N - 1, Chỉ số điện nước được ghi nhận theo từng Phòng hàng tháng.
* **`invoices.studentId → students.id`**: Quan hệ N - 1, Hóa đơn thu tiền phát hành cho Sinh viên đại diện phòng.
* **`invoices.contractId → contracts.id`**: Quan hệ N - 1, Hóa đơn tiền phòng liên kết trực tiếp tới Hợp đồng lưu trú.
* **`payments.invoiceId → invoices.id`**: Quan hệ N - 1, một Hóa đơn có thể có một hoặc nhiều lần nộp tiền (thanh toán đủ hoặc từng phần).
* **`repairrequests.studentId → students.id`**: Quan hệ N - 1, Yêu cầu sửa chữa do Sinh viên gửi lên.
* **`repairrequests.roomId → rooms.id`**: Quan hệ N - 1, Vị trí phòng xảy ra sự cố cần sửa chữa.
* **`violations.studentId → students.id`**: Quan hệ N - 1, Biên bản kỷ luật xử phạt gán cho Sinh viên vi phạm.
* **`notifications.userId → users.id`**: Quan hệ N - 1, Thông báo được gửi đến Tài khoản người dùng cụ thể (`null` nghĩa là thông báo chung cho toàn hệ thống).

---

## 3. THIẾT KẾ CHI TIẾT CÁC TRƯỜNG DỮ LIỆU (DATA DICTIONARY)

### 3.1 Collection: `users` (Tài khoản người dùng)
Lưu trữ thông tin xác thực và phân quyền tài khoản đăng nhập.

| Tên trường | Mô tả ý nghĩa | Kiểu dữ liệu | Cho phép Null | Ràng buộc / Mặc định |
|---|---|---|:---:|---|
| `_id` | Khóa chính tự sinh của MongoDB | ObjectId | Not null | PK, Index tự động |
| `id` | Mã số nguyên tự tăng duy nhất | Number | Not null | Unique, Index |
| `username` | Tên đăng nhập tài khoản | String | Not null | Unique, Trim |
| `email` | Địa chỉ thư điện tử | String | Not null | Unique, Trim |
| `passwordHash` | Mật khẩu tài khoản đã mã hóa | String | Not null | BCrypt băm 1 chiều |
| `fullName` | Họ và tên đầy đủ của người dùng | String | Not null | Trim |
| `phone` | Số điện thoại liên hệ | String | Null | Mặc định: `null` |
| `avatarUrl` | Đường dẫn ảnh đại diện cá nhân | String | Null | Mặc định: `null` |
| `role` | Phân quyền vai trò | Number | Not null | `1`: Admin, `2`: Staff, `3`: Student (Mặc định: 3) |
| `isActive` | Trạng thái hoạt động tài khoản | Boolean | Not null | Mặc định: `true` |
| `refreshToken` | Token dùng để làm mới phiên JWT | String | Null | Mặc định: `null` |
| `refreshTokenExpiryTime`| Thời hạn hết hạn của Refresh Token | Date | Null | Mặc định: `null` |
| `createdAt` | Thời điểm tạo tài khoản | Date | Not null | Tự động sinh (Timestamp) |
| `updatedAt` | Thời điểm cập nhật tài khoản gần nhất | Date | Not null | Tự động sinh (Timestamp) |

---

### 3.2 Collection: `students` (Hồ sơ Sinh viên)
Lưu trữ thông tin lý lịch cá nhân của sinh viên nội trú.

| Tên trường | Mô tả ý nghĩa | Kiểu dữ liệu | Cho phép Null | Ràng buộc / Mặc định |
|---|---|---|:---:|---|
| `_id` | Khóa chính tự sinh của MongoDB | ObjectId | Not null | PK, Index tự động |
| `id` | Mã số nguyên tự tăng duy nhất | Number | Not null | Unique, Index |
| `userId` | Khóa ngoại liên kết tài khoản (`users.id`) | Number | Null | FK, Index |
| `studentCode` | Mã số sinh viên (MSSV) | String | Not null | Unique, Trim |
| `fullName` | Họ và tên sinh viên | String | Not null | Trim |
| `dateOfBirth` | Ngày tháng năm sinh | Date | Not null | Định dạng ISO Date |
| `gender` | Giới tính | String | Not null | Mặc định: `'Nam'` |
| `phone` | Số điện thoại cá nhân | String | Null | Mặc định: `''` |
| `email` | Email sinh viên | String | Not null | Trim |
| `address` | Địa chỉ thường trú / Quê quán | String | Null | Mặc định: `''` |
| `faculty` | Khoa / Viện đào tạo | String | Null | Mặc định: `''` |
| `className` | Lớp sinh hoạt chuyên ngành | String | Null | Mặc định: `''` |
| `citizenId` | Số CCCD / CMND | String | Null | Mặc định: `null` |
| `avatarUrl` | Đường dẫn ảnh thẻ sinh viên | String | Null | Mặc định: `null` |
| `isStaying` | Trạng thái có đang ở KTX hay không | Boolean | Not null | Mặc định: `false` |
| `createdAt` | Thời điểm tạo hồ sơ | Date | Not null | Tự động sinh (Timestamp) |
| `updatedAt` | Thời điểm cập nhật hồ sơ gần nhất | Date | Not null | Tự động sinh (Timestamp) |

---

### 3.3 Collection: `buildings` (Tòa nhà KTX)
Quản lý danh mục các dãy nhà/tòa nhà ký túc xá.

| Tên trường | Mô tả ý nghĩa | Kiểu dữ liệu | Cho phép Null | Ràng buộc / Mặc định |
|---|---|---|:---:|---|
| `_id` | Khóa chính tự sinh của MongoDB | ObjectId | Not null | PK, Index tự động |
| `id` | Mã số nguyên tự tăng duy nhất | Number | Not null | Unique, Index |
| `code` | Mã ký hiệu tòa nhà (VD: A1, B2) | String | Not null | Unique, Trim |
| `name` | Tên hiển thị của tòa nhà | String | Not null | Trim |
| `address` | Vị trí tòa nhà trong khuôn viên | String | Null | Mặc định: `''` |
| `numberOfFloors` | Tổng số tầng lầu của tòa nhà | Number | Not null | Mặc định: `4` |
| `description` | Mô tả tiện ích, vị trí tòa nhà | String | Null | Mặc định: `null` |
| `genderAllowed` | Đối tượng giới tính được bố trí ở | String | Not null | `'Nam'`, `'Nữ'`, `'Tất cả'` (Mặc định: `'Tất cả'`) |
| `createdAt` | Thời điểm thêm tòa nhà | Date | Not null | Tự động sinh (Timestamp) |
| `updatedAt` | Thời điểm cập nhật thông tin tòa nhà | Date | Not null | Tự động sinh (Timestamp) |

---

### 3.4 Collection: `rooms` (Phòng ở)
Quản lý danh sách các phòng ở thuộc từng tòa nhà.

| Tên trường | Mô tả ý nghĩa | Kiểu dữ liệu | Cho phép Null | Ràng buộc / Mặc định |
|---|---|---|:---:|---|
| `_id` | Khóa chính tự sinh của MongoDB | ObjectId | Not null | PK, Index tự động |
| `id` | Mã số nguyên tự tăng duy nhất | Number | Not null | Unique, Index |
| `buildingId` | Khóa ngoại liên kết tòa nhà (`buildings.id`) | Number | Not null | FK, Index |
| `roomNumber` | Số phòng (VD: 101, 201) | String | Not null | Trim |
| `floor` | Tầng lầu đặt phòng | Number | Not null | Mặc định: `1` |
| `roomType` | Phân loại phòng theo số người | String | Not null | Mặc định: `'4 người'` |
| `capacity` | Sức chứa sinh viên tối đa | Number | Not null | Mặc định: `4` |
| `basePrice` | Đơn giá thuê phòng mỗi tháng (VNĐ) | Number | Not null | Giá trị dương |
| `status` | Trạng thái phòng | Number | Not null | `1`: Available, `2`: Full, `3`: UnderMaintenance (Mặc định: 1) |
| `description` | Ghi chú tiện nghi phòng (máy lạnh, nóng lạnh) | String | Null | Mặc định: `null` |
| `genderAllowed` | Giới tính cho phép ở trong phòng | String | Not null | Mặc định: `'Tất cả'` |
| `createdAt` | Thời điểm tạo phòng | Date | Not null | Tự động sinh (Timestamp) |
| `updatedAt` | Thời điểm cập nhật phòng gần nhất | Date | Not null | Tự động sinh (Timestamp) |

---

### 3.5 Collection: `beds` (Giường trong phòng)
Quản lý vị trí từng giường ngủ cụ thể trong phòng.

| Tên trường | Mô tả ý nghĩa | Kiểu dữ liệu | Cho phép Null | Ràng buộc / Mặc định |
|---|---|---|:---:|---|
| `_id` | Khóa chính tự sinh của MongoDB | ObjectId | Not null | PK, Index tự động |
| `id` | Mã số nguyên tự tăng duy nhất | Number | Not null | Unique, Index |
| `roomId` | Khóa ngoại liên kết phòng (`rooms.id`) | Number | Not null | FK, Index |
| `bedNumber` | Ký hiệu giường (VD: G1, G2, Bed 01) | String | Not null | Trim |
| `status` | Tình trạng giường | Number | Not null | `1`: Available, `2`: Occupied, `3`: Broken (Mặc định: 1) |
| `notes` | Ghi chú về giường (vị trí tầng trên/dưới) | String | Null | Mặc định: `null` |
| `createdAt` | Thời điểm thêm giường | Date | Not null | Tự động sinh (Timestamp) |
| `updatedAt` | Thời điểm cập nhật giường gần nhất | Date | Not null | Tự động sinh (Timestamp) |

---

### 3.6 Collection: `registrations` (Đăng ký lưu trú KTX)
Quản lý đơn đăng ký nguyện vọng ở KTX của sinh viên.

| Tên trường | Mô tả ý nghĩa | Kiểu dữ liệu | Cho phép Null | Ràng buộc / Mặc định |
|---|---|---|:---:|---|
| `_id` | Khóa chính tự sinh của MongoDB | ObjectId | Not null | PK, Index tự động |
| `id` | Mã số nguyên tự tăng duy nhất | Number | Not null | Unique, Index |
| `registrationCode`| Mã hồ sơ đăng ký tự sinh | String | Null | Định dạng `REG-YYYYMM-XXX` |
| `studentId` | Khóa ngoại liên kết sinh viên (`students.id`) | Number | Not null | FK, Index |
| `preferredBuildingId`| Khóa ngoại tòa nhà mong muốn (`buildings.id`) | Number | Null | FK |
| `preferredRoomType`| Loại phòng sinh viên mong muốn ở | String | Null | Mặc định: `null` |
| `desiredStartDate` | Ngày dự kiến bắt đầu vào ở | Date | Not null | Ngày hợp lệ |
| `durationMonths` | Thời hạn đăng ký thuê (tháng) | Number | Not null | Mặc định: `6` |
| `reasonOrNote` | Nguyện vọng hoặc lý do ưu tiên của sinh viên | String | Null | Mặc định: `null` |
| `status` | Trạng thái xét duyệt hồ sơ | Number | Not null | `1`: Pending, `2`: Approved, `3`: Rejected, `4`: Cancelled (Mặc định: 1) |
| `adminNote` | Ghi chú phản hồi của Cán bộ duyệt | String | Null | Mặc định: `null` |
| `approvedRoomId`| Phòng được cán bộ chỉ định (`rooms.id`) | Number | Null | FK |
| `approvedBedId` | Giường được cán bộ chỉ định (`beds.id`) | Number | Null | FK |
| `reviewedAt` | Thời điểm cán bộ thực hiện duyệt đơn | Date | Null | Mặc định: `null` |
| `createdAt` | Thời điểm nộp đơn đăng ký | Date | Not null | Tự động sinh (Timestamp) |
| `updatedAt` | Thời điểm cập nhật đơn gần nhất | Date | Not null | Tự động sinh (Timestamp) |

---

### 3.7 Collection: `contracts` (Hợp đồng lưu trú)
Quản lý hợp đồng cam kết lưu trú giữa KTX và sinh viên.

| Tên trường | Mô tả ý nghĩa | Kiểu dữ liệu | Cho phép Null | Ràng buộc / Mặc định |
|---|---|---|:---:|---|
| `_id` | Khóa chính tự sinh của MongoDB | ObjectId | Not null | PK, Index tự động |
| `id` | Mã số nguyên tự tăng duy nhất | Number | Not null | Unique, Index |
| `contractNumber` | Số hợp đồng (VD: HD-2026-001) | String | Not null | Unique, Trim |
| `studentId` | Khóa ngoại liên kết sinh viên (`students.id`) | Number | Not null | FK, Index |
| `roomId` | Khóa ngoại phòng ở (`rooms.id`) | Number | Not null | FK, Index |
| `bedId` | Khóa ngoại giường được thuê (`beds.id`) | Number | Not null | FK, Index |
| `startDate` | Ngày bắt đầu hiệu lực hợp đồng | Date | Not null | Định dạng ISO Date |
| `endDate` | Ngày kết thúc thời hạn hợp đồng | Date | Not null | `endDate >= startDate` |
| `monthlyRent` | Giá thuê phòng thỏa thuận hàng tháng (VNĐ) | Number | Not null | Giá trị dương |
| `depositAmount` | Tiền đặt cọc cơ sở vật chất (VNĐ) | Number | Not null | Mặc định: `0` |
| `status` | Trạng thái hợp đồng | Number | Not null | `1`: Active, `2`: Terminated, `3`: Expired (Mặc định: 1) |
| `terms` | Điều khoản và cam kết hợp đồng | String | Null | Mặc định: `null` |
| `terminatedDate` | Ngày thanh lý hợp đồng thực tế | Date | Null | Mặc định: `null` |
| `terminationReason`| Lý do thanh lý hoặc chấm dứt hợp đồng | String | Null | Mặc định: `null` |
| `createdAt` | Thời điểm ký hợp đồng | Date | Not null | Tự động sinh (Timestamp) |
| `updatedAt` | Thời điểm cập nhật hợp đồng gần nhất | Date | Not null | Tự động sinh (Timestamp) |

---

### 3.8 Collection: `meterreadings` (Chỉ số Điện - Nước)
Ghi nhận chỉ số công tơ điện và đồng hồ nước định kỳ theo từng phòng.

| Tên trường | Mô tả ý nghĩa | Kiểu dữ liệu | Cho phép Null | Ràng buộc / Mặc định |
|---|---|---|:---:|---|
| `_id` | Khóa chính tự sinh của MongoDB | ObjectId | Not null | PK, Index tự động |
| `id` | Mã số nguyên tự tăng duy nhất | Number | Not null | Unique, Index |
| `roomId` | Khóa ngoại liên kết phòng (`rooms.id`) | Number | Not null | FK, Index |
| `month` | Tháng ghi nhận chỉ số (1 - 12) | Number | Not null | Giá trị từ 1 đến 12 |
| `year` | Năm ghi nhận chỉ số (VD: 2026) | Number | Not null | Năm hợp lệ |
| `electricityOld` | Chỉ số điện đầu kỳ (kWh) | Number | Not null | Giá trị không âm |
| `electricityNew` | Chỉ số điện cuối kỳ (kWh) | Number | Not null | `electricityNew >= electricityOld` |
| `waterOld` | Chỉ số nước đầu kỳ (m³) | Number | Not null | Giá trị không âm |
| `waterNew` | Chỉ số nước cuối kỳ (m³) | Number | Not null | `waterNew >= waterOld` |
| `electricityUnitPrice`| Đơn giá 1 kWh điện (VNĐ) | Number | Not null | Mặc định: `3500` |
| `waterUnitPrice` | Đơn giá 1 m³ nước (VNĐ) | Number | Not null | Mặc định: `15000` |
| `recordedDate` | Ngày giờ thực hiện chốt chỉ số | Date | Not null | Mặc định: `Date.now` |
| `recordedBy` | Họ tên cán bộ đi chốt số | String | Null | Mặc định: `null` |
| `createdAt` | Thời điểm tạo bản ghi | Date | Not null | Tự động sinh (Timestamp) |
| `updatedAt` | Thời điểm cập nhật bản ghi gần nhất | Date | Not null | Tự động sinh (Timestamp) |

---

### 3.9 Collection: `invoices` (Hóa đơn thu phí)
Lưu trữ hóa đơn thanh toán tổng hợp hàng tháng của sinh viên.

| Tên trường | Mô tả ý nghĩa | Kiểu dữ liệu | Cho phép Null | Ràng buộc / Mặc định |
|---|---|---|:---:|---|
| `_id` | Khóa chính tự sinh của MongoDB | ObjectId | Not null | PK, Index tự động |
| `id` | Mã số nguyên tự tăng duy nhất | Number | Not null | Unique, Index |
| `invoiceCode` | Mã hóa đơn duy nhất (VD: HD202610-001) | String | Not null | Unique, Trim |
| `studentId` | Khóa ngoại sinh viên đại diện (`students.id`) | Number | Not null | FK, Index |
| `contractId` | Khóa ngoại hợp đồng lưu trú (`contracts.id`) | Number | Not null | FK, Index |
| `month` | Kỳ hóa đơn tháng (1 - 12) | Number | Not null | Giá trị từ 1 đến 12 |
| `year` | Kỳ hóa đơn năm (VD: 2026) | Number | Not null | Năm hợp lệ |
| `roomFee` | Tiền thuê phòng (VNĐ) | Number | Not null | Giá trị không âm |
| `electricityFee` | Tiền điện tiêu thụ trong tháng (VNĐ) | Number | Not null | Mặc định: `0` |
| `waterFee` | Tiền nước tiêu thụ trong tháng (VNĐ) | Number | Not null | Mặc định: `0` |
| `serviceFee` | Tiền dịch vụ (vệ sinh, internet, rác) | Number | Not null | Mặc định: `0` |
| `otherFee` | Phụ thu phát sinh khác (VNĐ) | Number | Not null | Mặc định: `0` |
| `otherFeeDescription`| Diễn giải nội dung khoản phụ thu | String | Null | Mặc định: `null` |
| `totalAmount` | Tổng số tiền phải nộp (VNĐ) | Number | Not null | Tính tổng các khoản phí |
| `paidAmount` | Số tiền sinh viên đã thanh toán thực tế (VNĐ)| Number | Not null | Mặc định: `0` |
| `dueDate` | Hạn chót nộp tiền hóa đơn | Date | Not null | Định dạng ISO Date |
| `status` | Trạng thái hóa đơn | Number | Not null | `1`: Unpaid, `2`: PartiallyPaid, `3`: Paid, `4`: Cancelled, `5`: Overdue (Mặc định: 1) |
| `notes` | Ghi chú trên hóa đơn | String | Null | Mặc định: `null` |
| `createdAt` | Thời điểm phát hành hóa đơn | Date | Not null | Tự động sinh (Timestamp) |
| `updatedAt` | Thời điểm cập nhật hóa đơn gần nhất | Date | Not null | Tự động sinh (Timestamp) |

---

### 3.10 Collection: `payments` (Phiếu thu / Thanh toán)
Ghi nhận từng lần thực hiện giao dịch nộp tiền của sinh viên.

| Tên trường | Mô tả ý nghĩa | Kiểu dữ liệu | Cho phép Null | Ràng buộc / Mặc định |
|---|---|---|:---:|---|
| `_id` | Khóa chính tự sinh của MongoDB | ObjectId | Not null | PK, Index tự động |
| `id` | Mã số nguyên tự tăng duy nhất | Number | Not null | Unique, Index |
| `invoiceId` | Khóa ngoại liên kết hóa đơn (`invoices.id`) | Number | Not null | FK, Index |
| `paymentCode` | Mã phiếu thu chứng từ (VD: PM202610-001) | String | Not null | Unique, Trim |
| `amount` | Số tiền thanh toán trong giao dịch (VNĐ) | Number | Not null | Giá trị dương |
| `paymentDate` | Ngày giờ thực hiện nộp tiền | Date | Not null | Mặc định: `Date.now` |
| `paymentMethod` | Phương thức nộp tiền | Number | Not null | `1`: Tiền mặt, `2`: Chuyển khoản ngân hàng, `3`: Cổng thanh toán trực tuyến (Mặc định: 2) |
| `transactionCode`| Mã giao dịch ngân hàng / Ủy nhiệm chi | String | Null | Mặc định: `null` |
| `status` | Trạng thái giao dịch nộp tiền | Number | Not null | `1`: Pending, `2`: Completed, `3`: Failed (Mặc định: 2) |
| `notes` | Nội dung chuyển khoản / Ghi chú | String | Null | Mặc định: `null` |
| `receivedBy` | Cán bộ thủ quỹ hoặc hệ thống thu | String | Null | Mặc định: `null` |
| `createdAt` | Thời điểm tạo phiếu thu | Date | Not null | Tự động sinh (Timestamp) |
| `updatedAt` | Thời điểm cập nhật phiếu thu gần nhất | Date | Not null | Tự động sinh (Timestamp) |

---

### 3.11 Collection: `repairrequests` (Yêu cầu sửa chữa)
Tiếp nhận và theo dõi quá trình bảo trì thiết bị hư hại.

| Tên trường | Mô tả ý nghĩa | Kiểu dữ liệu | Cho phép Null | Ràng buộc / Mặc định |
|---|---|---|:---:|---|
| `_id` | Khóa chính tự sinh của MongoDB | ObjectId | Not null | PK, Index tự động |
| `id` | Mã số nguyên tự tăng duy nhất | Number | Not null | Unique, Index |
| `studentId` | Khóa ngoại sinh viên báo hỏng (`students.id`)| Number | Not null | FK, Index |
| `roomId` | Khóa ngoại phòng xảy ra sự cố (`rooms.id`)| Number | Not null | FK, Index |
| `title` | Tiêu đề tóm tắt sự cố (VD: Vỡ bóng đèn) | String | Not null | Trim |
| `description` | Mô tả chi tiết hiện trạng thiết bị | String | Not null | Nội dung chi tiết |
| `imageUrl` | Đường dẫn ảnh chụp hiện trường hư hại | String | Null | Mặc định: `null` |
| `priority` | Mức độ khẩn cấp của sự cố | Number | Not null | `1`: Low, `2`: Medium, `3`: High, `4`: Urgent (Mặc định: 2) |
| `status` | Tiến độ xử lý sửa chữa | Number | Not null | `1`: Pending, `2`: Processing, `3`: Completed, `4`: Cancelled (Mặc định: 1) |
| `repairCost` | Chi phí sửa chữa/thay thế vật tư (VNĐ) | Number | Not null | Mặc định: `0` |
| `staffNotes` | Ghi chú của kỹ thuật viên/cán bộ bảo trì | String | Null | Mặc định: `null` |
| `completedAt` | Thời điểm hoàn thành sửa chữa | Date | Null | Mặc định: `null` |
| `createdAt` | Thời điểm gửi yêu cầu báo hỏng | Date | Not null | Tự động sinh (Timestamp) |
| `updatedAt` | Thời điểm cập nhật tiến độ gần nhất | Date | Not null | Tự động sinh (Timestamp) |

---

### 3.12 Collection: `violations` (Kỷ luật & Vi phạm)
Lưu trữ các biên bản xử phạt vi phạm quy chế KTX.

| Tên trường | Mô tả ý nghĩa | Kiểu dữ liệu | Cho phép Null | Ràng buộc / Mặc định |
|---|---|---|:---:|---|
| `_id` | Khóa chính tự sinh của MongoDB | ObjectId | Not null | PK, Index tự động |
| `id` | Mã số nguyên tự tăng duy nhất | Number | Not null | Unique, Index |
| `studentId` | Khóa ngoại sinh viên vi phạm (`students.id`) | Number | Not null | FK, Index |
| `title` | Tiêu đề lỗi vi phạm nội quy | String | Not null | Trim |
| `description` | Mô tả chi tiết hành vi và tang vật vi phạm | String | Not null | Nội dung chi tiết |
| `violationType` | Phân loại nhóm hành vi vi phạm | String | Not null | Mặc định: `'Nội quy phòng'` |
| `penaltyAmount` | Số tiền phạt kỷ luật (VNĐ) | Number | Not null | Mặc định: `0` |
| `violationDate` | Ngày giờ lập biên bản vi phạm | Date | Not null | Mặc định: `Date.now` |
| `status` | Trạng thái xử lý biên bản | Number | Not null | `1`: Pending, `2`: Processed, `3`: Cancelled (Mặc định: 1) |
| `resolutionNotes`| Biện pháp giáo dục / Hình thức kỷ luật | String | Null | Mặc định: `null` |
| `createdBy` | Cán bộ lập biên bản kỷ luật | String | Null | Mặc định: `null` |
| `createdAt` | Thời điểm lưu biên bản | Date | Not null | Tự động sinh (Timestamp) |
| `updatedAt` | Thời điểm cập nhật biên bản gần nhất | Date | Not null | Tự động sinh (Timestamp) |

---

### 3.13 Collection: `notifications` (Thông báo & Bản tin)
Lưu trữ các bản tin thông báo từ Ban quản lý tới sinh viên.

| Tên trường | Mô tả ý nghĩa | Kiểu dữ liệu | Cho phép Null | Ràng buộc / Mặc định |
|---|---|---|:---:|---|
| `_id` | Khóa chính tự sinh của MongoDB | ObjectId | Not null | PK, Index tự động |
| `id` | Mã số nguyên tự tăng duy nhất | Number | Not null | Unique, Index |
| `userId` | Khóa ngoại nhận thông báo (`users.id`) | Number | Null | `null` = Gửi thông báo chung toàn KTX |
| `title` | Tiêu đề bản tin thông báo | String | Not null | Trim |
| `content` | Nội dung thông báo chi tiết | String | Not null | Nội dung chi tiết |
| `type` | Phân loại thông báo | Number | Not null | `1`: General, `2`: Invoice, `3`: Violation, `4`: Repair, `5`: Contract (Mặc định: 1) |
| `isRead` | Đánh dấu trạng thái người dùng đã đọc | Boolean | Not null | Mặc định: `false` |
| `actionUrl` | Đường dẫn điều hướng xem chi tiết khi bấm | String | Null | Mặc định: `null` |
| `createdAt` | Thời điểm phát hành thông báo | Date | Not null | Tự động sinh (Timestamp) |
| `updatedAt` | Thời điểm cập nhật thông báo gần nhất | Date | Not null | Tự động sinh (Timestamp) |

---

### 3.14 Collection: `counters` (Bộ đếm tự tăng)
Quản lý sequence sinh mã ID tự tăng dạng số nguyên (`1, 2, 3...`) cho hệ thống.

| Tên trường | Mô tả ý nghĩa | Kiểu dữ liệu | Cho phép Null | Ràng buộc / Mặc định |
|---|---|---|:---:|---|
| `_id` | Khóa chính tự sinh của MongoDB | ObjectId | Not null | PK, Index tự động |
| `name` | Tên đối tượng/bảng cần sinh mã tự tăng | String | Not null | Unique (VD: `"User"`, `"Room"`) |
| `seq` | Giá trị số thứ tự tự tăng hiện tại | Number | Not null | Mặc định: `0` (Tăng 1 sau mỗi lần insert) |

---

*(Tài liệu thiết kế cơ sở dữ liệu hệ thống QLKTX - Nhóm 06)*
