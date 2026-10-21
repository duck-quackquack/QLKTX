import React, { useState, useEffect } from 'react';
import { Bell, Search, User as UserIcon, LogOut, ChevronDown, UserCircle, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { notificationApi } from '../../api';
import { Link, useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: { label: string; path?: string }[];
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, breadcrumb }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [keyword, setKeyword] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
  }, []);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && keyword.trim()) {
      if (user?.role === 3) {
        navigate(`/student/notifications`);
      } else {
        navigate(`/admin/students?search=${encodeURIComponent(keyword.trim())}`);
      }
    }
  };

  const profilePath = user?.role === 3 ? '/student/profile' : '/admin/profile';
  const roleLabel = user?.role === 1 ? 'Quản trị viên' : user?.role === 2 ? 'Nhân viên KTX' : 'Sinh viên';

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Title & Breadcrumb */}
      <div>
        {breadcrumb && breadcrumb.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-0.5">
            {breadcrumb.map((b, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span>/</span>}
                {b.path ? (
                  <Link to={b.path} className="hover:text-blue-600 transition">
                    {b.label}
                  </Link>
                ) : (
                  <span className="text-slate-600 font-medium">{b.label}</span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
        <h2 className="text-lg font-bold text-slate-900 leading-tight">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3.5">
        {/* Quick Search */}
        <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600 w-56 lg:w-64 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 focus-within:bg-white transition-all">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Tìm kiếm nhanh... (Enter)"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleSearch}
            className="bg-transparent border-none outline-none text-xs w-full text-slate-800 placeholder:text-slate-400"
          />
        </div>

        {/* Notification Bell */}
        <Link
          to={user?.role === 3 ? '/student/notifications' : '/admin/notifications'}
          className="relative w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition"
          title="Thông báo"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        {/* User Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
              {user?.fullName?.charAt(0) || <UserIcon className="w-3.5 h-3.5" />}
            </div>
            <div className="hidden sm:block text-left max-w-[120px]">
              <p className="text-xs font-semibold text-slate-800 leading-tight truncate">{user?.fullName || user?.username}</p>
              <p className="text-[10px] text-slate-400 leading-tight">{roleLabel}</p>
            </div>
            <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1.5 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3.5 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-800 truncate">{user?.fullName || user?.username}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email || `@${user?.username}`}</p>
                </div>
                <Link
                  to={profilePath}
                  onClick={() => setDropdownOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
                >
                  <UserCircle size={15} /> Hồ sơ cá nhân
                </Link>
                <div className="border-t border-slate-100 mt-1 pt-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 transition"
                  >
                    <LogOut size={15} /> Đăng xuất
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
