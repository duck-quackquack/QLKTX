import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { authApi } from '../../api';
import { useGoogleLogin } from '@react-oauth/google';
import { User, Lock, Building, CheckCircle2, Mail, KeyRound, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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
        // Fill the password input with the new password
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

  // Real Google Login Flow with OAuth SDK
  const handleGoogleSuccess = async (tokenResponse: any) => {
    try {
      setSocialLoading('google');
      setError('');

      // Fetch user info from Google API using access token
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
              // Get user profile from Graph API
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
        // Fallback for offline development mode
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
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 mb-4">
          <Building className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Hệ Thống Quản Lý Ký Túc Xá
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Đăng nhập bằng Tài khoản, Mã sinh viên hoặc Mạng xã hội
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-200/60">
          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              {error}
            </div>
          )}

          {/* Social Logins */}
          <div className="space-y-2.5 mb-5">
            <button
              type="button"
              onClick={() => googleLoginTrigger()}
              disabled={loading || !!socialLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition hover:border-slate-300 disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2s.7 5.5 1.9 7.9l3.7-2.9c-.2-.7-.4-1.5-.4-2.3z"
                />
                <path
                  fill="#34A853"
                  d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
                />
              </svg>
              <span>{socialLoading === 'google' ? 'Đang xác thực Google...' : 'Đăng nhập với Google'}</span>
            </button>

            <button
              type="button"
              onClick={handleFacebookLogin}
              disabled={loading || !!socialLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-blue-200 bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-semibold shadow-sm transition disabled:opacity-50"
            >
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>{socialLoading === 'facebook' ? 'Đang xác thực Facebook...' : 'Đăng nhập với Facebook'}</span>
            </button>
          </div>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2.5 text-slate-400 font-medium">
                Hoặc đăng nhập bằng tài khoản / Mã SV
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Tên đăng nhập hoặc Mã SV"
              placeholder="Nhập tên đăng nhập hoặc mã SV (ví dụ: SV2026001)..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              icon={<User className="w-4 h-4" />}
              required
            />

            <Input
              label="Mật khẩu"
              type="password"
              placeholder="Nhập mật khẩu..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
              required
            />

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center text-slate-600 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mr-1.5" />
                Ghi nhớ đăng nhập
              </label>
              <button
                type="button"
                onClick={openForgotModal}
                className="font-semibold text-indigo-600 hover:text-indigo-500 hover:underline transition"
              >
                Quên mật khẩu?
              </button>
            </div>

            <Button type="submit" className="w-full" loading={loading} size="lg">
              Đăng nhập
            </Button>
          </form>

          {/* Quick Demo Logins */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
              Tài khoản dùng thử nhanh (Demo)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'Admin@123')}
                className="px-2.5 py-2 rounded-lg bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition text-center"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('staff', 'Staff@123')}
                className="px-2.5 py-2 rounded-lg bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition text-center"
              >
                Nhân viên
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('SV2026001', 'Ktx@123456')}
                className="px-2.5 py-2 rounded-lg bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition text-center"
              >
                SV (Bằng Mã SV)
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Sinh viên chưa có tài khoản?{' '}
            <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
              Đăng ký tài khoản ngay
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


