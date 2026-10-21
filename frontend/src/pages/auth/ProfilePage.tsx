import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { authApi } from '../../api';
import {
  User,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  Check,
  ArrowLeft,
  Camera,
  Save,
  Bell,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const { user, updateCurrentUser } = useAuth();
  const [tab, setTab] = useState<'profile' | 'password' | 'notifications'>('profile');

  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatarUrl: user?.avatarUrl || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordErr, setPasswordErr] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPass, setLoadingPass] = useState(false);

  // Notification settings state
  const [notifSettings, setNotifSettings] = useState([
    { id: 'inv', label: 'Hóa đơn mới', desc: 'Nhận thông báo khi có hóa đơn mới phát sinh', on: true },
    { id: 'remind', label: 'Nhắc nhở thanh toán', desc: 'Nhắc trước hạn thanh toán hóa đơn 3 ngày', on: true },
    { id: 'reg', label: 'Đơn đăng ký nội trú', desc: 'Cập nhật trạng thái đơn đăng ký nội trú', on: true },
    { id: 'rep', label: 'Yêu cầu sửa chữa', desc: 'Cập nhật tiến độ xử lý sửa chữa thiết bị', on: true },
    { id: 'gen', label: 'Thông báo chung', desc: 'Thông báo sự kiện & lịch từ ban quản lý ký túc xá', on: true },
  ]);

  const toggleNotif = (id: string) => {
    setNotifSettings((prev) =>
      prev.map((item) => (item.id === id ? { ...item, on: !item.on } : item))
    );
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileErr('');
    setLoadingProfile(true);

    try {
      const res = await authApi.updateProfile(profileForm);
      if (res.success) {
        updateCurrentUser(res.data);
        setProfileMsg('Cập nhật thông tin cá nhân thành công!');
      }
    } catch (err: any) {
      setProfileErr(err.message || 'Cập nhật thất bại.');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordErr('');

    if (passwordForm.newPassword.length < 6) {
      setPasswordErr('Mật khẩu mới phải có tối thiểu 6 ký tự.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordErr('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoadingPass(true);
    try {
      const res = await authApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      if (res.success) {
        setPasswordMsg('Đổi mật khẩu thành công!');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err: any) {
      setPasswordErr(err.message || 'Đổi mật khẩu thất bại.');
    } finally {
      setLoadingPass(false);
    }
  };

  const roleLabel =
    user?.role === 1 ? 'Quản trị viên' : user?.role === 2 ? 'Nhân viên' : 'Sinh viên';

  return (
    <div className="flex-1 pb-12 bg-slate-50 min-h-screen">
      <Header
        title="Hồ sơ cá nhân"
        subtitle="Quản lý thông tin và cài đặt tài khoản"
      />

      <div className="max-w-5xl mx-auto px-6 mt-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200">
          {[
            { id: 'profile', label: 'Thông tin cá nhân' },
            { id: 'password', label: 'Đổi mật khẩu' },
            { id: 'notifications', label: 'Cài đặt thông báo' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as typeof tab)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                tab === t.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Avatar & Summary Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-center gap-3 text-center">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                    {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                  </div>
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 w-7 h-7 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm hover:bg-slate-50"
                  >
                    <Camera size={13} className="text-slate-500" />
                  </button>
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-base">{user?.fullName || user?.username}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{user?.email || `@${user?.username}`}</p>
                  <span className="mt-2 inline-block text-xs px-2.5 py-0.5 bg-blue-50 text-blue-600 rounded-md font-medium border border-blue-100">
                    {roleLabel}
                  </span>
                  {user?.studentCode && (
                    <p className="text-xs text-slate-500 mt-1.5 font-mono">MSSV: {user.studentCode}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">Thông tin cơ bản</h3>

              {profileMsg && (
                <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-xs font-semibold text-green-700 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-600" />
                  {profileMsg}
                </div>
              )}
              {profileErr && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
                  <AlertCircle size={16} className="text-red-600" />
                  {profileErr}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Họ và tên"
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                    required
                  />
                  <Input
                    label="Tên đăng nhập"
                    value={user?.username || ''}
                    disabled
                    className="bg-slate-50 text-slate-500"
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    icon={<Mail className="w-4 h-4 text-slate-400" />}
                    required
                  />
                  <Input
                    label="Số điện thoại"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    icon={<Phone className="w-4 h-4 text-slate-400" />}
                    placeholder="0901 234 567"
                  />
                  <Input
                    label="Vai trò"
                    value={roleLabel}
                    disabled
                    className="bg-slate-50 text-slate-500"
                  />
                  {user?.studentCode && (
                    <Input
                      label="Mã số sinh viên"
                      value={user.studentCode}
                      disabled
                      className="bg-slate-50 text-slate-500"
                    />
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" loading={loadingProfile} icon={<Save size={15} />}>
                    Lưu thay đổi
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {tab === 'password' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-lg">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Đổi mật khẩu</h3>

            {passwordMsg && (
              <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-xs font-semibold text-green-700 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-600" />
                {passwordMsg}
              </div>
            )}
            {passwordErr && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
                <AlertCircle size={16} className="text-red-600" />
                {passwordErr}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <Input
                label="Mật khẩu hiện tại"
                type="password"
                placeholder="••••••••"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                required
              />
              <Input
                label="Mật khẩu mới"
                type="password"
                placeholder="••••••••"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                helperText="Tối thiểu 6 ký tự"
                required
              />
              <Input
                label="Xác nhận mật khẩu mới"
                type="password"
                placeholder="••••••••"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                required
              />
              <div className="pt-2">
                <Button type="submit" loading={loadingPass}>
                  Cập nhật mật khẩu
                </Button>
              </div>
            </form>
          </div>
        )}

        {tab === 'notifications' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-2xl">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Cài đặt thông báo</h3>
            <div className="divide-y divide-slate-100">
              {notifSettings.map((item) => (
                <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{item.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.on}
                      onChange={() => toggleNotif(item.id)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
