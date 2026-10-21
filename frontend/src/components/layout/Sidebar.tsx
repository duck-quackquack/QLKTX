import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  DoorOpen,
  ClipboardList,
  FileSignature,
  Zap,
  Receipt,
  CreditCard,
  AlertTriangle,
  Wrench,
  Bell,
  Home,
  LogOut,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  UserCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Sidebar: React.FC<{ role: 'admin' | 'student' }> = ({ role }) => {
  const { logout, user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const adminNavItems = [
    { label: 'Tổng quan', path: '/admin/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Sinh viên', path: '/admin/students', icon: <Users size={18} /> },
    { label: 'Tòa nhà', path: '/admin/buildings', icon: <Building2 size={18} /> },
    { label: 'Phòng & Giường', path: '/admin/rooms', icon: <DoorOpen size={18} /> },
    { label: 'Đăng ký nội trú', path: '/admin/registrations', icon: <ClipboardList size={18} /> },
    { label: 'Hợp đồng', path: '/admin/contracts', icon: <FileSignature size={18} /> },
    { label: 'Điện nước', path: '/admin/meter-readings', icon: <Zap size={18} /> },
    { label: 'Hóa đơn', path: '/admin/invoices', icon: <Receipt size={18} /> },
    { label: 'Thanh toán', path: '/admin/payments', icon: <CreditCard size={18} /> },
    { label: 'Yêu cầu sửa chữa', path: '/admin/repairs', icon: <Wrench size={18} /> },
    { label: 'Vi phạm & Kỷ luật', path: '/admin/violations', icon: <AlertTriangle size={18} /> },
    { label: 'Thông báo', path: '/admin/notifications', icon: <Bell size={18} /> },
  ];

  const studentNavItems = [
    { label: 'Trang chủ', path: '/student/dashboard', icon: <Home size={18} /> },
    { label: 'Đăng ký phòng', path: '/student/register-room', icon: <ClipboardList size={18} /> },
    { label: 'Phòng & Giường', path: '/student/room', icon: <DoorOpen size={18} /> },
    { label: 'Hợp đồng của tôi', path: '/student/contracts', icon: <FileSignature size={18} /> },
    { label: 'Hóa đơn tiền phòng', path: '/student/invoices', icon: <Receipt size={18} /> },
    { label: 'Báo hỏng thiết bị', path: '/student/repairs', icon: <Wrench size={18} /> },
    { label: 'Vi phạm của tôi', path: '/student/violations', icon: <AlertTriangle size={18} /> },
    { label: 'Thông báo', path: '/student/notifications', icon: <Bell size={18} /> },
  ];

  const items = role === 'admin' ? adminNavItems : studentNavItems;
  const roleName = role === 'admin' ? 'Quản trị viên' : 'Sinh viên KTX';

  return (
    <aside
      className="h-screen sticky top-0 z-40 flex flex-col transition-all duration-200 bg-slate-900 border-r border-slate-800 shrink-0 select-none"
      style={{ width: collapsed ? 72 : 256 }}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80 bg-slate-950/40 shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
              <GraduationCap size={20} />
            </div>
            <div className="truncate">
              <p className="text-white text-sm font-bold tracking-wide">QLKTX</p>
              <p className="text-slate-400 text-[10px] truncate">Hệ thống Quản lý Ký túc xá</p>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-md shadow-blue-500/20">
            <GraduationCap size={20} />
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ${
            collapsed ? 'hidden' : ''
          }`}
          title="Thu gọn sidebar"
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="mx-auto mt-2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="Mở rộng sidebar"
        >
          <ChevronRight size={16} />
        </button>
      )}

      {/* Role Tag */}
      {!collapsed && (
        <div className="px-5 pt-4 pb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/50">
            {roleName}
          </span>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 font-semibold'
                  : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-100'
              }`
            }
          >
            <span className="shrink-0">{item.icon}</span>
            {!collapsed && <span className="truncate">{item.label}</span>}
            {collapsed && (
              <div className="absolute left-full ml-2 px-2.5 py-1 bg-slate-800 text-white text-xs rounded-md shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-slate-700">
                {item.label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Profile & Logout */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/30">
        <NavLink
          to={role === 'admin' ? '/admin/profile' : '/student/profile'}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition ${
              isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`
          }
          title={collapsed ? 'Hồ sơ cá nhân' : undefined}
        >
          <UserCircle size={18} className="shrink-0" />
          {!collapsed && (
            <div className="truncate flex-1">
              <p className="text-xs font-semibold text-white truncate">{user?.fullName || user?.username}</p>
              <p className="text-[10px] text-slate-400 truncate">Hồ sơ cá nhân</p>
            </div>
          )}
        </NavLink>

        <button
          onClick={logout}
          className="w-full mt-1 flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors text-sm"
          title={collapsed ? 'Đăng xuất' : undefined}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Đăng xuất</span>}
        </button>
      </div>
    </aside>
  );
};
