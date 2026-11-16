import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Badge, statusBadge } from '../../components/common/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { contractApi, invoiceApi, repairApi, notificationApi, violationApi } from '../../api';
import { Contract, Invoice, RepairRequest, NotificationItem } from '../../types';
import { Link, useNavigate } from 'react-router-dom';
import {
  DoorOpen,
  Receipt,
  Wrench,
  Bell,
  AlertTriangle,
  ChevronRight,
  FileText,
  CreditCard,
  Building2,
  BedDouble,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n);

export const StudentDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeContract, setActiveContract] = useState<Contract | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [repairs, setRepairs] = useState<RepairRequest[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [violationsCount, setViolationsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentHome = async () => {
      try {
        const [cRes, iRes, rRes, nRes, vRes] = await Promise.all([
          contractApi.getMyActive().catch(() => ({ success: false, data: null })),
          invoiceApi.getMy().catch(() => ({ success: false, data: [] })),
          repairApi.getMy().catch(() => ({ success: false, data: [] })),
          notificationApi.getMy().catch(() => ({ success: false, data: [] })),
          violationApi.getMy().catch(() => ({ success: false, data: [] })),
        ]);

        if (cRes.success) setActiveContract(cRes.data);
        if (iRes.success) setInvoices(iRes.data);
        if (rRes.success) setRepairs(rRes.data);
        if (nRes.success) setNotifications(nRes.data);
        if (vRes.success && Array.isArray(vRes.data)) setViolationsCount(vRes.data.length);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentHome();
  }, []);

  const latestInvoice = invoices.length > 0 ? invoices[0] : null;
  const unreadNotifs = notifications.filter((n) => !n.isRead);
  const processingRepairs = repairs.filter((r) => r.status === 2 || r.status === 1);

  const studentIdentifier = user?.studentCode || user?.username || 'SV';
  const lanHost = window.location.hostname === 'localhost' ? '192.168.1.203' : window.location.hostname;
  const passUrl = `${window.location.protocol}//${lanHost}:${window.location.port || '3000'}/verify-pass?code=${encodeURIComponent(studentIdentifier)}`;

  return (
    <div className="flex-1 pb-12 bg-slate-50 min-h-screen">
      <Header
        title="Trang chủ sinh viên"
        subtitle="Tổng quan phòng ở, thẻ nội trú điện tử và công nợ ký túc xá"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 flex flex-col gap-6">
        {/* Digital Dorm ID Card (Thẻ Nội Trú Điện Tử) */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-blue-900/30">
          <div
            className="absolute right-0 top-0 w-96 h-96 opacity-15 pointer-events-none"
            style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }}
          />

          {/* Card Top Meta */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-white/10 relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-bold tracking-wider uppercase text-blue-300">
                  Thẻ Nội Trú Điện Tử · Digital Resident Pass
                </p>
                <p className="text-[10px] text-slate-400">Hệ Thống Quản Lý Ký Túc Xá Sinh Viên</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${
                  activeContract
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    activeContract ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                {activeContract ? 'Đang Lưu Trú Hợp Lệ' : 'Chưa Đăng Ký Phòng'}
              </span>
            </div>
          </div>

          {/* Card Main Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6 relative z-10 items-center">
            {/* Student Info */}
            <div className="lg:col-span-2 space-y-5">
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-extrabold text-2xl sm:text-3xl flex items-center justify-center shadow-lg shadow-blue-500/25 border-2 border-white/20">
                    {user?.fullName?.split(' ').pop()?.charAt(0) || user?.username?.charAt(0) || 'S'}
                  </div>
                  {activeContract && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-slate-900 shadow">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white truncate">
                    {user?.fullName || user?.username}
                  </h1>
                  <p className="text-blue-300 font-mono text-xs sm:text-sm mt-0.5 font-semibold">
                    MSSV: {user?.studentCode || 'Chưa cập nhật'}
                  </p>
                  <p className="text-slate-400 text-xs mt-1 truncate">
                    {user?.email || ''} {user?.phone ? `· ${user.phone}` : ''}
                  </p>
                </div>
              </div>

              {/* Resident Metadata Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-white/5 rounded-xl p-3 border border-white/10 backdrop-blur-xs">
                  <p className="text-slate-400 text-[11px] mb-0.5">Tòa nhà</p>
                  <p className="font-bold text-sm text-white truncate">
                    {activeContract
                      ? (activeContract.buildingName?.startsWith('Tòa')
                          ? activeContract.buildingName
                          : `Tòa ${activeContract.buildingName}`)
                      : '—'}
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 border border-white/10 backdrop-blur-xs">
                  <p className="text-slate-400 text-[11px] mb-0.5">Phòng ở</p>
                  <p className="font-bold text-sm text-blue-300">
                    {activeContract ? `Phòng ${activeContract.roomNumber}` : '—'}
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 border border-white/10 backdrop-blur-xs">
                  <p className="text-slate-400 text-[11px] mb-0.5">Vị trí giường</p>
                  <p className="font-bold text-sm text-white">
                    {activeContract ? `Giường số ${activeContract.bedNumber}` : '—'}
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 border border-white/10 backdrop-blur-xs">
                  <p className="text-slate-400 text-[11px] mb-0.5">Mã hợp đồng</p>
                  <p className="font-bold text-xs sm:text-sm text-emerald-400 truncate">
                    {activeContract ? activeContract.contractNumber : 'Chưa có'}
                  </p>
                </div>
              </div>
            </div>

            {/* QR Pass Box */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex flex-col items-center text-center">
              <a
                href={passUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Bấm để mở thẻ nội trú điện tử trên web"
                className="bg-white p-2.5 rounded-xl shadow-md mb-2.5 hover:scale-105 transition-transform block group cursor-pointer"
              >
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(passUrl)}`}
                  alt="QR Code Thẻ Nội Trú KTX"
                  className="w-24 h-24 sm:w-28 sm:h-28 object-contain"
                />
              </a>
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-blue-400" />
                Mã QR Thẻ Nội Trú
              </p>
              <p className="text-[10px] text-slate-300 mt-0.5 font-mono">
                PASS: QLKTX-{studentIdentifier}
              </p>
              <Link
                to={`/verify-pass?code=${encodeURIComponent(studentIdentifier)}`}
                className="mt-2.5 inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600/90 hover:bg-blue-600 text-white text-[11px] font-bold transition shadow-xs hover:shadow-md"
              >
                <span>Mở thẻ điện tử</span>
                <ChevronRight size={13} />
              </Link>
            </div>
          </div>
        </div>

        {/* 6 Quick Action / Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Room Card */}
          <div
            onClick={() => navigate('/student/room')}
            className="bg-white rounded-xl border border-slate-200 p-5 cursor-pointer hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <DoorOpen size={20} className="text-blue-600" />
              </div>
              <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-600 transition" />
            </div>
            <p className="text-xs text-slate-400 mb-1">Phòng hiện tại</p>
            <p className="text-lg font-bold text-slate-800">
              {activeContract ? `Phòng ${activeContract.roomNumber}` : 'Chưa có phòng'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {activeContract ? `${activeContract.buildingName} · Giường ${activeContract.bedNumber}` : 'Bấm để xem đăng ký phòng'}
            </p>
          </div>

          {/* Contract Card */}
          <div
            onClick={() => navigate('/student/contracts')}
            className="bg-white rounded-xl border border-slate-200 p-5 cursor-pointer hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <FileText size={20} className="text-green-600" />
              </div>
              <ChevronRight size={16} className="text-slate-300 group-hover:text-green-600 transition" />
            </div>
            <p className="text-xs text-slate-400 mb-1">Hợp đồng nội trú</p>
            <p className="text-lg font-bold text-slate-800">
              {activeContract ? activeContract.contractNumber : 'Chưa có HĐ'}
            </p>
            <p className="text-xs text-green-600 mt-1 font-medium">
              {activeContract
                ? `Hiệu lực đến ${new Date(activeContract.endDate).toLocaleDateString('vi-VN')}`
                : 'Chưa kích hoạt hợp đồng'}
            </p>
          </div>

          {/* Invoices Card */}
          <div
            onClick={() => navigate('/student/invoices')}
            className={`rounded-xl border p-5 cursor-pointer hover:shadow-md transition-all group ${
              latestInvoice && latestInvoice.status !== 3
                ? 'bg-red-50/50 border-red-200'
                : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  latestInvoice && latestInvoice.status !== 3 ? 'bg-red-100' : 'bg-slate-50'
                }`}
              >
                <Receipt
                  size={20}
                  className={latestInvoice && latestInvoice.status !== 3 ? 'text-red-600' : 'text-slate-500'}
                />
              </div>
              <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-600 transition" />
            </div>
            <p className="text-xs text-slate-400 mb-1">
              Hóa đơn {latestInvoice ? `tháng ${String(latestInvoice.month).padStart(2, '0')}/${latestInvoice.year}` : 'gần nhất'}
            </p>
            <p
              className={`text-lg font-bold ${
                latestInvoice && latestInvoice.status !== 3 ? 'text-red-700' : 'text-slate-800'
              }`}
            >
              {latestInvoice ? `${fmt(latestInvoice.totalAmount)}đ` : '0đ'}
            </p>
            <div className="mt-2">
              {latestInvoice ? (
                statusBadge(latestInvoice.status === 3 ? 'paid' : latestInvoice.status === 2 ? 'partial' : 'unpaid')
              ) : (
                <Badge variant="success">Không có nợ</Badge>
              )}
            </div>
          </div>

          {/* Repair Card */}
          <div
            onClick={() => navigate('/student/repairs')}
            className="bg-white rounded-xl border border-slate-200 p-5 cursor-pointer hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                <Wrench size={20} className="text-orange-600" />
              </div>
              <ChevronRight size={16} className="text-slate-300 group-hover:text-orange-600 transition" />
            </div>
            <p className="text-xs text-slate-400 mb-1">Yêu cầu sửa chữa</p>
            <p className="text-lg font-bold text-slate-800">{repairs.length} đơn</p>
            <p className="text-xs text-slate-500 mt-1">
              {processingRepairs.length > 0 ? `${processingRepairs.length} đang xử lý` : 'Không có yêu cầu mở'}
            </p>
          </div>

          {/* Notification Card */}
          <div
            onClick={() => navigate('/student/notifications')}
            className="bg-white rounded-xl border border-slate-200 p-5 cursor-pointer hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <Bell size={20} className="text-purple-600" />
              </div>
              <ChevronRight size={16} className="text-slate-300 group-hover:text-purple-600 transition" />
            </div>
            <p className="text-xs text-slate-400 mb-1">Thông báo</p>
            <p className="text-lg font-bold text-slate-800">{unreadNotifs.length}</p>
            <p className="text-xs text-purple-600 mt-1 font-medium">chưa đọc</p>
          </div>

          {/* Violations Card */}
          <div
            onClick={() => navigate('/student/violations')}
            className="bg-white rounded-xl border border-slate-200 p-5 cursor-pointer hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center">
                <AlertTriangle size={20} className="text-slate-500" />
              </div>
              <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-600 transition" />
            </div>
            <p className="text-xs text-slate-400 mb-1">Vi phạm & Kỷ luật</p>
            <p className="text-lg font-bold text-slate-800">{violationsCount} biên bản</p>
            <p className="text-xs text-slate-500 mt-1">
              {violationsCount === 0 ? 'Tốt · Không có vi phạm' : 'Cần kiểm tra chi tiết'}
            </p>
          </div>
        </div>

        {/* Bottom Section: Latest Notifications & Dormitory Rules */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notifications preview */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <Bell size={16} className="text-blue-600" />
                Thông báo mới nhất
              </h3>
              <Link to="/student/notifications" className="text-xs font-medium text-blue-600 hover:text-blue-700">
                Xem tất cả
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {notifications.slice(0, 4).map((n) => (
                <div key={n.id} className="py-3">
                  <h4 className="text-xs font-semibold text-slate-800">{n.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.content}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {new Date(n.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              ))}
              {notifications.length === 0 && (
                <p className="text-xs text-slate-400 py-6 text-center">Chưa có thông báo nào.</p>
              )}
            </div>
          </div>

          {/* Dormitory Guidelines Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Nội quy ký túc xá</h3>
            <ul className="space-y-2.5 text-xs text-slate-600 list-disc pl-4 leading-relaxed">
              <li>Giờ mở cửa cổng KTX: <strong className="text-slate-800">05:30 - 23:00</strong> hàng ngày.</li>
              <li>Giữ gìn vệ sinh chung trong phòng và khu vực hành lang, bỏ rác đúng nơi quy định.</li>
              <li>Nghiêm cấm nấu ăn bằng bếp gas, hút thuốc, sử dụng chất gây nghiện trong phòng.</li>
              <li>Thanh toán tiền phòng và hóa đơn điện nước trước ngày 25 hàng tháng.</li>
              <li>Khi có sự cố trang thiết bị hỏng hóc, vui lòng tạo đơn tại mục <em>Báo hỏng thiết bị</em>.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
