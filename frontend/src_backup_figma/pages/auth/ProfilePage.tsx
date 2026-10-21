import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { authApi } from '../../api';
import { User, Lock, Mail, Phone, ShieldCheck, Check, ArrowLeft, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const { user, updateCurrentUser } = useAuth();

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

  const homePath = user?.role === 3 ? '/student/dashboard' : '/admin/dashboard';
  const homeTitle = user?.role === 3 ? 'Trang chủ Sinh viên' : 'Bảng điều khiển Quản trị';

  return (
    <div className="flex-1 pb-12">
      <Header title="Hồ Sơ Cá Nhân" subtitle="Quản lý thông tin tài khoản và đổi mật khẩu" />

      <div className="max-w-4xl mx-auto px-6 mt-6 space-y-6">
        {/* Navigation & Back button */}
        <div className="flex items-center justify-between">
          <Link
            to={homePath}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-sm border border-slate-200 shadow-sm transition"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-600" />
            <span>Quay về {homeTitle}</span>
          </Link>

          <Link
            to={homePath}
            className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Trang chủ</span>
          </Link>
        </div>

        {/* User Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-3xl font-extrabold shadow-lg shadow-indigo-500/30">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div className="text-center sm:text-left flex-1">
            <h3 className="text-xl font-bold text-slate-900">{user?.fullName}</h3>
            <p className="text-sm text-slate-500">@{user?.username} &bull; {user?.email}</p>
            <div className="mt-2 flex items-center justify-center sm:justify-start gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                {user?.role === 1 ? 'Quản trị viên (Admin)' : user?.role === 2 ? 'Nhân viên KTX' : 'Sinh viên'}
              </span>
              {user?.studentCode && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  Mã SV: {user.studentCode}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Edit Profile Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h4 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600" />
              Thông tin liên hệ
            </h4>

            {profileMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                {profileMsg}
              </div>
            )}
            {profileErr && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                {profileErr}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <Input
                label="Họ và tên"
                value={profileForm.fullName}
                onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                required
              />
              <Input
                label="Email"
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                icon={<Mail className="w-4 h-4" />}
                required
              />
              <Input
                label="Số điện thoại"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                icon={<Phone className="w-4 h-4" />}
              />
              <Button type="submit" loading={loadingProfile} className="w-full">
                Lưu thay đổi
              </Button>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h4 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-600" />
              Đổi mật khẩu
            </h4>

            {passwordMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                {passwordMsg}
              </div>
            )}
            {passwordErr && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                {passwordErr}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <Input
                label="Mật khẩu hiện tại"
                type="password"
                placeholder="Nhập mật khẩu đang dùng"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                required
              />
              <Input
                label="Mật khẩu mới"
                type="password"
                placeholder="Ít nhất 6 ký tự"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                required
              />
              <Input
                label="Xác nhận mật khẩu mới"
                type="password"
                placeholder="Nhập lại mật khẩu mới"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                required
              />
              <Button type="submit" variant="secondary" loading={loadingPass} className="w-full">
                Cập nhật mật khẩu
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
