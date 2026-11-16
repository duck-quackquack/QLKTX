import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Table } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Pagination } from '../../components/common/Pagination';
import { paymentApi, bankAccountApi } from '../../api';
import { Payment, BankAccount } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import {
  Search,
  CreditCard,
  Landmark,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Star,
  Building2,
  Check,
  AlertCircle,
} from 'lucide-react';

const VIETNAMESE_BANKS = [
  { code: 'MB', name: 'MB Bank (Ngân hàng Quân Đội)' },
  { code: 'VCB', name: 'Vietcombank (Ngoại Thương Việt Nam)' },
  { code: 'TCB', name: 'Techcombank (Kỹ Thương Việt Nam)' },
  { code: 'ICB', name: 'VietinBank (Công Thương Việt Nam)' },
  { code: 'BIDV', name: 'BIDV (Đầu tư và Phát triển VN)' },
  { code: 'ACB', name: 'ACB (Á Châu)' },
  { code: 'TPB', name: 'TPBank (Tiên Phong)' },
  { code: 'VPB', name: 'VPBank (Việt Nam Thịnh Vượng)' },
  { code: 'STB', name: 'Sacombank (Sài Gòn Thương Tín)' },
  { code: 'HDB', name: 'HDBank (Phát triển TP.HCM)' },
  { code: 'VIB', name: 'VIB (Quốc Tế)' },
  { code: 'SHB', name: 'SHB (Sài Gòn - Hà Nội)' },
  { code: 'OCB', name: 'OCB (Phương Đông)' },
  { code: 'MSB', name: 'MSB (Hàng Hải)' },
  { code: 'VBA', name: 'Agribank (Nông nghiệp & PTNT)' },
];

export const PaymentsPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 1;
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  // Bank accounts state
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [bankLoading, setBankLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [bankMsg, setBankMsg] = useState({ type: '', text: '' });

  const [bankForm, setBankForm] = useState({
    bankCode: 'MB',
    bankName: 'MB Bank (Ngân hàng Quân Đội)',
    accountNumber: '',
    accountName: '',
    branch: '',
    notes: '',
    isDefault: false,
    isActive: true,
  });

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await paymentApi.getAll({
        page,
        pageSize: 10,
        searchTerm,
      });
      if (res.success) {
        setPayments(res.data.items);
        setTotalPages(res.data.totalPages);
        setTotalItems(res.data.totalItems);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBankAccounts = async () => {
    setBankLoading(true);
    try {
      const res = await bankAccountApi.getAll();
      if (res.success) {
        setBankAccounts(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBankLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [page]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setBankForm({
      bankCode: 'MB',
      bankName: 'MB Bank (Ngân hàng Quân Đội)',
      accountNumber: '',
      accountName: '',
      branch: '',
      notes: '',
      isDefault: bankAccounts.length === 0,
      isActive: true,
    });
    setBankMsg({ type: '', text: '' });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (acc: BankAccount) => {
    setEditingId(acc.id);
    setBankForm({
      bankCode: acc.bankCode,
      bankName: acc.bankName,
      accountNumber: acc.accountNumber,
      accountName: acc.accountName,
      branch: acc.branch || '',
      notes: acc.notes || '',
      isDefault: acc.isDefault,
      isActive: acc.isActive,
    });
    setBankMsg({ type: '', text: '' });
    setIsFormOpen(true);
  };

  const handleBankSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = VIETNAMESE_BANKS.find((b) => b.code === e.target.value);
    if (selected) {
      setBankForm({
        ...bankForm,
        bankCode: selected.code,
        bankName: selected.name,
      });
    }
  };

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setBankMsg({ type: '', text: '' });

    if (!bankForm.accountNumber.trim() || !bankForm.accountName.trim()) {
      setBankMsg({ type: 'error', text: 'Vui lòng nhập đầy đủ Số tài khoản và Tên chủ tài khoản.' });
      return;
    }

    try {
      if (editingId) {
        const res = await bankAccountApi.update(editingId, bankForm);
        if (res.success) {
          setBankMsg({ type: 'success', text: 'Cập nhật tài khoản ngân hàng thành công!' });
          setIsFormOpen(false);
          fetchBankAccounts();
        }
      } else {
        const res = await bankAccountApi.create(bankForm);
        if (res.success) {
          setBankMsg({ type: 'success', text: 'Thêm tài khoản ngân hàng mới thành công!' });
          setIsFormOpen(false);
          fetchBankAccounts();
        }
      }
    } catch (err: any) {
      setBankMsg({ type: 'error', text: err.message || 'Lưu tài khoản thất bại' });
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      const res = await bankAccountApi.setDefault(id);
      if (res.success) {
        fetchBankAccounts();
      }
    } catch (err: any) {
      alert(err.message || 'Không thể đặt mặc định');
    }
  };

  const handleDeleteBank = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài khoản ngân hàng này?')) return;
    try {
      const res = await bankAccountApi.delete(id);
      if (res.success) {
        fetchBankAccounts();
      }
    } catch (err: any) {
      alert(err.message || 'Không thể xóa tài khoản');
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const getMethodName = (m: number) => {
    switch (m) {
      case 1: return 'Tiền mặt';
      case 2: return 'Chuyển khoản VietQR';
      case 3: return 'VNPay';
      case 4: return 'MoMo';
      default: return 'Khác';
    }
  };

  const columns = [
    {
      header: 'Mã Giao Dịch',
      render: (p: Payment) => <span className="font-mono font-bold text-slate-900">{p.paymentCode}</span>,
    },
    {
      header: 'Mã Hóa Đơn',
      render: (p: Payment) => <span className="font-mono text-indigo-700 font-semibold">{p.invoiceCode}</span>,
    },
    {
      header: 'Sinh Viên Nộp',
      render: (p: Payment) => (
        <div>
          <p className="font-semibold text-slate-800 text-xs">{p.studentName || 'Sinh viên KTX'}</p>
          <p className="text-[11px] text-slate-400 font-mono">
            {p.studentCode ? `${p.studentCode}` : ''} {p.roomNumber ? `• P.${p.roomNumber}` : ''}
          </p>
        </div>
      ),
    },
    {
      header: 'Số Tiền Thu',
      render: (p: Payment) => (
        <span className="font-bold text-emerald-600 text-sm">
          {formatCurrency(p.amount)}
        </span>
      ),
    },
    {
      header: 'Hình Thức',
      render: (p: Payment) => (
        <Badge variant={p.paymentMethod === 1 ? 'slate' : 'primary'}>
          {getMethodName(p.paymentMethod)}
        </Badge>
      ),
    },
    {
      header: 'Mã Tham Chiếu / GD',
      render: (p: Payment) => <span className="font-mono text-xs text-slate-500">{p.transactionCode || '-'}</span>,
    },
    {
      header: 'Ngày Thu',
      render: (p: Payment) => (
        <span className="text-xs text-slate-500">
          {new Date(p.paymentDate).toLocaleString('vi-VN')}
        </span>
      ),
    },
    {
      header: 'Đơn Vị / Cán Bộ Nhận',
      render: (p: Payment) => (
        <span className="text-xs font-medium text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
          {p.receivedBy || 'Ban Quản Trị KTX'}
        </span>
      ),
    },
  ];

  return (
    <div className="flex-1 pb-12">
      <Header
        title="Lịch Sử Giao Dịch & Thu Tiền"
        subtitle="Sổ quỹ và lịch sử thanh toán toàn bộ hóa đơn của sinh viên"
      />

      <div className="max-w-7xl mx-auto px-6 mt-6 space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 max-w-md w-full">
            <Input
              placeholder="Tìm theo mã GD, mã hóa đơn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
            <Button
              variant="secondary"
              onClick={() => {
                setPage(1);
                fetchPayments();
              }}
            >
              Tìm
            </Button>
          </div>

          <Button
            variant="primary"
            icon={<Landmark size={16} />}
            onClick={() => {
              setIsBankModalOpen(true);
              fetchBankAccounts();
            }}
          >
            Cấu hình STK Ngân Hàng
          </Button>
        </div>

        <Table columns={columns} data={payments} loading={loading} />

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={10}
          onPageChange={(p) => setPage(p)}
        />
      </div>

      {/* Modal Cấu hình STK Ngân hàng */}
      <Modal
        isOpen={isBankModalOpen}
        onClose={() => {
          setIsBankModalOpen(false);
          setIsFormOpen(false);
        }}
        title="Cấu hình Tài khoản Ngân hàng (VietQR)"
        size="lg"
      >
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-800 flex items-start gap-2.5">
            <Building2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold">Tài khoản thụ hưởng tiền ký túc xá</p>
              <p className="mt-0.5 text-blue-600">
                Các tài khoản dưới đây được dùng để tự động tạo mã VietQR Napas khi sinh viên quét thanh toán hóa đơn.
                Bạn có thể thêm nhiều tài khoản, đổi chủ sở hữu, hoặc chọn tài khoản nhận tiền chính bất kỳ lúc nào.
              </p>
            </div>
          </div>

          {bankMsg.text && (
            <div
              className={`p-3 rounded-lg text-xs font-semibold ${
                bankMsg.type === 'error'
                  ? 'bg-rose-50 border border-rose-200 text-rose-700'
                  : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
              }`}
            >
              {bankMsg.text}
            </div>
          )}

          {!isFormOpen ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Danh sách tài khoản ({bankAccounts.length})
                </span>
                {isAdmin ? (
                  <Button size="sm" icon={<Plus size={14} />} onClick={handleOpenAdd}>
                    Thêm tài khoản mới
                  </Button>
                ) : (
                  <span className="text-[11px] text-slate-500 font-medium italic bg-slate-100 px-2.5 py-1 rounded-md">
                    Chế độ xem thông tin tài khoản (Chỉ Admin mới có quyền sửa/xóa)
                  </span>
                )}
              </div>

              {bankLoading ? (
                <div className="py-8 text-center text-xs text-slate-400">Đang tải danh sách tài khoản...</div>
              ) : bankAccounts.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">Chưa có tài khoản ngân hàng nào.</div>
              ) : (
                <div className="space-y-3">
                  {bankAccounts.map((acc) => (
                    <div
                      key={acc.id}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        acc.isDefault
                          ? 'border-blue-500 bg-blue-50/20 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-blue-700 border border-slate-200 shrink-0">
                            {acc.bankCode}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-slate-900">{acc.bankName}</h4>
                              {acc.isDefault && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-green-100 text-green-700">
                                  <Star size={11} className="fill-green-600" /> Tài khoản chính (Mặc định)
                                </span>
                              )}
                              {!acc.isActive && (
                                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500">
                                  Tạm khóa
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 mt-1">
                              Số tài khoản: <strong className="font-mono text-sm text-blue-700 font-bold">{acc.accountNumber}</strong> &bull; Chủ TK: <strong className="uppercase text-slate-800">{acc.accountName}</strong>
                            </p>
                            {acc.notes && <p className="text-[11px] text-slate-400 mt-0.5 italic">{acc.notes}</p>}
                          </div>
                        </div>

                        {isAdmin && (
                          <div className="flex items-center gap-1.5 ml-auto">
                            {!acc.isDefault && (
                              <button
                                onClick={() => handleSetDefault(acc.id)}
                                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                                title="Đặt làm tài khoản nhận tiền chính"
                              >
                                Đặt làm chính
                              </button>
                            )}
                            <button
                              onClick={() => handleOpenEdit(acc)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Sửa thông tin"
                            >
                              <Edit2 size={15} />
                            </button>
                            {bankAccounts.length > 1 && (
                              <button
                                onClick={() => handleDeleteBank(acc.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Xóa tài khoản"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Form Thêm / Sửa tài khoản */
            <form onSubmit={handleSaveBank} className="space-y-4 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <h4 className="text-sm font-bold text-slate-800">
                  {editingId ? 'Chỉnh sửa tài khoản ngân hàng' : 'Thêm tài khoản ngân hàng mới'}
                </h4>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  Đóng form
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-700">Ngân hàng thụ hưởng</label>
                  <select
                    value={bankForm.bankCode}
                    onChange={handleBankSelectChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none bg-white text-slate-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    {VIETNAMESE_BANKS.map((b) => (
                      <option key={b.code} value={b.code}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Số tài khoản ngân hàng"
                  placeholder="Ví dụ: 0968231204"
                  value={bankForm.accountNumber}
                  onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Tên chủ tài khoản (viết hoa không dấu)"
                  placeholder="Ví dụ: DO THANH DUC"
                  value={bankForm.accountName}
                  onChange={(e) => setBankForm({ ...bankForm, accountName: e.target.value.toUpperCase() })}
                  required
                />
                <Input
                  label="Chi nhánh (không bắt buộc)"
                  placeholder="Ví dụ: Chi nhánh Hà Nội, TP.HCM..."
                  value={bankForm.branch}
                  onChange={(e) => setBankForm({ ...bankForm, branch: e.target.value })}
                />
              </div>

              <Input
                label="Ghi chú nhận diện"
                placeholder="Ví dụ: Tài khoản chính nhận tiền phòng, Tài khoản phụ 2..."
                value={bankForm.notes}
                onChange={(e) => setBankForm({ ...bankForm, notes: e.target.value })}
              />

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={bankForm.isDefault}
                    onChange={(e) => setBankForm({ ...bankForm, isDefault: e.target.checked })}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  Đặt làm tài khoản nhận tiền chính (Mặc định)
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={bankForm.isActive}
                    onChange={(e) => setBankForm({ ...bankForm, isActive: e.target.checked })}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  Đang hoạt động
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit">
                  {editingId ? 'Lưu thay đổi' : 'Thêm tài khoản'}
                </Button>
              </div>
            </form>
          )}

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsBankModalOpen(false)}>
              Đóng
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
