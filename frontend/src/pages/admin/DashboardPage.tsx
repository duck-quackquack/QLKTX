import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { StatCard } from '../../components/ui/StatCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { dashboardApi } from '../../api';
import { DashboardStatistics } from '../../types';
import {
  Users,
  DoorOpen,
  BedDouble,
  Receipt,
  ClipboardList,
  Wrench,
  AlertTriangle,
  TrendingUp,
  Building2,
  Calendar,
  ArrowRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Link } from 'react-router-dom';

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

const formatShortCurrency = (val: number) => {
  if (val >= 1e9) return `${(val / 1e9).toFixed(1)}B`;
  if (val >= 1e6) return `${(val / 1e6).toFixed(0)}M`;
  if (val >= 1e3) return `${(val / 1e3).toFixed(0)}K`;
  return `${val}`;
};

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
        <Header title="Tổng quan Ký túc xá" />
        <LoadingSpinner message="Đang nạp dữ liệu thống kê KTX..." />
      </div>
    );
  }

  // Transform data for charts
  const revenueChartData = (stats.monthlyRevenues || []).map((item) => ({
    month: item.monthYear,
    'Xuất hóa đơn': item.totalBilled,
    'Thực thu': item.totalCollected,
  }));

  const buildingChartData = (stats.buildingOccupancies || []).map((b) => ({
    name: b.buildingName || `Tòa ${b.buildingCode}`,
    'Đã ở': b.occupiedBeds,
    'Trống': b.availableBeds,
    'Tỷ lệ': b.rate,
  }));

  const occupancyPieData = [
    { name: 'Đã có người', value: stats.occupiedBeds || 0, color: '#2563eb' },
    { name: 'Còn trống', value: (stats.totalBeds || 0) - (stats.occupiedBeds || 0), color: '#10b981' },
  ];

  return (
    <div className="flex-1 pb-12 bg-slate-50 min-h-screen">
      <Header
        title="Tổng quan Ký túc xá"
        subtitle="Theo dõi chỉ số lưu trú, tỷ lệ lấp đầy phòng và tình hình tài chính KTX"
      />

      <div className="max-w-7xl mx-auto px-6 mt-6 space-y-6">
        {/* Welcome Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div>
            <h1 className="text-lg font-bold text-slate-800">Xin chào, Quản trị viên 👋</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Hệ thống đang hoạt động ổn định. Dưới đây là dữ liệu cập nhật theo thời gian thực.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-1.5">
              <Calendar size={14} />
              {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* 8 Metric Stat Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Sinh viên đang ở"
            value={`${stats.activeStayingStudents} / ${stats.totalStudents}`}
            subtitle="Đang ở / Tổng hồ sơ"
            icon={<Users size={20} className="text-blue-600" />}
            iconBg="bg-blue-50"
          />

          <StatCard
            title="Tỷ lệ lấp đầy"
            value={`${stats.occupancyRate}%`}
            subtitle={`${stats.occupiedBeds} / ${stats.totalBeds} giường`}
            icon={<BedDouble size={20} className="text-indigo-600" />}
            iconBg="bg-indigo-50"
            trend={{ value: 3.5, label: "so với tháng trước" }}
          />

          <StatCard
            title="Doanh thu tháng"
            value={formatShortCurrency(stats.monthlyRevenue)}
            subtitle={`Thực thu: ${formatCurrency(stats.monthlyRevenue)}`}
            icon={<TrendingUp size={20} className="text-emerald-600" />}
            iconBg="bg-emerald-50"
            trend={{ value: 4.2, label: "tăng trưởng" }}
          />

          <StatCard
            title="Hóa đơn chưa thu"
            value={formatShortCurrency(stats.totalUnpaidAmount)}
            subtitle="Tổng nợ cần thu"
            icon={<Receipt size={20} className="text-rose-500" />}
            iconBg="bg-rose-50"
          />

          <Link to="/admin/registrations" className="block">
            <StatCard
              title="Đơn đăng ký mới"
              value={stats.pendingRegistrations}
              subtitle="Cần duyệt hồ sơ"
              icon={<ClipboardList size={20} className="text-amber-600" />}
              iconBg="bg-amber-50"
            />
          </Link>

          <Link to="/admin/repairs" className="block">
            <StatCard
              title="Yêu cầu sửa chữa"
              value={stats.pendingRepairs}
              subtitle="Thiết bị báo hỏng"
              icon={<Wrench size={20} className="text-orange-600" />}
              iconBg="bg-orange-50"
            />
          </Link>

          <Link to="/admin/violations" className="block">
            <StatCard
              title="Vi phạm chờ xử lý"
              value={stats.pendingViolations}
              subtitle="Biên bản kỷ luật"
              icon={<AlertTriangle size={20} className="text-purple-600" />}
              iconBg="bg-purple-50"
            />
          </Link>

          <Link to="/admin/buildings" className="block">
            <StatCard
              title="Tổng số tòa nhà"
              value={stats.totalBuildings}
              subtitle="Khu Ký túc xá"
              icon={<Building2 size={20} className="text-cyan-600" />}
              iconBg="bg-cyan-50"
            />
          </Link>
        </div>

        {/* Charts Row 1: Line chart & Pie chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800">Biểu đồ doanh thu 6 tháng gần nhất</h3>
                <p className="text-xs text-slate-400 mt-0.5">So sánh tổng tiền xuất hóa đơn và tiền thực thu</p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => formatShortCurrency(v)}
                  />
                  <Tooltip
                    formatter={(v: any, name: any) => [formatCurrency(Number(v)), name]}
                    contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  <Line type="monotone" dataKey="Xuất hóa đơn" stroke="#93c5fd" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Thực thu" stroke="#2563eb" strokeWidth={2.5} dot={{ fill: '#2563eb', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Occupancy Donut Pie Chart */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800 mb-1">Tỷ lệ lấp đầy giường</h3>
              <p className="text-xs text-slate-400 mb-2">Tổng quy mô: {stats.totalBeds} giường</p>

              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={occupancyPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {occupancyPieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: any, name: any) => [`${v} giường`, name]}
                      contentStyle={{ fontSize: 12, borderRadius: 10 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 mt-2">
                {occupancyPieData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-xs px-2 py-1 bg-slate-50 rounded-lg">
                    <span className="flex items-center gap-2 text-slate-600 font-medium">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                      {d.name}
                    </span>
                    <span className="font-bold text-slate-800">{d.value} giường</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 2: Building Bar Chart & Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Building Breakdown Bar Chart */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800">Tình trạng theo tòa nhà</h3>
                <p className="text-xs text-slate-400 mt-0.5">Số giường đã ở và còn trống</p>
              </div>
              <Link to="/admin/rooms" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
                Xem chi tiết <ArrowRight size={12} />
              </Link>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={buildingChartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #e2e8f0' }}
                    formatter={(v: any, name: any) => [`${v} giường`, name]}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Đã ở" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Trống" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Activity List */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800 mb-1">Hoạt động gần đây</h3>
              <p className="text-xs text-slate-400 mb-4">Các sự kiện và thay đổi mới nhất trong ký túc xá</p>

              <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto pr-1">
                {stats.recentActivities && stats.recentActivities.length > 0 ? (
                  stats.recentActivities.map((act, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-slate-800 leading-tight">{act.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{act.description}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {new Date(act.time).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-6 text-center">Chưa có hoạt động mới ghi nhận.</p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between text-xs text-slate-500">
              <span>Đang kết nối cơ sở dữ liệu</span>
              <span className="inline-flex items-center gap-1 text-green-600 font-semibold">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Trực tuyến
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

