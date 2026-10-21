import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Building, User, Lock, Mail, Phone, BookOpen, GraduationCap } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    studentCode: '',
    email: '',
    phone: '',
    gender: 'Nam',
    faculty: 'Công nghệ Thông tin',
    className: '',
    address: '',
    dateOfBirth: '2005-01-01',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData);
      navigate('/student/dashboard');
    } catch (err: any) {
      setError(err.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 mb-3">
          <Building className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Đăng Ký Tài Khoản Sinh Viên
        </h2>
        <p className="mt-1.5 text-xs text-slate-600">
          Nhập đầy đủ thông tin để tạo hồ sơ lưu trú Ký túc xá
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-8 border border-slate-200/60">
          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Mã sinh viên"
                name="studentCode"
                placeholder="VD: SV2026099"
                value={formData.studentCode}
                onChange={handleChange}
                icon={<GraduationCap className="w-4 h-4" />}
                required
              />
              <Input
                label="Họ và tên"
                name="fullName"
                placeholder="Nguyễn Văn A"
                value={formData.fullName}
                onChange={handleChange}
                icon={<User className="w-4 h-4" />}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Tên đăng nhập"
                name="username"
                placeholder="VD: sv2026099"
                value={formData.username}
                onChange={handleChange}
                required
              />
              <Input
                label="Mật khẩu"
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                icon={<Lock className="w-4 h-4" />}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                name="email"
                placeholder="student@example.com"
                value={formData.email}
                onChange={handleChange}
                icon={<Mail className="w-4 h-4" />}
                required
              />
              <Input
                label="Số điện thoại"
                name="phone"
                placeholder="0912345678"
                value={formData.phone}
                onChange={handleChange}
                icon={<Phone className="w-4 h-4" />}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Giới tính</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-slate-300 text-sm px-3.5 py-2 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>
              <Input
                label="Ngày sinh"
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Khoa / Viện</label>
                <select
                  name="faculty"
                  value={formData.faculty}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-slate-300 text-sm px-3.5 py-2 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Công nghệ Thông tin">Công nghệ Thông tin</option>
                  <option value="Kinh tế & Quản trị">Kinh tế & Quản trị</option>
                  <option value="Điện tử Viễn thông">Điện tử Viễn thông</option>
                  <option value="Ngoại ngữ">Ngoại ngữ</option>
                  <option value="Khoa học Xã hội">Khoa học Xã hội</option>
                </select>
              </div>
              <Input
                label="Lớp sinh viên"
                name="className"
                placeholder="VD: CNTT-K19A"
                value={formData.className}
                onChange={handleChange}
                icon={<BookOpen className="w-4 h-4" />}
                required
              />
            </div>

            <Input
              label="Địa chỉ quê quán"
              name="address"
              placeholder="Xã/Huyện/Tỉnh"
              value={formData.address}
              onChange={handleChange}
              required
            />

            <Button type="submit" className="w-full mt-2" loading={loading} size="lg">
              Hoàn tất đăng ký
            </Button>
          </form>

          <div className="mt-5 text-center text-xs text-slate-500">
            Đã có tài khoản?{' '}
            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

