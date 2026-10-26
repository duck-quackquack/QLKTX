# SPRINT 1 BACKLOG
## Hệ thống Quản lý Ký túc xá (QLKTX) - Nhóm 06

* **Thời gian thực hiện:** 29/09/2026 – 19/10/2026 (Tuần 4 – Tuần 6)
* **Mục tiêu Sprint 1:** Hoàn thành xác thực người dùng, phân quyền RBAC, quản lý tài khoản, hồ sơ sinh viên, danh mục tòa nhà, phòng và giường (Release 1).
* **Tài liệu đối chiếu:** 
  * `2.1 SEP_KTX_FunctionList_v1.1.xlsx` (Module 1, 2, 3, 4, 5)
  * `1.1.4 SEP_KTX_ProductBacklog_ver1.1.xlsx` (US.01 – US.08)
  * `1.1.2 SEP_KTX_Milestone_ver1.1.xlsx` (Sprint 1)

---

### BẢNG SPRINT 1 BACKLOG ITEMS

| STT | User Story | Story Point | Độ ưu tiên | Người thực hiện |
|:---:|---|:---:|:---:|---|
| **1.0** | **Scrum Master tổ chức họp Sprint 1 (Sprint Planning)** | **5** | **Medium** | **Đỗ Thành Đức** |
| **2.0** | **Là người dùng, tôi muốn Đăng nhập/Đăng xuất bằng email (F.1.1, F.1.2)** | **18** | **High** | **Đỗ Thành Đức** |
| 2.1 | - Designer: thiết kế prototype giao diện Đăng nhập/Đăng xuất | 5 | High | Dương Minh Hùng |
| 2.2 | - Tester: viết test case chức năng Đăng nhập/Đăng xuất | 5 | High | Vũ Thành Tâm |
| 2.3 | - Developer: hiện thực chức năng (JWT, Refresh Token, Express API) | 5 | High | Đỗ Thành Đức, Tống Nhật Phát |
| 2.4 | - Tester: thực thi test Đăng nhập/Đăng xuất | 3 | High | Vũ Thành Tâm |
| **3.0** | **Là Admin, tôi muốn Xem danh sách tài khoản (F.2.1)** | **16** | **High** | **Dương Minh Hùng** |
| **4.0** | **Là Admin, tôi muốn Tìm kiếm tài khoản (F.2.2)** | **18** | **High** | **Dương Minh Hùng** |
| **5.0** | **Là Admin, tôi muốn Thêm tài khoản mới (F.2.3)** | **47** | **High** | **Đỗ Thành Đức** |
| 5.1 | - Designer: thiết kế prototype modal Thêm tài khoản | 13 | High | Dương Minh Hùng |
| 5.2 | - Tester: viết test case Thêm tài khoản | 8 | High | Vũ Thành Tâm |
| 5.3 | - Developer: hiện thực chức năng tạo tài khoản & mã hóa BCrypt | 13 | High | Đỗ Thành Đức, Tống Nhật Phát |
| 5.4 | - Tester: thực thi test Thêm tài khoản | 13 | High | Vũ Thành Tâm |
| **6.0** | **Là Admin, tôi muốn Sửa tài khoản (F.2.4)** | **42** | **High** | **Đỗ Thành Đức** |
| **7.0** | **Là Admin, tôi muốn Khóa/Xóa tài khoản (F.2.5)** | **21** | **Low** | **Đỗ Thành Đức** |
| **8.0** | **Là Admin, tôi muốn Phân quyền tài khoản theo vai trò Admin/Staff/Student (F.2.6)** | **42** | **High** | **Đỗ Thành Đức** |
| 8.1 | - Designer: thiết kế giao diện gán vai trò RBAC | 8 | High | Dương Minh Hùng |
| 8.2 | - Tester: viết test case phân quyền RBAC | 8 | High | Vũ Thành Tâm |
| 8.3 | - Developer: hiện thực Middleware RBAC `authorizeRoles` | 13 | High | Đỗ Thành Đức |
| 8.4 | - Tester: thực thi test phân quyền RBAC | 13 | High | Vũ Thành Tâm |
| **9.0** | **Là Nhân viên, tôi muốn Xem & Tìm kiếm danh sách sinh viên (F.3.1, F.3.2)** | **29** | **High** | **Dương Minh Hùng** |
| **10.0**| **Là Nhân viên, tôi muốn Thêm & Cập nhật thông tin hồ sơ sinh viên (F.3.3, F.3.4)** | **55** | **High** | **Đỗ Thành Đức** |
| 10.1| - Designer: thiết kế prototype quản lý hồ sơ sinh viên | 13 | High | Dương Minh Hùng |
| 10.2| - Tester: viết test case CRUD sinh viên | 8 | High | Vũ Thành Tâm |
| 10.3| - Developer: hiện thực API và giao diện quản lý sinh viên | 21 | High | Đỗ Thành Đức, Dương Minh Hùng |
| 10.4| - Tester: thực thi test quản lý sinh viên | 13 | High | Vũ Thành Tâm |
| **11.0**| **Là Sinh viên, tôi muốn Xem thông tin cá nhân của mình (F.3.5)** | **13** | **Medium** | **Dương Minh Hùng** |
| **12.0**| **Là Nhân viên, tôi muốn Quản lý danh mục Tòa nhà KTX (Xem/Thêm/Sửa/Xóa - F.4.1 - F.4.4)** | **34** | **High** | **Tống Nhật Phát** |
| 12.1| - Designer: thiết kế giao diện danh sách và modal Tòa nhà | 8 | High | Dương Minh Hùng |
| 12.2| - Tester: viết test case Quản lý Tòa nhà | 5 | High | Vũ Thành Tâm |
| 12.3| - Developer: hiện thực API và trang quản lý Tòa nhà | 13 | High | Tống Nhật Phát |
| 12.4| - Tester: thực thi test Quản lý Tòa nhà | 8 | High | Vũ Thành Tâm |
| **13.0**| **Là Nhân viên, tôi muốn Quản lý Phòng ở (Xem/Thêm/Sửa thông tin phòng - F.5.1 - F.5.3)** | **42** | **High** | **Tống Nhật Phát** |
| 13.1| - Designer: thiết kế giao diện Lưới phòng theo tầng & tòa | 8 | High | Dương Minh Hùng |
| 13.2| - Tester: viết test case Quản lý Phòng | 8 | High | Vũ Thành Tâm |
| 13.3| - Developer: hiện thực API phòng, sức chứa, đơn giá | 13 | High | Tống Nhật Phát |
| 13.4| - Tester: thực thi test Quản lý Phòng | 13 | High | Vũ Thành Tâm |
| **14.0**| **Là Nhân viên, tôi muốn Quản lý Giường & Kiểm tra tình trạng giường trống (F.5.4, F.5.5)** | **29** | **High** | **Tống Nhật Phát** |
| 14.1| - Designer: thiết kế hiển thị trạng thái giường (Available/Occupied/Broken) | 5 | High | Dương Minh Hùng |
| 14.2| - Tester: viết test case kiểm tra giường trống | 5 | High | Vũ Thành Tâm |
| 14.3| - Developer: hiện thực logic truy vấn giường trống theo phòng | 13 | High | Tống Nhật Phát |
| 14.4| - Tester: thực thi test quản lý giường | 6 | High | Vũ Thành Tâm |
| **15.0**| **Tester viết Test Report Sprint 1** | **5** | **High** | **Vũ Thành Tâm** |
| **16.0**| **Scrum Master viết Retrospective Sprint 1** | **5** | **High** | **Đỗ Thành Đức** |
| **17.0**| **Tester cập nhật Defect Tracking Report Sprint 1** | **5** | **High** | **Vũ Thành Tâm** |
| **18.0**| **Product Owner viết Traceability Matrix Sprint 1** | **5** | **High** | **Phạm Nhật Đăng** |

---

*(Sprint 1 Backlog - Nhóm 06 - Website Quản lý Ký túc xá)*

