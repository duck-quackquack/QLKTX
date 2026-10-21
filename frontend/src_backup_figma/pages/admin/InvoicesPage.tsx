import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Table } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import { invoiceApi, paymentApi } from '../../api';
import { Invoice } from '../../types';
import {
  Receipt,
  Search,
  Plus,
  CreditCard,
  Eye,
  Zap,
  Droplets,
  Calendar,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export const InvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const [genForm, setGenForm] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    dueDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
    serviceFee: 30000,
  });

  const [payForm, setPayForm] = useState({
    amount: 0,
    paymentMethod: 2, // 2: BankTransfer
    transactionCode: '',
    notes: 'Thu tiền trực tiếp tại văn phòng',
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [modalErr, setModalErr] = useState('');

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await invoiceApi.getAll({
        page,
        pageSize: 10,
        searchTerm,
        status: statusFilter ? Number(statusFilter) : undefined,
      });
      if (res.success) {
        setInvoices(res.data.items);
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
    fetchInvoices();
  }, [page, statusFilter]);

  const handleGenerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalErr('');
    setActionLoading(true);

    try {
      const res = await invoiceApi.generateMonthly({
        month: genForm.month,
        year: genForm.year,
        dueDate: new Date(genForm.dueDate),
        serviceFee: genForm.serviceFee,
      });

      if (res.success) {
        setIsGenerateOpen(false);
        fetchInvoices();
      }
    } catch (err: any) {
      setModalErr(err.message || 'Tạo hóa đơn tự động thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenPayment = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setPayForm({
      amount: inv.remainingAmount,
      paymentMethod: 2,
      transactionCode: `MB${Math.floor(10000000 + Math.random() * 90000000)}`,
      notes: 'Thanh toán tiền phòng KTX',
    });
    setModalErr('');
    setIsPaymentOpen(true);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    setModalErr('');
    setActionLoading(true);

    try {
      const res = await paymentApi.record({
        invoiceId: selectedInvoice.id,
        amount: payForm.amount,
        paymentMethod: payForm.paymentMethod,
        transactionCode: payForm.transactionCode,
        notes: payForm.notes,
      });

      if (res.success) {
        setIsPaymentOpen(false);
        fetchInvoices();
      }
    } catch (err: any) {
      setModalErr(err.message || 'Ghi nhận thanh toán thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (val?: number | null) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  const columns = [
    {
      header: 'Mã Hóa Đơn',
      render: (i: Invoice) => <span className="font-mono font-bold text-slate-900">{i.invoiceCode}</span>,
    },
    {
      header: 'Sinh Viên',
      render: (i: Invoice) => (
        <div>
          <p className="font-bold text-slate-800">{i.studentName}</p>
          <p className="text-xs text-slate-400">{i.studentCode} &bull; P.{i.roomNumber} ({i.buildingName})</p>
        </div>
      ),
    },
    {
      header: 'Kỳ Thu',
      render: (i: Invoice) => (
        <span className="font-semibold text-slate-700">
          {String(i.month).padStart(2, '0')}/{i.year}
        </span>
      ),
    },
    {
      header: 'Tổng Tiền',
      render: (i: Invoice) => <span className="font-bold text-slate-900">{formatCurrency(i.totalAmount)}</span>,
    },
    {
      header: 'Đã Thu',
      render: (i: Invoice) => (
        <span className="font-semibold text-emerald-600">
          {formatCurrency(i.paidAmount)}
        </span>
      ),
    },
    {
      header: 'Còn Nợ',
      render: (i: Invoice) => {
        const remaining = i.remainingAmount !== undefined ? i.remainingAmount : Math.max(0, (i.totalAmount || 0) - (i.paidAmount || 0));
        return (
          <span className={`font-bold ${remaining > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
            {formatCurrency(remaining)}
          </span>
        );
      },
    },
    {
      header: 'Hạn Nộp',
      render: (i: Invoice) => (
        <span className="text-xs text-slate-500">
          {i.dueDate ? new Date(i.dueDate).toLocaleDateString('vi-VN') : '---'}
        </span>
      ),
    },
    {
      header: 'Trạng Thái',
      render: (i: Invoice) => (
        <Badge
          variant={
            i.status === 3 ? 'success' : i.status === 2 ? 'warning' : i.status === 4 ? 'danger' : 'slate'
          }
        >
          {i.status === 3 ? 'Đã thu đủ' : i.status === 2 ? 'Thu một phần' : i.status === 4 ? 'Quá hạn' : 'Chưa thu'}
        </Badge>
      ),
    },
    {
      header: 'Thao tác',
      render: (i: Invoice) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => {
              setSelectedInvoice(i);
              setIsDetailOpen(true);
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
            title="Chi tiết"
          >
            <Eye className="w-4 h-4" />
          </button>
          {i.status !== 3 && (
            <button
              onClick={() => handleOpenPayment(i)}
              className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs flex items-center gap-1"
            >
              <CreditCard className="w-3.5 h-3.5" />
              Thu tiền
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex-1 pb-12">
      <Header
        title="Quản Lý Hóa Đơn Tiền Phòng"
        subtitle="Quản lý hóa đơn sinh viên, tiền phòng, điện nước, dịch vụ hàng tháng"
      />

      <div className="max-w-7xl mx-auto px-6 mt-6 space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Input
              placeholder="Tìm theo mã HĐ, tên sinh viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
            <Button
              variant="secondary"
              onClick={() => {
                setPage(1);
                fetchInvoices();
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
              <option value="1">Chưa thu</option>
              <option value="2">Thu một phần</option>
              <option value="3">Đã thu đủ</option>
            </select>

            <Button
              onClick={() => setIsGenerateOpen(true)}
              icon={<Sparkles className="w-4 h-4" />}
            >
              Tạo Hóa Đơn Tháng
            </Button>
          </div>
        </div>

        <Table columns={columns} data={invoices} loading={loading} />

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={10}
          onPageChange={(p) => setPage(p)}
        />
      </div>

      {/* Modal Tự Động Sinh Hóa Đơn Tháng */}
      <Modal
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        title="Tự Động Sinh Hóa Đơn Hàng Tháng"
      >
        {modalErr && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
            {modalErr}
          </div>
        )}
        <form onSubmit={handleGenerateSubmit} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-900 leading-relaxed">
            Hệ thống sẽ quét toàn bộ các hợp đồng đang hoạt động, kết hợp chỉ số điện nước đã ghi để tự động tạo hóa đơn chi tiết cho từng sinh viên.
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tháng</label>
              <select
                value={genForm.month}
                onChange={(e) => setGenForm({ ...genForm, month: Number(e.target.value) })}
                className="block w-full rounded-lg border border-slate-300 text-sm px-3.5 py-2 text-slate-900 bg-white"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>Tháng {m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Năm</label>
              <select
                value={genForm.year}
                onChange={(e) => setGenForm({ ...genForm, year: Number(e.target.value) })}
                className="block w-full rounded-lg border border-slate-300 text-sm px-3.5 py-2 text-slate-900 bg-white"
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
              </select>
            </div>
          </div>

          <Input
            label="Hạn chót thanh toán"
            type="date"
            value={genForm.dueDate}
            onChange={(e) => setGenForm({ ...genForm, dueDate: e.target.value })}
            required
          />

          <Input
            label="Phí dịch vụ chung / SV (Rác, vệ sinh, internet)"
            type="number"
            value={genForm.serviceFee}
            onChange={(e) => setGenForm({ ...genForm, serviceFee: Number(e.target.value) })}
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="secondary" onClick={() => setIsGenerateOpen(false)}>
              Hủy bỏ
            </Button>
            <Button type="submit" loading={actionLoading}>
              Bắt đầu tạo hóa đơn
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Thu Tiền / Ghi Nhận Thanh Toán */}
      {selectedInvoice && (
        <Modal
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          title={`Ghi Nhận Thanh Toán - ${selectedInvoice.invoiceCode}`}
        >
          {modalErr && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
              {modalErr}
            </div>
          )}
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <p><span className="text-slate-400">Sinh viên:</span> <span className="font-bold text-slate-900">{selectedInvoice.studentName} ({selectedInvoice.studentCode})</span></p>
              <p><span className="text-slate-400">Tổng hóa đơn:</span> <span className="font-bold text-slate-900">{formatCurrency(selectedInvoice.totalAmount)}</span></p>
              <p><span className="text-slate-400">Số tiền còn nợ:</span> <span className="font-bold text-rose-600">{formatCurrency(selectedInvoice.remainingAmount)}</span></p>
            </div>

            <Input
              label="Số tiền thu (VNĐ)"
              type="number"
              max={selectedInvoice.remainingAmount}
              value={payForm.amount}
              onChange={(e) => setPayForm({ ...payForm, amount: Number(e.target.value) })}
              required
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phương thức thanh toán</label>
              <select
                value={payForm.paymentMethod}
                onChange={(e) => setPayForm({ ...payForm, paymentMethod: Number(e.target.value) })}
                className="block w-full rounded-lg border border-slate-300 text-sm px-3.5 py-2 text-slate-900 bg-white"
              >
                <option value="1">Tiền mặt tại quầy (Cash)</option>
                <option value="2">Chuyển khoản ngân hàng (Bank Transfer)</option>
                <option value="3">VNPay QR</option>
                <option value="4">Ví MoMo</option>
              </select>
            </div>

            <Input
              label="Mã giao dịch / Mã tham chiếu ngân hàng"
              placeholder="VD: FT262559..."
              value={payForm.transactionCode}
              onChange={(e) => setPayForm({ ...payForm, transactionCode: e.target.value })}
            />

            <Input
              label="Ghi chú thu tiền"
              value={payForm.notes}
              onChange={(e) => setPayForm({ ...payForm, notes: e.target.value })}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button type="button" variant="secondary" onClick={() => setIsPaymentOpen(false)}>
                Hủy bỏ
              </Button>
              <Button type="submit" loading={actionLoading}>
                Xác nhận thu tiền
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Chi Tiết Hóa Đơn */}
      {selectedInvoice && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Chi Tiết Hóa Đơn - ${selectedInvoice.invoiceCode}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Sinh viên:</span>
                <span className="font-bold text-slate-900">{selectedInvoice.studentName} ({selectedInvoice.studentCode})</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Phòng:</span>
                <span className="font-bold text-indigo-700">{selectedInvoice.buildingName} - P.{selectedInvoice.roomNumber}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Tiền phòng:</span>
                <span className="font-semibold text-slate-800">{formatCurrency(selectedInvoice.roomFee)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Tiền điện:</span>
                <span className="font-semibold text-amber-700">{formatCurrency(selectedInvoice.electricityFee)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Tiền nước:</span>
                <span className="font-semibold text-sky-700">{formatCurrency(selectedInvoice.waterFee)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Phí dịch vụ:</span>
                <span className="font-semibold text-slate-800">{formatCurrency(selectedInvoice.serviceFee)}</span>
              </div>
              <div className="flex justify-between font-extrabold text-sm pt-1">
                <span className="text-slate-900">Tổng cộng:</span>
                <span className="text-indigo-600">{formatCurrency(selectedInvoice.totalAmount)}</span>
              </div>
            </div>

            {/* Payments history */}
            <div>
              <h4 className="font-bold text-slate-900 mb-2">Lịch sử thu tiền</h4>
              {selectedInvoice.payments.length === 0 ? (
                <p className="text-slate-400">Chưa có giao dịch thu tiền nào.</p>
              ) : (
                <div className="space-y-2">
                  {selectedInvoice.payments.map((p) => (
                    <div key={p.id} className="p-3 rounded-xl border border-slate-100 bg-emerald-50/50 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-emerald-900">{formatCurrency(p.amount)}</p>
                        <p className="text-slate-500">{p.paymentCode} &bull; Mã GD: {p.transactionCode}</p>
                      </div>
                      <span className="text-slate-400">{new Date(p.paymentDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                  ))}
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

