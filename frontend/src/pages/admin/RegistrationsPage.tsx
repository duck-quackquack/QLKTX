import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Badge, statusBadge } from '../../components/common/Badge';
import { registrationApi, roomApi } from '../../api';
import { Registration, Room, Bed } from '../../types';
import { CheckCircle, XCircle, Search, Eye, UserCheck } from 'lucide-react';

export const RegistrationsPage: React.FC = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Review & Detail Modals
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [reviewStatus, setReviewStatus] = useState<number>(2); // 2: Approved, 3: Rejected
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [selectedBedId, setSelectedBedId] = useState<number | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [depositAmount, setDepositAmount] = useState<number>(650000);

  const [actionLoading, setActionLoading] = useState(false);
  const [formErr, setFormErr] = useState('');

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const res = await registrationApi.getAll({
        page,
        pageSize: 10,
        searchTerm,
        status: statusFilter ? Number(statusFilter) : undefined,
      });
      if (res.success) {
        setRegistrations(res.data.items);
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
    fetchRegistrations();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchRegistrations();
  };

  const handleOpenReview = async (reg: Registration, defaultStatus = 2) => {
    setSelectedReg(reg);
    setReviewStatus(defaultStatus);
    setAdminNote('');
    setFormErr('');
    setIsReviewOpen(true);

    try {
      const res = await roomApi.getAll({ pageSize: 50 });
      if (res.success) {
        const withAvailableBeds = res.data.items.filter((r) => r.availableCount > 0);
        setAvailableRooms(withAvailableBeds);
        if (withAvailableBeds.length > 0) {
          setSelectedRoomId(withAvailableBeds[0].id);
          const firstBed = withAvailableBeds[0].beds.find((b) => b.status === 1);
          setSelectedBedId(firstBed?.id || null);
          setDepositAmount(withAvailableBeds[0].basePrice);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRoomChange = (roomId: number) => {
    setSelectedRoomId(roomId);
    const room = availableRooms.find((r) => r.id === roomId);
    if (room) {
      const firstBed = room.beds.find((b) => b.status === 1);
      setSelectedBedId(firstBed?.id || null);
      setDepositAmount(room.basePrice);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReg) return;
    setFormErr('');
    setActionLoading(true);

    try {
      const res = await registrationApi.review(selectedReg.id, {
        status: reviewStatus,
        assignedRoomId: reviewStatus === 2 ? selectedRoomId || undefined : undefined,
        assignedBedId: reviewStatus === 2 ? selectedBedId || undefined : undefined,
        adminNote,
        depositAmount: reviewStatus === 2 ? depositAmount : undefined,
      });

      if (res.success) {
        setIsReviewOpen(false);
        fetchRegistrations();
      }
    } catch (err: any) {
      setFormErr(err.message || 'Xử lý đơn thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const counts = {
    all: totalItems,
    pending: registrations.filter((r) => r.status === 1).length,
    approved: registrations.filter((r) => r.status === 2).length,
    rejected: registrations.filter((r) => r.status === 3).length,
  };

  return (
    <div className="flex-1 pb-12 bg-slate-50 min-h-screen">
      <Header
        title="Đăng ký nội trú"
        subtitle="Quản lý và duyệt đơn đăng ký ở ký túc xá"
      />

      <div className="max-w-7xl mx-auto px-6 mt-6 flex flex-col gap-5">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Đăng ký nội trú</h1>
          <p className="text-sm text-slate-500 mt-0.5">Tiếp nhận hồ sơ xét duyệt phân phòng sinh viên</p>
        </div>

        {/* Status Tab Buttons */}
        <div className="flex flex-wrap gap-2.5">
          {[
            { key: '', label: 'Tất cả đơn', count: counts.all, color: 'text-slate-700 bg-slate-100' },
            { key: '1', label: 'Chờ duyệt', count: counts.pending, color: 'text-amber-700 bg-amber-100' },
            { key: '2', label: 'Đã duyệt', count: counts.approved, color: 'text-green-700 bg-green-100' },
            { key: '3', label: 'Từ chối', count: counts.rejected, color: 'text-red-700 bg-red-100' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setStatusFilter(t.key);
                setPage(1);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
                statusFilter === t.key
                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t.label}
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${t.color}`}>{t.count}</span>
            </button>
          ))}
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          {/* Search bar */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
            <form onSubmit={handleSearchSubmit} className="relative w-64">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm sinh viên hoặc MSSV..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg outline-none bg-white text-slate-800 placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors"
              />
            </form>
            <span className="ml-auto text-xs text-slate-400">{registrations.length} / {totalItems} kết quả</span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Mã đơn', 'Sinh viên', 'MSSV', 'Khoa', 'Tòa / Nguyện vọng', 'Ngày nộp', 'Trạng thái', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {registrations.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-600">ĐK#{r.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-xs font-bold shrink-0">
                          {r.studentName?.charAt(0) || 'S'}
                        </div>
                        <span className="text-sm font-semibold text-slate-800 whitespace-nowrap">{r.studentName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{r.studentCode}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{r.studentFaculty || '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {r.preferredBuildingName ? `Tòa ${r.preferredBuildingName}` : 'Tự do'} &bull;{' '}
                      <span className="text-xs text-slate-400">{r.preferredRoomType || 'Loại phòng chuẩn'}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          r.status === 2 ? 'success' : r.status === 3 ? 'danger' : 'warning'
                        }
                      >
                        {r.status === 2 ? 'Đã duyệt' : r.status === 3 ? 'Từ chối' : 'Chờ duyệt'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setSelectedReg(r);
                            setIsDetailOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye size={14} />
                        </button>
                        {r.status === 1 && (
                          <>
                            <button
                              onClick={() => handleOpenReview(r, 2)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                              title="Duyệt đơn"
                            >
                              <CheckCircle size={14} />
                            </button>
                            <button
                              onClick={() => handleOpenReview(r, 3)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Từ chối"
                            >
                              <XCircle size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {registrations.length === 0 && !loading && (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-xs text-slate-400">
                      Không tìm thấy đơn đăng ký nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 text-xs text-slate-400">
            <span>Hiển thị trang {page} / {totalPages || 1} ({totalItems} đơn)</span>
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

      {/* Modal Duyệt / Từ Chối Đơn */}
      {selectedReg && (
        <Modal
          isOpen={isReviewOpen}
          onClose={() => setIsReviewOpen(false)}
          title={`Xét duyệt hồ sơ — ${selectedReg.studentName}`}
          size="lg"
        >
          {formErr && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
              {formErr}
            </div>
          )}
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
              <p><span className="text-slate-400">Sinh viên:</span> <strong className="text-slate-800">{selectedReg.studentName} ({selectedReg.studentCode})</strong></p>
              <p><span className="text-slate-400">Khoa / Lớp:</span> <span className="text-slate-700">{selectedReg.studentFaculty || '—'} - {selectedReg.studentClassName || '—'}</span></p>
              <p><span className="text-slate-400">Nguyện vọng:</span> <span className="text-blue-700 font-semibold">{selectedReg.preferredBuildingName ? `Tòa ${selectedReg.preferredBuildingName}` : 'Tùy chọn'} ({selectedReg.preferredRoomType})</span></p>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Quyết định phê duyệt</label>
              <select
                value={reviewStatus}
                onChange={(e) => setReviewStatus(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none bg-white text-slate-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                <option value={2}>Duyệt và xếp phòng (Chấp thuận)</option>
                <option value={3}>Từ chối đơn đăng ký</option>
              </select>
            </div>

            {reviewStatus === 2 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-slate-600">Phòng xếp chỗ</label>
                    <select
                      value={selectedRoomId || ''}
                      onChange={(e) => handleRoomChange(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none bg-white text-slate-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    >
                      {availableRooms.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.buildingName} - P.{r.roomNumber} ({r.roomType} - Còn {r.availableCount} chỗ)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-slate-600">Số giường</label>
                    <select
                      value={selectedBedId || ''}
                      onChange={(e) => setSelectedBedId(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none bg-white text-slate-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    >
                      {availableRooms
                        .find((r) => r.id === selectedRoomId)
                        ?.beds.filter((b) => b.status === 1)
                        .map((b) => (
                          <option key={b.id} value={b.id}>
                            Giường số {b.bedNumber}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <Input
                  label="Tiền cọc / Tiền phòng đợt 1 (VNĐ)"
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                />
              </>
            )}

            <Input
              label="Ghi chú phản hồi cho sinh viên"
              placeholder="VD: Đã duyệt hồ sơ, vui lòng mang theo CCCD đến nhận phòng trước ngày 30..."
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="secondary" type="button" onClick={() => setIsReviewOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" loading={actionLoading}>
                Xác nhận
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Chi Tiết */}
      {selectedReg && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Đơn đăng ký #${selectedReg.id} — ${selectedReg.studentName}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg space-y-1.5 text-slate-700">
              <p>Mã SV: <strong className="text-slate-900">{selectedReg.studentCode}</strong></p>
              <p>Họ và tên: <strong className="text-slate-900">{selectedReg.studentName}</strong></p>
              <p>Khoa: <strong>{selectedReg.studentFaculty || '—'}</strong> &bull; Lớp: <strong>{selectedReg.studentClassName || '—'}</strong></p>
              <p>Số điện thoại: <strong>{selectedReg.studentPhone || '—'}</strong></p>
              <p>Ngày nộp: <strong>{new Date(selectedReg.createdAt).toLocaleString('vi-VN')}</strong></p>
            </div>

            {selectedReg.adminNote && (
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-blue-800">
                <p className="font-semibold mb-0.5">Phản hồi của Ban Quản lý:</p>
                <p>{selectedReg.adminNote}</p>
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
