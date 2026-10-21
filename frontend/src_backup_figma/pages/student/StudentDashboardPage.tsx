import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { contractApi, invoiceApi, repairApi, notificationApi } from '../../api';
import { Contract, Invoice, RepairRequest, NotificationItem } from '../../types';
import { Link } from 'react-router-dom';
import {
  DoorOpen,
  Receipt,
  Wrench,
  Bell,
  Calendar,
  CreditCard,
  AlertCircle,
  FileSignature,
  ArrowRight
} from 'lucide-react';

export const StudentDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [activeContract, setActiveContract] = useState<Contract | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [repairs, setRepairs] = useState<RepairRequest[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentHome = async () => {
      try {
        const [cRes, iRes, rRes, nRes] = await Promise.all([
          contractApi.getMyActive().catch(() => ({ success: false, data: null })),
          invoiceApi.getMy().catch(() => ({ success: false, data: [] })),
          repairApi.getMy().catch(() => ({ success: false, data: [] })),
          notificationApi.getMy().catch(() => ({ success: false, data: [] })),
        ]);

        if (cRes.success) setActiveContract(cRes.data);
        if (iRes.success) setInvoices(iRes.data);
        if (rRes.success) setRepairs(rRes.data);
        if (nRes.success) setNotifications(nRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentHome();
  }, []);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const unpaidInvoices = invoices.filter((i) => i.status !== 3);
  const totalDebt = unpaidInvoices.reduce((acc, curr) => acc + curr.remainingAmount, 0);

  return (
    <div className="flex-1 pb-12">
      <Header
        title={`Xin chào, ${user?.fullName || user?.username}!`}
        subtitle="Cổng thông tin sinh viên nội trú Ký túc xá"
      />

      <div className="max-w-7xl mx-auto px-6 mt-6 space-y-6">
        {/* Welcome Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 p-6 sm:p-8 text-white shadow-xl shadow-indigo-600/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-indigo-100">
              Sinh Viên Nội Trú KTX
            </span>
            <h2 className="mt-3 text-2xl sm:text-3xl font-black">
              {activeContract
                ? `Phòng ${activeContract.roomNumber} - ${activeContract.buildingName}`
                : 'Bạn Chưa Đăng Ký Phòng KTX'}
            </h2>
            <p className="mt-1 text-sm text-indigo-100 max-w-xl">
              {activeContract
                ? `Giường ${activeContract.bedNumber} &bull; Hạn hợp đồng đến ${new Date(activeContract.endDate).toLocaleDateString('vi-VN')}`
                : 'Hãy đăng ký phòng ngay hôm nay để nhận chỗ ở tiện nghi trong khuôn viên trường!'}
            </p>
          </div>

          <div>
            {activeContract ? (
              <Link to="/student/room">
                <Button variant="secondary" className="bg-white text-indigo-700 hover:bg-indigo-50 border-none font-bold">
                  Xem phòng của tôi →
                </Button>
              </Link>
            ) : (
              <Link to="/student/register-room">
                <Button variant="secondary" className="bg-white text-indigo-700 hover:bg-indigo-50 border-none font-bold">
                  Nộp đơn đăng ký phòng →
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* 3 Overview Quick Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Room info */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phòng & Giường</span>
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <DoorOpen className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-xl font-black text-slate-900">
                {activeContract ? `P.${activeContract.roomNumber} (${activeContract.bedNumber})` : 'Chưa có'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {activeContract ? activeContract.buildingName : 'Vui lòng nộp đơn đăng ký'}
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
              <Link to="/student/room" className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
                Chi tiết phòng <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Unpaid Invoices */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tiền Phòng Cần Nộp</span>
                <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                  <Receipt className="w-5 h-5" />
                </div>
              </div>
              <h3 className={`text-xl font-black ${totalDebt > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {totalDebt > 0 ? formatCurrency(totalDebt) : 'Đã thanh toán đủ'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {unpaidInvoices.length > 0 ? `${unpaidInvoices.length} hóa đơn chưa thanh toán` : 'Không có công nợ quá hạn'}
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
              <Link to="/student/invoices" className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
                Xem hóa đơn <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Repair requests */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Yêu Cầu Sửa Chữa</span>
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <Wrench className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-xl font-black text-slate-900">
                {repairs.length} yêu cầu
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {repairs.filter((r) => r.status === 1 || r.status === 2).length} đang được xử lý
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
              <Link to="/student/repairs" className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
                Báo hỏng thiết bị <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Notifications and Invoices List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Latest Notifications */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-600" />
                Thông Báo Mới Nhất
              </h3>
              <Link to="/student/notifications" className="text-xs font-bold text-indigo-600 hover:underline">
                Xem tất cả
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {notifications.slice(0, 4).map((n) => (
                <div key={n.id} className="py-3">
                  <h4 className="text-xs font-bold text-slate-800">{n.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.content}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {new Date(n.createdAt).toLocaleString('vi-VN')}
                  </span>
                </div>
              ))}
              {notifications.length === 0 && (
                <p className="text-xs text-slate-400 py-6 text-center">Chưa có thông báo nào.</p>
              )}
            </div>
          </div>

          {/* Quick Info & Rules */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">Nội Quy Ký Túc Xá Cần Nhớ</h3>
            <ul className="space-y-2.5 text-xs text-slate-600 list-disc pl-4 leading-relaxed">
              <li>Giờ mở cửa: <span className="font-bold text-slate-900">05:30 - 23:00</span> hàng ngày.</li>
              <li>Giữ gìn vệ sinh chung phòng ở và hành lang, phân loại rác đúng nơi quy định.</li>
              <li>Không hút thuốc, sử dụng chất kích thích, đun nấu sai quy định trong phòng ngủ.</li>
              <li>Thanh toán tiền phòng và tiền điện nước đúng hạn trước ngày 30 hàng tháng.</li>
              <li>Khi có sự cố hỏng hóc thiết bị điện nước, gửi yêu cầu tại mục <span className="font-bold text-indigo-600">Báo hỏng / Sửa chữa</span>.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

