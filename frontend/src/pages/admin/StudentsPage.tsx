import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal, ConfirmDialog } from '../../components/common/Modal';
import { Badge, statusBadge } from '../../components/common/Badge';
import { studentApi } from '../../api';
import { Student } from '../../types';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Download,
  Filter,
  UserCheck,
  UserX
} from 'lucide-react';

export const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [facultyFilter, setFacultyFilter] = useState('');
  const [stayingFilter, setStayingFilter] = useState<string>('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [createForm, setCreateForm] = useState({
    studentCode: '',
    fullName: '',
    dateOfBirth: '2004-01-01',
    gender: 'Nam',
    phone: '',
    email: '',
    address: '',
    faculty: 'Công nghệ Thông tin',
    className: '',
    citizenId: '',
    createAccount: true,
  });

  const [formErr, setFormErr] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await studentApi.getAll({
        page,
        pageSize: 10,
        searchTerm,
        faculty: facultyFilter || undefined,
        isStaying: stayingFilter === 'true' ? true : stayingFilter === 'false' ? false : undefined,
      });
      if (res.success) {
        setStudents(res.data.items);
        setTotalPages(res.data.totalPages);
        setTotalItems(res.data.totalItems);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, facultyFilter, stayingFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErr('');
    setActionLoading(true);

    try {
      const res = await studentApi.create(createForm);
      if (res.success) {
        setIsCreateOpen(false);
        setCreateForm({
          studentCode: '',
          fullName: '',
          dateOfBirth: '2004-01-01',
          gender: 'Nam',
          phone: '',
          email: '',
          address: '',
          faculty: 'Công nghệ Thông tin',
          className: '',
          citizenId: '',
          createAccount: true,
        });
        fetchStudents();
      }
    } catch (err: any) {
      setFormErr(err.message || 'Thêm sinh viên thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setFormErr('');
    setActionLoading(true);

    try {
      const res = await studentApi.update(selectedStudent.id, {
        fullName: selectedStudent.fullName,
        dateOfBirth: selectedStudent.dateOfBirth,
        gender: selectedStudent.gender,
        phone: selectedStudent.phone,
        email: selectedStudent.email,
        address: selectedStudent.address,
        faculty: selectedStudent.faculty,
        className: selectedStudent.className,
        citizenId: selectedStudent.citizenId,
      });
      if (res.success) {
        setIsEditOpen(false);
        fetchStudents();
      }
    } catch (err: any) {
      setFormErr(err.message || 'Cập nhật thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedStudent) return;
    try {
      await studentApi.delete(selectedStudent.id);
      fetchStudents();
    } catch (err: any) {
      alert(err.message || 'Không thể xóa sinh viên');
    }
  };

  return (
    <div className="flex-1 pb-12 bg-slate-50 min-h-screen">
      <Header
        title="Quản lý Sinh viên"
        subtitle={`Tổng: ${totalItems} sinh viên trong hệ thống`}
      />

      <div className="max-w-7xl mx-auto px-6 mt-6 flex flex-col gap-5">
        {/* Page Top Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Quản lý Sinh viên</h1>
            <p className="text-sm text-slate-500 mt-0.5">Tổng cộng {totalItems} sinh viên đăng ký nội trú</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              icon={<Download size={14} />}
              onClick={() => alert('Xuất danh sách sinh viên ra file Excel thành công!')}
            >
              Xuất Excel
            </Button>
            <Button icon={<Plus size={15} />} onClick={() => setIsCreateOpen(true)}>
              Thêm sinh viên
            </Button>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          {/* Search & Filter bar */}
          <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-slate-100">
            <form onSubmit={handleSearchSubmit} className="relative w-64">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm MSSV hoặc họ tên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg outline-none bg-white text-slate-800 placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors"
              />
            </form>

            <select
              value={facultyFilter}
              onChange={(e) => {
                setFacultyFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg outline-none bg-white text-slate-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Tất cả khoa</option>
              <option value="Công nghệ Thông tin">Công nghệ Thông tin</option>
              <option value="Kinh tế & Quản trị">Kinh tế & Quản trị</option>
              <option value="Điện tử Viễn thông">Điện tử Viễn thông</option>
              <option value="Ngoại ngữ">Ngoại ngữ</option>
            </select>

            <select
              value={stayingFilter}
              onChange={(e) => {
                setStayingFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg outline-none bg-white text-slate-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="true">Đang nội trú</option>
              <option value="false">Chưa xếp phòng</option>
            </select>

            <span className="ml-auto text-xs text-slate-400">{students.length} / {totalItems} kết quả</span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr className="border-b border-slate-100">
                  {['', 'MSSV', 'Họ tên', 'Khoa', 'Lớp', 'Phòng', 'Giường', 'Số điện thoại', 'Trạng thái', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="pl-4 py-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-700 text-xs font-bold shrink-0">
                        {s.fullName?.split(' ').pop()?.charAt(0) || 'S'}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-600">{s.studentCode}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-800 whitespace-nowrap">
                      {s.fullName}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">{s.faculty}</td>
                    <td className="px-4 py-3 text-sm text-slate-500 font-mono">{s.className}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-700">
                      {s.currentRoomNumber ? `P.${s.currentRoomNumber}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {s.currentBedNumber ? `G.${s.currentBedNumber}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-slate-500">{s.phone}</td>
                    <td className="px-4 py-3">
                      <Badge variant={s.isStaying ? 'success' : 'default'}>
                        {s.isStaying ? 'Đang nội trú' : 'Chưa xếp phòng'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setSelectedStudent(s);
                            setIsDetailOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStudent(s);
                            setIsEditOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          title="Sửa"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStudent(s);
                            setShowDelete(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Xóa"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && !loading && (
                  <tr>
                    <td colSpan={10} className="text-center py-10 text-xs text-slate-400">
                      Không tìm thấy sinh viên nào phù hợp với điều kiện tìm kiếm.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 text-xs text-slate-400">
            <span>Hiển thị trang {page} / {totalPages || 1} ({totalItems} sinh viên)</span>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
              >
                ‹
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`px-2.5 py-1 rounded border ${
                    n === page
                      ? 'border-blue-600 bg-blue-600 text-white font-medium'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Thêm Sinh Viên */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Thêm sinh viên mới" size="lg">
        {formErr && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
            {formErr}
          </div>
        )}
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Mã sinh viên"
              placeholder="VD: SV2026010"
              value={createForm.studentCode}
              onChange={(e) => setCreateForm({ ...createForm, studentCode: e.target.value })}
              required
            />
            <Input
              label="Họ và tên"
              placeholder="Nguyễn Văn A"
              value={createForm.fullName}
              onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Giới tính</label>
              <select
                value={createForm.gender}
                onChange={(e) => setCreateForm({ ...createForm, gender: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none bg-white text-slate-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>
            <Input
              label="Ngày sinh"
              type="date"
              value={createForm.dateOfBirth}
              onChange={(e) => setCreateForm({ ...createForm, dateOfBirth: e.target.value })}
              required
            />
            <Input
              label="CCCD / CMND"
              placeholder="Số CCCD"
              value={createForm.citizenId}
              onChange={(e) => setCreateForm({ ...createForm, citizenId: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Số điện thoại"
              placeholder="0912345678"
              value={createForm.phone}
              onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
              required
            />
            <Input
              label="Email"
              type="email"
              placeholder="student@example.com"
              value={createForm.email}
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Khoa / Viện</label>
              <select
                value={createForm.faculty}
                onChange={(e) => setCreateForm({ ...createForm, faculty: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none bg-white text-slate-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                <option value="Công nghệ Thông tin">Công nghệ Thông tin</option>
                <option value="Kinh tế & Quản trị">Kinh tế & Quản trị</option>
                <option value="Điện tử Viễn thông">Điện tử Viễn thông</option>
                <option value="Ngoại ngữ">Ngoại ngữ</option>
              </select>
            </div>
            <Input
              label="Lớp sinh hoạt"
              placeholder="VD: CNTT-K18A"
              value={createForm.className}
              onChange={(e) => setCreateForm({ ...createForm, className: e.target.value })}
              required
            />
          </div>

          <Input
            label="Địa chỉ thường trú"
            placeholder="Huyện, Tỉnh..."
            value={createForm.address}
            onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })}
            required
          />

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="createAcc"
              checked={createForm.createAccount}
              onChange={(e) => setCreateForm({ ...createForm, createAccount: e.target.checked })}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="createAcc" className="text-xs text-slate-700 cursor-pointer">
              Tự động cấp tài khoản đăng nhập (Mật khẩu mặc định: <span className="font-mono font-bold">Ktx@123456</span>)
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={() => setIsCreateOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" loading={actionLoading}>
              Xác nhận thêm
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Sửa Sinh Viên */}
      {selectedStudent && (
        <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title={`Chỉnh sửa: ${selectedStudent.fullName}`} size="lg">
          {formErr && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
              {formErr}
            </div>
          )}
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Mã sinh viên" value={selectedStudent.studentCode} disabled className="bg-slate-50" />
              <Input
                label="Họ và tên"
                value={selectedStudent.fullName}
                onChange={(e) => setSelectedStudent({ ...selectedStudent, fullName: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-600">Giới tính</label>
                <select
                  value={selectedStudent.gender}
                  onChange={(e) => setSelectedStudent({ ...selectedStudent, gender: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none bg-white text-slate-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>
              <Input
                label="Ngày sinh"
                type="date"
                value={selectedStudent.dateOfBirth?.split('T')[0] || ''}
                onChange={(e) => setSelectedStudent({ ...selectedStudent, dateOfBirth: e.target.value })}
              />
              <Input
                label="CCCD / CMND"
                value={selectedStudent.citizenId || ''}
                onChange={(e) => setSelectedStudent({ ...selectedStudent, citizenId: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Số điện thoại"
                value={selectedStudent.phone || ''}
                onChange={(e) => setSelectedStudent({ ...selectedStudent, phone: e.target.value })}
                required
              />
              <Input
                label="Email"
                type="email"
                value={selectedStudent.email || ''}
                onChange={(e) => setSelectedStudent({ ...selectedStudent, email: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Khoa / Viện"
                value={selectedStudent.faculty || ''}
                onChange={(e) => setSelectedStudent({ ...selectedStudent, faculty: e.target.value })}
              />
              <Input
                label="Lớp sinh hoạt"
                value={selectedStudent.className || ''}
                onChange={(e) => setSelectedStudent({ ...selectedStudent, className: e.target.value })}
              />
            </div>

            <Input
              label="Địa chỉ thường trú"
              value={selectedStudent.address || ''}
              onChange={(e) => setSelectedStudent({ ...selectedStudent, address: e.target.value })}
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="secondary" type="button" onClick={() => setIsEditOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" loading={actionLoading}>
                Lưu thay đổi
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Chi Tiết Sinh Viên */}
      {selectedStudent && (
        <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title="Hồ sơ chi tiết sinh viên" size="md">
          <div className="space-y-4">
            <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-bold text-lg flex items-center justify-center">
                {selectedStudent.fullName?.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">{selectedStudent.fullName}</h3>
                <p className="text-xs text-slate-500 font-mono">MSSV: {selectedStudent.studentCode}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <p className="text-slate-400 mb-0.5">Khoa / Viện</p>
                <p className="font-semibold text-slate-800">{selectedStudent.faculty}</p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <p className="text-slate-400 mb-0.5">Lớp</p>
                <p className="font-semibold text-slate-800">{selectedStudent.className}</p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <p className="text-slate-400 mb-0.5">Giới tính</p>
                <p className="font-semibold text-slate-800">{selectedStudent.gender}</p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <p className="text-slate-400 mb-0.5">Số điện thoại</p>
                <p className="font-semibold text-slate-800">{selectedStudent.phone}</p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg col-span-2">
                <p className="text-slate-400 mb-0.5">Email liên hệ</p>
                <p className="font-semibold text-slate-800">{selectedStudent.email}</p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg col-span-2">
                <p className="text-slate-400 mb-0.5">Địa chỉ thường trú</p>
                <p className="font-semibold text-slate-800">{selectedStudent.address}</p>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs">
              <p className="text-blue-700 font-semibold mb-1">Tình trạng chỗ ở hiện tại:</p>
              {selectedStudent.isStaying ? (
                <p className="text-blue-800 font-medium">
                  Đang ở tại: Tòa {selectedStudent.currentBuildingName} &bull; Phòng {selectedStudent.currentRoomNumber} &bull; Giường {selectedStudent.currentBedNumber}
                </p>
              ) : (
                <p className="text-slate-500">Chưa được xếp phòng trong ký túc xá.</p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setIsDetailOpen(false)}>
                Đóng
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm Delete */}
      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa sinh viên"
        message={`Bạn có chắc chắn muốn xóa sinh viên ${selectedStudent?.fullName} (${selectedStudent?.studentCode}) khỏi cơ sở dữ liệu?`}
        confirmLabel="Xóa sinh viên"
      />
    </div>
  );
};
