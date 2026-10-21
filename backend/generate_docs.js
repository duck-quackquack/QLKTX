import fs from 'fs';
import path from 'path';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType,
  Header,
  Footer,
  PageNumber,
} from 'docx';

const outputDir = path.resolve('..', 'docs_design');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Helpers for stylish document styling
const primaryColor = '1E3A8A'; // Dark Blue
const secondaryColor = '0D9488'; // Teal
const lightBgColor = 'F1F5F9'; // Slate 100
const borderColor = 'CBD5E1'; // Slate 300

function createTitle(text, subtitle = '') {
  const children = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 100 },
      children: [
        new TextRun({
          text: text,
          bold: true,
          size: 32, // 16pt
          color: primaryColor,
          font: 'Calibri',
        }),
      ],
    }),
  ];
  if (subtitle) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 50, after: 300 },
        children: [
          new TextRun({
            text: subtitle,
            italics: true,
            size: 22,
            color: '64748B',
            font: 'Calibri',
          }),
        ],
      })
    );
  }
  return children;
}

function createHeading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 300, after: 120 },
    children: [
      new TextRun({
        text: text,
        bold: true,
        size: 26, // 13pt
        color: primaryColor,
        font: 'Calibri',
      }),
    ],
  });
}

function createHeading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 80 },
    children: [
      new TextRun({
        text: text,
        bold: true,
        size: 23, // 11.5pt
        color: secondaryColor,
        font: 'Calibri',
      }),
    ],
  });
}

function createHeading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 140, after: 60 },
    children: [
      new TextRun({
        text: text,
        bold: true,
        size: 21,
        color: '334155',
        font: 'Calibri',
      }),
    ],
  });
}

function createParagraph(text, isItalic = false) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [
      new TextRun({
        text: text,
        italics: isItalic,
        size: 22,
        font: 'Calibri',
        color: '1E293B',
      }),
    ],
  });
}

function createBullet(text, boldPrefix = '') {
  const children = [];
  if (boldPrefix) {
    children.push(new TextRun({ text: boldPrefix + ' ', bold: true, size: 22, font: 'Calibri' }));
  }
  children.push(new TextRun({ text: text, size: 22, font: 'Calibri' }));
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 40, after: 40 },
    children: children,
  });
}

function createCodeBlock(codeLines) {
  return codeLines.map(
    (line) =>
      new Paragraph({
        spacing: { before: 20, after: 20 },
        shading: { type: ShadingType.CLEAR, fill: 'F8FAFC' },
        children: [
          new TextRun({
            text: line,
            font: 'Consolas',
            size: 19,
            color: '0F172A',
          }),
        ],
      })
  );
}

function createTable(headers, rows) {
  const tableRows = [
    new TableRow({
      tableHeader: true,
      children: headers.map(
        (h) =>
          new TableCell({
            shading: { type: ShadingType.CLEAR, fill: primaryColor },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: h, bold: true, color: 'FFFFFF', size: 20, font: 'Calibri' })],
              }),
            ],
          })
      ),
    }),
    ...rows.map(
      (row, idx) =>
        new TableRow({
          children: row.map(
            (cell) =>
              new TableCell({
                shading: { type: ShadingType.CLEAR, fill: idx % 2 === 0 ? 'FFFFFF' : lightBgColor },
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: cell, size: 20, font: 'Calibri', color: '1E293B' })],
                  }),
                ],
              })
          ),
        })
    ),
  ];

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
      left: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
      right: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
    },
    rows: tableRows,
  });
}

// -------------------------------------------------------------
// DOC 1: 01_Tong_Quan_Kien_Truc_Va_Context_Diagram.docx
// -------------------------------------------------------------
async function generateDoc1() {
  const doc = new Document({
    sections: [
      {
        properties: {},
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: 'Hệ Thống Quản Lý Ký Túc Xá - QLKTX | MERN Stack', italics: true, size: 18, color: '94A3B8' })],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'Trang ', size: 18 }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 18 }),
                  new TextRun({ text: ' / ', size: 18 }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18 }),
                ],
              }),
            ],
          }),
        },
        children: [
          ...createTitle('TÀI LIỆU TỔNG QUAN KIẾN TRÚC & SƠ ĐỒ NGỮ CẢNH (CONTEXT DIAGRAM)', 'Hệ thống Quản lý Ký túc xá (Dormitory Management System)'),

          createHeading1('1. Giới thiệu tổng quan hệ thống'),
          createParagraph(
            'Hệ thống Quản lý Ký túc xá (QLKTX) là giải pháp phần mềm hiện đại xây dựng trên nền tảng MERN Stack (MongoDB, Express.js, React 18, Node.js) nhằm tin học hóa và tự động hóa toàn bộ quy trình quản lý lưu trú, tài chính, cơ sở vật chất và tương tác sinh viên tại các trường Đại học/Cao đẳng.'
          ),

          createHeading1('2. Sơ đồ ngữ cảnh hệ thống (Context Diagram - Level 0 DFD)'),
          createParagraph('Sơ đồ ngữ cảnh mô tả tương tác giữa Hệ thống QLKTX ở trung tâm và các tác nhân ngoài (External Entities):'),

          ...createCodeBlock([
            '                 +---------------------------------------------+',
            '                 |         Google OAuth 2.0 Identity           |',
            '                 |         Meta Facebook Graph Identity        |',
            '                 +---------------------------------------------+',
            '                           ^                         |',
            '          Yêu cầu xác thực |                         | Token, Profile, Email',
            '                           |                         v',
            '+--------------------+     +-----------------------------------+     +-------------------------+',
            '|                    |====>|                                   |<====|                         |',
            '|      SINH VIÊN     |     |                                   |     |  BAN QUẢN LÝ (BQL)      |',
            '|     (STUDENT)      |<====|       HỆ THỐNG QUẢN LÝ            |====>|  - Quản trị viên (Admin)|',
            '|                    |     |       KÝ TÚC XÁ (QLKTX)           |     |  - Nhân viên KTX (Staff)|',
            '+--------------------+     |                                   |     +-------------------------+',
            '                           +-----------------------------------+',
            '                                     |               ^',
            '                      Hóa đơn điện tử|               | Chỉ số điện nước thực tế',
            '                                     v               |',
            '                           +-----------------------------------+',
            '                           |  Cổng Thanh toán (MoMo/VNPAY/Bank)|',
            '                           |  Đồng hồ Điện - Nước Cơ sở KTX    |',
            '                           +-----------------------------------+'
          ]),

          createHeading2('2.1. Luồng dữ liệu giữa Sinh viên và QLKTX:'),
          createBullet('Thông tin tài khoản, thông tin sinh viên, nguyện vọng chọn tòa/phòng/giường.', 'Input:'),
          createBullet('Yêu cầu báo hỏng cơ sở vật chất, phản ánh vi phạm, đơn đăng ký nội trú.', 'Input:'),
          createBullet('Hồ sơ phòng ở, hợp đồng số, thông báo hóa đơn tháng, kết quả duyệt đơn.', 'Output:'),

          createHeading2('2.2. Luồng dữ liệu giữa Ban Quản trị (Admin/Staff) và QLKTX:'),
          createBullet('Cấu hình tòa nhà, giá thuê, chỉ số công tơ điện nước, biên bản vi phạm, duyệt đơn.', 'Input:'),
          createBullet('Báo cáo doanh thu tài chính, tỷ lệ lấp đầy phòng, danh sách công nợ, dashboard điều hành.', 'Output:'),

          createHeading1('3. Kiến trúc kỹ thuật MERN Client-Server'),
          createTable(
            ['Thành phần', 'Công nghệ', 'Nhiệm vụ & Chức năng'],
            [
              ['Frontend Client', 'React 18, TypeScript, Vite, Tailwind CSS', 'Giao diện SPA hiện đại, responsive đa thiết bị, tích hợp Google/Facebook OAuth SDK'],
              ['Backend Server', 'Node.js, Express.js (ES Modules)', 'Xử lý RESTful API, mã hóa mật khẩu Bcrypt, xác thực JWT Protect, tự động tính tiền hóa đơn'],
              ['Database Server', 'MongoDB Community Server (Port 27017)', 'Lưu trữ NoSQL 14 Collection tối ưu hóa truy vấn JSON/BSON và tự tăng counter id'],
              ['Security Layer', 'JWT Authentication, CORS, Encrypted Hash', 'Phân quyền chặt chẽ theo Role ID (1: Admin, 2: Staff, 3: Student)']
            ]
          )
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(path.join(outputDir, '01_Tong_Quan_Kien_Truc_Va_Context_Diagram.docx'), buffer);
  console.log('Created: 01_Tong_Quan_Kien_Truc_Va_Context_Diagram.docx');
}

// -------------------------------------------------------------
// DOC 2: 02_So_Do_Use_Case_Va_Mo_Ta_Chi_Tiet.docx
// -------------------------------------------------------------
async function generateDoc2() {
  const doc = new Document({
    sections: [
      {
        properties: {},
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: 'Tài liệu Thiết kế Use Case Chi tiết | QLKTX MERN', italics: true, size: 18, color: '94A3B8' })],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'Trang ', size: 18 }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 18 }),
                  new TextRun({ text: ' / ', size: 18 }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18 }),
                ],
              }),
            ],
          }),
        },
        children: [
          ...createTitle('TÀI LIỆU THIẾT KẾ USE CASE VÀ BẢNG ĐẶC TẢ CHI TIẾT (USE CASE SPECIFICATIONS)', 'Hệ thống Quản lý Ký túc xá - Đầy đủ các phân hệ'),

          createHeading1('1. Sơ đồ Use Case tổng quát hệ thống'),
          createParagraph('Hệ thống phục vụ 3 Actor chính: Quản trị viên (Admin), Nhân viên (Staff) và Sinh viên (Student).'),

          ...createCodeBlock([
            '+-----------------------------------------------------------------------------------------+',
            '|                         HỆ THỐNG QUẢN LÝ KÝ TÚC XÁ (QLKTX)                              |',
            '|                                                                                         |',
            '|   [Phân hệ 1: Xác thực & Tài khoản]                                                     |',
            '|   (UC01: Đăng nhập bằng Username / MSSV) <------- (Student, Staff, Admin)               |',
            '|   (UC02: Đăng nhập Google / Facebook OAuth) <--- (Student)                              |',
            '|   (UC03: Đặt lại mật khẩu / Quên mật khẩu) <----- (Student, Staff, Admin)               |',
            '|   (UC04: Quản lý hồ sơ cá nhân / Đổi mật khẩu) <- (Student, Staff, Admin)               |',
            '|                                                                                         |',
            '|   [Phân hệ 2: Cơ sở vật chất & Phòng ở]                                                 |',
            '|   (UC05: Quản lý Tòa nhà & Phòng ở) <------------ (Admin, Staff)                        |',
            '|   (UC06: Quản lý Giường ngủ & Trạng thái) <------ (Admin, Staff)                        |',
            '|   (UC07: Tra cứu phòng & giường còn trống) <----- (Student, Admin, Staff)               |',
            '|                                                                                         |',
            '|   [Phân hệ 3: Đăng ký & Hợp đồng thuê phòng]                                            |',
            '|   (UC08: Nộp đơn đăng ký ở ký túc xá) <--------- (Student)                              |',
            '|   (UC09: Xét duyệt đơn đăng ký & Xếp phòng) <---- (Admin)                                |',
            '|   (UC10: Quản lý & Gia hạn Hợp đồng lưu trú) <--- (Admin, Student)                      |',
            '|                                                                                         |',
            '|   [Phân hệ 4: Điện Nước, Hóa Đơn & Thanh Toán]                                          |',
            '|   (UC11: Ghi chỉ số Điện - Nước theo tháng) <---- (Staff, Admin)                        |',
            '|   (UC12: Phát hành hóa đơn tự động định kỳ) <---- (Admin)                                |',
            '|   (UC13: Tra cứu & Thanh toán Hóa đơn) <--------- (Student, Staff, Admin)               |',
            '|                                                                                         |',
            '|   [Phân hệ 5: Báo hỏng, Kỷ luật & Thống kê]                                             |',
            '|   (UC14: Gửi yêu cầu sửa chữa thiết bị) <-------- (Student)                             |',
            '|   (UC15: Tiếp nhận & Xử lý báo hỏng) <----------- (Staff, Admin)                        |',
            '|   (UC16: Lập biên bản & Xử lý vi phạm nội quy) <- (Staff, Admin)                        |',
            '|   (UC17: Xem Báo cáo & Dashboard Thống kê) <----- (Admin)                                |',
            '+-----------------------------------------------------------------------------------------+'
          ]),

          createHeading1('2. Bảng ma trận phân quyền Use Case (Use Case vs Actor Matrix)'),
          createTable(
            ['Mã UC', 'Tên Use Case', 'Sinh viên (Student)', 'Nhân viên (Staff)', 'Quản trị viên (Admin)'],
            [
              ['UC01', 'Đăng nhập (Username / MSSV)', 'X', 'X', 'X'],
              ['UC02', 'Đăng nhập OAuth (Google / Facebook)', 'X', '-', '-'],
              ['UC03', 'Khôi phục / Đặt lại mật khẩu', 'X', 'X', 'X'],
              ['UC04', 'Cập nhật Profile / Đổi MK', 'X', 'X', 'X'],
              ['UC05', 'Quản lý Tòa nhà & Phòng ở', '-', 'Xem/Sửa', 'Toàn quyền (CRUD)'],
              ['UC06', 'Quản lý Giường & Trạng thái', '-', 'Xem/Sửa', 'Toàn quyền (CRUD)'],
              ['UC07', 'Nộp đơn đăng ký nội trú', 'X', '-', '-'],
              ['UC08', 'Duyệt đơn đăng ký nội trú', '-', '-', 'X'],
              ['UC09', 'Quản lý Hợp đồng lưu trú', 'Xem của tôi', 'Xem', 'Toàn quyền (CRUD)'],
              ['UC10', 'Ghi chỉ số Điện - Nước', '-', 'X', 'X'],
              ['UC11', 'Tạo hóa đơn tự động hàng tháng', '-', '-', 'X'],
              ['UC12', 'Ghi nhận Thanh toán Hóa đơn', 'Xem/Nộp', 'X', 'X'],
              ['UC13', 'Gửi yêu cầu sửa chữa thiết bị', 'X', '-', '-'],
              ['UC14', 'Xử lý báo hỏng thiết bị', '-', 'X', 'X'],
              ['UC15', 'Ghi nhận vi phạm & Xử phạt', 'Xem vi phạm', 'X', 'X'],
              ['UC16', 'Báo cáo Dashboard & Doanh thu', '-', '-', 'X']
            ]
          ),

          createHeading1('3. Đặc tả chi tiết các Use Case trọng tâm (Use Case Specifications)'),

          createHeading2('3.1. Đặc tả UC01: Đăng nhập hệ thống (Login)'),
          createTable(
            ['Thuộc tính', 'Nội dung chi tiết'],
            [
              ['Mã Use Case', 'UC01 - Login'],
              ['Tác nhân (Actor)', 'Sinh viên, Nhân viên, Quản trị viên'],
              ['Tiền điều kiện', 'Người dùng đã có tài khoản trong cơ sở dữ liệu MongoDB.'],
              ['Hậu điều kiện', 'Hệ thống cấp JWT Token, lưu phiên và chuyển hướng vào Dashboard theo quyền.'],
              ['Luồng sự kiện chính', '1. Người dùng mở trang /login.\n2. Nhập Tên đăng nhập hoặc Mã sinh viên (MSSV) và Mật khẩu.\n3. Bấm "Đăng nhập".\n4. Hệ thống kiểm tra mật khẩu bằng bcrypt.compare.\n5. Đăng nhập thành công và chuyển hướng về trang tương ứng.'],
              ['Luồng ngoại lệ (A1)', '4a. Thông tin tài khoản hoặc mật khẩu không chính xác -> Hiển thị cảnh báo lỗi màu đỏ.\n4b. Tài khoản bị khóa (isActive=false) -> Thông báo liên hệ BQL.']
            ]
          ),

          createHeading2('3.2. Đặc tả UC08: Nộp đơn đăng ký nội trú (Submit Registration)'),
          createTable(
            ['Thuộc tính', 'Nội dung chi tiết'],
            [
              ['Mã Use Case', 'UC08 - Register Dormitory'],
              ['Tác nhân (Actor)', 'Sinh viên (Student)'],
              ['Tiền điều kiện', 'Sinh viên đã đăng nhập và hiện tại chưa có hợp đồng đang hiệu lực.'],
              ['Hậu điều kiện', 'Một bản ghi Registration mới được lưu với status = 1 (Pending).'],
              ['Luồng sự kiện chính', '1. Sinh viên vào mục "Đăng ký nội trú".\n2. Chọn Tòa nhà và xem danh sách phòng còn chỗ.\n3. Chọn Phòng và chọn Giường trống mong muốn.\n4. Chọn ngày bắt đầu và kết thúc kỳ ở.\n5. Bấm "Gửi đơn đăng ký".\n6. Hệ thống lưu đơn và gửi thông báo cho Admin.']
            ]
          ),

          createHeading2('3.3. Đặc tả UC09: Xét duyệt đơn & Tự động tạo hợp đồng (Approve Registration)'),
          createTable(
            ['Thuộc tính', 'Nội dung chi tiết'],
            [
              ['Mã Use Case', 'UC09 - Approve Registration & Generate Contract'],
              ['Tác nhân (Actor)', 'Quản trị viên (Admin)'],
              ['Tiền điều kiện', 'Có đơn đăng ký ở trạng thái Pending.'],
              ['Hậu điều kiện', 'Đơn chuyển sang Approved, Giường đổi sang Occupied, Hợp đồng mới được tạo, Sinh viên chuyển sang isStaying = true.'],
              ['Luồng sự kiện chính', '1. Admin mở danh sách đơn đăng ký.\n2. Xem chi tiết đơn và thông tin sinh viên.\n3. Bấm "Phê duyệt".\n4. Hệ thống thực hiện transaction tạo Contract và cập nhật trạng thái phòng/giường.\n5. Gửi thông báo thông báo duyệt thành công đến sinh viên.']
            ]
          ),

          createHeading2('3.4. Đặc tả UC12: Tự động phát hành Hóa đơn hàng tháng (Batch Monthly Invoices)'),
          createTable(
            ['Thuộc tính', 'Nội dung chi tiết'],
            [
              ['Mã Use Case', 'UC12 - Generate Monthly Invoices'],
              ['Tác nhân (Actor)', 'Quản trị viên (Admin)'],
              ['Tiền điều kiện', 'Các phòng đã được nhân viên ghi nhận chỉ số điện nước tháng đó.'],
              ['Hậu điều kiện', 'Hóa đơn tiền phòng + điện nước + dịch vụ được tạo cho từng sinh viên.'],
              ['Luồng sự kiện chính', '1. Admin chọn kỳ tháng và năm cần phát hành hóa đơn.\n2. Hệ thống quét qua tất cả hợp đồng đang hiệu lực.\n3. Tính tiền điện nước tiêu thụ của phòng chia đều cho số sinh viên trong phòng.\n4. Cộng tiền thuê phòng và tiền dịch vụ để tính tổng số tiền (totalAmount).\n5. Lưu hóa đơn và tự động gửi thông báo đến từng sinh viên.']
            ]
          )
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(path.join(outputDir, '02_So_Do_Use_Case_Va_Mo_Ta_Chi_Tiet.docx'), buffer);
  console.log('Created: 02_So_Do_Use_Case_Va_Mo_Ta_Chi_Tiet.docx');
}

// -------------------------------------------------------------
// DOC 3: 03_So_Do_Lop_Class_Diagram.docx
// -------------------------------------------------------------
async function generateDoc3() {
  const doc = new Document({
    sections: [
      {
        properties: {},
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: 'Tài liệu Thiết kế Sơ đồ Lớp (Class Diagram) | QLKTX', italics: true, size: 18, color: '94A3B8' })],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'Trang ', size: 18 }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 18 }),
                  new TextRun({ text: ' / ', size: 18 }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18 }),
                ],
              }),
            ],
          }),
        },
        children: [
          ...createTitle('TÀI LIỆU THIẾT KẾ SƠ ĐỒ LỚP CHI TIẾT (CLASS DIAGRAM)', 'Mô hình hóa thực thể, quan hệ và kiến trúc Controller/Model trong Backend'),

          createHeading1('1. Giới thiệu mô hình lớp hệ thống'),
          createParagraph(
            'Sơ đồ lớp mô tả cấu trúc tĩnh của hệ thống QLKTX, bao gồm các thuộc tính, phương thức và các mối quan hệ (Association, Aggregation, Composition, Dependency) giữa 14 thực thể Model và các Controller xử lý nghiệp vụ.'
          ),

          createHeading1('2. Sơ đồ lớp chi tiết thực thể dữ liệu (Data Domain Class Diagram)'),

          ...createCodeBlock([
            '+----------------------------------+            +----------------------------------+',
            '|              User                | 1        1 |             Student              |',
            '+----------------------------------+------------+----------------------------------+',
            '| - id: Number (PK)                |            | - id: Number (PK)                |',
            '| - username: String               |            | - userId: Number (FK)            |',
            '| - email: String                  |            | - studentCode: String (MSSV)     |',
            '| - passwordHash: String           |            | - fullName: String               |',
            '| - fullName: String               |            | - dateOfBirth: Date              |',
            '| - phone: String                  |            | - gender: String                 |',
            '| - avatarUrl: String              |            | - faculty: String                |',
            '| - role: Number (1,2,3)           |            | - className: String              |',
            '| - isActive: Boolean              |            | - isStaying: Boolean             |',
            '+----------------------------------+            +----------------------------------+',
            '                                                          | 1           | 1',
            '                                                          |             |',
            '                                                   1..*   v             v 1..*',
            '+----------------------------------+            +--------------------+  +--------------------+',
            '|             Building             | 1        * |    Registration    |  |     Contract       |',
            '+----------------------------------+------------+--------------------+  +--------------------+',
            '| - id: Number (PK)                |            | - id: Number (PK)  |  | - id: Number (PK)  |',
            '| - name: String                   |            | - studentId: Number|  | - contractCode: Str|',
            '| - code: String                   |            | - roomId: Number   |  | - studentId: Number|',
            '| - genderType: String             |            | - bedId: Number    |  | - roomId: Number   |',
            '| - totalFloors: Number            |            | - status: Number   |  | - bedId: Number    |',
            '+----------------------------------+            +--------------------+  | - monthlyRent: Num |',
            '                 | 1                                                    | - status: Number   |',
            '                 |                                                      +--------------------+',
            '                 | 1..*                                                           | 1',
            '                 v                                                                | 1..*',
            '+----------------------------------+                                              v',
            '|               Room               | 1        * +------------------------------------+',
            '+----------------------------------+------------|              Invoice               |',
            '| - id: Number (PK)                |            +------------------------------------+',
            '| - buildingId: Number (FK)        |            | - id: Number (PK)                  |',
            '| - roomNumber: String             |            | - invoiceCode: String              |',
            '| - roomType: String               |            | - studentId: Number (FK)           |',
            '| - capacity: Number               |            | - contractId: Number (FK)          |',
            '| - basePrice: Number              |            | - roomFee: Number                  |',
            '| - status: Number                 |            | - electricityFee: Number           |',
            '+----------------------------------+            | - waterFee: Number                 |',
            '       | 1                  | 1                 | - totalAmount: Number              |',
            '       |                    |                   | - paidAmount: Number               |',
            '       | 1..*               | 1..*              | - status: Number (1:Unpaid,2:Paid) |',
            '       v                    v                   +------------------------------------+',
            '+----------------+   +-------------------+                        | 1',
            '|      Bed       |   |   MeterReading    |                        | 0..*',
            '+----------------+   +-------------------+                        v',
            '| - id: Number   |   | - id: Number      |      +------------------------------------+',
            '| - roomId: Num  |   | - roomId: Number  |      |              Payment               |',
            '| - bedNumber:Str|   | - month: Number   |      +------------------------------------+',
            '| - status: Num  |   | - year: Number    |      | - id: Number (PK)                  |',
            '+----------------+   | - electricityOld  |      | - paymentCode: String              |',
            '                     | - electricityNew  |      | - invoiceId: Number (FK)           |',
            '                     | - waterOld / New  |      | - amount: Number                   |',
            '                     +-------------------+      | - paymentMethod: String            |',
            '                                                +------------------------------------+'
          ]),

          createHeading1('3. Bảng phân tích chi tiết các lớp đối tượng'),
          createTable(
            ['Tên Lớp (Class)', 'Thuộc tính chính', 'Quan hệ với lớp khác', 'Mục đích sử dụng'],
            [
              ['User', 'id, username, email, passwordHash, role, isActive', '1 - 1 với Student', 'Quản lý tài khoản đăng nhập và phân quyền hệ thống'],
              ['Student', 'id, userId, studentCode (MSSV), fullName, faculty', '1 - 1 User, 1 - N Contract', 'Hồ sơ lý lịch sinh viên nội trú'],
              ['Building', 'id, name, code, genderType, totalFloors', '1 - N Room', 'Quản lý các tòa nhà ký túc xá'],
              ['Room', 'id, buildingId, roomNumber, capacity, basePrice', 'N - 1 Building, 1 - N Bed', 'Quản lý thông tin và giá thuê của phòng'],
              ['Bed', 'id, roomId, bedNumber, status', 'N - 1 Room', 'Quản lý vị trí giường ngủ của từng phòng'],
              ['Registration', 'id, studentId, roomId, bedId, status', 'N - 1 Student, Room, Bed', 'Theo dõi đơn đăng ký nội trú của sinh viên'],
              ['Contract', 'id, contractCode, studentId, roomId, bedId, rent', '1 - N Invoice', 'Hợp đồng lưu trú chính thức giữa KTX và sinh viên'],
              ['MeterReading', 'id, roomId, month, year, elec, water', 'N - 1 Room', 'Ghi nhận chỉ số điện nước công tơ mỗi tháng'],
              ['Invoice', 'id, invoiceCode, contractId, totalAmount, status', '1 - N Payment', 'Hóa đơn tổng hợp tiền phòng, điện nước hàng tháng'],
              ['Payment', 'id, paymentCode, invoiceId, amount, method', 'N - 1 Invoice', 'Lưu vết lịch sử giao dịch đóng tiền hóa đơn'],
              ['RepairRequest', 'id, studentId, roomId, title, priority, status', 'N - 1 Student, Room', 'Tiếp nhận báo hỏng thiết bị và phân công sửa chữa'],
              ['Violation', 'id, studentId, title, fineAmount, violationDate', 'N - 1 Student', 'Xử lý biên bản vi phạm kỷ luật của sinh viên']
            ]
          )
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(path.join(outputDir, '03_So_Do_Lop_Class_Diagram.docx'), buffer);
  console.log('Created: 03_So_Do_Lop_Class_Diagram.docx');
}

// -------------------------------------------------------------
// DOC 4: 04_So_Do_Trinh_Tu_Sequence_Diagram.docx
// -------------------------------------------------------------
async function generateDoc4() {
  const doc = new Document({
    sections: [
      {
        properties: {},
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: 'Tài liệu Sơ đồ Tuần tự (Sequence Diagram) | QLKTX', italics: true, size: 18, color: '94A3B8' })],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'Trang ', size: 18 }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 18 }),
                  new TextRun({ text: ' / ', size: 18 }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18 }),
                ],
              }),
            ],
          }),
        },
        children: [
          ...createTitle('TÀI LIỆU THIẾT KẾ SƠ ĐỒ TUẦN TỰ (SEQUENCE DIAGRAMS)', 'Mô tả chi tiết luồng tương tác thời gian thực giữa Client, Server và Database'),

          createHeading1('1. Sequence Diagram: Đăng nhập hệ thống (Bằng Username / MSSV)'),
          createParagraph('Mô tả tương tác khi người dùng đăng nhập bằng tên tài khoản hoặc mã số sinh viên:'),

          ...createCodeBlock([
            'Actor (User)       Frontend (React)      Backend (Express)       MongoDB (Database)',
            '    |                    |                       |                       |',
            '    |-- 1. Nhập username/MSSV, password -------->|                       |',
            '    |   & Bấm "Đăng nhập"|                       |                       |',
            '    |                    |-- 2. POST /api/auth/login ------------------->|',
            '    |                    |   {username, password}|                       |',
            '    |                    |                       |-- 3. findOne(username/studentCode)',
            '    |                    |                       |---------------------->|',
            '    |                    |                       |<-- 4. Trả về User doc -|',
            '    |                    |                       |                       |',
            '    |                    |                       |-- 5. bcrypt.compare() |',
            '    |                    |                       |-- 6. generateToken()  |',
            '    |                    |                       |-- 7. Lưu refreshToken |',
            '    |                    |                       |---------------------->|',
            '    |                    |<-- 8. Trả về JWT Token & User Profile --------|',
            '    |                    |                       |                       |',
            '    |                    |-- 9. Lưu token vào localStorage               |',
            '    |<-- 10. Chuyển hướng vào Dashboard ---------|                       |'
          ]),

          createHeading1('2. Sequence Diagram: Đăng ký nội trú KTX trực tuyến'),
          createParagraph('Sinh viên chọn phòng, giường và gửi đơn đăng ký:'),

          ...createCodeBlock([
            'Student            Frontend (React)      Backend Controller      MongoDB (Database)',
            '    |                    |                       |                       |',
            '    |-- 1. Chọn phòng & giường trống ----------->|                       |',
            '    |-- 2. Gửi đơn đăng ký                      |                       |',
            '    |                    |-- 3. POST /api/registrations ---------------->|',
            '    |                    |   {roomId, bedId, ...}|                       |',
            '    |                    |                       |-- 4. Check active contract/registration',
            '    |                    |                       |---------------------->|',
            '    |                    |                       |<-- 5. OK (Chưa có) ---|',
            '    |                    |                       |                       |',
            '    |                    |                       |-- 6. create(Registration: Pending)',
            '    |                    |                       |---------------------->|',
            '    |                    |<-- 7. 201 Created (Đơn đã tiếp nhận) ---------|',
            '    |<-- 8. Thông báo gửi đơn thành công --------|                       |'
          ]),

          createHeading1('3. Sequence Diagram: Phê duyệt đơn & Tự động tạo Hợp đồng'),
          createParagraph('Admin duyệt đơn đăng ký của sinh viên:'),

          ...createCodeBlock([
            'Admin              Frontend (React)      Backend Controller      MongoDB (Database)',
            '    |                    |                       |                       |',
            '    |-- 1. Bấm "Phê duyệt đơn" ----------------->|                       |',
            '    |                    |-- 2. PUT /api/registrations/:id/review ------>|',
            '    |                    |   {status: 2 (Approved)}                      |',
            '    |                    |                       |-- 3. Update Registration (Approved)',
            '    |                    |                       |-- 4. Create Contract (Active)',
            '    |                    |                       |-- 5. Update Bed (status: Occupied)',
            '    |                    |                       |-- 6. Update Student (isStaying: true)',
            '    |                    |                       |-- 7. Create Notification (User)',
            '    |                    |                       |---------------------->|',
            '    |                    |                       |<-- 8. Transaction thành công -|',
            '    |                    |<-- 9. 200 OK Response-|                       |',
            '    |<-- 10. Cập nhật UI & Hiển thị thành công -|'
          ]),

          createHeading1('4. Sequence Diagram: Tự động phát hành Hóa đơn hàng tháng'),
          createParagraph('Admin tạo hóa đơn điện nước + phòng định kỳ cho toàn bộ ký túc xá:'),

          ...createCodeBlock([
            'Admin              Frontend (React)      Backend Controller      MongoDB (Database)',
            '    |                    |                       |                       |',
            '    |-- 1. Chọn tháng/năm & Bấm "Tạo hóa đơn" -->|                       |',
            '    |                    |-- 2. POST /api/invoices/generate-monthly ---->|',
            '    |                    |   {month: 10, year: 2026}                     |',
            '    |                    |                       |-- 3. find active Contracts',
            '    |                    |                       |-- 4. find MeterReadings of Room',
            '    |                    |                       |---------------------->|',
            '    |                    |                       |<-- 5. Dữ liệu hợp đồng & chỉ số',
            '    |                    |                       |                       |',
            '    |                    |                       |-- 6. Loop & Calculate per person',
            '    |                    |                       |      (Rent + Elec + Water + Svc)',
            '    |                    |                       |-- 7. insertMany(Invoices) & Notifications',
            '    |                    |                       |---------------------->|',
            '    |                    |<-- 8. Trả về số lượng hóa đơn đã tạo ---------|',
            '    |<-- 9. Hiển thị thông báo "Tạo thành công N hóa đơn" ---------------|'
          ])
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(path.join(outputDir, '04_So_Do_Trinh_Tu_Sequence_Diagram.docx'), buffer);
  console.log('Created: 04_So_Do_Trinh_Tu_Sequence_Diagram.docx');
}

// -------------------------------------------------------------
// DOC 5: 05_So_Do_Hoat_Dong_Activity_Diagram.docx
// -------------------------------------------------------------
async function generateDoc5() {
  const doc = new Document({
    sections: [
      {
        properties: {},
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: 'Tài liệu Sơ đồ Hoạt động (Activity Diagram) | QLKTX', italics: true, size: 18, color: '94A3B8' })],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'Trang ', size: 18 }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 18 }),
                  new TextRun({ text: ' / ', size: 18 }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18 }),
                ],
              }),
            ],
          }),
        },
        children: [
          ...createTitle('TÀI LIỆU THIẾT KẾ SƠ ĐỒ HOẠT ĐỘNG (ACTIVITY DIAGRAMS)', 'Mô tả quy trình nghiệp vụ chi tiết với các điểm quyết định và luồng rẽ nhánh'),

          createHeading1('1. Activity Diagram: Quy trình Đăng ký & Duyệt ở Ký túc xá'),
          createParagraph('Mô tả từ lúc sinh viên nộp đơn đến khi nhận phòng và ký hợp đồng:'),

          ...createCodeBlock([
            '   (Start)',
            '      |',
            '      v',
            '[Sinh viên đăng nhập hệ thống]',
            '      |',
            '      v',
            '[Xem danh sách Tòa nhà & Phòng còn giường trống]',
            '      |',
            '      v',
            '[Điền form Đăng ký & Chọn giường]',
            '      |',
            '      v',
            '[Gửi đơn đăng ký (Pending)]',
            '      |',
            '      v',
            '<Ban Quản lý (Admin) xét duyệt đơn>',
            '     /                               \\',
            '    / (Từ chối)                       \\ (Đồng ý)',
            '   v                                   v',
            '[Cập nhật status: Rejected]      [Cập nhật status: Approved]',
            '   |                                   |',
            '   |                             [Tự động tạo Hợp đồng lưu trú]',
            '   |                                   |',
            '   |                             [Chuyển trạng thái Giường: Occupied]',
            '   |                                   |',
            '   |                             [Chuyển Student isStaying: True]',
            '   |                                   |',
            '   +-----------------+-----------------+',
            '                     |',
            '                     v',
            '      [Gửi thông báo Realtime đến Sinh viên]',
            '                     |',
            '                     v',
            '                   (End)'
          ]),

          createHeading1('2. Activity Diagram: Quy trình Ghi chỉ số Điện Nước & Thanh toán Hóa đơn'),
          createParagraph('Mô tả quy trình chốt số điện nước, sinh hóa đơn và thanh toán:'),

          ...createCodeBlock([
            '   (Start)',
            '      |',
            '      v',
            '[Nhân viên KTX kiểm tra công tơ từng phòng]',
            '      |',
            '      v',
            '[Nhập chỉ số Điện Mới & Nước Mới vào hệ thống]',
            '      |',
            '      v',
            '<Đến ngày chốt hóa đơn hàng tháng>',
            '      |',
            '      v',
            '[Admin bấm "Phát hành hóa đơn tự động"]',
            '      |',
            '      v',
            '[Hệ thống tính tiền điện/nước = (Số mới - Số cũ) * Đơn giá / Số người]',
            '      |',
            '      v',
            '[Hệ thống tạo Hóa đơn (Tiền phòng + Điện + Nước + Dịch vụ)]',
            '      |',
            '      v',
            '[Sinh viên nhận thông báo hóa đơn]',
            '      |',
            '      v',
            '<Sinh viên thực hiện thanh toán>',
            '     /                            \\',
            '    / (Tiền mặt tại phòng BQL)     \\ (Chuyển khoản / Cổng thanh toán)',
            '   v                                v',
            '[Nhân viên lập phiếu thu]        [Hệ thống ghi nhận giao dịch]',
            '   |                                |',
            '   +----------------+---------------+',
            '                    |',
            '                    v',
            '        [Cập nhật paidAmount & status: Paid]',
            '                    |',
            '                    v',
            '                  (End)'
          ]),

          createHeading1('3. Activity Diagram: Quy trình Báo hỏng & Sửa chữa thiết bị'),
          createParagraph('Xử lý phản ánh sự cố cơ sở vật chất từ sinh viên:'),

          ...createCodeBlock([
            '   (Start) -> [Sinh viên gửi yêu cầu báo hỏng (Mô tả + Mức độ khẩn)]',
            '                 |',
            '                 v',
            '              [Nhân viên tiếp nhận yêu cầu -> Status: In Progress]',
            '                 |',
            '                 v',
            '              [Cán bộ kỹ thuật đến kiểm tra & sửa chữa tại phòng]',
            '                 |',
            '                 v',
            '              <Kiểm tra hoàn thành sửa chữa?>',
            '                 |-- (Chưa đạt) -> [Tiếp tục thay thế linh kiện]',
            '                 |',
            '                 +-- (Đạt) ------> [Cập nhật status: Completed]',
            '                                      |',
            '                                      v',
            '                                   [Sinh viên nhận thông báo hoàn tất]',
            '                                      |',
            '                                    (End)'
          ])
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(path.join(outputDir, '05_So_Do_Hoat_Dong_Activity_Diagram.docx'), buffer);
  console.log('Created: 05_So_Do_Hoat_Dong_Activity_Diagram.docx');
}

// -------------------------------------------------------------
// DOC 6: 06_So_Do_Thuc_The_ER_Va_ERD.docx
// -------------------------------------------------------------
async function generateDoc6() {
  const doc = new Document({
    sections: [
      {
        properties: {},
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: 'Tài liệu Thiết kế Cơ sở Dữ liệu ER / ERD | QLKTX MERN', italics: true, size: 18, color: '94A3B8' })],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'Trang ', size: 18 }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 18 }),
                  new TextRun({ text: ' / ', size: 18 }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18 }),
                ],
              }),
            ],
          }),
        },
        children: [
          ...createTitle('TÀI LIỆU THIẾT KẾ CƠ SỞ DỮ LIỆU ER / ERD (ENTITY RELATIONSHIP DIAGRAM)', 'Đặc tả chi tiết lược đồ dữ liệu NoSQL MongoDB, khóa chính, khóa ngoại & mối quan hệ'),

          createHeading1('1. Sơ đồ thực thể liên kết (Entity Relationship Diagram - ERD)'),
          createParagraph('Mô hình hóa liên kết logic giữa 14 thực thể Collection trong cơ sở dữ liệu MongoDB:'),

          ...createCodeBlock([
            ' +-------------------+          1:1          +-------------------+',
            ' |      USERS        |-----------------------|     STUDENTS      |',
            ' | PK: id            |                       | PK: id            |',
            ' +-------------------+                       | FK: userId        |',
            '                                             +-------------------+',
            '                                                | 1           | 1',
            '                                                |             |',
            '                                                | 1..*        | 1..*',
            ' +-------------------+          1:N             |             |',
            ' |    BUILDINGS      |----------------+         v             v',
            ' | PK: id            |                |   +-------------+  +-------------+',
            ' +-------------------+                |   |REGISTRATIONS|  |  CONTRACTS  |',
            '          | 1                         |   | PK: id      |  | PK: id      |',
            '          |                           +-->| FK:studentId|  | FK:studentId|',
            '          v 1..*                          | FK:roomId   |  | FK:roomId   |',
            ' +-------------------+                    | FK:bedId    |  | FK:bedId    |',
            ' |      ROOMS        |------------------->+-------------+  +-------------+',
            ' | PK: id            |                                            | 1',
            ' | FK: buildingId    |--------------------+                       |',
            ' +-------------------+                    | 1:N                   | 1..*',
            '    | 1            | 1                    v                       v',
            '    |              | 1..*          +-------------+         +-------------+',
            '    v 1..*         |               |METERREADINGS|         |  INVOICES   |',
            ' +-------------+   |               | PK: id      |         | PK: id      |',
            ' |    BEDS     |   +-------------->| FK: roomId  |         | FK:studentId|',
            ' | PK: id      |                   +-------------+         | FK:contractId',
            ' | FK: roomId  |                                           +-------------+',
            ' +-------------+                                                  | 1',
            '                                                                  | 0..*',
            ' +-------------+                   +-------------+                v',
            ' | VIOLATIONS  |                   |REPAIRREQUEST|         +-------------+',
            ' | PK: id      |                   | PK: id      |         |  PAYMENTS   |',
            ' | FK:studentId|                   | FK:studentId|         | PK: id      |',
            ' +-------------+                   | FK: roomId  |         | FK:invoiceId|',
            '                                   +-------------+         +-------------+'
          ]),

          createHeading1('2. Bảng mô tả chi tiết các trường dữ liệu (Data Dictionary)'),

          createHeading2('2.1. Bảng Users (Tài khoản & Phân quyền)'),
          createTable(
            ['Tên trường (Field)', 'Kiểu dữ liệu', 'Ràng buộc', 'Mô tả ý nghĩa'],
            [
              ['id', 'Number', 'Primary Key, Auto-increment', 'Mã định danh duy nhất của tài khoản'],
              ['username', 'String', 'Unique, Required', 'Tên đăng nhập hệ thống'],
              ['email', 'String', 'Unique, Required', 'Email liên lạc chính thức'],
              ['passwordHash', 'String', 'Required', 'Mật khẩu đã được băm bằng Bcrypt (10 rounds)'],
              ['fullName', 'String', 'Required', 'Họ và tên đầy đủ'],
              ['phone', 'String', 'Optional', 'Số điện thoại cá nhân'],
              ['avatarUrl', 'String', 'Optional', 'Đường dẫn ảnh đại diện'],
              ['role', 'Number', '1:Admin, 2:Staff, 3:Student', 'Vai trò và phân quyền trong hệ thống'],
              ['isActive', 'Boolean', 'Default: true', 'Trạng thái hoạt động của tài khoản'],
              ['refreshToken', 'String', 'Optional', 'Mã JWT Refresh Token cấp phiên làm việc']
            ]
          ),

          createHeading2('2.2. Bảng Students (Hồ sơ sinh viên nội trú)'),
          createTable(
            ['Tên trường (Field)', 'Kiểu dữ liệu', 'Ràng buộc', 'Mô tả ý nghĩa'],
            [
              ['id', 'Number', 'Primary Key', 'Mã hồ sơ sinh viên'],
              ['userId', 'Number', 'Foreign Key (Users.id)', 'Liên kết với tài khoản User'],
              ['studentCode', 'String', 'Unique, Required', 'Mã số sinh viên (MSSV, ví dụ: SV2026001)'],
              ['fullName', 'String', 'Required', 'Họ tên sinh viên'],
              ['gender', 'String', 'Nam / Nữ', 'Giới tính'],
              ['faculty', 'String', 'Required', 'Khoa / Ngành đào tạo (ví dụ: CNTT)'],
              ['className', 'String', 'Required', 'Lớp sinh hoạt'],
              ['citizenId', 'String', 'Optional', 'Số Căn cước công dân (CCCD)'],
              ['isStaying', 'Boolean', 'Default: false', 'Đang thực tế lưu trú tại KTX hay không']
            ]
          ),

          createHeading2('2.3. Bảng Invoices & Payments (Tài chính - Hóa đơn & Thanh toán)'),
          createTable(
            ['Tên trường (Field)', 'Kiểu dữ liệu', 'Ràng buộc', 'Mô tả ý nghĩa'],
            [
              ['id', 'Number', 'Primary Key', 'Mã hóa đơn duy nhất'],
              ['invoiceCode', 'String', 'Unique', 'Mã hóa đơn (INV-YYYYMM-StudentId)'],
              ['studentId', 'Number', 'Foreign Key (Students.id)', 'Sinh viên chịu trách nhiệm thanh toán'],
              ['contractId', 'Number', 'Foreign Key (Contracts.id)', 'Hợp đồng phát sinh hóa đơn'],
              ['roomFee', 'Number', 'Default: 0', 'Tiền thuê phòng tháng'],
              ['electricityFee', 'Number', 'Default: 0', 'Tiền điện sinh hoạt'],
              ['waterFee', 'Number', 'Default: 0', 'Tiền nước sinh hoạt'],
              ['serviceFee', 'Number', 'Default: 0', 'Tiền dịch vụ / an ninh / vệ sinh'],
              ['totalAmount', 'Number', 'Required', 'Tổng tiền cần thanh toán'],
              ['paidAmount', 'Number', 'Default: 0', 'Số tiền sinh viên đã thanh toán'],
              ['status', 'Number', '1:Unpaid, 2:Paid, 3:Partial, 4:Cancelled', 'Trạng thái thanh toán hóa đơn']
            ]
          )
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(path.join(outputDir, '06_So_Do_Thuc_The_ER_Va_ERD.docx'), buffer);
  console.log('Created: 06_So_Do_Thuc_The_ER_Va_ERD.docx');
}

// Run all generators
async function main() {
  console.log('Generating comprehensive Word documentation in:', outputDir);
  await generateDoc1();
  await generateDoc2();
  await generateDoc3();
  await generateDoc4();
  await generateDoc5();
  await generateDoc6();
  console.log('ALL DOCX FILES GENERATED SUCCESSFULLY!');
}

main().catch(console.error);
