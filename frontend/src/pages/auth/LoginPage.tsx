import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { authApi } from '../../api';
import { useGoogleLogin } from '@react-oauth/google';
import {
  User,
  Lock,
  GraduationCap,
  Building2,
  ClipboardList,
  CreditCard,
  Wrench,
  CheckCircle2,
  Mail,
  KeyRound,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot password modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotInput, setForgotInput] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login({ username, password });
      if (res.user.role === 1 || res.user.role === 2) {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Tên đăng nhập hoặc mật khẩu không đúng');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  const openForgotModal = (e: React.MouseEvent) => {
    e.preventDefault();
    setForgotInput(username);
    setForgotEmail('');
    setForgotNewPassword('');
    setForgotConfirmPassword('');
    setForgotError('');
    setForgotSuccess('');
    setIsForgotModalOpen(true);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (!forgotInput.trim() || !forgotEmail.trim() || !forgotNewPassword) {
      setForgotError('Vui lòng điền đầy đủ các thông tin yêu cầu.');
      return;
    }

    if (forgotNewPassword.length < 6) {
      setForgotError('Mật khẩu mới phải có tối thiểu 6 ký tự.');
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('Xác nhận mật khẩu mới không khớp.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await authApi.resetPassword({
        usernameOrStudentCode: forgotInput.trim(),
        email: forgotEmail.trim(),
        newPassword: forgotNewPassword,
      });

      if (res.success) {
        setForgotSuccess(res.message || 'Đặt lại mật khẩu thành công! Bạn có thể đóng cửa sổ và đăng nhập ngay.');
        setPassword(forgotNewPassword);
        setUsername(forgotInput.trim());
      }
    } catch (err: any) {
      setForgotError(err.message || 'Không thể đặt lại mật khẩu. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setForgotLoading(false);
    }
  };

  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  // Google Login
  const handleGoogleSuccess = async (tokenResponse: any) => {
    try {
      setSocialLoading('google');
      setError('');

      const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      });

      if (!userInfoRes.ok) {
        throw new Error('Không thể lấy thông tin từ tài khoản Google.');
      }

      const googleUser = await userInfoRes.json();

      const authRes = await authApi.socialLogin({
        provider: 'google',
        email: googleUser.email,
        name: googleUser.name || googleUser.email.split('@')[0],
        avatarUrl: googleUser.picture || null,
        providerId: googleUser.sub,
      });

      if (authRes.success && authRes.data) {
        localStorage.setItem('token', authRes.data.token);
        localStorage.setItem('user', JSON.stringify(authRes.data.user));
        if (authRes.data.user.role === 1 || authRes.data.user.role === 2) {
          navigate('/admin/dashboard');
        } else {
          navigate('/student/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Đăng nhập bằng Google thất bại.');
    } finally {
      setSocialLoading(null);
    }
  };

  const googleLoginTrigger = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => {
      setError('Đăng nhập bằng Google đã bị hủy hoặc gặp lỗi.');
      setSocialLoading(null);
    },
  });

  const handleFacebookLogin = async () => {
    setError('');
    setSocialLoading('facebook');

    try {
      if (typeof window !== 'undefined' && (window as any).FB) {
        (window as any).FB.login(
          (response: any) => {
            if (response.authResponse) {
              (window as any).FB.api('/me', { fields: 'name, email, picture' }, async (userData: any) => {
                try {
                  const fbEmail = userData.email || `${userData.id}@facebook.user`;
                  const fbName = userData.name || 'Người dùng Facebook';
                  const fbAvatar = userData.picture?.data?.url || null;

                  const authRes = await authApi.socialLogin({
                    provider: 'facebook',
                    email: fbEmail,
                    name: fbName,
                    avatarUrl: fbAvatar,
                    providerId: userData.id,
                  });

                  if (authRes.success && authRes.data) {
                    localStorage.setItem('token', authRes.data.token);
                    localStorage.setItem('user', JSON.stringify(authRes.data.user));
                    if (authRes.data.user.role === 1 || authRes.data.user.role === 2) {
                      navigate('/admin/dashboard');
                    } else {
                      navigate('/student/dashboard');
                    }
                  }
                } catch (apiErr: any) {
                  setError(apiErr.message || 'Lỗi khi lưu thông tin đăng nhập Facebook.');
                } finally {
                  setSocialLoading(null);
                }
              });
            } else {
              setError('Đăng nhập bằng Facebook đã bị hủy hoặc chưa hoàn tất.');
              setSocialLoading(null);
            }
          },
          { scope: 'public_profile,email' }
        );
      } else {
        const mockOAuthData = {
          provider: 'facebook',
          email: 'sinhvien.fb@kytucxa.edu.vn',
          name: 'Sinh Viên Facebook OAuth',
          avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
          providerId: 'fb_1353686059900909',
        };

        const authRes = await authApi.socialLogin(mockOAuthData);
        if (authRes.success && authRes.data) {
          localStorage.setItem('token', authRes.data.token);
          localStorage.setItem('user', JSON.stringify(authRes.data.user));
          if (authRes.data.user.role === 1 || authRes.data.user.role === 2) {
            navigate('/admin/dashboard');
          } else {
            navigate('/student/dashboard');
          }
        }
        setSocialLoading(null);
      }
    } catch (err: any) {
      setError(err.message || 'Đăng nhập qua Facebook thất bại.');
      setSocialLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 bg-gradient-to-br from-blue-700 to-blue-900 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 50%, white 1px, transparent 1px), radial-gradient(circle at 70% 20%, white 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <GraduationCap size={22} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-tight">QLKTX</p>
              <p className="text-blue-200 text-xs">Hệ thống Quản lý Ký túc xá</p>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4 leading-snug">
            Quản lý ký túc xá<br />thông minh, hiệu quả
          </h1>
          <p className="text-blue-200 text-sm leading-relaxed max-w-sm">
            Hệ thống quản lý toàn diện cho sinh viên, nhân viên và ban quản trị ký túc xá đại học.
          </p>
        </div>

        {/* Feature highlights */}
        <div className="relative grid grid-cols-2 gap-4">
          {[
            { icon: "🏢", label: "Quản lý tòa nhà & phòng ở" },
            { icon: "📋", label: "Đăng ký nội trú trực tuyến" },
            { icon: "💳", label: "Thanh toán hóa đơn" },
            { icon: "🔧", label: "Báo hỏng & sửa chữa" },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-2 bg-white/10 rounded-xl p-3">
              <span className="text-xl">{f.icon}</span>
              <span className="text-white/80 text-xs font-medium">{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <GraduationCap size={18} className="text-white" />
            </div>
            <span className="font-bold text-slate-800">QLKTX</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-1">Đăng nhập</h2>
          <p className="text-sm text-slate-500 mb-8">Nhập thông tin tài khoản để tiếp tục</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700 flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Tên đăng nhập / MSSV</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tên đăng nhập hoặc MSSV"
                  className="w-full pl-10 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors bg-white"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Mật khẩu</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors bg-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="text-sm text-slate-600">Ghi nhớ đăng nhập</span>
              </label>
              <button
                type="button"
                onClick={openForgotModal}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Quên mật khẩu?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors mt-2 disabled:opacity-50 shadow-xs"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400">Hoặc</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => googleLoginTrigger()}
                disabled={loading || !!socialLoading}
                className="flex items-center justify-center gap-2 px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors bg-white"
              >
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {socialLoading === "google" ? "Google..." : "Google"}
              </button>
              <button
                type="button"
                onClick={handleFacebookLogin}
                disabled={loading || !!socialLoading}
                className="flex items-center justify-center gap-2 px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors bg-white"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                {socialLoading === "facebook" ? "Facebook..." : "Facebook"}
              </button>
            </div>
          </form>

          {/* Demo accounts */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <p className="text-xs font-semibold text-blue-700 mb-3">Tài khoản demo</p>
            <div className="flex flex-col gap-2">
              {[
                { label: "Quản trị viên", user: "admin", pass: "Admin@123", color: "bg-blue-100 text-blue-700" },
                { label: "Nhân viên", user: "staff", pass: "Staff@123", color: "bg-indigo-100 text-indigo-700" },
                { label: "Sinh viên", user: "sv2026001", pass: "Ktx@123456", color: "bg-green-100 text-green-700" },
              ].map((d, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleQuickLogin(d.user, d.pass)}
                  className="flex items-center justify-between px-3 py-2 bg-white border border-blue-100 rounded-lg hover:border-blue-300 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${d.color}`}>{d.label}</span>
                    <span className="text-xs text-slate-500 font-mono">{d.user}</span>
                  </div>
                  <span className="text-xs text-blue-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Điền nhanh &rarr;
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Chưa có tài khoản sinh viên?{" "}
            <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">
              Đăng ký tài khoản
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot / Reset Password Modal */}
      <Modal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        title="Khôi phục & Đặt lại mật khẩu"
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            Vui lòng nhập <strong className="text-slate-700">Tên đăng nhập hoặc Mã sinh viên</strong> cùng với <strong className="text-slate-700">Email đã đăng ký</strong> để thiết lập mật khẩu mới.
          </p>

          {forgotError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <span>{forgotError}</span>
            </div>
          )}

          {forgotSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-700 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>{forgotSuccess}</span>
            </div>
          )}

          {!forgotSuccess ? (
            <form onSubmit={handleResetPassword} className="space-y-3.5 pt-1">
              <Input
                label="Tên đăng nhập / Mã sinh viên"
                placeholder="Ví dụ: sv2026001 hoặc admin..."
                value={forgotInput}
                onChange={(e) => setForgotInput(e.target.value)}
                icon={<User className="w-4 h-4" />}
                required
              />

              <Input
                label="Email đăng ký"
                type="email"
                placeholder="Ví dụ: student1@kytucxa.edu.vn..."
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                icon={<Mail className="w-4 h-4" />}
                required
              />

              <Input
                label="Mật khẩu mới (tối thiểu 6 ký tự)"
                type="password"
                placeholder="Nhập mật khẩu mới..."
                value={forgotNewPassword}
                onChange={(e) => setForgotNewPassword(e.target.value)}
                icon={<KeyRound className="w-4 h-4" />}
                required
              />

              <Input
                label="Xác nhận mật khẩu mới"
                type="password"
                placeholder="Nhập lại mật khẩu mới..."
                value={forgotConfirmPassword}
                onChange={(e) => setForgotConfirmPassword(e.target.value)}
                icon={<Lock className="w-4 h-4" />}
                required
              />

              <div className="flex items-center justify-end gap-2 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setIsForgotModalOpen(false)}
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  size="md"
                  loading={forgotLoading}
                >
                  Đặt lại mật khẩu
                </Button>
              </div>
            </form>
          ) : (
            <div className="pt-2 flex justify-end">
              <Button
                type="button"
                size="md"
                onClick={() => setIsForgotModalOpen(false)}
              >
                Đăng nhập ngay
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
