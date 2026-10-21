import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Badge, statusBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { invoiceApi } from '../../api';
import { Invoice } from '../../types';
import { Receipt, CreditCard, QrCode, CheckCircle2, Clock } from 'lucide-react';

const fmt = (n?: number | null) => new Intl.NumberFormat('vi-VN').format(n || 0);

export const StudentInvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await invoiceApi.getMy();
      if (res.success) setInvoices(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return (
    <div className="flex-1 pb-12 bg-slate-50 min-h-screen">
      <Header
        title="Hóa đơn của tôi"
        subtitle="Lịch sử hóa đơn phòng ở, điện nước và hướng dẫn thanh toán"
      />

      <div className="max-w-5xl mx-auto px-6 mt-6 flex flex-col gap-5">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Hóa đơn của tôi</h1>
          <p className="text-sm text-slate-500 mt-0.5">Danh sách các khoản phí tiền phòng, điện nước hàng tháng</p>
        </div>

        {invoices.length === 0 && !loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 shadow-sm">
            Bạn chưa có hóa đơn nào phát sinh.
          </div>
        ) : (
          invoices.map((inv) => {
            const remaining = inv.remainingAmount !== undefined ? inv.remainingAmount : Math.max(0, (inv.totalAmount || 0) - (inv.paidAmount || 0));
            const isPaid = inv.status === 3;

            return (
              <div
                key={inv.id}
                className={`bg-white rounded-xl border-2 overflow-hidden shadow-sm transition-all ${
                  isPaid ? 'border-slate-200' : 'border-red-200'
                }`}
              >
                {/* Invoice Header */}
                <div
                  className={`px-5 py-3.5 flex items-center justify-between border-b ${
                    isPaid ? 'bg-slate-50 border-slate-200' : 'bg-red-50/60 border-red-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-slate-800">{inv.invoiceCode}</span>
                    <span className="text-xs text-slate-500 font-medium">
                      &bull; Tháng {String(inv.month).padStart(2, '0')}/{inv.year}
                    </span>
                  </div>
                  <Badge variant={isPaid ? 'success' : inv.status === 2 ? 'warning' : 'danger'}>
                    {isPaid ? 'Đã thanh toán đủ' : inv.status === 2 ? 'Một phần' : 'Chưa thanh toán'}
                  </Badge>
                </div>

                {/* Breakdown Grid */}
                <div className="p-5">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm mb-4">
                    {[
                      { label: 'Tiền phòng', value: inv.roomFee },
                      { label: 'Tiền điện', value: inv.electricityFee },
                      { label: 'Tiền nước', value: inv.waterFee },
                      { label: 'Phí dịch vụ', value: inv.serviceFee },
                      { label: 'Tổng cộng', value: inv.totalAmount },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={`flex flex-col gap-0.5 ${
                          item.label === 'Tổng cộng' ? 'md:col-span-1' : ''
                        }`}
                      >
                        <span className="text-xs text-slate-400">{item.label}</span>
                        <span
                          className={`font-mono font-bold ${
                            item.label === 'Tổng cộng' ? 'text-blue-700 text-base' : 'text-slate-700'
                          }`}
                        >
                          {fmt(item.value)}đ
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Actions & Due Date Footer */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 pt-3.5">
                    <div className="text-xs text-slate-600">
                      <span>Hạn thanh toán: </span>
                      <strong className="text-slate-800">
                        {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('vi-VN') : '—'}
                      </strong>
                      {remaining > 0 && (
                        <span className="ml-3 text-red-600 font-bold">
                          Còn nợ: {fmt(remaining)}đ
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSelectedInvoice(inv);
                          setIsDetailOpen(true);
                        }}
                      >
                        Xem chi tiết
                      </Button>
                      {!isPaid && (
                        <Button
                          size="sm"
                          icon={<QrCode size={14} />}
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setIsQrOpen(true);
                          }}
                        >
                          Thanh toán ngay
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Chi Tiết Hóa Đơn */}
      {selectedInvoice && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Chi tiết hóa đơn — ${selectedInvoice.invoiceCode}`}
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
              <div className="flex justify-between px-4 py-2.5 bg-slate-50/50">
                <span className="text-slate-600">Tiền phòng (1 tháng)</span>
                <strong className="font-mono text-slate-800">{fmt(selectedInvoice.roomFee)}đ</strong>
              </div>
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-slate-600">Tiền điện tiêu thụ</span>
                <strong className="font-mono text-slate-800">{fmt(selectedInvoice.electricityFee)}đ</strong>
              </div>
              <div className="flex justify-between px-4 py-2.5 bg-slate-50/50">
                <span className="text-slate-600">Tiền nước sinh hoạt</span>
                <strong className="font-mono text-slate-800">{fmt(selectedInvoice.waterFee)}đ</strong>
              </div>
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-slate-600">Phí vệ sinh & quản lý dịch vụ</span>
                <strong className="font-mono text-slate-800">{fmt(selectedInvoice.serviceFee)}đ</strong>
              </div>
              <div className="flex justify-between px-4 py-3 bg-blue-50 font-bold text-sm">
                <span className="text-slate-800">Tổng cộng hóa đơn</span>
                <span className="text-blue-700 font-mono">{fmt(selectedInvoice.totalAmount)}đ</span>
              </div>
            </div>

            <div className="flex justify-between text-xs px-1">
              <span className="text-slate-500">Đã thanh toán:</span>
              <strong className="text-green-600 font-mono">{fmt(selectedInvoice.paidAmount)}đ</strong>
            </div>

            <div className="flex justify-between text-xs px-1">
              <span className="text-slate-500">Số tiền còn nợ:</span>
              <strong className="text-red-600 font-mono font-bold">
                {fmt(selectedInvoice.remainingAmount !== undefined ? selectedInvoice.remainingAmount : Math.max(0, (selectedInvoice.totalAmount || 0) - (selectedInvoice.paidAmount || 0)))}đ
              </strong>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setIsDetailOpen(false)}>
                Đóng
              </Button>
              {selectedInvoice.status !== 3 && (
                <Button
                  onClick={() => {
                    setIsDetailOpen(false);
                    setIsQrOpen(true);
                  }}
                  icon={<QrCode size={14} />}
                >
                  Mở mã QR nộp tiền
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Quét Mã QR Thanh Toán */}
      {selectedInvoice && (
        <Modal
          isOpen={isQrOpen}
          onClose={() => setIsQrOpen(false)}
          title={`Thanh toán hóa đơn ${selectedInvoice.invoiceCode}`}
          size="md"
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-4 bg-white border-2 border-slate-200 rounded-2xl shadow-sm">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=KTX-${selectedInvoice.invoiceCode}-${selectedInvoice.remainingAmount || selectedInvoice.totalAmount}`}
                alt="QR Code Pay"
                className="w-44 h-44 rounded-lg"
              />
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <p>
                Số tiền thanh toán:{' '}
                <strong className="text-base text-blue-700 font-mono font-bold">
                  {fmt(selectedInvoice.remainingAmount || selectedInvoice.totalAmount)}đ
                </strong>
              </p>
              <p className="text-slate-400">
                Nội dung chuyển khoản: <strong className="text-slate-800 font-mono font-bold">{selectedInvoice.invoiceCode}</strong>
              </p>
            </div>

            <p className="text-[11px] text-slate-400 italic">
              Sau khi chuyển khoản thành công, hệ thống hoặc kế toán sẽ kiểm tra và tự động cập nhật hóa đơn.
            </p>

            <Button className="w-full" onClick={() => setIsQrOpen(false)}>
              Tôi đã hoàn tất chuyển khoản
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};
