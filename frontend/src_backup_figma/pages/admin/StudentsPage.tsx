import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Table } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import { studentApi } from '../../api';
import { Student } from '../../types';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  FileSpreadsheet,
  Filter
} from 'lucide-react';

export const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [facultyFilter, setFacultyFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [stayingFilter, setStayingFilter] = useState<string>('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
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
        gender: genderFilter || undefined,
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
  }, [page, facultyFilter, genderFilter, stayingFilter]);

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

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sinh viên này khỏi hệ thống?')) return;
    try {
      await studentApi.delete(id);
      fetchStudents();
    } catch (err: any) {
      alert(err.message || 'Không thể xóa sinh viên');
    }
  };

  const columns = [
    {
      header: 'Mã SV',
      accessor: 'studentCode' as keyof Student,
      render: (s: Student) => <span className="font-bold text-slate-900">{s.studentCode}</span>,
    },
    {
      header: 'Họ và tên',
      render: (s: Student) => (
        <div>
          <p className="font-semibold text-slate-800">{s.fullName}</p>
          <p className="text-xs text-slate-400">{s.gender} &bull; {s.className}</p>
        </div>
      ),
    },
    {
      header: 'Khoa / Viện',
      accessor: 'faculty' as keyof Student,
    },
    {
      header: 'Liên hệ',
      render: (s: Student) => (
        <div className="text-xs text-slate-600">
          <p>{s.phone}</p>
          <p className="text-slate-400">{s.email}</p>
        </div>
      ),
    },
    {
      header: 'Phòng hiện tại',
      render: (s: Student) =>
        s.isStaying && s.currentRoomNumber ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            {s.currentBuildingName} - {s.currentRoomNumber} ({s.currentBedNumber})
          </span>
        ) : (
          <span className="text-xs text-slate-400">Chưa ở KTX</span>
        ),
    },
    {
      header: 'Trạng thái',
      render: (s: Student) => (
        <Badge variant={s.isStaying ? 'success' : 'slate'}>
          {s.isStaying ? 'Đang lưu trú' : 'Chưa xếp phòng'}
        </Badge>
      ),
    },
    {
      header: 'Thao tác',
      render: (s: Student) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => {
              setSelectedStudent(s);
              setIsDetailOpen(true);
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
            title="Chi tiết"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setSelectedStudent(s);
              setIsEditOpen(true);
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50"
            title="Sửa"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          {!s.isStaying && (
            <button
              onClick={() => handleDelete(s.id)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50"
              title="Xóa"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex-1 pb-12">
      <Header title="Quản Lý Sinh Viên" subtitle="Danh sách hồ sơ sinh viên nội trú và ngoại trú" />

      <div className="max-w-7xl mx-auto px-6 mt-6 space-y-4">
        {/* Filters & Actions bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-auto flex-1 max-w-md">
            <Input
              placeholder="Tìm theo tên, mã SV, SĐT, Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
            <Button type="submit" variant="secondary" size="md">
              Tìm
            </Button>
          </form>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
            <select
              value={facultyFilter}
              onChange={(e) => {
                setFacultyFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-slate-300 text-xs px-3 py-2 text-slate-700 bg-white"
            >
              <option value="">Tất cả khoa</option>
              <option value="Công nghệ Thông tin">CNTT</option>
              <option value="Kinh tế & Quản trị">Kinh tế</option>
              <option value="Điện tử Viễn thông">Điện tử</option>
            </select>

            <select
              value={stayingFilter}
              onChange={(e) => {
                setStayingFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-slate-300 text-xs px-3 py-2 text-slate-700 bg-white"
            >
              <option value="">Tất cả tình trạng</option>
              <option value="true">Đang lưu trú</option>
              <option value="false">Chưa ở KTX</option>
            </select>

            <Button onClick={() => setIsCreateOpen(true)} icon={<Plus className="w-4 h-4" />}>
              Thêm Sinh Viên
            </Button>
          </div>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          data={students}
          loading={loading}
          emptyMessage="Không tìm thấy sinh viên nào phù hợp với bộ lọc."
          onRowClick={(s) => {
            setSelectedStudent(s);
            setIsDetailOpen(true);
          }}
        />

        {/* Pagination */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={10}
          onPageChange={(p) => setPage(p)}
        />
      </div>

      {/* Modal Thêm Sinh Viên */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Thêm Mới Sinh Viên" maxWidth="2xl">
        {formErr && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
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
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Giới tính</label>
              <select
                value={createForm.gender}
                onChange={(e) => setCreateForm({ ...createForm, gender: e.target.value })}
                className="block w-full rounded-lg border border-slate-300 text-sm px-3.5 py-2 text-slate-900"
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
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Khoa / Viện</label>
              <select
                value={createForm.faculty}
                onChange={(e) => setCreateForm({ ...createForm, faculty: e.target.value })}
                className="block w-full rounded-lg border border-slate-300 text-sm px-3.5 py-2 text-slate-900"
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

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="createAcc"
              checked={createForm.createAccount}
              onChange={(e) => setCreateForm({ ...createForm, createAccount: e.target.checked })}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="createAcc" className="text-sm text-slate-700 cursor-pointer">
              Tự động cấp tài khoản đăng nhập (Mật khẩu mặc định: <span className="font-mono font-bold">Ktx@123456</span>)
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(false)}>
              Hủy bỏ
            </Button>
            <Button type="submit" loading={actionLoading}>
              Lưu sinh viên
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Sửa Sinh Viên */}
      {selectedStudent && (
        <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Chỉnh Sửa Hồ Sơ Sinh Viên" maxWidth="2xl">
          {formErr && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
              {formErr}
            </div>
          )}
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Mã sinh viên (Không thể sửa)"
                value={selectedStudent.studentCode}
                disabled
              />
              <Input
                label="Họ và tên"
                value={selectedStudent.fullName}
                onChange={(e) => setSelectedStudent({ ...selectedStudent, fullName: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Số điện thoại"
                value={selectedStudent.phone}
                onChange={(e) => setSelectedStudent({ ...selectedStudent, phone: e.target.value })}
                required
              />
              <Input
                label="Email"
                type="email"
                value={selectedStudent.email}
                onChange={(e) => setSelectedStudent({ ...selectedStudent, email: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Khoa"
                value={selectedStudent.faculty}
                onChange={(e) => setSelectedStudent({ ...selectedStudent, faculty: e.target.value })}
                required
              />
              <Input
                label="Lớp"
                value={selectedStudent.className}
                onChange={(e) => setSelectedStudent({ ...selectedStudent, className: e.target.value })}
                required
              />
            </div>

            <Input
              label="Địa chỉ"
              value={selectedStudent.address}
              onChange={(e) => setSelectedStudent({ ...selectedStudent, address: e.target.value })}
              required
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button type="button" variant="secondary" onClick={() => setIsEditOpen(false)}>
                Hủy bỏ
              </Button>
              <Button type="submit" loading={actionLoading}>
                Cập nhật
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Chi tiết Sinh Viên */}
      {selectedStudent && (
        <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title="Hồ Sơ Chi Tiết Sinh Viên" maxWidth="lg">
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center">
                {selectedStudent.fullName.charAt(0)}
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">{selectedStudent.fullName}</h4>
                <p className="text-xs text-slate-500">Mã SV: {selectedStudent.studentCode} &bull; Lớp: {selectedStudent.className}</p>
                <div className="mt-1">
                  <Badge variant={selectedStudent.isStaying ? 'success' : 'slate'}>
                    {selectedStudent.isStaying ? 'Đang lưu trú tại KTX' : 'Chưa ở KTX'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-0.5">Giới tính:</span>
                <span className="font-semibold text-slate-800">{selectedStudent.gender}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-0.5">Ngày sinh:</span>
                <span className="font-semibold text-slate-800">{new Date(selectedStudent.dateOfBirth).toLocaleDateString('vi-VN')}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-0.5">Số điện thoại:</span>
                <span className="font-semibold text-slate-800">{selectedStudent.phone}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-0.5">Email:</span>
                <span className="font-semibold text-slate-800 truncate block">{selectedStudent.email}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 col-span-2">
                <span className="text-slate-400 block mb-0.5">Khoa / Viện:</span>
                <span className="font-semibold text-slate-800">{selectedStudent.faculty}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 col-span-2">
                <span className="text-slate-400 block mb-0.5">Quê quán:</span>
                <span className="font-semibold text-slate-800">{selectedStudent.address}</span>
              </div>
              {selectedStudent.isStaying && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 col-span-2">
                  <span className="text-emerald-600 font-bold block mb-0.5">Phòng / Giường đang ở:</span>
                  <span className="font-bold text-emerald-800">
                    {selectedStudent.currentBuildingName} - Phòng {selectedStudent.currentRoomNumber} (Giường {selectedStudent.currentBedNumber})
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setIsDetailOpen(false)}>
                Đóng
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

