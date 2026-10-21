import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Badge, statusBadge } from '../../components/common/Badge';
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
  CheckCircle2
} from 'lucide-react';

const fmt = (n?: number | null) => new Intl.NumberFormat('vi-VN').format(n || 0);

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchInvoices();
  };

  const handleGenerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalErr('');
    setActionLoading(true);

    try {
      const res = await invoiceApi.generateMonthly({
        month: Number(genForm.month),
        year: Number(genForm.year),
        dueDate: new Date(genForm.dueDate),
        serviceFee: Number(genForm.serviceFee),
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
    const rem = inv.remainingAmount !== undefined ? inv.remainingAmount : Math.max(0, (inv.totalAmount || 0) - (inv.paidAmount || 0));
    setPayForm({
      amount: rem,
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
        amount: Number(payForm.amount),
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

  const totalUnpaid = invoices.reduce((acc, curr) => {
    const rem = curr.remainingAmount !== undefined ? curr.remainingAmount : Math.max(0, (curr.totalAmount || 0) - (curr.paidAmount || 0));
    return acc + rem;
  }, 0);

  return (
    <div className="flex-1 pb-12 bg-slate-50 min-h-screen">
      <Header
        title="Quản lý Hóa đơn"
        subtitle={`Tổng công nợ cần thu: ${fmt(totalUnpaid)}đ`}
      />

      <div className="max-w-7xl mx-auto px-6 mt-6 flex flex-col gap-5">
        {/* Top Action Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Quản lý Hóa đơn</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Tổng công nợ: <span className="text-red-600 font-semibold">{fmt(totalUnpaid)}đ</span>
            </p>
          </div>
          <Button icon={<Zap size={14} />} onClick={() => setIsGenerateOpen(true)}>
            Tạo hóa đơn tháng
          </Button>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-slate-100">
            <form onSubmit={handleSearchSubmit} className="relative w-64">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm mã HĐ hoặc tên sinh viên..."
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
              <option value="3">Đã thanh toán đủ</option>
              <option value="1">Chưa thanh toán</option>
              <option value="2">Thanh toán một phần</option>
              <option value="4">Quá hạn</option>
            </select>

            <span className="ml-auto text-xs text-slate-400">{invoices.length} / {totalItems} kết quả</span>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Mã HĐ', 'Sinh viên', 'Phòng', 'Kỳ thu', 'Tiền phòng', 'Điện', 'Nước', 'Dịch vụ', 'Tổng cộng', 'Đã TT', 'Còn lại', 'Hạn TT', 'Trạng thái', ''].map((h) => (
                    <th key={h} className="px-3 py-3 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {invoices.map((inv) => {
                  const remaining = inv.remainingAmount !== undefined ? inv.remainingAmount : Math.max(0, (inv.totalAmount || 0) - (inv.paidAmount || 0));

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-3 font-mono text-xs font-semibold text-blue-600">{inv.invoiceCode}</td>
                      <td className="px-3 py-3 text-sm font-semibold text-slate-800 whitespace-nowrap">
                        {inv.studentName}
                        <span className="block text-[11px] font-normal text-slate-400">{inv.studentCode}</span>
                      </td>
                      <td className="px-3 py-3 text-sm text-slate-600">P.{inv.roomNumber}</td>
                      <td className="px-3 py-3 text-sm font-mono text-slate-600">
                        {String(inv.month).padStart(2, '0')}/{inv.year}
                      </td>
                      <td className="px-3 py-3 text-sm font-mono text-slate-600 text-right">{fmt(inv.roomFee)}đ</td>
                      <td className="px-3 py-3 text-sm font-mono text-slate-600 text-right">{fmt(inv.electricityFee)}đ</td>
                      <td className="px-3 py-3 text-sm font-mono text-slate-600 text-right">{fmt(inv.waterFee)}đ</td>
                      <td className="px-3 py-3 text-sm font-mono text-slate-600 text-right">{fmt(inv.serviceFee)}đ</td>
                      <td className="px-3 py-3 text-sm font-mono font-bold text-slate-800 text-right">{fmt(inv.totalAmount)}đ</td>
                      <td className="px-3 py-3 text-sm font-mono text-green-600 font-medium text-right">{fmt(inv.paidAmount)}đ</td>
                      <td className={`px-3 py-3 text-sm font-mono font-semibold text-right ${remaining > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                        {fmt(remaining)}đ
                      </td>
                      <td className="px-3 py-3 text-xs text-slate-500 whitespace-nowrap">
                        {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('vi-VN') : '—'}
                      </td>
                      <td className="px-3 py-3">
                        <Badge
                          variant={
                            inv.status === 3 ? 'success' : inv.status === 2 ? 'warning' : inv.status === 4 ? 'danger' : 'default'
                          }
                        >
                          {inv.status === 3 ? 'Đã thanh toán' : inv.status === 2 ? 'Một phần' : inv.status === 4 ? 'Quá hạn' : 'Chưa thanh toán'}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setIsDetailOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Chi tiết"
                          >
                            <Eye size={14} />
                          </button>
                          {inv.status !== 3 && (
                            <button
                              onClick={() => handleOpenPayment(inv)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                              title="Thu tiền"
                            >
                              <CreditCard size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {invoices.length === 0 && !loading && (
                  <tr>
                    <td colSpan={14} className="text-center py-10 text-xs text-slate-400">
                      Không có hóa đơn nào được tìm thấy.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 text-xs text-slate-400">
            <span>Hiển thị trang {page} / {totalPages || 1} ({totalItems} hóa đơn)</span>
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

      {/* Modal Tạo Hóa Đơn Tự Động */}
      <Modal isOpen={isGenerateOpen} onClose={() => setIsGenerateOpen(false)} title="Tạo hóa đơn tháng">
        {modalErr && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
            {modalErr}
          </div>
        )}
        <form onSubmit={handleGenerateSubmit} className="space-y-4">
          <p className="text-xs text-slate-500">
            Hệ thống sẽ tự động quét chỉ số điện nước & các hợp đồng nội trú đang hiệu lực để phát hành hóa đơn cho toàn bộ sinh viên.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Tháng"
              type="number"
              min={1}
              max={12}
              value={genForm.month}
              onChange={(e) => setGenForm({ ...genForm, month: Number(e.target.value) })}
              required
            />
            <Input
              label="Năm"
              type="number"
              min={2020}
              max={2030}
              value={genForm.year}
              onChange={(e) => setGenForm({ ...genForm, year: Number(e.target.value) })}
              required
            />
          </div>

          <Input
            label="Hạn thanh toán"
            type="date"
            value={genForm.dueDate}
            onChange={(e) => setGenForm({ ...genForm, dueDate: e.target.value })}
            required
          />

          <Input
            label="Phí dịch vụ chung (VNĐ/người)"
            type="number"
            value={genForm.serviceFee}
            onChange={(e) => setGenForm({ ...genForm, serviceFee: Number(e.target.value) })}
            required
          />

          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700 space-y-1">
            <p className="font-semibold">Lưu ý khi tạo:</p>
            <p>&bull; Tiền điện và nước sẽ được tính tự động từ bảng ghi chỉ số chốt tháng.</p>
            <p>&bull; Thông báo hóa đơn sẽ được gửi ngay đến tài khoản cá nhân của sinh viên.</p>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={() => setIsGenerateOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" loading={actionLoading}>
              Xác nhận tạo
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Thu Tiền / Ghi Nhận Thanh Toán */}
      {selectedInvoice && (
        <Modal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} title={`Thu tiền — HĐ ${selectedInvoice.invoiceCode}`}>
          {modalErr && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
              {modalErr}
            </div>
          )}
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5">
              <p><span className="text-slate-400">Sinh viên:</span> <strong className="text-slate-800">{selectedInvoice.studentName} ({selectedInvoice.studentCode})</strong></p>
              <p><span className="text-slate-400">Phòng:</span> <strong className="text-slate-800">P.{selectedInvoice.roomNumber} ({selectedInvoice.buildingName})</strong></p>
              <p><span className="text-slate-400">Tổng hóa đơn:</span> <strong>{fmt(selectedInvoice.totalAmount)}đ</strong></p>
              <p><span className="text-slate-400">Số tiền còn nợ:</span> <strong className="text-red-600">{fmt(selectedInvoice.remainingAmount)}đ</strong></p>
            </div>

            <Input
              label="Số tiền thu (VNĐ)"
              type="number"
              value={payForm.amount}
              onChange={(e) => setPayForm({ ...payForm, amount: Number(e.target.value) })}
              required
            />

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Hình thức thanh toán</label>
              <select
                value={payForm.paymentMethod}
                onChange={(e) => setPayForm({ ...payForm, paymentMethod: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none bg-white text-slate-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                <option value={1}>Tiền mặt (Trực tiếp)</option>
                <option value={2}>Chuyển khoản ngân hàng (QR / App)</option>
                <option value={3}>Ví điện tử (Momo / VNPay)</option>
              </select>
            </div>

            <Input
              label="Mã giao dịch / Mã tham chiếu"
              placeholder="VD: MB12345678"
              value={payForm.transactionCode}
              onChange={(e) => setPayForm({ ...payForm, transactionCode: e.target.value })}
              required
            />

            <Input
              label="Ghi chú thanh toán"
              value={payForm.notes}
              onChange={(e) => setPayForm({ ...payForm, notes: e.target.value })}
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="secondary" type="button" onClick={() => setIsPaymentOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" loading={actionLoading}>
                Ghi nhận thu tiền
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Chi Tiết Hóa Đơn */}
      {selectedInvoice && (
        <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title={`Chi tiết hóa đơn — ${selectedInvoice.invoiceCode}`}>
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">{selectedInvoice.studentName}</h3>
                <p className="text-slate-400 font-mono">MSSV: {selectedInvoice.studentCode} &bull; P.{selectedInvoice.roomNumber}</p>
              </div>
              <Badge variant={selectedInvoice.status === 3 ? 'success' : 'danger'}>
                {selectedInvoice.status === 3 ? 'Đã thanh toán' : 'Chưa thu'}
              </Badge>
            </div>

            <div className="space-y-2 divide-y divide-slate-100">
              <div className="flex justify-between py-1.5"><span className="text-slate-500">Tiền thuê phòng:</span><strong className="font-mono text-slate-800">{fmt(selectedInvoice.roomFee)}đ</strong></div>
              <div className="flex justify-between py-1.5"><span className="text-slate-500">Tiền điện tiêu thụ:</span><strong className="font-mono text-slate-800">{fmt(selectedInvoice.electricityFee)}đ</strong></div>
              <div className="flex justify-between py-1.5"><span className="text-slate-500">Tiền nước sinh hoạt:</span><strong className="font-mono text-slate-800">{fmt(selectedInvoice.waterFee)}đ</strong></div>
              <div className="flex justify-between py-1.5"><span className="text-slate-500">Phí quản lý & dịch vụ:</span><strong className="font-mono text-slate-800">{fmt(selectedInvoice.serviceFee)}đ</strong></div>
              <div className="flex justify-between py-2 text-sm font-bold bg-slate-50 px-3 rounded-lg"><span className="text-slate-800">Tổng cộng:</span><span className="text-blue-600 font-mono">{fmt(selectedInvoice.totalAmount)}đ</span></div>
            </div>

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
