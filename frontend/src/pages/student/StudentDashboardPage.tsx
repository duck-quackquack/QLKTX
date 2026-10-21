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
  BedDouble
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

  return (
    <div className="flex-1 pb-12 bg-slate-50 min-h-screen">
      <Header
        title="Trang chủ sinh viên"
        subtitle="Tổng quan phòng ở, công nợ và thông tin ký túc xá"
      />

      <div className="max-w-7xl mx-auto px-6 mt-6 flex flex-col gap-6">
        {/* Welcome Card Banner */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white relative overflow-hidden shadow-sm">
          <div
            className="absolute right-0 top-0 w-64 h-64 opacity-10 pointer-events-none"
            style={{ background: 'radial-gradient(circle, white, transparent)' }}
          />
          <div className="relative">
            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                {user?.fullName?.split(' ').pop()?.charAt(0) || user?.username?.charAt(0) || 'S'}
              </div>
              <div>
                <h1 className="text-xl font-bold leading-tight">Xin chào, {user?.fullName || user?.username}</h1>
                <p className="text-blue-200 text-sm mt-0.5">
                  {user?.studentCode ? `${user.studentCode} · ` : ''}{user?.email || 'Sinh viên nội trú'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Tòa nhà', value: activeContract ? `Tòa ${activeContract.buildingName}` : 'Chưa xếp phòng' },
                { label: 'Phòng', value: activeContract ? `P.${activeContract.roomNumber}` : '—' },
                { label: 'Giường', value: activeContract ? `Giường ${activeContract.bedNumber}` : '—' },
                {
                  label: 'Trạng thái',
                  value: activeContract ? 'Đang nội trú' : 'Chưa đăng ký',
                },
              ].map((i) => (
                <div key={i.label} className="bg-white/10 rounded-xl p-3.5 backdrop-blur-sm border border-white/10">
                  <p className="text-blue-200 text-xs mb-1 font-medium">{i.label}</p>
                  <p className="font-semibold text-sm">{i.value}</p>
                </div>
              ))}
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
