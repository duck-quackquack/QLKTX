import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Table } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import { repairApi } from '../../api';
import { RepairRequest } from '../../types';
import { Wrench, Search, CheckCircle2, Clock, Eye } from 'lucide-react';

export const RepairsPage: React.FC = () => {
  const [repairs, setRepairs] = useState<RepairRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState<RepairRequest | null>(null);

  const [updateForm, setUpdateForm] = useState({
    status: 2, // 2: Processing, 3: Completed
    repairCost: 0,
    staffNotes: '',
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [modalErr, setModalErr] = useState('');

  const fetchRepairs = async () => {
    setLoading(true);
    try {
      const res = await repairApi.getAll({
        page,
        pageSize: 10,
        searchTerm,
        status: statusFilter ? Number(statusFilter) : undefined,
      });
      if (res.success) {
        setRepairs(res.data.items);
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
    fetchRepairs();
  }, [page, statusFilter]);

  const handleOpenUpdate = (r: RepairRequest) => {
    setSelectedRepair(r);
    setUpdateForm({
      status: r.status === 1 ? 2 : r.status,
      repairCost: r.repairCost,
      staffNotes: r.staffNotes || '',
    });
    setModalErr('');
    setIsUpdateOpen(true);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRepair) return;
    setModalErr('');
    setActionLoading(true);

    try {
      const res = await repairApi.updateStatus(selectedRepair.id, updateForm);
      if (res.success) {
        setIsUpdateOpen(false);
        fetchRepairs();
      }
    } catch (err: any) {
      setModalErr(err.message || 'Cập nhật thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const getPriorityBadge = (p: number) => {
    switch (p) {
      case 4: return <Badge variant="danger">Khẩn cấp</Badge>;
      case 3: return <Badge variant="warning">Cao</Badge>;
      case 2: return <Badge variant="primary">Trung bình</Badge>;
      default: return <Badge variant="slate">Thấp</Badge>;
    }
  };

  const columns = [
    {
      header: 'Yêu Cầu / Vấn Đề',
      render: (r: RepairRequest) => (
        <div>
          <p className="font-bold text-slate-900">{r.title}</p>
          <p className="text-xs text-slate-400 max-w-xs truncate">{r.description}</p>
        </div>
      ),
    },
    {
      header: 'Phòng',
      render: (r: RepairRequest) => (
        <span className="font-bold text-indigo-700">
          P.{r.roomNumber} ({r.buildingName})
        </span>
      ),
    },
    {
      header: 'Người Báo',
      render: (r: RepairRequest) => (
        <div>
          <p className="font-semibold text-slate-800">{r.studentName}</p>
          <p className="text-xs text-slate-400">{r.studentPhone}</p>
        </div>
      ),
    },
    {
      header: 'Mức Độ',
      render: (r: RepairRequest) => getPriorityBadge(r.priority),
    },
    {
      header: 'Ngày Gửi',
      render: (r: RepairRequest) => (
        <span className="text-xs text-slate-500">
          {new Date(r.createdAt).toLocaleDateString('vi-VN')}
        </span>
      ),
    },
    {
      header: 'Trạng Thái',
      render: (r: RepairRequest) => (
        <Badge
          variant={
            r.status === 3 ? 'success' : r.status === 2 ? 'warning' : 'danger'
          }
        >
          {r.status === 3 ? 'Đã hoàn thành' : r.status === 2 ? 'Đang sửa chữa' : 'Chờ xử lý'}
        </Badge>
      ),
    },
    {
      header: 'Thao tác',
      render: (r: RepairRequest) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" onClick={() => handleOpenUpdate(r)} variant="outline">
            Cập nhật
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex-1 pb-12">
      <Header
        title="Quản Lý Yêu Cầu Sửa Chữa & Cơ Sở Vật Chất"
        subtitle="Tiếp nhận phản ánh hỏng hóc thiết bị, phân công sửa chữa và nghiệm thu"
      />

      <div className="max-w-7xl mx-auto px-6 mt-6 space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Input
              placeholder="Tìm theo sự cố, số phòng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
            <Button
              variant="secondary"
              onClick={() => {
                setPage(1);
                fetchRepairs();
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
              <option value="1">Chờ tiếp nhận</option>
              <option value="2">Đang sửa chữa</option>
              <option value="3">Đã hoàn thành</option>
            </select>
          </div>
        </div>

        <Table columns={columns} data={repairs} loading={loading} />

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={10}
          onPageChange={(p) => setPage(p)}
        />
      </div>

      {/* Modal Cập Nhật Trạng Thái Sửa Chữa */}
      {selectedRepair && (
        <Modal
          isOpen={isUpdateOpen}
          onClose={() => setIsUpdateOpen(false)}
          title={`Cập Nhật Yêu Cầu - P.${selectedRepair.roomNumber}`}
        >
          {modalErr && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
              {modalErr}
            </div>
          )}
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <p><span className="text-slate-400">Vấn đề:</span> <span className="font-bold text-slate-900">{selectedRepair.title}</span></p>
              <p><span className="text-slate-400">Mô tả:</span> <span className="text-slate-700">{selectedRepair.description}</span></p>
              <p><span className="text-slate-400">Phòng:</span> <span className="font-semibold text-indigo-700">{selectedRepair.buildingName} - P.{selectedRepair.roomNumber}</span></p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Trạng thái tiến độ</label>
              <select
                value={updateForm.status}
                onChange={(e) => setUpdateForm({ ...updateForm, status: Number(e.target.value) })}
                className="block w-full rounded-lg border border-slate-300 text-sm px-3.5 py-2 text-slate-900 bg-white"
              >
                <option value="1">Chờ tiếp nhận</option>
                <option value="2">Đang xử lý / Đã hẹn thợ</option>
                <option value="3">Đã hoàn thành</option>
                <option value="4">Hủy yêu cầu</option>
              </select>
            </div>

            <Input
              label="Chi phí phát sinh / vật tư (nếu có, VNĐ)"
              type="number"
              value={updateForm.repairCost}
              onChange={(e) => setUpdateForm({ ...updateForm, repairCost: Number(e.target.value) })}
            />

            <Input
              label="Ghi chú nhân viên / Thợ kỹ thuật"
              placeholder="Đã thay bóng đèn mới và kiểm tra công tắc..."
              value={updateForm.staffNotes}
              onChange={(e) => setUpdateForm({ ...updateForm, staffNotes: e.target.value })}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button type="button" variant="secondary" onClick={() => setIsUpdateOpen(false)}>
                Hủy bỏ
              </Button>
              <Button type="submit" loading={actionLoading}>
                Lưu cập nhật
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

