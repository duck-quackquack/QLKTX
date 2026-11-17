import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { notificationApi } from '../../api';
import {
  GraduationCap,
  LayoutDashboard,
  BedDouble,
  DoorOpen,
  FileText,
  CreditCard,
  Wrench,
  AlertTriangle,
  Bell,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Menu,
  X,
  QrCode,
  ShieldCheck,
} from 'lucide-react';

export const StudentHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await notificationApi.getUnreadCount();
        if (res.success) {
          setUnreadCount(res.data);
        }
      } catch (err) {
        // ignore
      }
    };
    fetchUnread();
  }, [location.pathname]);

  const navItems = [
    { label: 'Trang chủ', path: '/student/dashboard', icon: LayoutDashboard },
    { label: 'Đăng ký phòng', path: '/student/register-room', icon: BedDouble },
    { label: 'Phòng ở', path: '/student/room', icon: DoorOpen },
    { label: 'Hợp đồng', path: '/student/contracts', icon: FileText },
    { label: 'Hóa đơn & Thanh toán', shortLabel: 'Thanh toán', path: '/student/invoices', icon: CreditCard },
    { label: 'Báo hỏng', path: '/student/repairs', icon: Wrench },
    { label: 'Vi phạm', path: '/student/violations', icon: AlertTriangle },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Top Navbar Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Portal Title */}
            <div className="flex items-center gap-3 shrink-0">
              <Link to="/student/dashboard" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">
                      QLKTX
                    </span>
                    <span className="px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200/60 uppercase">
                      Sinh Viên
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium hidden 2xl:block">
                    Cổng Đời Sống Ký Túc Xá
                  </p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 shrink-0">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 xl:px-3 xl:py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span className="whitespace-nowrap">
                      {item.shortLabel ? (
                        <>
                          <span className="hidden xl:inline">{item.label}</span>
                          <span className="inline xl:hidden">{item.shortLabel}</span>
                        </>
                      ) : (
                        item.label
                      )}
                    </span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Right Controls (Notification + User Profile) */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Notification Bell */}
              <Link
                to="/student/notifications"
                className="relative w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200/80 text-slate-600 hover:text-blue-600 hover:bg-blue-50/60 transition-all shadow-2xs"
                title="Thông báo của bạn"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-xs animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200/80 hover:bg-slate-50 transition-all text-left shadow-2xs"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                    {user?.fullName?.split(' ').pop()?.charAt(0) || user?.username?.charAt(0) || 'S'}
                  </div>
                  <div className="hidden md:block max-w-[130px]">
                    <p className="text-xs font-bold text-slate-800 truncate leading-tight">
                      {user?.fullName || user?.username}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono truncate leading-tight">
                      {user?.studentCode || 'Sinh viên'}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-2 animate-in fade-in zoom-in-95 duration-150">
                      {/* User Header in Dropdown */}
                      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                          {user?.fullName?.split(' ').pop()?.charAt(0) || 'S'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {user?.fullName || user?.username}
                          </p>
                          <p className="text-[11px] text-blue-600 font-mono font-medium truncate">
                            {user?.studentCode ? `MSSV: ${user.studentCode}` : 'Sinh viên'}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">
                            {user?.email}
                          </p>
                        </div>
                      </div>

                      {/* Dropdown Links */}
                      <div className="py-1">
                        <Link
                          to="/student/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50/70 hover:text-blue-600 transition"
                        >
                          <UserIcon className="w-4 h-4 text-slate-400" />
                          <span>Hồ sơ & Đổi mật khẩu</span>
                        </Link>
                        <Link
                          to="/student/notifications"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center justify-between px-4 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50/70 hover:text-blue-600 transition"
                        >
                          <div className="flex items-center gap-2.5">
                            <Bell className="w-4 h-4 text-slate-400" />
                            <span>Thông báo Ký túc xá</span>
                          </div>
                          {unreadCount > 0 && (
                            <span className="px-1.5 py-0.2 bg-rose-100 text-rose-700 text-[10px] font-bold rounded-full">
                              {unreadCount} mới
                            </span>
                          )}
                        </Link>
                      </div>

                      <div className="pt-1 border-t border-slate-100">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50/80 transition"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Đăng xuất tài khoản</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Mobile Hamburger Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
                title="Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-1 animate-in slide-in-from-top-2 duration-150">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation Bar (Floating quick tabs for mobile) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
        <Link
          to="/student/dashboard"
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[10px] font-medium transition ${
            location.pathname === '/student/dashboard' ? 'text-blue-600 font-bold' : 'text-slate-500'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Trang chủ</span>
        </Link>
        <Link
          to="/student/room"
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[10px] font-medium transition ${
            location.pathname === '/student/room' ? 'text-blue-600 font-bold' : 'text-slate-500'
          }`}
        >
          <DoorOpen className="w-5 h-5" />
          <span>Phòng ở</span>
        </Link>
        <Link
          to="/student/invoices"
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[10px] font-medium transition ${
            location.pathname === '/student/invoices' ? 'text-blue-600 font-bold' : 'text-slate-500'
          }`}
        >
          <CreditCard className="w-5 h-5" />
          <span>Hóa đơn</span>
        </Link>
        <Link
          to="/student/repairs"
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[10px] font-medium transition ${
            location.pathname === '/student/repairs' ? 'text-blue-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Wrench className="w-5 h-5" />
          <span>Báo hỏng</span>
        </Link>
        <Link
          to="/student/profile"
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[10px] font-medium transition ${
            location.pathname === '/student/profile' ? 'text-blue-600 font-bold' : 'text-slate-500'
          }`}
        >
          <UserIcon className="w-5 h-5" />
          <span>Cá nhân</span>
        </Link>
      </nav>
    </>
  );
};
