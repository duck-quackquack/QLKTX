import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { StatCard } from '../../components/common/StatCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { dashboardApi } from '../../api';
import { DashboardStatistics } from '../../types';
import {
  Users,
  DoorOpen,
  BedDouble,
  DollarSign,
  AlertCircle,
  FileCheck2,
  Wrench,
  TrendingUp,
  Building
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await dashboardApi.getStatistics();
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard statistics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex-1">
        <Header title="Bảng Điều Khiển Tổng Quan" />
        <LoadingSpinner message="Đang nạp dữ liệu thống kê KTX..." />
      </div>
    );
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  return (
    <div className="flex-1 pb-12">
      <Header title="Bảng Điều Khiển Tổng Quan" subtitle="Thống kê lưu trú, tỷ lệ lấp đầy và tình hình tài chính KTX" />

      <div className="max-w-7xl mx-auto px-6 mt-6 space-y-6">
        {/* Top 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Tổng Sinh Viên Lưu Trú"
            value={`${stats.activeStayingStudents} / ${stats.totalStudents}`}
            subtitle="Đang ở / Tổng hồ sơ"
            icon={<Users className="w-6 h-6" />}
            color="indigo"
          />

          <StatCard
            title="Tỷ Lệ Lấp Đầy Giường"
            value={`${stats.occupancyRate}%`}
            subtitle={`${stats.occupiedBeds} đã ở / ${stats.totalBeds} giường`}
            icon={<BedDouble className="w-6 h-6" />}
            color="emerald"
            trend={{ value: '3.5%', isPositive: true }}
          />

          <StatCard
            title="Doanh Thu Tháng Này"
            value={formatCurrency(stats.monthlyRevenue)}
            subtitle="Tổng tiền đã thu thực tế"
            icon={<DollarSign className="w-6 h-6" />}
            color="sky"
          />

          <StatCard
            title="Công Nợ Chưa Thu"
            value={formatCurrency(stats.totalUnpaidAmount)}
            subtitle="Hóa đơn chưa thanh toán"
            icon={<AlertCircle className="w-6 h-6" />}
            color="rose"
          />
        </div>

        {/* Secondary Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-100 text-amber-700">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-amber-900">Đơn chờ duyệt</p>
                <p className="text-xl font-black text-amber-800">{stats.pendingRegistrations}</p>
              </div>
            </div>
            <a href="/admin/registrations" className="text-xs font-bold text-amber-700 hover:underline">
              Xử lý →
            </a>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-indigo-100 text-indigo-700">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-indigo-900">Yêu cầu sửa chữa mới</p>
                <p className="text-xl font-black text-indigo-800">{stats.pendingRepairs}</p>
              </div>
            </div>
            <a href="/admin/repairs" className="text-xs font-bold text-indigo-700 hover:underline">
              Kiểm tra →
            </a>
          </div>

          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-rose-100 text-rose-700">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-rose-900">Vi phạm chưa xử lý</p>
                <p className="text-xl font-black text-rose-800">{stats.pendingViolations}</p>
              </div>
            </div>
            <a href="/admin/violations" className="text-xs font-bold text-rose-700 hover:underline">
              Xem ngay →
            </a>
          </div>
        </div>

        {/* Charts and Building Occupancy breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Bars Trend */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Xu Hướng Thu Phí 6 Tháng Gần Nhất</h3>
                <p className="text-xs text-slate-500">So sánh tổng tiền xuất hóa đơn và thực thu</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 font-medium text-slate-600">
                  <span className="w-3 h-3 rounded bg-indigo-200" /> Xuất hóa đơn
                </span>
                <span className="flex items-center gap-1.5 font-medium text-slate-600">
                  <span className="w-3 h-3 rounded bg-indigo-600" /> Thực thu
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {stats.monthlyRevenues.map((item, idx) => {
                const maxVal = Math.max(
                  ...stats.monthlyRevenues.map((r) => Math.max(r.totalBilled, r.totalCollected)),
                  1
                );
                const billedWidth = (item.totalBilled / maxVal) * 100;
                const collectedWidth = (item.totalCollected / maxVal) * 100;

                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span>Tháng {item.monthYear}</span>
                      <span className="text-slate-500">
                        Thu: {formatCurrency(item.totalCollected)} / {formatCurrency(item.totalBilled)}
                      </span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex flex-col gap-0.5">
                      <div
                        className="h-1.5 bg-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, collectedWidth)}%` }}
                      />
                      <div
                        className="h-1 bg-indigo-200 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, billedWidth)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Building Occupancy breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Tỷ Lệ Theo Tòa Nhà</h3>
              <p className="text-xs text-slate-500 mb-5">Số giường đã ở trên tổng số giường</p>

              <div className="space-y-4">
                {stats.buildingOccupancies.map((b, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-800">{b.buildingName || `Tòa ${b.buildingCode}`}</span>
                      <span className="text-xs font-extrabold text-indigo-600">{b.rate}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full"
                        style={{ width: `${b.rate}%` }}
                      />
                    </div>
                    <div className="mt-2 flex justify-between text-[11px] text-slate-500">
                      <span>Đã ở: {b.occupiedBeds}</span>
                      <span>Còn trống: {b.availableBeds}</span>
                      <span>Tổng: {b.totalBeds}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Tổng số tòa nhà: {stats.totalBuildings}</span>
              <a href="/admin/rooms" className="font-bold text-indigo-600 hover:underline">
                Xem sơ đồ phòng →
              </a>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4">Hoạt Động Gần Đây</h3>
          <div className="divide-y divide-slate-100">
            {stats.recentActivities.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">Chưa có hoạt động mới.</p>
            ) : (
              stats.recentActivities.map((act, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{act.title}</p>
                      <p className="text-xs text-slate-500">{act.description}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(act.time).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

