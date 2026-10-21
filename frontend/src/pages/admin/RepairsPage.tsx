import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Badge, statusBadge } from '../../components/common/Badge';
import { repairApi } from '../../api';
import { RepairRequest } from '../../types';
import { Wrench, Search, CheckCircle2, Clock, Eye, UserCheck } from 'lucide-react';

export const RepairsPage: React.FC = () => {
  const [repairs, setRepairs] = useState<RepairRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchRepairs();
  };

  const handleOpenUpdate = (r: RepairRequest) => {
    setSelectedRepair(r);
    setUpdateForm({
      status: r.status === 1 ? 2 : r.status,
      repairCost: r.repairCost || 0,
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

  const counts = {
    pending: repairs.filter((r) => r.status === 1).length,
    processing: repairs.filter((r) => r.status === 2).length,
    completed: repairs.filter((r) => r.status === 3).length,
  };

  return (
    <div className="flex-1 pb-12 bg-slate-50 min-h-screen">
      <Header
        title="Yêu cầu Sửa chữa"
        subtitle="Quản lý và xử lý báo hỏng thiết bị ký túc xá"
      />

      <div className="max-w-7xl mx-auto px-6 mt-6 flex flex-col gap-5">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Yêu cầu Sửa chữa</h1>
          <p className="text-sm text-slate-500 mt-0.5">Tiếp nhận và theo dõi tiến độ sửa chữa cơ sở vật chất</p>
        </div>

        {/* Counts summary header cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Tất cả yêu cầu', count: totalItems, color: 'text-slate-700' },
            { label: 'Chờ tiếp nhận', count: counts.pending, color: 'text-amber-600' },
            { label: 'Đang sửa chữa', count: counts.processing, color: 'text-blue-600' },
            { label: 'Đã hoàn thành', count: counts.completed, color: 'text-green-600' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-sm">
              <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
              <p className="text-xs text-slate-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-slate-100">
            <form onSubmit={handleSearchSubmit} className="relative w-64">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm tiêu đề, phòng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg outline-none bg-white text-slate-800 placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors"
              />
            </form>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg outline-none bg-white text-slate-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="1">Chờ tiếp nhận</option>
              <option value="2">Đang sửa chữa</option>
              <option value="3">Đã hoàn thành</option>
            </select>

            <span className="ml-auto text-xs text-slate-400">{repairs.length} / {totalItems} kết quả</span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Mã YC', 'Sinh viên', 'Phòng', 'Tiêu đề sự cố', 'Mức độ', 'Trạng thái', 'Ngày gửi', 'Ghi chú / Chi phí', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {repairs.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-600">YC#{r.id}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-800 whitespace-nowrap">
                      {r.studentName}
                      <span className="block text-[11px] font-normal text-slate-400">{r.studentPhone}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                      P.{r.roomNumber} ({r.buildingName})
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 max-w-[200px] truncate" title={r.title}>
                      <span className="font-semibold text-slate-800 block truncate">{r.title}</span>
                      <span className="text-xs text-slate-400 block truncate">{r.description}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={r.priority === 4 ? 'danger' : r.priority === 3 ? 'warning' : 'primary'}>
                        {r.priority === 4 ? 'Khẩn cấp' : r.priority === 3 ? 'Cao' : r.priority === 2 ? 'Trung bình' : 'Thấp'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={r.status === 3 ? 'success' : r.status === 2 ? 'info' : 'warning'}
                      >
                        {r.status === 3 ? 'Hoàn thành' : r.status === 2 ? 'Đang sửa' : 'Chờ tiếp nhận'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {r.repairCost ? `${new Intl.NumberFormat('vi-VN').format(r.repairCost)}đ` : r.staffNotes || '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setSelectedRepair(r);
                            setIsDetailOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleOpenUpdate(r)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                          title="Cập nhật tiến độ"
                        >
                          <UserCheck size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {repairs.length === 0 && !loading && (
                  <tr>
                    <td colSpan={9} className="text-center py-10 text-xs text-slate-400">
                      Không có yêu cầu sửa chữa nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 text-xs text-slate-400">
            <span>Hiển thị trang {page} / {totalPages || 1} ({totalItems} yêu cầu)</span>
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

      {/* Modal Cập Nhật Trạng Thái */}
      {selectedRepair && (
        <Modal
          isOpen={isUpdateOpen}
          onClose={() => setIsUpdateOpen(false)}
          title={`Xử lý báo hỏng — P.${selectedRepair.roomNumber}`}
        >
          {modalErr && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
              {modalErr}
            </div>
          )}
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5">
              <p><span className="text-slate-400">Vấn đề:</span> <strong className="text-slate-800">{selectedRepair.title}</strong></p>
              <p><span className="text-slate-400">Mô tả:</span> <span className="text-slate-600">{selectedRepair.description}</span></p>
              <p><span className="text-slate-400">Phòng:</span> <strong>{selectedRepair.buildingName} - P.{selectedRepair.roomNumber}</strong></p>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Trạng thái xử lý</label>
              <select
                value={updateForm.status}
                onChange={(e) => setUpdateForm({ ...updateForm, status: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none bg-white text-slate-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                <option value={1}>Chờ tiếp nhận</option>
                <option value={2}>Đang sửa chữa / Đã điều thợ</option>
                <option value={3}>Đã hoàn thành</option>
                <option value={4}>Hủy yêu cầu</option>
              </select>
            </div>

            <Input
              label="Chi phí phát sinh (VNĐ) nếu có"
              type="number"
              value={updateForm.repairCost}
              onChange={(e) => setUpdateForm({ ...updateForm, repairCost: Number(e.target.value) })}
            />

            <Input
              label="Ghi chú của kỹ thuật / nhân viên"
              placeholder="VD: Đã thay bóng đèn LED, kiểm tra dây nguồn..."
              value={updateForm.staffNotes}
              onChange={(e) => setUpdateForm({ ...updateForm, staffNotes: e.target.value })}
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="secondary" type="button" onClick={() => setIsUpdateOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" loading={actionLoading}>
                Lưu tiến độ
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Chi Tiết */}
      {selectedRepair && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Chi tiết sự cố #${selectedRepair.id}`}
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">{selectedRepair.title}</h3>
                <p className="text-slate-400">P.{selectedRepair.roomNumber} ({selectedRepair.buildingName})</p>
              </div>
              <Badge variant={selectedRepair.status === 3 ? 'success' : 'warning'}>
                {selectedRepair.status === 3 ? 'Hoàn thành' : 'Đang xử lý'}
              </Badge>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg text-slate-700">
              <p className="font-semibold text-slate-800 mb-1">Mô tả hỏng hóc:</p>
              <p>{selectedRepair.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-slate-600">
              <p>Người báo: <strong className="text-slate-800">{selectedRepair.studentName}</strong></p>
              <p>SĐT: <strong className="text-slate-800">{selectedRepair.studentPhone}</strong></p>
              <p>Ngày gửi: <strong className="text-slate-800">{new Date(selectedRepair.createdAt).toLocaleString('vi-VN')}</strong></p>
              <p>Chi phí: <strong className="text-slate-800">{selectedRepair.repairCost ? `${new Intl.NumberFormat('vi-VN').format(selectedRepair.repairCost)}đ` : 'Miễn phí'}</strong></p>
            </div>

            {selectedRepair.staffNotes && (
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-blue-800">
                <p className="font-semibold mb-0.5">Ghi chú nhân viên:</p>
                <p>{selectedRepair.staffNotes}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
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
