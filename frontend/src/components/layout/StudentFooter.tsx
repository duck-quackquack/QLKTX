import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Phone,
  Clock,
  MapPin,
  ShieldAlert,
  Wrench,
  HeartHandshake,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

export const StudentFooter: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-auto">
      {/* Main Footer Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand & Address */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-white text-base tracking-tight">QLKTX</span>
              <span className="px-1.5 py-0.5 rounded-full bg-blue-900/60 text-blue-300 text-[10px] font-bold border border-blue-700/50 uppercase">
                Sinh Viên
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Cổng thông tin nội trú và quản lý đời sống ký túc xá đại học thông minh, an toàn và tiện lợi.
            </p>
            <div className="space-y-1.5 pt-1 text-[11px]">
              <p className="flex items-center gap-2 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Khu Ký túc xá Sinh viên Đại học (Tòa A, B, C, D)</span>
              </p>
              <p className="flex items-center gap-2 text-slate-300">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Giờ đóng/mở cổng: <strong>05:30 - 23:00</strong> hàng ngày</span>
              </p>
            </div>
          </div>

          {/* Emergency Hotlines 24/7 */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              Đường Dây Nóng (24/7)
            </h4>
            <p className="text-[11px] text-slate-400">
              Liên hệ ngay ban quản lý khi có sự cố khẩn cấp, an ninh hoặc sức khỏe:
            </p>
            <div className="space-y-2">
              <a
                href="tel:02438692222"
                className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 transition border border-slate-700/60 group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Phone className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition-transform shrink-0" />
                  <span className="truncate font-medium text-slate-300">Bảo vệ trực ban:</span>
                </div>
                <span className="font-mono font-bold text-rose-400 px-2 py-0.5 rounded bg-rose-950/50 border border-rose-800/40 text-[11px] shrink-0">
                  024.3869.2222
                </span>
              </a>

              <a
                href="tel:0988115115"
                className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 transition border border-slate-700/60 group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <HeartHandshake className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
                  <span className="truncate font-medium text-slate-300">Y tế & Cấp cứu:</span>
                </div>
                <span className="font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/50 border border-emerald-800/40 text-[11px] shrink-0">
                  0988.115.115
                </span>
              </a>

              <a
                href="tel:0912345678"
                className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 transition border border-slate-700/60 group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Wrench className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
                  <span className="truncate font-medium text-slate-300">Sự cố Kỹ thuật:</span>
                </div>
                <span className="font-mono font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-950/50 border border-amber-800/40 text-[11px] shrink-0">
                  0912.345.678
                </span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Tiện Ích Sinh Viên
            </h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <Link to="/student/register-room" className="hover:text-blue-400 flex items-center gap-1.5 transition">
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span>Đăng ký xét duyệt phòng nội trú</span>
                </Link>
              </li>
              <li>
                <Link to="/student/invoices" className="hover:text-blue-400 flex items-center gap-1.5 transition">
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span>Nộp tiền phòng & Điện nước (VietQR)</span>
                </Link>
              </li>
              <li>
                <Link to="/student/repairs" className="hover:text-blue-400 flex items-center gap-1.5 transition">
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span>Gửi yêu cầu sửa chữa thiết bị</span>
                </Link>
              </li>
              <li>
                <Link to="/student/violations" className="hover:text-blue-400 flex items-center gap-1.5 transition">
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span>Quy định kỷ luật & Tra cứu điểm trừ</span>
                </Link>
              </li>
              <li>
                <Link to="/student/profile" className="hover:text-blue-400 flex items-center gap-1.5 transition">
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span>Hồ sơ cá nhân & Liên kết tài khoản</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Office & Admin */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Văn Phòng Quản Lý
            </h4>
            <div className="space-y-1.5 text-[11px] text-slate-300">
              <p>
                <strong>Văn phòng BQL:</strong> Phòng 101, Tòa A
              </p>
              <p>
                <strong>Giờ tiếp sinh viên:</strong> Sáng 08:00 - 11:30, Chiều 13:30 - 17:00 (Thứ 2 - Thứ 6)
              </p>
              <p>
                <strong>Email phản hồi:</strong>{' '}
                <a href="mailto:banquanly@kytucxa.edu.vn" className="text-blue-400 hover:underline">
                  banquanly@kytucxa.edu.vn
                </a>
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-900/60 text-[10px] text-blue-300">
              💡 <em>Sinh viên cần khai báo tạm trú đầy đủ và tuân thủ thời gian sinh hoạt chung để đảm bảo an ninh KTX.</em>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="border-t border-slate-800/80 bg-slate-950 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
          <p>© 2026 Hệ Thống Quản Lý Ký Túc Xá Sinh Viên. Phát triển theo chuẩn đại học thông minh.</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-400">Hệ thống trực tuyến 24/7 · VietQR Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
