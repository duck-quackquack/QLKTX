import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  DoorOpen,
  ClipboardList,
  FileSignature,
  Gauge,
  Receipt,
  CreditCard,
  AlertTriangle,
  Wrench,
  Bell,
  Home,
  LogOut,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Sidebar: React.FC<{ role: 'admin' | 'student' }> = ({ role }) => {
  const { logout, user } = useAuth();

  const adminNavItems = [
    { label: 'Tổng quan', path: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Sinh viên', path: '/admin/students', icon: <Users className="w-5 h-5" /> },
    { label: 'Tòa nhà', path: '/admin/buildings', icon: <Building2 className="w-5 h-5" /> },
    { label: 'Phòng & Sơ đồ', path: '/admin/rooms', icon: <DoorOpen className="w-5 h-5" /> },
    { label: 'Duyệt đăng ký', path: '/admin/registrations', icon: <UserCheck className="w-5 h-5" /> },
    { label: 'Hợp đồng', path: '/admin/contracts', icon: <FileSignature className="w-5 h-5" /> },
    { label: 'Chỉ số điện nước', path: '/admin/meter-readings', icon: <Gauge className="w-5 h-5" /> },
    { label: 'Hóa đơn', path: '/admin/invoices', icon: <Receipt className="w-5 h-5" /> },
    { label: 'Thanh toán', path: '/admin/payments', icon: <CreditCard className="w-5 h-5" /> },
    { label: 'Kỷ luật / Vi phạm', path: '/admin/violations', icon: <AlertTriangle className="w-5 h-5" /> },
    { label: 'Yêu cầu sửa chữa', path: '/admin/repairs', icon: <Wrench className="w-5 h-5" /> },
    { label: 'Thông báo', path: '/admin/notifications', icon: <Bell className="w-5 h-5" /> },
  ];

  const studentNavItems = [
    { label: 'Trang chủ', path: '/student/dashboard', icon: <Home className="w-5 h-5" /> },
    { label: 'Đăng ký phòng', path: '/student/register-room', icon: <ClipboardList className="w-5 h-5" /> },
    { label: 'Phòng & Giường của tôi', path: '/student/room', icon: <DoorOpen className="w-5 h-5" /> },
    { label: 'Hợp đồng lưu trú', path: '/student/contracts', icon: <FileSignature className="w-5 h-5" /> },
    { label: 'Hóa đơn tiền phòng', path: '/student/invoices', icon: <Receipt className="w-5 h-5" /> },
    { label: 'Báo hỏng / Sửa chữa', path: '/student/repairs', icon: <Wrench className="w-5 h-5" /> },
    { label: 'Vi phạm của tôi', path: '/student/violations', icon: <AlertTriangle className="w-5 h-5" /> },
    { label: 'Thông báo', path: '/student/notifications', icon: <Bell className="w-5 h-5" /> },
  ];

  const items = role === 'admin' ? adminNavItems : studentNavItems;

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-screen border-r border-slate-800">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800 bg-slate-950/40">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/20">
          KTX
        </div>
        <div>
          <h1 className="text-sm font-bold text-white tracking-wide">QUẢN LÝ KTX</h1>
          <p className="text-[10px] text-slate-400 font-medium">Hệ thống nội trú KTX</p>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          {role === 'admin' ? 'Quản trị viên' : 'Cổng Sinh viên'}
        </div>
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User info & Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white uppercase">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">{user?.fullName}</p>
              <p className="text-[11px] text-slate-400 truncate">@{user?.username}</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Đăng xuất"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

