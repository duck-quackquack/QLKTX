import React, { useState, useEffect } from 'react';
import { Bell, Search, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { notificationApi } from '../../api';
import { Link, useNavigate } from 'react-router-dom';

export const Header: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [keyword, setKeyword] = useState('');

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

  const profileLink = user?.role === 3 ? '/student/profile' : '/admin/profile';

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm/50">
      <div>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Quick Search */}
        <div className="hidden md:flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-1.5 text-xs text-slate-600 w-56 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:bg-white border border-transparent focus-within:border-indigo-300 transition">
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
          className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition"
          title="Thông báo"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        {/* User Profile dropdown shortcut */}
        <Link
          to={profileLink}
          className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition"
          title="Xem trang cá nhân"
        >
          <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
            <UserIcon className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-slate-700 max-w-[120px] truncate">
            {user?.fullName || user?.username}
          </span>
        </Link>
      </div>
    </header>
  );
};
