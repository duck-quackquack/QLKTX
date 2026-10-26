# SPRINT 2 BACKLOG
## Hệ thống Quản lý Ký túc xá (QLKTX) - Nhóm 06

* **Thời gian thực hiện:** 20/10/2026 – 09/11/2026 (Tuần 7 – Tuần 9)
* **Mục tiêu Sprint 2:** Hoàn thiện toàn bộ quy trình Đăng ký lưu trú, Duyệt & Phân bổ phòng/giường, Quản lý hợp đồng, Chốt chỉ số điện nước, Phát hành hóa đơn và Tiếp nhận yêu cầu sửa chữa (Release 2).
* **Tài liệu đối chiếu:** 
  * `2.1 SEP_KTX_FunctionList_v1.1.xlsx` (Module 6, 7, 8, 9, 10)
  * `1.1.4 SEP_KTX_ProductBacklog_ver1.1.xlsx` (US.09 – US.15, US.16 – US.22)
  * `1.1.2 SEP_KTX_Milestone_ver1.1.xlsx` (Sprint 2)

---

### BẢNG SPRINT 2 BACKLOG ITEMS

| STT | User Story | Story Point | Độ ưu tiên | Người thực hiện |
|:---:|---|:---:|:---:|---|
| **1.0** | **Scrum Master tổ chức họp Sprint 2 (Sprint Planning)** | **5** | **Medium** | **Đỗ Thành Đức** |
| **2.0** | **Là Sinh viên, tôi muốn Đăng ký lưu trú KTX trực tuyến (F.6.1)** | **34** | **High** | **Dương Minh Hùng** |
| 2.1 | - Designer: thiết kế prototype form Đăng ký lưu trú | 8 | High | Dương Minh Hùng |
| 2.2 | - Tester: viết test case Đăng ký lưu trú | 5 | High | Vũ Thành Tâm |
| 2.3 | - Developer: hiện thực API và xử lý lưu đơn đăng ký (Pending) | 13 | High | Đỗ Thành Đức, Dương Minh Hùng |
| 2.4 | - Tester: thực thi test Đăng ký lưu trú | 8 | High | Vũ Thành Tâm |
| **3.0** | **Là Nhân viên, tôi muốn Xem danh sách & Tìm kiếm đơn đăng ký (F.6.2)** | **16** | **High** | **Dương Minh Hùng** |
| **4.0** | **Là Nhân viên, tôi muốn Duyệt hoặc Từ chối đơn đăng ký lưu trú (F.6.3)** | **42** | **High** | **Đỗ Thành Đức** |
| 4.1 | - Designer: thiết kế modal phê duyệt và ghi lý do từ chối | 8 | High | Dương Minh Hùng |
| 4.2 | - Tester: viết test case Duyệt/Từ chối đăng ký | 8 | High | Vũ Thành Tâm |
| 4.3 | - Developer: hiện thực API duyệt đơn và cập nhật trạng thái | 13 | High | Đỗ Thành Đức |
| 4.4 | - Tester: thực thi test quy trình duyệt đơn | 13 | High | Vũ Thành Tâm |
| **5.0** | **Là Nhân viên, tôi muốn Phân bổ phòng và giường cho sinh viên (F.6.4, F.6.5)** | **47** | **High** | **Đỗ Thành Đức** |
| 5.1 | - Designer: thiết kế popup chọn tòa/phòng/giường trống theo giới tính | 13 | High | Dương Minh Hùng |
| 5.2 | - Tester: viết test case ràng buộc phân phòng & giới tính (BR-01, BR-02) | 8 | High | Vũ Thành Tâm |
| 5.3 | - Developer: hiện thực logic xếp phòng và gán BedId cho sinh viên | 13 | High | Đỗ Thành Đức, Tống Nhật Phát |
| 5.4 | - Tester: thực thi test phân phòng và giường | 13 | High | Vũ Thành Tâm |
| **6.0** | **Là Nhân viên, tôi muốn Tạo và Quản lý Hợp đồng lưu trú (F.7.1 - F.7.5)** | **55** | **High** | **Tống Nhật Phát** |
| 6.1 | - Designer: thiết kế giao diện danh sách, chi tiết và in hợp đồng | 13 | High | Dương Minh Hùng |
| 6.2 | - Tester: viết test case Quản lý Hợp đồng (tạo, gia hạn, thanh lý) | 8 | High | Vũ Thành Tâm |
| 6.3 | - Developer: hiện thực API Hợp đồng, tiền cọc và State Pattern hợp đồng | 21 | High | Tống Nhật Phát, Đỗ Thành Đức |
| 6.4 | - Tester: thực thi test quản lý hợp đồng | 13 | High | Vũ Thành Tâm |
| **7.0** | **Là Sinh viên, tôi muốn Xem hợp đồng lưu trú cá nhân (F.7.6)** | **13** | **Medium** | **Dương Minh Hùng** |
| **8.0** | **Là Nhân viên, tôi muốn Ghi nhận và Kiểm tra chỉ số điện nước (F.8.1 - F.8.4)** | **47** | **High** | **Tống Nhật Phát** |
| 8.1 | - Designer: thiết kế bảng nhập nhanh chỉ số điện nước theo phòng | 8 | High | Dương Minh Hùng |
| 8.2 | - Tester: viết test case ràng buộc chỉ số mới >= chỉ số cũ (BR-04) | 8 | High | Vũ Thành Tâm |
| 8.3 | - Developer: hiện thực API chốt số, tính điện nước tiêu thụ | 18 | High | Tống Nhật Phát |
| 8.4 | - Tester: thực thi test ghi nhận chỉ số điện nước | 13 | High | Vũ Thành Tâm |
| **9.0** | **Là Nhân viên, tôi muốn Lập hóa đơn và Quản lý thanh toán (F.9.1 - F.9.5)** | **55** | **High** | **Tống Nhật Phát** |
| 9.1 | - Designer: thiết kế giao diện hóa đơn và modal ghi nhận phiếu thu | 13 | High | Dương Minh Hùng |
| 9.2 | - Tester: viết test case công thức tính tiền hóa đơn tổng hợp (BR-05) | 8 | High | Vũ Thành Tâm |
| 9.3 | - Developer: hiện thực Invoice Factory, tính tổng tiền và thanh toán | 21 | High | Tống Nhật Phát, Đỗ Thành Đức |
| 9.4 | - Tester: thực thi test lập hóa đơn và thanh toán | 13 | High | Vũ Thành Tâm |
| **10.0**| **Là Sinh viên, tôi muốn Xem hóa đơn và lịch sử thanh toán cá nhân (F.9.3)** | **18** | **High** | **Dương Minh Hùng** |
| **11.0**| **Là Sinh viên, tôi muốn Gửi yêu cầu sửa chữa thiết bị (F.10.1)** | **29** | **High** | **Dương Minh Hùng** |
| 11.1| - Designer: thiết kế form báo hỏng thiết bị, chọn mức độ khẩn cấp | 8 | High | Dương Minh Hùng |
| 11.2| - Tester: viết test case gửi yêu cầu sửa chữa | 5 | High | Vũ Thành Tâm |
| 11.3| - Developer: hiện thực API tiếp nhận phản ánh sự cố phòng | 11 | High | Đỗ Thành Đức |
| 11.4| - Tester: thực thi test gửi yêu cầu sửa chữa | 5 | High | Vũ Thành Tâm |
| **12.0**| **Là Nhân viên, tôi muốn Cập nhật tiến độ & xử lý yêu cầu sửa chữa (F.10.2 - F.10.4)** | **34** | **High** | **Tống Nhật Phát** |
| 12.1| - Designer: thiết kế giao diện điều phối và cập nhật trạng thái sửa chữa | 8 | High | Dương Minh Hùng |
| 12.2| - Tester: viết test case luồng chuyển trạng thái sửa chữa (State Pattern) | 5 | High | Vũ Thành Tâm |
| 12.3| - Developer: hiện thực API cập nhật tiến độ và chi phí sửa chữa | 13 | High | Tống Nhật Phát |
| 12.4| - Tester: thực thi test điều phối sửa chữa | 8 | High | Vũ Thành Tâm |
| **13.0**| **Tester viết Test Report Sprint 2** | **5** | **High** | **Vũ Thành Tâm** |
| **14.0**| **Scrum Master viết Retrospective Sprint 2** | **5** | **High** | **Đỗ Thành Đức** |
| **15.0**| **Tester cập nhật Defect Tracking Report Sprint 2** | **5** | **High** | **Vũ Thành Tâm** |
| **16.0**| **Product Owner viết Traceability Matrix Sprint 2** | **5** | **High** | **Phạm Nhật Đăng** |

---

*(Sprint 2 Backlog - Nhóm 06 - Website Quản lý Ký túc xá)*

