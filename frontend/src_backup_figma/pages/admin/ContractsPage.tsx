import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Table } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import { contractApi } from '../../api';
import { Contract } from '../../types';
import { Search, FileSignature, AlertOctagon, RotateCw, Calendar, Eye } from 'lucide-react';

export const ContractsPage: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Terminate & Renew Modals
  const [isTerminateOpen, setIsTerminateOpen] = useState(false);
  const [isRenewOpen, setIsRenewOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  const [terminateForm, setTerminateForm] = useState({
    terminatedDate: new Date().toISOString().split('T')[0],
    reason: 'Hết hạn năm học / Sinh viên xin ra ngoài ở',
    refundDeposit: true,
  });

  const [renewDate, setRenewDate] = useState('2027-06-30');
  const [actionLoading, setActionLoading] = useState(false);
  const [modalErr, setModalErr] = useState('');

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const res = await contractApi.getAll({
        page,
        pageSize: 10,
        searchTerm,
        status: statusFilter ? Number(statusFilter) : undefined,
      });
      if (res.success) {
        setContracts(res.data.items);
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
    fetchContracts();
  }, [page, statusFilter]);

  const handleTerminateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContract) return;
    setModalErr('');
    setActionLoading(true);

    try {
      const res = await contractApi.terminate(selectedContract.id, terminateForm);
      if (res.success) {
        setIsTerminateOpen(false);
        fetchContracts();
      }
    } catch (err: any) {
      setModalErr(err.message || 'Chấm dứt hợp đồng thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRenewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContract) return;
    setModalErr('');
    setActionLoading(true);

    try {
      const res = await contractApi.renew(selectedContract.id, renewDate);
      if (res.success) {
        setIsRenewOpen(false);
        fetchContracts();
      }
    } catch (err: any) {
      setModalErr(err.message || 'Gia hạn hợp đồng thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const columns = [
    {
      header: 'Số Hợp Đồng',
      render: (c: Contract) => <span className="font-mono font-bold text-slate-900">{c.contractNumber}</span>,
    },
    {
      header: 'Sinh Viên',
      render: (c: Contract) => (
        <div>
          <p className="font-bold text-slate-800">{c.studentName}</p>
          <p className="text-xs text-slate-400">{c.studentCode} &bull; {c.studentPhone}</p>
        </div>
      ),
    },
    {
      header: 'Phòng & Giường',
      render: (c: Contract) => (
        <span className="font-semibold text-indigo-700">
          {c.buildingName} - P.{c.roomNumber} ({c.bedNumber})
        </span>
      ),
    },
    {
      header: 'Thời Hạn Lưu Trú',
      render: (c: Contract) => (
        <div className="text-xs text-slate-600">
          <p>{new Date(c.startDate).toLocaleDateString('vi-VN')} → {new Date(c.endDate).toLocaleDateString('vi-VN')}</p>
        </div>
      ),
    },
    {
      header: 'Tiền Phòng & Cọc',
      render: (c: Contract) => (
        <div className="text-xs text-slate-700">
          <p className="font-semibold">{formatCurrency(c.monthlyRent)}/tháng</p>
          <p className="text-slate-400">Cọc: {formatCurrency(c.depositAmount)}</p>
        </div>
      ),
    },
    {
      header: 'Trạng Thái',
      render: (c: Contract) => (
        <Badge
          variant={
            c.status === 2 ? 'success' : c.status === 3 ? 'warning' : c.status === 4 ? 'danger' : 'slate'
          }
        >
          {c.status === 2 ? 'Đang hiệu lực' : c.status === 3 ? 'Đã hết hạn' : c.status === 4 ? 'Đã thanh lý' : 'Chờ duyệt'}
        </Badge>
      ),
    },
    {
      header: 'Thao tác',
      render: (c: Contract) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => {
              setSelectedContract(c);
              setIsDetailOpen(true);
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
            title="Xem chi tiết"
          >
            <Eye className="w-4 h-4" />
          </button>

          {c.status === 2 && (
            <>
              <button
                onClick={() => {
                  setSelectedContract(c);
                  setRenewDate(new Date(new Date(c.endDate).setMonth(new Date(c.endDate).getMonth() + 6)).toISOString().split('T')[0]);
                  setIsRenewOpen(true);
                }}
                className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50"
                title="Gia hạn hợp đồng"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setSelectedContract(c);
                  setIsTerminateOpen(true);
                }}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                title="Trả phòng / Chấm dứt"
              >
                <AlertOctagon className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex-1 pb-12">
      <Header
        title="Quản Lý Hợp Đồng Lưu Trú"
        subtitle="Quản lý vòng đời hợp đồng, gia hạn và thủ tục trả phòng, hoàn trả tiền cọc"
      />

      <div className="max-w-7xl mx-auto px-6 mt-6 space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Input
              placeholder="Tìm theo số HĐ, tên sinh viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
            <Button
              variant="secondary"
              onClick={() => {
                setPage(1);
                fetchContracts();
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
              <option value="2">Đang hiệu lực</option>
              <option value="3">Đã hết hạn</option>
              <option value="4">Đã thanh lý / Trả phòng</option>
            </select>
          </div>
        </div>

        <Table columns={columns} data={contracts} loading={loading} />

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={10}
          onPageChange={(p) => setPage(p)}
        />
      </div>

      {/* Modal Chấm dứt & Trả phòng */}
      {selectedContract && (
        <Modal
          isOpen={isTerminateOpen}
          onClose={() => setIsTerminateOpen(false)}
          title={`Thanh Lý Hợp Đồng - ${selectedContract.contractNumber}`}
        >
          {modalErr && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
              {modalErr}
            </div>
          )}
          <form onSubmit={handleTerminateSubmit} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
              <p className="font-bold">Lưu ý khi thanh lý hợp đồng:</p>
              <p className="mt-1">
                Giường <span className="font-bold">{selectedContract.bedNumber}</span> tại Phòng{' '}
                <span className="font-bold">{selectedContract.roomNumber}</span> sẽ được tự động giải phóng sang trạng thái Trống để tiếp nhận sinh viên mới.
              </p>
            </div>

            <Input
              label="Ngày trả phòng"
              type="date"
              value={terminateForm.terminatedDate}
              onChange={(e) => setTerminateForm({ ...terminateForm, terminatedDate: e.target.value })}
              required
            />

            <Input
              label="Lý do chấm dứt / Ghi chú"
              value={terminateForm.reason}
              onChange={(e) => setTerminateForm({ ...terminateForm, reason: e.target.value })}
              required
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button type="button" variant="secondary" onClick={() => setIsTerminateOpen(false)}>
                Hủy bỏ
              </Button>
              <Button type="submit" variant="danger" loading={actionLoading}>
                Xác nhận trả phòng
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Gia hạn Hợp Đồng */}
      {selectedContract && (
        <Modal
          isOpen={isRenewOpen}
          onClose={() => setIsRenewOpen(false)}
          title={`Gia Hạn Hợp Đồng - ${selectedContract.contractNumber}`}
        >
          {modalErr && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
              {modalErr}
            </div>
          )}
          <form onSubmit={handleRenewSubmit} className="space-y-4">
            <p className="text-xs text-slate-500">
              Ngày kết thúc hiện tại: <span className="font-bold text-slate-800">{new Date(selectedContract.endDate).toLocaleDateString('vi-VN')}</span>
            </p>

            <Input
              label="Ngày kết thúc mới sau khi gia hạn"
              type="date"
              value={renewDate}
              onChange={(e) => setRenewDate(e.target.value)}
              required
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button type="button" variant="secondary" onClick={() => setIsRenewOpen(false)}>
                Hủy bỏ
              </Button>
              <Button type="submit" loading={actionLoading}>
                Xác nhận gia hạn
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Chi Tiết Hợp Đồng */}
      {selectedContract && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Chi Tiết Hợp Đồng Lưu Trú - ${selectedContract.contractNumber}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Sinh viên:</span>
                <span className="font-bold text-slate-900">{selectedContract.studentName} ({selectedContract.studentCode})</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Số điện thoại:</span>
                <span className="font-semibold text-slate-800">{selectedContract.studentPhone}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Phòng & Giường:</span>
                <span className="font-bold text-indigo-700">{selectedContract.buildingName} - P.{selectedContract.roomNumber} ({selectedContract.bedNumber})</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Thời hạn:</span>
                <span className="font-semibold text-slate-800">
                  {new Date(selectedContract.startDate).toLocaleDateString('vi-VN')} → {new Date(selectedContract.endDate).toLocaleDateString('vi-VN')}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Tiền phòng hàng tháng:</span>
                <span className="font-bold text-slate-900">{formatCurrency(selectedContract.monthlyRent)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tiền đặt cọc:</span>
                <span className="font-bold text-slate-900">{formatCurrency(selectedContract.depositAmount)}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200">
              <span className="font-bold text-slate-700 block mb-1">Điều khoản hợp đồng:</span>
              <p className="text-slate-500 leading-relaxed">{selectedContract.terms || 'Tuân thủ nội quy ký túc xá.'}</p>
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

