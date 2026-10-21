import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Table } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import { registrationApi, roomApi, buildingApi } from '../../api';
import { Registration, Room, Bed } from '../../types';
import { CheckCircle, XCircle, Search, Filter, UserCheck, Eye, DoorOpen } from 'lucide-react';

export const RegistrationsPage: React.FC = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Review Modal
  const [isReviewOpen, setIsReviewOpen] = useState(false);
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

  const handleOpenReview = async (reg: Registration) => {
    setSelectedReg(reg);
    setReviewStatus(2);
    setAdminNote('');
    setFormErr('');
    setIsReviewOpen(true);

    // Fetch rooms for preferred building or all
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
        approvedRoomId: reviewStatus === 2 ? selectedRoomId : undefined,
        approvedBedId: reviewStatus === 2 ? selectedBedId : undefined,
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

  const selectedRoomObj = availableRooms.find((r) => r.id === selectedRoomId);
  const availableBedsInRoom = selectedRoomObj?.beds.filter((b) => b.status === 1) || [];

  const columns = [
    {
      header: 'Mã đơn',
      render: (r: Registration) => <span className="font-mono font-bold text-slate-800">#REG-{String(r.id).padStart(4, '0')}</span>,
    },
    {
      header: 'Sinh viên',
      render: (r: Registration) => (
        <div>
          <p className="font-bold text-slate-900">{r.studentName}</p>
          <p className="text-xs text-slate-400">{r.studentCode} &bull; {r.studentGender} &bull; {r.studentFaculty}</p>
        </div>
      ),
    },
    {
      header: 'Nguyện vọng',
      render: (r: Registration) => (
        <div className="text-xs text-slate-700">
          <p className="font-semibold">{r.preferredBuildingName || 'Tùy chọn tòa'} ({r.preferredRoomType || '4 người'})</p>
          <p className="text-slate-400">Thời hạn: {r.durationMonths} tháng</p>
        </div>
      ),
    },
    {
      header: 'Ngày nộp',
      render: (r: Registration) => (
        <span className="text-xs text-slate-500">
          {new Date(r.createdAt).toLocaleDateString('vi-VN')}
        </span>
      ),
    },
    {
      header: 'Trạng thái',
      render: (r: Registration) => (
        <Badge
          variant={
            r.status === 1 ? 'warning' : r.status === 2 ? 'success' : r.status === 3 ? 'danger' : 'slate'
          }
        >
          {r.status === 1
            ? 'Chờ duyệt'
            : r.status === 2
            ? 'Đã duyệt'
            : r.status === 3
            ? 'Từ chối'
            : 'Đã hủy'}
        </Badge>
      ),
    },
    {
      header: 'Phòng đã xếp',
      render: (r: Registration) =>
        r.status === 2 && r.approvedRoomNumber ? (
          <span className="text-xs font-bold text-emerald-700">
            P.{r.approvedRoomNumber} ({r.approvedBedNumber})
          </span>
        ) : (
          <span className="text-xs text-slate-400">-</span>
        ),
    },
    {
      header: 'Thao tác',
      render: (r: Registration) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {r.status === 1 ? (
            <Button size="sm" onClick={() => handleOpenReview(r)} icon={<UserCheck className="w-3.5 h-3.5" />}>
              Xét duyệt
            </Button>
          ) : (
            <span className="text-xs text-slate-400 font-medium">Đã xử lý</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex-1 pb-12">
      <Header
        title="Duyệt Đăng Ký Ở KTX"
        subtitle="Tiếp nhận hồ sơ sinh viên, phê duyệt và trực tiếp xếp phòng/giường"
      />

      <div className="max-w-7xl mx-auto px-6 mt-6 space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Input
              placeholder="Tìm theo tên SV hoặc mã SV..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
            <Button
              variant="secondary"
              onClick={() => {
                setPage(1);
                fetchRegistrations();
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
              <option value="1">Chờ duyệt</option>
              <option value="2">Đã duyệt</option>
              <option value="3">Từ chối</option>
            </select>
          </div>
        </div>

        <Table columns={columns} data={registrations} loading={loading} />

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={10}
          onPageChange={(p) => setPage(p)}
        />
      </div>

      {/* Modal Xét Duyệt & Xếp Phòng */}
      {selectedReg && (
        <Modal
          isOpen={isReviewOpen}
          onClose={() => setIsReviewOpen(false)}
          title={`Xét Duyệt Đơn Đăng Ký - ${selectedReg.studentName}`}
          maxWidth="xl"
        >
          {formErr && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
              {formErr}
            </div>
          )}

          <form onSubmit={handleReviewSubmit} className="space-y-4">
            {/* Student summary info */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
              <p>
                <span className="text-slate-400">Sinh viên:</span>{' '}
                <span className="font-bold text-slate-800">{selectedReg.studentName} ({selectedReg.studentCode})</span>
              </p>
              <p>
                <span className="text-slate-400">Giới tính:</span>{' '}
                <span className="font-semibold text-slate-700">{selectedReg.studentGender}</span> &bull;{' '}
                <span className="text-slate-400">Khoa:</span>{' '}
                <span className="font-semibold text-slate-700">{selectedReg.studentFaculty}</span>
              </p>
              <p>
                <span className="text-slate-400">Nguyện vọng:</span>{' '}
                <span className="font-semibold text-indigo-700">{selectedReg.preferredBuildingName || 'Tùy chọn'} ({selectedReg.preferredRoomType})</span>
              </p>
              {selectedReg.reasonOrNote && (
                <p>
                  <span className="text-slate-400">Ghi chú của SV:</span>{' '}
                  <span className="italic text-slate-600">{selectedReg.reasonOrNote}</span>
                </p>
              )}
            </div>

            {/* Decision Radio */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Quyết định phê duyệt</label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition ${
                    reviewStatus === 2
                      ? 'border-emerald-500 bg-emerald-50/60 text-emerald-900 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="revStatus"
                    checked={reviewStatus === 2}
                    onChange={() => setReviewStatus(2)}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Duyệt & Xếp phòng</span>
                </label>

                <label
                  className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition ${
                    reviewStatus === 3
                      ? 'border-rose-500 bg-rose-50/60 text-rose-900 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="revStatus"
                    checked={reviewStatus === 3}
                    onChange={() => setReviewStatus(3)}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <span>Từ chối đơn</span>
                </label>
              </div>
            </div>

            {/* If Approved: Select Room and Bed */}
            {reviewStatus === 2 && (
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Chọn phòng còn chỗ</label>
                    <select
                      value={selectedRoomId || ''}
                      onChange={(e) => handleRoomChange(Number(e.target.value))}
                      className="block w-full rounded-lg border border-slate-300 text-sm px-3 py-2 text-slate-900 bg-white"
                      required
                    >
                      {availableRooms.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.buildingName} - P.{r.roomNumber} ({r.availableCount} chỗ trống - {r.genderAllowed})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Chọn giường trống</label>
                    <select
                      value={selectedBedId || ''}
                      onChange={(e) => setSelectedBedId(Number(e.target.value))}
                      className="block w-full rounded-lg border border-slate-300 text-sm px-3 py-2 text-slate-900 bg-white"
                      required
                    >
                      {availableBedsInRoom.map((b) => (
                        <option key={b.id} value={b.id}>
                          Giường {b.bedNumber} (Trống)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <Input
                  label="Tiền đặt cọc hợp đồng (VNĐ)"
                  type="number"
                  step={50000}
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  required
                />
              </div>
            )}

            <Input
              label="Ghi chú ban quản lý (Gửi đến sinh viên)"
              placeholder={reviewStatus === 2 ? 'Chúc mừng bạn đã trúng tuyển KTX...' : 'Lý do từ chối...'}
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button type="button" variant="secondary" onClick={() => setIsReviewOpen(false)}>
                Hủy bỏ
              </Button>
              <Button type="submit" loading={actionLoading} variant={reviewStatus === 2 ? 'primary' : 'danger'}>
                {reviewStatus === 2 ? 'Xác nhận duyệt & Tạo hợp đồng' : 'Xác nhận từ chối'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

