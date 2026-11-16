import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { repairApi, bankAccountApi } from '../../api';
import { RepairRequest, BankAccount } from '../../types';
import { Wrench, Plus, QrCode, Copy, Check, CheckCircle2, AlertTriangle } from 'lucide-react';

export const StudentRepairsPage: React.FC = () => {
  const [repairs, setRepairs] = useState<RepairRequest[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedBank, setSelectedBank] = useState<BankAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState<RepairRequest | null>(null);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [transCode, setTransCode] = useState('');
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState('');
  const [paySuccess, setPaySuccess] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 2, // Medium
  });

  const [formErr, setFormErr] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [repairRes, bankRes] = await Promise.all([
        repairApi.getMy(),
        bankAccountApi.getAll(),
      ]);
      if (repairRes.success) setRepairs(repairRes.data);
      if (bankRes.success) {
        setBankAccounts(bankRes.data);
        const defaultBank = bankRes.data.find((b) => b.isDefault) || bankRes.data[0] || null;
        setSelectedBank(defaultBank);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErr('');
    setActionLoading(true);

    try {
      const res = await repairApi.create(form);
      if (res.success) {
        setIsCreateOpen(false);
        setForm({ title: '', description: '', priority: 2 });
        fetchData();
      }
    } catch (err: any) {
      setFormErr(err.message || 'Gửi yêu cầu thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleConfirmPayment = async () => {
    if (!selectedRepair) return;
    setPayLoading(true);
    setPayError('');
    setPaySuccess(false);

    try {
      const res = await repairApi.pay(selectedRepair.id, {
        transactionCode: transCode,
        paymentMethod: 2, // BankTransfer / VietQR
      });
      if (res.success) {
        setPaySuccess(true);
        setTimeout(() => {
          setIsQrOpen(false);
          setPaySuccess(false);
          setTransCode('');
          fetchData();
        }, 1500);
      }
    } catch (err: any) {
      setPayError(err.message || 'Xác nhận thanh toán thất bại.');
    } finally {
      setPayLoading(false);
    }
  };

  const formatCurrency = (val: number | undefined | null) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(val) || 0);

  return (
    <div className="flex-1 pb-12 bg-slate-50 min-h-screen">
      <Header
        title="Báo hỏng thiết bị"
        subtitle="Gửi và theo dõi yêu cầu sửa chữa cơ sở vật chất trong phòng"
      />

      <div className="max-w-5xl mx-auto px-6 mt-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Báo hỏng thiết bị</h1>
            <p className="text-sm text-slate-500 mt-0.5">Tiếp nhận báo hỏng điện, nước, giường, khóa cửa...</p>
          </div>
          <Button icon={<Plus size={15} />} onClick={() => setIsCreateOpen(true)}>
            Báo hỏng mới
          </Button>
        </div>

        {repairs.some((r) => (r.repairCost || 0) > 0 && !r.isPaid) && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertTriangle size={16} className="text-amber-600 shrink-0" />
              <span>
                Bạn có chi phí sửa chữa vật tư cần thanh toán. Bạn có thể thanh toán trực tiếp tại đây hoặc qua{' '}
                <strong>Trung tâm Thanh toán & Hóa đơn</strong>.
              </span>
            </div>
            <Link
              to="/student/invoices?tab=repairs"
              className="font-bold text-amber-800 hover:text-amber-900 underline whitespace-nowrap"
            >
              Đến Trung tâm Thanh toán →
            </Link>
          </div>
        )}

        {/* List of repairs */}
        <div className="space-y-3.5">
          {repairs.length === 0 && !loading ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 shadow-sm">
              Bạn chưa gửi yêu cầu báo hỏng nào.
            </div>
          ) : (
            repairs.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                      <Wrench size={16} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{r.title}</h4>
                      <p className="text-xs text-slate-400">
                        Phòng {r.roomNumber} ({r.buildingName}) ·{' '}
                        {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={r.priority === 4 ? 'danger' : r.priority === 3 ? 'warning' : 'primary'}>
                      {r.priority === 4 ? 'Khẩn cấp' : r.priority === 3 ? 'Cao' : 'Bình thường'}
                    </Badge>
                    <Badge variant={r.status === 3 ? 'success' : r.status === 2 ? 'info' : 'warning'}>
                      {r.status === 3 ? 'Đã sửa xong' : r.status === 2 ? 'Đang xử lý' : 'Chờ tiếp nhận'}
                    </Badge>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{r.description}</p>

                {r.staffNotes && (
                  <div className="p-2.5 bg-blue-50/60 rounded-lg text-xs text-blue-800 border border-blue-100">
                    <span className="font-semibold">Phản hồi của kỹ thuật:</span> {r.staffNotes}
                  </div>
                )}

                {/* Chi phí phát sinh nếu có */}
                {r.repairCost > 0 && (
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border bg-amber-50/70 border-amber-200">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-semibold text-amber-900">Chi phí vật tư phát sinh:</span>
                      <span className="font-mono font-bold text-sm text-amber-800">
                        {formatCurrency(r.repairCost)}
                      </span>
                      <Badge variant={r.isPaid ? 'success' : 'danger'}>
                        {r.isPaid ? '✓ Đã thanh toán' : 'Chưa thanh toán'}
                      </Badge>
                    </div>
                    {!r.isPaid && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          setSelectedRepair(r);
                          setIsQrOpen(true);
                          setPayError('');
                          setPaySuccess(false);
                        }}
                        className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm flex items-center gap-1.5 py-1 px-3 text-xs"
                      >
                        <QrCode size={14} /> Thanh toán chi phí
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Thêm Báo Hỏng */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Gửi yêu cầu báo hỏng mới">
        {formErr && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
            {formErr}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Tiêu đề sự cố"
            placeholder="VD: Hỏng bóng đèn trần, rò rỉ vòi nước..."
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600">Mức độ ưu tiên</label>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none bg-white text-slate-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option value={1}>Thấp (Có thể hoãn lại)</option>
              <option value={2}>Bình thường (1-2 ngày)</option>
              <option value={3}>Cao (Cần xử lý trong ngày)</option>
              <option value={4}>Khẩn cấp (Cháy chập, ngập nước)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600">Mô tả chi tiết sự cố</label>
            <textarea
              rows={3}
              placeholder="Mô tả cụ thể vị trí, tình trạng hư hỏng để cán bộ kỹ thuật chuẩn bị dụng cụ..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={() => setIsCreateOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" loading={actionLoading}>
              Gửi yêu cầu
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Thanh toán chi phí sửa chữa qua VietQR */}
      {selectedRepair && (
        <Modal
          isOpen={isQrOpen}
          onClose={() => setIsQrOpen(false)}
          title={`Thanh toán chi phí sửa chữa — Yêu cầu #${selectedRepair.id}`}
          size="md"
        >
          {(() => {
            const payAmount = selectedRepair.repairCost;
            const curBank = selectedBank || (bankAccounts.length > 0 ? bankAccounts[0] : null);
            const bankCode = curBank?.bankCode || 'MB';
            const accountNumber = curBank?.accountNumber || '0968231204';
            const accountName = curBank?.accountName || 'DO THANH DUC';
            const bankName = curBank?.bankName || 'MB Bank';
            const memoCode = `SC${selectedRepair.id}`;

            const vietQrUrl = `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact2.png?amount=${payAmount}&addInfo=${encodeURIComponent(
              memoCode
            )}&accountName=${encodeURIComponent(accountName)}`;

            return (
              <div className="flex flex-col items-center space-y-3.5 text-center">
                {/* Bank Selector if multiple accounts */}
                {bankAccounts.length > 1 && (
                  <div className="w-full text-left">
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Chọn tài khoản KTX nhận tiền:
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
                                ? 'border-amber-600 bg-amber-50/80 shadow-sm ring-2 ring-amber-500/20'
                                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-slate-800">{b.bankCode}</span>
                              {b.isDefault && (
                                <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.2 rounded font-medium">
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
                <div className="p-3 bg-white border-2 border-amber-100 rounded-2xl shadow-sm relative group flex flex-col items-center w-full max-w-xs mx-auto">
                  <img
                    src={vietQrUrl}
                    alt="VietQR Repair Payment"
                    loading="lazy"
                    className="w-48 sm:w-56 h-auto rounded-lg max-h-64 object-contain max-w-full"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="mt-1.5 text-[11px] text-amber-700 font-semibold flex items-center gap-1">
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
                        className="p-1 text-slate-500 hover:text-amber-600 rounded bg-white border border-slate-200 hover:border-amber-400 transition"
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
                    <span className="text-slate-500">Chi phí sửa chữa:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-amber-800 text-sm">
                        {formatCurrency(payAmount)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(String(payAmount), 'amount')}
                        className="p-1 text-slate-500 hover:text-amber-600 rounded bg-white border border-slate-200 hover:border-amber-400 transition"
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
                        className="p-1 text-slate-500 hover:text-indigo-600 rounded bg-white border border-slate-200 hover:border-indigo-400 transition"
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

                <div className="w-full text-left bg-amber-50/60 border border-amber-100 rounded-lg p-2.5 text-[11px] text-amber-800">
                  💡 <strong>Cách thanh toán:</strong> Mở app ngân hàng quét mã QR trên. Sau khi chuyển xong, bấm <strong>"Xác nhận đã thanh toán"</strong> để hệ thống cập nhật trạng thái chi phí thành <strong>Đã thanh toán</strong>.
                </div>

                <div className="w-full text-left space-y-1">
                  <label className="text-xs font-medium text-slate-700">Mã giao dịch / Tham chiếu ngân hàng (nếu có):</label>
                  <input
                    type="text"
                    value={transCode}
                    onChange={(e) => setTransCode(e.target.value)}
                    placeholder="Ví dụ: FT260901234567"
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-amber-400"
                  />
                </div>

                {payError && (
                  <div className="w-full p-2.5 rounded-lg bg-red-50 text-red-600 text-xs text-left">
                    {payError}
                  </div>
                )}

                {paySuccess && (
                  <div className="w-full p-2.5 rounded-lg bg-green-50 text-green-700 text-xs flex items-center justify-center gap-1.5 font-bold">
                    <CheckCircle2 size={16} /> Thanh toán chi phí sửa chữa thành công!
                  </div>
                )}

                <Button
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                  onClick={handleConfirmPayment}
                  disabled={payLoading || paySuccess}
                >
                  {payLoading ? 'Đang ghi nhận thanh toán...' : 'Xác nhận đã thanh toán'}
                </Button>
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
};
