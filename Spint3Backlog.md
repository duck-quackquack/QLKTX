# SPRINT 3 BACKLOG
## Hệ thống Quản lý Ký túc xá (QLKTX) - Nhóm 06

* **Thời gian thực hiện:** 10/11/2026 – 30/11/2026 (Tuần 10 – Tuần 12)
* **Mục tiêu Sprint 3:** Hoàn thành Quản lý kỷ luật & vi phạm, Bản tin thông báo KTX, Dashboard thống kê & báo cáo tài chính; Thực hiện kiểm thử toàn diện hệ thống (End-to-End) và nghiệm thu người dùng (UAT) (Release 3).
* **Tài liệu đối chiếu:** 
  * `2.1 SEP_KTX_FunctionList_v1.1.xlsx` (Module 11)
  * `1.1.4 SEP_KTX_ProductBacklog_ver1.1.xlsx` (US.23 – US.25)
  * `1.1.2 SEP_KTX_Milestone_ver1.1.xlsx` (Sprint 3)

---

### BẢNG SPRINT 3 BACKLOG ITEMS

| STT | User Story | Story Point | Độ ưu tiên | Người thực hiện |
|:---:|---|:---:|:---:|---|
| **1.0** | **Scrum Master tổ chức họp Sprint 3 (Sprint Planning)** | **5** | **Medium** | **Đỗ Thành Đức** |
| **2.0** | **Là Nhân viên, tôi muốn Ghi nhận vi phạm của sinh viên và áp dụng mức phạt (F.11.1)** | **34** | **Medium** | **Đỗ Thành Đức** |
| 2.1 | - Designer: thiết kế giao diện danh sách và modal lập biên bản vi phạm | 8 | Medium | Dương Minh Hùng |
| 2.2 | - Tester: viết test case Quản lý vi phạm và tiền phạt | 5 | Medium | Vũ Thành Tâm |
| 2.3 | - Developer: hiện thực API lập biên bản vi phạm và tính trừ điểm | 13 | Medium | Đỗ Thành Đức |
| 2.4 | - Tester: thực thi test chức năng xử lý vi phạm | 8 | Medium | Vũ Thành Tâm |
| **3.0** | **Là Sinh viên, tôi muốn Xem lịch sử vi phạm nội quy của mình (F.11.1)** | **13** | **Low** | **Dương Minh Hùng** |
| **4.0** | **Là Ban Quản lý, tôi muốn Soạn thảo và Gửi thông báo tới sinh viên (F.11.2)** | **34** | **Medium** | **Tống Nhật Phát** |
| 4.1 | - Designer: thiết kế giao diện soạn thông báo và chuông thông báo Header | 8 | Medium | Dương Minh Hùng |
| 4.2 | - Tester: viết test case gửi thông báo chung / cá nhân | 5 | Medium | Vũ Thành Tâm |
| 4.3 | - Developer: hiện thực Notification Service (Observer Pattern) và API | 13 | Medium | Tống Nhật Phát, Đỗ Thành Đức |
| 4.4 | - Tester: thực thi test phát và nhận thông báo | 8 | Medium | Vũ Thành Tâm |
| **5.0** | **Là Sinh viên, tôi muốn Xem bảng tin & thông báo nộp tiền, sửa chữa (F.11.2)** | **16** | **High** | **Dương Minh Hùng** |
| **6.0** | **Là Admin, tôi muốn Thống kê tình hình lưu trú, tỷ lệ phòng/giường trống (F.11.3)** | **42** | **Medium** | **Dương Minh Hùng** |
| 6.1 | - Designer: thiết kế biểu đồ tỷ lệ lấp đầy giường và trạng thái phòng | 13 | Medium | Dương Minh Hùng |
| 6.2 | - Tester: viết test case Thống kê lưu trú | 5 | Medium | Vũ Thành Tâm |
| 6.3 | - Developer: hiện thực Aggregation Pipeline thống kê phòng/giường | 16 | Medium | Tống Nhật Phát, Đỗ Thành Đức |
| 6.4 | - Tester: thực thi test đối soát số liệu thống kê lưu trú | 8 | Medium | Vũ Thành Tâm |
| **7.0** | **Là Admin, tôi muốn Thống kê hợp đồng và doanh thu hóa đơn KTX (F.11.4)** | **47** | **Medium** | **Tống Nhật Phát** |
| 7.1 | - Designer: thiết kế biểu đồ doanh thu theo tháng và thẻ thống kê công nợ | 13 | Medium | Dương Minh Hùng |
| 7.2 | - Tester: viết test case Thống kê tài chính & hóa đơn | 8 | Medium | Vũ Thành Tâm |
| 7.3 | - Developer: hiện thực truy vấn tính tổng doanh thu và nợ đọng | 18 | Medium | Tống Nhật Phát |
| 7.4 | - Tester: thực thi test kiểm tra số liệu doanh thu | 8 | Medium | Vũ Thành Tâm |
| **8.0** | **Là Admin, tôi muốn Thống kê tình hình xử lý yêu cầu sửa chữa (F.11.5)** | **21** | **Low** | **Tống Nhật Phát** |
| 8.1 | - Designer: thiết kế thẻ hiển thị tỷ lệ yêu cầu đã xong/đang chờ | 5 | Low | Dương Minh Hùng |
| 8.2 | - Developer: hiện thực thống kê số liệu sự cố thiết bị KTX | 11 | Low | Tống Nhật Phát |
| 8.3 | - Tester: thực thi test thống kê sửa chữa | 5 | Low | Vũ Thành Tâm |
| **9.0** | **Kiểm thử tích hợp toàn diện hệ thống (End-to-End System Testing)** | **21** | **High** | **Vũ Thành Tâm** |
| **10.0**| **Thực hiện nghiệm thu người dùng (User Acceptance Testing - UAT)** | **13** | **High** | **Vũ Thành Tâm, Phạm Nhật Đăng** |
| **11.0**| **Tester viết Test Report Sprint 3 & Tổng kết kiểm thử toàn dự án** | **5** | **High** | **Vũ Thành Tâm** |
| **12.0**| **Scrum Master viết Retrospective Sprint 3** | **5** | **High** | **Đỗ Thành Đức** |
| **13.0**| **Tester hoàn tất Defect Tracking Report** | **5** | **High** | **Vũ Thành Tâm** |
| **14.0**| **Product Owner hoàn thiện Traceability Matrix & Tài liệu nghiệm thu** | **5** | **High** | **Phạm Nhật Đăng** |

---

*(Sprint 3 Backlog - Nhóm 06 - Website Quản lý Ký túc xá)*

