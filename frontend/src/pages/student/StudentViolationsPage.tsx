import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { violationApi, bankAccountApi } from '../../api';
import { Violation, BankAccount } from '../../types';
import { AlertTriangle, CheckCircle2, QrCode, Copy, Check } from 'lucide-react';

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

export const StudentViolationsPage: React.FC = () => {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedBank, setSelectedBank] = useState<BankAccount | null>(null);
  const [loading, setLoading] = useState(true);

  // Payment Modal State
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [transCode, setTransCode] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [payLoading, setPayLoading] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);
  const [payError, setPayError] = useState('');

  const fetchViolations = async () => {
    setLoading(true);
    try {
      const [resVio, resBank] = await Promise.all([
        violationApi.getMy(),
        bankAccountApi.getAll(),
      ]);
      if (resVio.success) setViolations(resVio.data);
      if (resBank.success && resBank.data) {
        setBankAccounts(resBank.data);
        const def = resBank.data.find((b) => b.isDefault) || resBank.data[0] || null;
        setSelectedBank(def);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViolations();
  }, []);

  const handleOpenPay = (v: Violation) => {
    setSelectedViolation(v);
    setTransCode(`VP${v.id}${Math.floor(1000 + Math.random() * 9000)}`);
    setPayError('');
    setPaySuccess(false);
    setIsQrOpen(true);
    if (!selectedBank && bankAccounts.length > 0) {
      setSelectedBank(bankAccounts.find((b) => b.isDefault) || bankAccounts[0]);
    }
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleConfirmPayment = async () => {
    if (!selectedViolation) return;
    setPayLoading(true);
    setPayError('');

    try {
      const res = await violationApi.pay(selectedViolation.id, {
        transactionCode: transCode,
        notes: `Sinh viên nộp phạt trực tuyến VietQR (${selectedBank?.bankCode || 'MB'} - ${selectedBank?.accountNumber || ''})`,
      });

      if (res.success) {
        setPaySuccess(true);
        setTimeout(() => {
          setIsQrOpen(false);
          fetchViolations();
        }, 1500);
      }
    } catch (err: any) {
      setPayError(err.message || 'Nộp phạt không thành công. Vui lòng thử lại.');
    } finally {
      setPayLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 pb-12 bg-slate-50 min-h-screen">
        <Header
          title="Lịch Sử Vi Phạm & Kỷ Luật"
          subtitle="Theo dõi các biên bản nhắc nhở, vi phạm nội quy và tình trạng nộp phạt"
        />
        <LoadingSpinner message="Đang nạp danh sách vi phạm..." />
      </div>
    );
  }

  return (
    <div className="flex-1 pb-12 bg-slate-50 min-h-screen">
      <Header
        title="Lịch Sử Vi Phạm & Kỷ Luật"
        subtitle="Theo dõi các biên bản nhắc nhở, vi phạm nội quy và tình trạng nộp phạt"
      />

      <div className="max-w-4xl mx-auto px-6 mt-6 space-y-4">
        {violations.some((v) => (v.penaltyAmount || 0) > 0 && v.status !== 3 && v.status !== 4) && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-rose-800">
              <AlertTriangle size={16} className="text-rose-600 shrink-0" />
              <span>
                Bạn có khoản phạt vi phạm nội quy cần nộp. Bạn có thể nộp phạt trực tiếp tại đây hoặc qua{' '}
                <strong>Trung tâm Thanh toán & Hóa đơn</strong>.
              </span>
            </div>
            <Link
              to="/student/invoices?tab=violations"
              className="font-bold text-rose-800 hover:text-rose-900 underline whitespace-nowrap"
            >
              Đến Trung tâm Thanh toán →
            </Link>
          </div>
        )}
        {violations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 shadow-sm">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">Không Có Vi Phạm</h3>
            <p className="text-xs text-slate-500 mt-1">
              Bạn luôn chấp hành tốt nội quy và quy chế ký túc xá!
            </p>
          </div>
        ) : (
          violations.map((v) => {
            const isResolved = v.status === 3;
            const hasPenalty = v.penaltyAmount > 0;

            return (
              <div
                key={v.id}
                className={`bg-white rounded-2xl border-2 p-5 shadow-sm space-y-3 transition-all ${
                  isResolved ? 'border-slate-200' : hasPenalty ? 'border-rose-200' : 'border-amber-200'
                }`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{v.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Loại vi phạm: {v.violationType}</p>
                  </div>
                  <Badge variant={isResolved ? 'success' : 'danger'}>
                    {isResolved ? 'Đã nộp phạt' : 'Chưa xử lý'}
                  </Badge>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{v.description}</p>

                {v.resolutionNotes && (
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-600">
                    <span className="font-semibold text-slate-700">Ghi chú giải quyết: </span>
                    {v.resolutionNotes}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                  <span className="text-slate-400">
                    Ngày lập: {new Date(v.violationDate).toLocaleDateString('vi-VN')}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className={`font-bold ${hasPenalty ? 'text-rose-600 text-sm' : 'text-slate-500'}`}>
                      Mức phạt: {hasPenalty ? formatCurrency(v.penaltyAmount) : 'Nhắc nhở'}
                    </span>
                    {hasPenalty && !isResolved && (
                      <Button
                        size="sm"
                        icon={<QrCode size={14} />}
                        onClick={() => handleOpenPay(v)}
                      >
                        Nộp phạt ngay
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Nộp Phạt Bằng Mã VietQR */}
      {selectedViolation && (
        <Modal
          isOpen={isQrOpen}
          onClose={() => setIsQrOpen(false)}
          title={`Nộp tiền phạt — Biên bản #${selectedViolation.id}`}
          size="md"
        >
          {(() => {
            const payAmount = selectedViolation.penaltyAmount;
            const curBank = selectedBank || (bankAccounts.length > 0 ? bankAccounts[0] : null);
            const bankCode = curBank?.bankCode || 'MB';
            const accountNumber = curBank?.accountNumber || '0968231204';
            const accountName = curBank?.accountName || 'DO THANH DUC';
            const bankName = curBank?.bankName || 'MB Bank';
            const memoCode = `VP${selectedViolation.id}`;

            const vietQrUrl = `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact2.png?amount=${payAmount}&addInfo=${encodeURIComponent(
              memoCode
            )}&accountName=${encodeURIComponent(accountName)}`;

            return (
              <div className="flex flex-col items-center space-y-3.5 text-center">
                {/* Bank Selector if multiple accounts */}
                {bankAccounts.length > 1 && (
                  <div className="w-full text-left">
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Chọn tài khoản KTX nhận tiền phạt:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {bankAccounts.map((b) => {
                        const isSelected = curBank?.id === b.id;
                        return (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => setSelectedBank(b)}
                            className={`p-2.5 rounded-xl border text-left flex flex-col transition-all cursor-pointer ${
                              isSelected
                                ? 'border-blue-600 bg-blue-50/80 shadow-sm ring-2 ring-blue-500/20'
                                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-slate-800">{b.bankCode}</span>
                              {b.isDefault && (
                                <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded font-medium">
                                  Chính
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-mono text-slate-500 truncate mt-0.5">
                              {b.accountNumber}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Real VietQR Napas Code */}
                <div className="p-3 bg-white border-2 border-rose-100 rounded-2xl shadow-sm relative group flex flex-col items-center w-full max-w-xs mx-auto">
                  <img
                    src={vietQrUrl}
                    alt="VietQR Fine Payment"
                    loading="lazy"
                    className="w-48 sm:w-56 h-auto rounded-lg max-h-64 object-contain max-w-full"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="mt-1.5 text-[11px] text-rose-700 font-semibold flex items-center gap-1">
                    <span>Chuẩn VietQR · Napas 24/7</span>
                  </div>
                </div>

                {/* Account Details Card with 1-click Copy */}
                <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 text-xs text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Ngân hàng thụ hưởng:</span>
                    <span className="font-semibold text-slate-800 truncate max-w-[220px]">
                      {bankName} ({bankCode})
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Chủ tài khoản:</span>
                    <span className="font-bold text-slate-800 uppercase">
                      {accountName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Số tài khoản:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {accountNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(accountNumber, 'accNum')}
                        className="p-1 text-slate-500 hover:text-blue-600 rounded bg-white border border-slate-200 hover:border-blue-400 transition"
                        title="Sao chép số tài khoản"
                      >
                        {copiedField === 'accNum' ? (
                          <Check size={13} className="text-green-600" />
                        ) : (
                          <Copy size={13} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                    <span className="text-slate-500">Số tiền phạt:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-rose-700 text-sm">
                        {formatCurrency(payAmount)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(String(payAmount), 'amount')}
                        className="p-1 text-slate-500 hover:text-blue-600 rounded bg-white border border-slate-200 hover:border-blue-400 transition"
                        title="Sao chép số tiền"
                      >
                        {copiedField === 'amount' ? (
                          <Check size={13} className="text-green-600" />
                        ) : (
                          <Copy size={13} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Nội dung chuyển khoản:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        {memoCode}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(memoCode, 'memo')}
                        className="p-1 text-slate-500 hover:text-blue-600 rounded bg-white border border-slate-200 hover:border-indigo-400 transition"
                        title="Sao chép nội dung"
                      >
                        {copiedField === 'memo' ? (
                          <Check size={13} className="text-green-600" />
                        ) : (
                          <Copy size={13} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="w-full text-left bg-rose-50/60 border border-rose-100 rounded-lg p-2.5 text-[11px] text-rose-800">
                  💡 <strong>Cách nộp phạt:</strong> Mở app ngân hàng quét mã QR trên để hệ thống tự động điền STK, Số tiền và Nội dung. Sau khi chuyển xong, bấm <strong>"Xác nhận đã nộp phạt"</strong> bên dưới để hệ thống cập nhật biên bản thành <strong>Đã xử lý</strong>.
                </div>

                <div className="w-full text-left space-y-1">
                  <label className="text-xs font-medium text-slate-700">Mã giao dịch / Tham chiếu ngân hàng (nếu có):</label>
                  <input
                    type="text"
                    value={transCode}
                    onChange={(e) => setTransCode(e.target.value)}
                    placeholder="Ví dụ: FT260901234567"
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue-400"
                  />
                </div>

                {payError && (
                  <div className="w-full p-2.5 rounded-lg bg-red-50 text-red-600 text-xs text-left">
                    {payError}
                  </div>
                )}

                {paySuccess && (
                  <div className="w-full p-2.5 rounded-lg bg-green-50 text-green-700 text-xs flex items-center justify-center gap-1.5 font-bold">
                    <Check size={16} /> Nộp phạt thành công! Trạng thái vi phạm đã chuyển sang Đã xử lý.
                  </div>
                )}

                <Button
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white"
                  onClick={handleConfirmPayment}
                  disabled={payLoading || paySuccess}
                >
                  {payLoading ? 'Đang ghi nhận nộp phạt...' : 'Xác nhận đã nộp phạt'}
                </Button>
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
};
