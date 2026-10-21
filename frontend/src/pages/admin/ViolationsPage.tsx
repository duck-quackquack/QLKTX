import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Table } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import { violationApi, studentApi } from '../../api';
import { Violation, Student } from '../../types';
import { AlertTriangle, Plus, Search, CheckCircle2, Trash2 } from 'lucide-react';

export const ViolationsPage: React.FC = () => {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [form, setForm] = useState({
    studentId: 1,
    title: '',
    description: '',
    violationType: 'Kỷ luật phòng',
    penaltyAmount: 100000,
    violationDate: new Date().toISOString().split('T')[0],
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [modalErr, setModalErr] = useState('');

  const fetchViolations = async () => {
    setLoading(true);
    try {
      const res = await violationApi.getAll({
        page,
        pageSize: 10,
        searchTerm,
        status: statusFilter ? Number(statusFilter) : undefined,
      });
      if (res.success) {
        setViolations(res.data.items);
        setTotalPages(res.data.totalPages);
        setTotalItems(res.data.totalItems);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveStudents = async () => {
    try {
      const res = await studentApi.getAll({ pageSize: 100 });
      if (res.success && res.data.items.length > 0) {
        setStudents(res.data.items);
        setForm((prev) => ({ ...prev, studentId: res.data.items[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchViolations();
    fetchActiveStudents();
  }, [page, statusFilter]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalErr('');
    setActionLoading(true);

    try {
      const res = await violationApi.create(form);
      if (res.success) {
        setIsCreateOpen(false);
        setForm({
          studentId: students[0]?.id || 1,
          title: '',
          description: '',
          violationType: 'Kỷ luật phòng',
          penaltyAmount: 100000,
          violationDate: new Date().toISOString().split('T')[0],
        });
        fetchViolations();
      }
    } catch (err: any) {
      setModalErr(err.message || 'Lập biên bản vi phạm thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: number) => {
    try {
      await violationApi.updateStatus(id, {
        status,
        resolutionNotes: status === 3 ? 'Đã nộp phạt đầy đủ' : 'Đã lập biên bản cảnh cáo',
      });
      fetchViolations();
    } catch (err: any) {
      alert(err.message || 'Cập nhật trạng thái thất bại');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa biên bản vi phạm này?')) return;
    try {
      await violationApi.delete(id);
      fetchViolations();
    } catch (err: any) {
      alert(err.message || 'Xóa thất bại');
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const columns = [
    {
      header: 'Sinh Viên Vi Phạm',
      render: (v: Violation) => (
        <div>
          <p className="font-bold text-slate-800">{v.studentName}</p>
          <p className="text-xs text-slate-400">{v.studentCode} &bull; {v.studentPhone}</p>
        </div>
      ),
    },
    {
      header: 'Hành Vi Vi Phạm',
      render: (v: Violation) => (
        <div>
          <p className="font-semibold text-slate-900">{v.title}</p>
          <p className="text-xs text-slate-500 max-w-xs truncate">{v.description}</p>
        </div>
      ),
    },
    {
      header: 'Phân Loại',
      accessor: 'violationType' as keyof Violation,
    },
    {
      header: 'Mức Phạt',
      render: (v: Violation) => (
        <span className={`font-bold ${v.penaltyAmount > 0 ? 'text-rose-600' : 'text-slate-500'}`}>
          {v.penaltyAmount > 0 ? formatCurrency(v.penaltyAmount) : 'Cảnh cáo'}
        </span>
      ),
    },
    {
      header: 'Ngày Lập',
      render: (v: Violation) => (
        <span className="text-xs text-slate-500">
          {new Date(v.violationDate).toLocaleDateString('vi-VN')}
        </span>
      ),
    },
    {
      header: 'Trạng Thái',
      render: (v: Violation) => (
        <Badge
          variant={
            v.status === 3 ? 'success' : v.status === 2 ? 'warning' : 'danger'
          }
        >
          {v.status === 3 ? 'Đã nộp phạt' : v.status === 2 ? 'Đang xử lý' : 'Chưa xử lý'}
        </Badge>
      ),
    },
    {
      header: 'Thao tác',
      render: (v: Violation) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {v.status !== 3 && (
            <button
              onClick={() => handleUpdateStatus(v.id, 3)}
              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs flex items-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Đã thu phạt
            </button>
          )}
          <button
            onClick={() => handleDelete(v.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
            title="Xóa"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex-1 pb-12">
      <Header
        title="Quản Lý Kỷ Luật & Vi Phạm"
        subtitle="Lập biên bản xử phạt nội quy KTX và theo dõi nộp phạt của sinh viên"
      />

      <div className="max-w-7xl mx-auto px-6 mt-6 space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Input
              placeholder="Tìm theo lỗi, tên SV..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
            <Button
              variant="secondary"
              onClick={() => {
                setPage(1);
                fetchViolations();
              }}
            >
              Tìm
            </Button>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-slate-300 text-xs px-3.5 py-2 text-slate-700 bg-white"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="1">Chưa xử lý</option>
              <option value="2">Đang xử lý</option>
              <option value="3">Đã nộp phạt</option>
            </select>

            <Button onClick={() => setIsCreateOpen(true)} icon={<Plus className="w-4 h-4" />}>
              Lập Biên Bản Mới
            </Button>
          </div>
        </div>

        <Table columns={columns} data={violations} loading={loading} />

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={10}
          onPageChange={(p) => setPage(p)}
        />
      </div>

      {/* Modal Lập Biên Bản */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Lập Biên Bản Vi Phạm KTX">
        {modalErr && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
            {modalErr}
          </div>
        )}
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Chọn sinh viên vi phạm</label>
            <select
              value={form.studentId}
              onChange={(e) => setForm({ ...form, studentId: Number(e.target.value) })}
              className="block w-full rounded-lg border border-slate-300 text-sm px-3.5 py-2 text-slate-900 bg-white"
              required
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName} - {s.studentCode} ({s.className})
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Tiêu đề vi phạm"
            placeholder="VD: Nấu ăn trong phòng ngủ, Gây ồn sau 23h..."
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Loại vi phạm</label>
              <select
                value={form.violationType}
                onChange={(e) => setForm({ ...form, violationType: e.target.value })}
                className="block w-full rounded-lg border border-slate-300 text-sm px-3.5 py-2 text-slate-900 bg-white"
              >
                <option value="Kỷ luật phòng">Kỷ luật phòng</option>
                <option value="An ninh trật tự">An ninh trật tự</option>
                <option value="Vệ sinh môi trường">Vệ sinh môi trường</option>
                <option value="PCCC / Thiết bị điện">PCCC / Thiết bị điện</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            <Input
              label="Mức tiền phạt (VNĐ)"
              type="number"
              step={50000}
              value={form.penaltyAmount}
              onChange={(e) => setForm({ ...form, penaltyAmount: Number(e.target.value) })}
              required
            />
          </div>

          <Input
            label="Mô tả chi tiết sự việc"
            placeholder="Ghi nhận lúc 23h30 có biểu hiện..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(false)}>
              Hủy bỏ
            </Button>
            <Button type="submit" loading={actionLoading} variant="danger">
              Lập biên bản
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

