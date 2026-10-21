import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { invoiceApi } from '../../api';
import { Invoice } from '../../types';
import { Receipt, CreditCard, QrCode, CheckCircle2, Clock } from 'lucide-react';

export const StudentInvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
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

  const formatCurrency = (val?: number | null) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  return (
    <div className="flex-1 pb-12">
      <Header
        title="Hóa Đơn & Thanh Toán Tiền Phòng"
        subtitle="Chi tiết các khoản phí tiền phòng, điện nước và hướng dẫn thanh toán"
      />

      <div className="max-w-4xl mx-auto px-6 mt-6 space-y-4">
        {invoices.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
            Bạn chưa có hóa đơn nào cần thanh toán.
          </div>
        ) : (
          invoices.map((inv) => (
            <div key={inv.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-indigo-600" />
                  <span className="font-mono font-bold text-slate-900">{inv.invoiceCode}</span>
                  <span className="text-xs text-slate-400">&bull; Kỳ {String(inv.month).padStart(2, '0')}/{inv.year}</span>
                </div>
                <Badge variant={inv.status === 3 ? 'success' : inv.status === 2 ? 'warning' : 'danger'}>
                  {inv.status === 3 ? 'Đã thanh toán đủ' : inv.status === 2 ? 'Đã trả một phần' : 'Chưa thanh toán'}
                </Badge>
              </div>

              {/* Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">Tiền phòng:</span>
                  <span className="font-bold text-slate-800">{formatCurrency(inv.roomFee)}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">Tiền điện:</span>
                  <span className="font-bold text-amber-700">{formatCurrency(inv.electricityFee)}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">Tiền nước:</span>
                  <span className="font-bold text-sky-700">{formatCurrency(inv.waterFee)}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">Phí dịch vụ:</span>
                  <span className="font-bold text-slate-800">{formatCurrency(inv.serviceFee)}</span>
                </div>
              </div>

              {/* Total & Action */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100">
                <div>
                  <p className="text-xs text-slate-500">
                    Hạn thanh toán: <span className="font-semibold text-slate-700">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('vi-VN') : '---'}</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Đã thanh toán: <span className="font-bold text-emerald-600">{formatCurrency(inv.paidAmount)}</span> &bull; Còn nợ:{' '}
                    <span className="font-black text-rose-600 text-sm">
                      {formatCurrency(inv.remainingAmount !== undefined ? inv.remainingAmount : Math.max(0, (inv.totalAmount || 0) - (inv.paidAmount || 0)))}
                    </span>
                  </p>
                </div>

                {(inv.remainingAmount !== undefined ? inv.remainingAmount : Math.max(0, (inv.totalAmount || 0) - (inv.paidAmount || 0))) > 0 && (
                  <Button
                    onClick={() => {
                      setSelectedInvoice(inv);
                      setIsQrOpen(true);
                    }}
                    icon={<QrCode className="w-4 h-4" />}
                  >
                    Chuyển Khoản / Quét Mã QR
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Hướng Dẫn Chuyển Khoản & QR Thanh Toán */}
      {selectedInvoice && (
        <Modal
          isOpen={isQrOpen}
          onClose={() => setIsQrOpen(false)}
          title={`Thanh Toán Hóa Đơn - ${selectedInvoice.invoiceCode}`}
          maxWidth="sm"
        >
          <div className="space-y-4 text-center">
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 inline-block">
              {/* Demo QR Placeholder */}
              <div className="w-48 h-48 bg-white rounded-xl border border-slate-200 p-2 mx-auto flex flex-col items-center justify-center shadow-inner">
                <QrCode className="w-32 h-32 text-indigo-900 mb-2" />
                <span className="text-[10px] font-bold text-slate-600 uppercase">VietQR MBBank</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Ngân hàng:</span>
                <span className="font-bold text-slate-900">MBBank (Quân Đội)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Số tài khoản:</span>
                <span className="font-mono font-bold text-indigo-700 text-sm">8888.6666.9999</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Chủ tài khoản:</span>
                <span className="font-bold text-slate-900">BAN QUAN LY KTX TRUONG</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Số tiền:</span>
                <span className="font-black text-rose-600 text-sm">{formatCurrency(selectedInvoice.remainingAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Nội dung CK:</span>
                <span className="font-mono font-bold text-slate-900 bg-amber-100 px-2 py-0.5 rounded">
                  {selectedInvoice.invoiceCode}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Sau khi chuyển khoản, hệ thống sẽ tự động đối soát và cập nhật trạng thái hóa đơn của bạn trong vòng 1-2 tiếng.
            </p>

            <div className="pt-2">
              <Button variant="secondary" className="w-full" onClick={() => setIsQrOpen(false)}>
                Đã hoàn tất
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

