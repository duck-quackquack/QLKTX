import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import {
  invoiceApi,
  paymentApi,
  repairApi,
  violationApi,
  bankAccountApi,
} from '../../api';
import {
  Invoice,
  RepairRequest,
  Violation,
  Payment,
  BankAccount,
} from '../../types';
import {
  Receipt,
  CreditCard,
  QrCode,
  CheckCircle2,
  Clock,
  Check,
  Copy,
  Wrench,
  AlertTriangle,
  Layers,
  History,
  ArrowRight,
  ShieldAlert,
  Zap,
  Droplets,
  Calendar,
  Building2,
  FileCheck2,
  Sparkles,
  CheckSquare,
  Square,
  Wallet,
} from 'lucide-react';

const fmt = (n?: number | null) => new Intl.NumberFormat('vi-VN').format(n || 0);

type TabType = 'all' | 'invoices' | 'repairs' | 'violations' | 'history';

interface UnifiedPayableItem {
  key: string;
  sourceType: 'invoice' | 'repair' | 'violation';
  id: number;
  title: string;
  subtitle: string;
  roomInfo?: string;
  date: string;
  amount: number;
  isPaid: boolean;
  statusText: string;
  statusVariant: 'success' | 'warning' | 'danger';
  rawItem: Invoice | RepairRequest | Violation;
}

interface PaymentTarget {
  type: 'invoice' | 'repair' | 'violation';
  id: number;
  code: string;
  title: string;
  subtitle: string;
  amount: number;
  memo: string;
  notesDefault: string;
}

interface BatchPaymentTarget {
  items: UnifiedPayableItem[];
  totalAmount: number;
  memo: string;
}

export const StudentInvoicesPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabType) || 'all';
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [repairs, setRepairs] = useState<RepairRequest[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedBank, setSelectedBank] = useState<BankAccount | null>(null);
  const [loading, setLoading] = useState(true);

  // Selection state for batch payment in Tab 1
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  // Detail Modal for Invoice Breakdown
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Single Payment Modal State
  const [paymentTarget, setPaymentTarget] = useState<PaymentTarget | null>(null);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [transCode, setTransCode] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [payLoading, setPayLoading] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);
  const [payError, setPayError] = useState('');

  // Batch / Pay All Modal State
  const [batchTarget, setBatchTarget] = useState<BatchPaymentTarget | null>(null);
  const [isBatchQrOpen, setIsBatchQrOpen] = useState(false);
  const [batchTransCode, setBatchTransCode] = useState('');
  const [batchPayLoading, setBatchPayLoading] = useState(false);
  const [batchPaySuccess, setBatchPaySuccess] = useState(false);
  const [batchPayError, setBatchPayError] = useState('');

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [resInv, resRep, resVio, resPay, resBank] = await Promise.all([
        invoiceApi.getMy(),
        repairApi.getMy(),
        violationApi.getMy(),
        paymentApi.getMy(),
        bankAccountApi.getAll(),
      ]);

      if (resInv.success) setInvoices(resInv.data || []);
      if (resRep.success) setRepairs(resRep.data || []);
      if (resVio.success) setViolations(resVio.data || []);
      if (resPay.success) setPayments(resPay.data || []);
      if (resBank.success && resBank.data) {
        setBankAccounts(resBank.data);
        const def = resBank.data.find((b) => b.isDefault) || resBank.data[0] || null;
        setSelectedBank(def);
      }
    } catch (err) {
      console.error('Lỗi nạp dữ liệu tài chính sinh viên:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Sync tab with URL search parameter if changed
  useEffect(() => {
    const tabParam = searchParams.get('tab') as TabType;
    if (tabParam && ['all', 'invoices', 'repairs', 'violations', 'history'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // --- Financial Calculations ---
  // Invoices
  const unpaidInvoices = useMemo(
    () => invoices.filter((i) => i.status !== 3),
    [invoices]
  );
  const totalInvoiceDebt = useMemo(
    () =>
      unpaidInvoices.reduce((acc, cur) => {
        const rem = cur.remainingAmount !== undefined ? cur.remainingAmount : Math.max(0, (cur.totalAmount || 0) - (cur.paidAmount || 0));
        return acc + rem;
      }, 0),
    [unpaidInvoices]
  );

  // Repairs with cost
  const unpaidRepairs = useMemo(
    () => repairs.filter((r) => (r.repairCost || 0) > 0 && !r.isPaid),
    [repairs]
  );
  const totalRepairDebt = useMemo(
    () => unpaidRepairs.reduce((acc, cur) => acc + (cur.repairCost || 0), 0),
    [unpaidRepairs]
  );

  // Violations with fine (status !== 3: Paid && status !== 4: Cancelled)
  const unpaidViolations = useMemo(
    () => violations.filter((v) => (v.penaltyAmount || 0) > 0 && v.status !== 3 && v.status !== 4),
    [violations]
  );
  const totalViolationDebt = useMemo(
    () => unpaidViolations.reduce((acc, cur) => acc + (cur.penaltyAmount || 0), 0),
    [unpaidViolations]
  );

  // Grand Total Debt
  const grandTotalDebt = totalInvoiceDebt + totalRepairDebt + totalViolationDebt;
  const totalUnpaidCount = unpaidInvoices.length + unpaidRepairs.length + unpaidViolations.length;

  // Unified Payables Feed for Tab 1
  const unifiedPayables = useMemo(() => {
    const list: UnifiedPayableItem[] = [];

    // Add Invoices
    invoices.forEach((inv) => {
      const remaining = inv.remainingAmount !== undefined ? inv.remainingAmount : Math.max(0, (inv.totalAmount || 0) - (inv.paidAmount || 0));
      const isPaid = inv.status === 3;
      list.push({
        key: `INV-${inv.id}`,
        sourceType: 'invoice',
        id: inv.id,
        title: `Hóa đơn ${inv.invoiceCode}`,
        subtitle: `Tiền phòng & Điện nước tháng ${String(inv.month).padStart(2, '0')}/${inv.year}`,
        roomInfo: inv.roomNumber ? `Phòng P.${inv.roomNumber}` : undefined,
        date: inv.createdAt || '',
        amount: isPaid ? (inv.totalAmount || 0) : remaining,
        isPaid,
        statusText: isPaid ? 'Đã thanh toán' : inv.status === 4 ? 'Quá hạn' : 'Chưa thanh toán',
        statusVariant: isPaid ? 'success' : inv.status === 4 ? 'danger' : 'warning',
        rawItem: inv,
      });
    });

    // Add Repairs that have cost
    repairs
      .filter((r) => (r.repairCost || 0) > 0)
      .forEach((rep) => {
        const isPaid = Boolean(rep.isPaid);
        list.push({
          key: `REP-${rep.id}`,
          sourceType: 'repair',
          id: rep.id,
          title: `Phí sửa chữa: ${rep.title}`,
          subtitle: `Vật tư & Thiết bị: ${rep.description || 'Sửa chữa hỏng hóc'}`,
          roomInfo: rep.roomNumber ? `Phòng P.${rep.roomNumber}` : undefined,
          date: rep.createdAt || '',
          amount: rep.repairCost || 0,
          isPaid,
          statusText: isPaid ? 'Đã thanh toán' : 'Chờ nộp phí',
          statusVariant: isPaid ? 'success' : 'warning',
          rawItem: rep,
        });
      });

    // Add Violations that have fines
    violations
      .filter((v) => (v.penaltyAmount || 0) > 0)
      .forEach((vio) => {
        const isPaid = vio.status === 3;
        list.push({
          key: `VIO-${vio.id}`,
          sourceType: 'violation',
          id: vio.id,
          title: `Tiền phạt: ${vio.title}`,
          subtitle: `Vi phạm: ${vio.violationType} · ${vio.description || ''}`,
          date: vio.violationDate || vio.createdAt || '',
          amount: vio.penaltyAmount || 0,
          isPaid,
          statusText: isPaid ? 'Đã nộp phạt' : 'Chờ nộp phạt',
          statusVariant: isPaid ? 'success' : 'danger',
          rawItem: vio,
        });
      });

    // Sort: Unpaid items first, then by date descending
    return list.sort((a, b) => {
      if (a.isPaid !== b.isPaid) return a.isPaid ? 1 : -1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [invoices, repairs, violations]);

  // All unpaid payables
  const unpaidPayables = useMemo(
    () => unifiedPayables.filter((item) => !item.isPaid),
    [unifiedPayables]
  );

  // Selected unpaid payables
  const selectedPayables = useMemo(
    () => unpaidPayables.filter((item) => selectedKeys.has(item.key)),
    [unpaidPayables, selectedKeys]
  );

  const selectedTotalAmount = useMemo(
    () => selectedPayables.reduce((acc, cur) => acc + cur.amount, 0),
    [selectedPayables]
  );

  // --- Single Payment Modal Actions ---
  const handleOpenPayment = (target: PaymentTarget) => {
    setPaymentTarget(target);
    setTransCode(`MB${Math.floor(10000000 + Math.random() * 90000000)}`);
    setPayError('');
    setPaySuccess(false);
    setIsQrOpen(true);
    if (!selectedBank && bankAccounts.length > 0) {
      setSelectedBank(bankAccounts.find((b) => b.isDefault) || bankAccounts[0]);
    }
  };

  const handleOpenInvoicePayment = (inv: Invoice) => {
    const rem = inv.remainingAmount !== undefined ? inv.remainingAmount : Math.max(0, (inv.totalAmount || 0) - (inv.paidAmount || 0));
    handleOpenPayment({
      type: 'invoice',
      id: inv.id,
      code: inv.invoiceCode,
      title: `Hóa đơn ${inv.invoiceCode}`,
      subtitle: `Tiền phòng & Điện nước tháng ${String(inv.month).padStart(2, '0')}/${inv.year}`,
      amount: rem,
      memo: inv.invoiceCode,
      notesDefault: `Sinh viên thanh toán hóa đơn ${inv.invoiceCode}`,
    });
  };

  const handleOpenRepairPayment = (rep: RepairRequest) => {
    handleOpenPayment({
      type: 'repair',
      id: rep.id,
      code: `SC#${rep.id}`,
      title: `Chi phí sửa chữa #${rep.id}`,
      subtitle: rep.title,
      amount: rep.repairCost || 0,
      memo: `SC${rep.id} ${rep.studentCode || ''}`.trim(),
      notesDefault: `Thanh toán chi phí sửa chữa #${rep.id}: ${rep.title}`,
    });
  };

  const handleOpenViolationPayment = (vio: Violation) => {
    handleOpenPayment({
      type: 'violation',
      id: vio.id,
      code: `VP#${vio.id}`,
      title: `Tiền phạt vi phạm #${vio.id}`,
      subtitle: vio.title,
      amount: vio.penaltyAmount || 0,
      memo: `VP${vio.id} ${vio.studentCode || ''}`.trim(),
      notesDefault: `Nộp tiền phạt vi phạm #${vio.id}: ${vio.title}`,
    });
  };

  // --- Batch / Pay All Actions ---
  const handleOpenPayAll = () => {
    if (unpaidPayables.length === 0) return;
    const memo = `GOP-${user?.studentCode || 'KTX'}-${Date.now().toString().slice(-4)}`;
    setBatchTarget({
      items: unpaidPayables,
      totalAmount: grandTotalDebt,
      memo,
    });
    setBatchTransCode(`MB${Math.floor(10000000 + Math.random() * 90000000)}`);
    setBatchPayError('');
    setBatchPaySuccess(false);
    setIsBatchQrOpen(true);
    if (!selectedBank && bankAccounts.length > 0) {
      setSelectedBank(bankAccounts.find((b) => b.isDefault) || bankAccounts[0]);
    }
  };

  const handleOpenPaySelected = () => {
    if (selectedPayables.length === 0) return;
    const memo = `GOP-${user?.studentCode || 'KTX'}-${Date.now().toString().slice(-4)}`;
    setBatchTarget({
      items: selectedPayables,
      totalAmount: selectedTotalAmount,
      memo,
    });
    setBatchTransCode(`MB${Math.floor(10000000 + Math.random() * 90000000)}`);
    setBatchPayError('');
    setBatchPaySuccess(false);
    setIsBatchQrOpen(true);
    if (!selectedBank && bankAccounts.length > 0) {
      setSelectedBank(bankAccounts.find((b) => b.isDefault) || bankAccounts[0]);
    }
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Confirm Single Payment
  const handleConfirmSinglePayment = async () => {
    if (!paymentTarget) return;
    setPayLoading(true);
    setPayError('');

    try {
      const tx = transCode || `CK-${Date.now()}`;
      const bankNote = `(${selectedBank?.bankCode || 'MB'} - ${selectedBank?.accountNumber || ''})`;

      if (paymentTarget.type === 'invoice') {
        const res = await paymentApi.record({
          invoiceId: paymentTarget.id,
          amount: paymentTarget.amount,
          paymentMethod: 2,
          transactionCode: tx,
          notes: `${paymentTarget.notesDefault} qua VietQR ${bankNote}`,
        });
        if (!res.success) throw new Error(res.message || 'Thanh toán hóa đơn thất bại.');
      } else if (paymentTarget.type === 'repair') {
        const res = await repairApi.pay(paymentTarget.id, {
          transactionCode: tx,
          paymentMethod: 2,
        });
        if (!res.success) throw new Error(res.message || 'Thanh toán phí sửa chữa thất bại.');
      } else if (paymentTarget.type === 'violation') {
        const res = await violationApi.pay(paymentTarget.id, {
          transactionCode: tx,
          notes: `${paymentTarget.notesDefault} qua VietQR ${bankNote}`,
        });
        if (!res.success) throw new Error(res.message || 'Nộp phạt vi phạm thất bại.');
      }

      setPaySuccess(true);
      setTimeout(() => {
        setIsQrOpen(false);
        setPaySuccess(false);
        fetchAllData();
      }, 1500);
    } catch (err: any) {
      setPayError(err.message || 'Thao tác không thành công. Vui lòng thử lại.');
    } finally {
      setPayLoading(false);
    }
  };

  // Confirm Batch Payment
  const handleConfirmBatchPayment = async () => {
    if (!batchTarget || batchTarget.items.length === 0) return;
    setBatchPayLoading(true);
    setBatchPayError('');

    try {
      const baseTx = batchTransCode || `CKGOP-${Date.now()}`;
      const bankNote = `(${selectedBank?.bankCode || 'MB'} - ${selectedBank?.accountNumber || ''})`;

      // Run payments concurrently with distinct transaction codes to satisfy unique transactionCode rule
      const promises = batchTarget.items.map(async (item) => {
        if (item.sourceType === 'invoice') {
          return paymentApi.record({
            invoiceId: item.id,
            amount: item.amount,
            paymentMethod: 2,
            transactionCode: `${baseTx}-INV${item.id}`,
            notes: `Thanh toán gộp hóa đơn ${(item.rawItem as Invoice).invoiceCode} qua VietQR ${bankNote}`,
          });
        } else if (item.sourceType === 'repair') {
          return repairApi.pay(item.id, {
            transactionCode: `${baseTx}-SC${item.id}`,
            paymentMethod: 2,
          });
        } else if (item.sourceType === 'violation') {
          return violationApi.pay(item.id, {
            transactionCode: `${baseTx}-VP${item.id}`,
            notes: `Nộp phạt gộp vi phạm #${item.id} qua VietQR ${bankNote}`,
          });
        }
      });

      const results = await Promise.allSettled(promises);
      const failed = results.filter((r) => r.status === 'rejected');
      if (failed.length > 0) {
        throw new Error(`Có ${failed.length} khoản thanh toán gặp lỗi. Vui lòng kiểm tra lại.`);
      }

      setBatchPaySuccess(true);
      setTimeout(() => {
        setIsBatchQrOpen(false);
        setBatchPaySuccess(false);
        setSelectedKeys(new Set());
        fetchAllData();
      }, 1500);
    } catch (err: any) {
      setBatchPayError(err.message || 'Thanh toán gộp không thành công. Vui lòng thử lại.');
    } finally {
      setBatchPayLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-slate-50 min-h-screen">
        <Header
          title="Trung Tâm Thanh Toán & Hóa Đơn"
          subtitle="Tổng hợp công nợ, hóa đơn phòng, phí sửa chữa và tiền phạt phát sinh"
        />
        <LoadingSpinner message="Đang nạp dữ liệu tài chính sinh viên..." />
      </div>
    );
  }

  // Active bank details for single modal
  const bankCode = selectedBank?.bankCode || 'MB';
  const bankName = selectedBank?.bankName || 'MBBank';
  const accountNumber = selectedBank?.accountNumber || '0988115115';
  const accountName = selectedBank?.accountName || 'BAN QUAN TRI KY TUC XA';

  // VietQR URL for single modal
  const singlePayAmount = paymentTarget ? paymentTarget.amount : 0;
  const singlePayMemo = paymentTarget ? paymentTarget.memo : '';
  const singleVietQrUrl = `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact2.png?amount=${singlePayAmount}&addInfo=${encodeURIComponent(
    singlePayMemo
  )}&accountName=${encodeURIComponent(accountName)}`;

  // VietQR URL for batch modal
  const batchPayAmount = batchTarget ? batchTarget.totalAmount : 0;
  const batchPayMemo = batchTarget ? batchTarget.memo : '';
  const batchVietQrUrl = `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact2.png?amount=${batchPayAmount}&addInfo=${encodeURIComponent(
    batchPayMemo
  )}&accountName=${encodeURIComponent(accountName)}`;

  return (
    <div className="flex-1 pb-16 bg-slate-50 min-h-screen">
      <Header
        title="Trung Tâm Thanh Toán & Hóa Đơn"
        subtitle="Tổng hợp công nợ, hóa đơn phòng, phí sửa chữa và tiền phạt phát sinh"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 flex flex-col gap-6">
        {/* ================= HERO SUMMARY CARD ================= */}
        {grandTotalDebt === 0 ? (
          <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-teal-50 to-white p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
                  <CheckCircle2 size={32} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-300">
                      Tình trạng tài chính: Tốt
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 mt-1">
                    Bạn đã hoàn tất mọi nghĩa vụ tài chính!
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hiện tại bạn không có hóa đơn phòng, phí sửa chữa hay khoản phạt vi phạm nào cần thanh toán.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTabChange('history')}
                  icon={<History size={14} />}
                >
                  Xem lịch sử thanh toán ({payments.length})
                </Button>
              </div>
            </div>

            {/* Micro Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-emerald-200/60">
              <div className="p-3 bg-white/80 rounded-xl border border-emerald-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Receipt size={14} className="text-blue-500" />
                  <span>Hóa đơn phòng & Điện nước:</span>
                </div>
                <span className="text-xs font-bold font-mono text-emerald-600">0đ (Đã đủ)</span>
              </div>
              <div className="p-3 bg-white/80 rounded-xl border border-emerald-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Wrench size={14} className="text-amber-500" />
                  <span>Chi phí sửa chữa phát sinh:</span>
                </div>
                <span className="text-xs font-bold font-mono text-emerald-600">0đ (Đã đủ)</span>
              </div>
              <div className="p-3 bg-white/80 rounded-xl border border-emerald-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <AlertTriangle size={14} className="text-rose-500" />
                  <span>Khoản phạt vi phạm nội quy:</span>
                </div>
                <span className="text-xs font-bold font-mono text-emerald-600">0đ (Đã đủ)</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white p-6 shadow-xl border border-slate-800 relative overflow-hidden">
            {/* Background blur highlight */}
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/40 flex items-center gap-1.5 animate-pulse">
                    <Clock size={12} />
                    Cần thanh toán: {totalUnpaidCount} khoản phí
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2">Tổng số tiền cần thanh toán hôm nay:</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-mono text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                    {fmt(grandTotalDebt)}
                  </span>
                  <span className="text-base text-blue-300 font-semibold">VNĐ</span>
                </div>

                {/* Batch Pay All Button directly in Hero Card */}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Button
                    variant="primary"
                    size="md"
                    icon={<QrCode size={16} />}
                    onClick={handleOpenPayAll}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-950/40 px-5 py-2.5 text-sm"
                  >
                    Thanh toán tất cả ({totalUnpaidCount} khoản — {fmt(grandTotalDebt)} VNĐ)
                  </Button>
                  <span className="text-xs text-slate-400">
                    Hoặc tích chọn từng khoản trong danh sách bên dưới
                  </span>
                </div>
              </div>

              {/* 3 Component Breakdown Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleTabChange('invoices')}
                  className={`p-3.5 rounded-xl border text-left transition-all group ${
                    totalInvoiceDebt > 0
                      ? 'bg-blue-950/60 border-blue-700/60 hover:bg-blue-900/60 hover:border-blue-500'
                      : 'bg-slate-800/40 border-slate-700/40 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-blue-300 font-medium mb-1">
                    <span className="flex items-center gap-1.5">
                      <Receipt size={14} className="text-blue-400" /> Tiền phòng
                    </span>
                    <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-base font-bold font-mono text-white">{fmt(totalInvoiceDebt)}đ</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {unpaidInvoices.length > 0 ? `${unpaidInvoices.length} hóa đơn chưa nộp` : 'Đã hoàn tất'}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleTabChange('repairs')}
                  className={`p-3.5 rounded-xl border text-left transition-all group ${
                    totalRepairDebt > 0
                      ? 'bg-amber-950/60 border-amber-700/60 hover:bg-amber-900/60 hover:border-amber-500'
                      : 'bg-slate-800/40 border-slate-700/40 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-amber-300 font-medium mb-1">
                    <span className="flex items-center gap-1.5">
                      <Wrench size={14} className="text-amber-400" /> Phí sửa chữa
                    </span>
                    <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-base font-bold font-mono text-white">{fmt(totalRepairDebt)}đ</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {unpaidRepairs.length > 0 ? `${unpaidRepairs.length} phiếu cần nộp` : 'Đã hoàn tất'}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleTabChange('violations')}
                  className={`p-3.5 rounded-xl border text-left transition-all group ${
                    totalViolationDebt > 0
                      ? 'bg-rose-950/60 border-rose-700/60 hover:bg-rose-900/60 hover:border-rose-500'
                      : 'bg-slate-800/40 border-slate-700/40 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-rose-300 font-medium mb-1">
                    <span className="flex items-center gap-1.5">
                      <AlertTriangle size={14} className="text-rose-400" /> Tiền phạt
                    </span>
                    <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-base font-bold font-mono text-white">{fmt(totalViolationDebt)}đ</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {unpaidViolations.length > 0 ? `${unpaidViolations.length} biên bản cần nộp` : 'Đã hoàn tất'}
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB NAVIGATION ================= */}
        <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => handleTabChange('all')}
            className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'all'
                ? 'border-blue-600 text-blue-600 bg-blue-50/40 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 rounded-t-lg'
            }`}
          >
            <Layers size={16} />
            <span>Tất cả khoản thu</span>
            {totalUnpaidCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                {totalUnpaidCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('invoices')}
            className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'invoices'
                ? 'border-blue-600 text-blue-600 bg-blue-50/40 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 rounded-t-lg'
            }`}
          >
            <Receipt size={16} />
            <span>Hóa đơn phòng & Điện nước</span>
            {unpaidInvoices.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                {unpaidInvoices.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('repairs')}
            className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'repairs'
                ? 'border-blue-600 text-blue-600 bg-blue-50/40 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 rounded-t-lg'
            }`}
          >
            <Wrench size={16} />
            <span>Phí sửa chữa hư hại</span>
            {unpaidRepairs.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                {unpaidRepairs.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('violations')}
            className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'violations'
                ? 'border-blue-600 text-blue-600 bg-blue-50/40 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 rounded-t-lg'
            }`}
          >
            <AlertTriangle size={16} />
            <span>Tiền phạt vi phạm</span>
            {unpaidViolations.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                {unpaidViolations.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('history')}
            className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 whitespace-nowrap transition-all ml-auto ${
              activeTab === 'history'
                ? 'border-blue-600 text-blue-600 bg-blue-50/40 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 rounded-t-lg'
            }`}
          >
            <History size={16} />
            <span>Lịch sử & Biên lai ({payments.length})</span>
          </button>
        </div>

        {/* ================= TAB 1: TẤT CẢ KHOẢN THU (UNIFIED PAYABLES WITH BATCH SELECTION) ================= */}
        {activeTab === 'all' && (
          <div className="flex flex-col gap-4">
            {/* Batch Selection Action Bar */}
            {unpaidPayables.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="selectAllUnpaid"
                    checked={unpaidPayables.length > 0 && unpaidPayables.every((item) => selectedKeys.has(item.key))}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedKeys(new Set(unpaidPayables.map((item) => item.key)));
                      } else {
                        setSelectedKeys(new Set());
                      }
                    }}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="selectAllUnpaid" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
                    Chọn tất cả ({unpaidPayables.length} khoản cần nộp)
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  {selectedKeys.size > 0 && (
                    <span className="text-xs text-slate-600 font-medium">
                      Đã chọn: <strong className="text-blue-600 font-mono">{selectedKeys.size}</strong> khoản (
                      <strong className="text-blue-600 font-mono text-sm">{fmt(selectedTotalAmount)}đ</strong>)
                    </span>
                  )}
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<QrCode size={14} />}
                    disabled={selectedKeys.size === 0}
                    onClick={handleOpenPaySelected}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Thanh toán {selectedKeys.size > 0 ? `${selectedKeys.size} khoản đã chọn` : 'các khoản đã chọn'}
                  </Button>
                </div>
              </div>
            )}

            {unifiedPayables.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 shadow-sm">
                Bạn chưa có bất kỳ khoản phí hay hóa đơn nào phát sinh trong hệ thống.
              </div>
            ) : (
              unifiedPayables.map((item) => {
                const isPaid = item.isPaid;
                const isSelected = selectedKeys.has(item.key);

                return (
                  <div
                    key={item.key}
                    className={`bg-white rounded-xl border p-5 shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isPaid
                        ? 'border-slate-200 hover:border-slate-300 opacity-90'
                        : isSelected
                        ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20'
                        : item.sourceType === 'violation'
                        ? 'border-rose-300 bg-rose-50/10 hover:border-rose-400'
                        : item.sourceType === 'repair'
                        ? 'border-amber-300 bg-amber-50/10 hover:border-amber-400'
                        : 'border-blue-300 bg-blue-50/10 hover:border-blue-400'
                    }`}
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      {/* Checkbox for batch payment */}
                      {!isPaid && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            const next = new Set(selectedKeys);
                            if (e.target.checked) {
                              next.add(item.key);
                            } else {
                              next.delete(item.key);
                            }
                            setSelectedKeys(next);
                          }}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0 mt-3"
                          title="Tích chọn để thanh toán gộp"
                        />
                      )}

                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                          item.sourceType === 'invoice'
                            ? 'bg-blue-50 text-blue-600 border border-blue-200'
                            : item.sourceType === 'repair'
                            ? 'bg-amber-50 text-amber-600 border border-amber-200'
                            : 'bg-rose-50 text-rose-600 border border-rose-200'
                        }`}
                      >
                        {item.sourceType === 'invoice' && <Receipt size={20} />}
                        {item.sourceType === 'repair' && <Wrench size={20} />}
                        {item.sourceType === 'violation' && <AlertTriangle size={20} />}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              item.sourceType === 'invoice'
                                ? 'bg-blue-100 text-blue-700'
                                : item.sourceType === 'repair'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {item.sourceType === 'invoice'
                              ? '🏢 Hóa đơn phòng'
                              : item.sourceType === 'repair'
                              ? '🔧 Sửa chữa'
                              : '⚠️ Phạt vi phạm'}
                          </span>

                          <Badge variant={item.statusVariant}>{item.statusText}</Badge>

                          {item.roomInfo && (
                            <span className="text-[11px] text-slate-500 font-medium">
                              · {item.roomInfo}
                            </span>
                          )}
                        </div>

                        <h4 className="text-base font-bold text-slate-800 truncate">{item.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{item.subtitle}</p>

                        <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                          <Calendar size={12} />
                          {item.date ? new Date(item.date).toLocaleDateString('vi-VN') : '—'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-row md:flex-col md:items-end justify-between items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                      <div>
                        <div className="text-[11px] text-slate-400 md:text-right">
                          {isPaid ? 'Đã nộp:' : 'Cần thanh toán:'}
                        </div>
                        <div
                          className={`font-mono font-bold text-lg ${
                            isPaid ? 'text-slate-600' : 'text-blue-600'
                          }`}
                        >
                          {fmt(item.amount)}đ
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.sourceType === 'invoice' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedInvoice(item.rawItem as Invoice);
                              setIsDetailOpen(true);
                            }}
                          >
                            Chi tiết
                          </Button>
                        )}

                        {!isPaid && (
                          <Button
                            variant="primary"
                            size="sm"
                            icon={<QrCode size={14} />}
                            onClick={() => {
                              if (item.sourceType === 'invoice') {
                                handleOpenInvoicePayment(item.rawItem as Invoice);
                              } else if (item.sourceType === 'repair') {
                                handleOpenRepairPayment(item.rawItem as RepairRequest);
                              } else {
                                handleOpenViolationPayment(item.rawItem as Violation);
                              }
                            }}
                            className={
                              item.sourceType === 'violation'
                                ? 'bg-rose-600 hover:bg-rose-700'
                                : item.sourceType === 'repair'
                                ? 'bg-amber-600 hover:bg-amber-700'
                                : 'bg-blue-600 hover:bg-blue-700'
                            }
                          >
                            Thanh toán VietQR
                          </Button>
                        )}

                        {isPaid && (
                          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle2 size={14} /> Hoàn tất
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ================= TAB 2: HÓA ĐƠN PHÒNG & ĐIỆN NƯỚC ================= */}
        {activeTab === 'invoices' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800">Hóa đơn tiền phòng & Điện nước</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Danh sách các khoản phí tiền phòng, điện nước hàng tháng kèm chỉ số đo đạc
                </p>
              </div>
            </div>

            {invoices.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 shadow-sm">
                Bạn chưa có hóa đơn định kỳ nào phát sinh.
              </div>
            ) : (
              invoices.map((inv) => {
                const remaining = inv.remainingAmount !== undefined ? inv.remainingAmount : Math.max(0, (inv.totalAmount || 0) - (inv.paidAmount || 0));
                const isPaid = inv.status === 3;

                return (
                  <div
                    key={inv.id}
                    className={`bg-white rounded-xl border-2 overflow-hidden shadow-sm transition-all ${
                      isPaid ? 'border-slate-200' : 'border-blue-200 ring-1 ring-blue-100'
                    }`}
                  >
                    {/* Invoice Header */}
                    <div
                      className={`px-5 py-3.5 flex items-center justify-between border-b ${
                        isPaid ? 'bg-slate-50 border-slate-200' : 'bg-blue-50/60 border-blue-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-bold text-slate-800">{inv.invoiceCode}</span>
                        <span className="text-xs text-slate-500 font-medium">
                          · Tháng {String(inv.month).padStart(2, '0')}/{inv.year}
                        </span>
                        {inv.roomNumber && (
                          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                            · Phòng P.{inv.roomNumber}
                          </span>
                        )}
                      </div>
                      <Badge variant={isPaid ? 'success' : inv.status === 4 ? 'danger' : 'warning'}>
                        {isPaid ? 'Đã thanh toán' : inv.status === 4 ? 'Quá hạn' : 'Chưa thanh toán'}
                      </Badge>
                    </div>

                    {/* Breakdown Grid */}
                    <div className="p-5">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="text-slate-400 block mb-1">Tiền phòng:</span>
                          <span className="font-mono font-bold text-slate-800 text-sm">{fmt(inv.roomFee)}đ</span>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="text-slate-400 block mb-1 flex items-center gap-1">
                            <Zap size={12} className="text-amber-500" /> Tiền điện:
                          </span>
                          <span className="font-mono font-bold text-slate-800 text-sm">{fmt(inv.electricityFee)}đ</span>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="text-slate-400 block mb-1 flex items-center gap-1">
                            <Droplets size={12} className="text-blue-500" /> Tiền nước:
                          </span>
                          <span className="font-mono font-bold text-slate-800 text-sm">{fmt(inv.waterFee)}đ</span>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="text-slate-400 block mb-1">Phí dịch vụ:</span>
                          <span className="font-mono font-bold text-slate-800 text-sm">{fmt(inv.serviceFee)}đ</span>
                        </div>
                      </div>

                      {/* Summary Row */}
                      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="text-xs text-slate-500">
                          Hạn thanh toán:{' '}
                          <span className="font-semibold text-slate-700">
                            {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('vi-VN') : 'Theo thông báo'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4">
                          <div className="text-right">
                            <span className="text-xs text-slate-400 mr-2">Còn nợ:</span>
                            <span className="font-mono font-bold text-blue-600 text-base">{fmt(remaining)}đ</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedInvoice(inv);
                                setIsDetailOpen(true);
                              }}
                            >
                              Chi tiết
                            </Button>
                            {!isPaid && (
                              <Button
                                variant="primary"
                                size="sm"
                                icon={<QrCode size={14} />}
                                onClick={() => handleOpenInvoicePayment(inv)}
                              >
                                Thanh toán VietQR
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ================= TAB 3: PHÍ SỬA CHỮA HƯ HẠI ================= */}
        {activeTab === 'repairs' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800">Chi phí sửa chữa phát sinh</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Các khoản chi phí vật tư, thay thế thiết bị hỏng hóc trong phòng ở
                </p>
              </div>
              <Link to="/student/repairs">
                <Button variant="outline" size="sm" icon={<Wrench size={14} />}>
                  Gửi yêu cầu sửa chữa mới
                </Button>
              </Link>
            </div>

            {repairs.filter((r) => (r.repairCost || 0) > 0).length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 shadow-sm">
                Bạn không có khoản chi phí sửa chữa nào cần thanh toán.
              </div>
            ) : (
              repairs
                .filter((r) => (r.repairCost || 0) > 0)
                .map((rep) => {
                  const isPaid = Boolean(rep.isPaid);

                  return (
                    <div
                      key={rep.id}
                      className={`bg-white rounded-xl border p-5 shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        isPaid ? 'border-slate-200' : 'border-amber-300 ring-1 ring-amber-100 bg-amber-50/10'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
                          <Wrench size={22} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs font-bold text-slate-500">Yêu cầu #{rep.id}</span>
                            <Badge variant={isPaid ? 'success' : 'warning'}>
                              {isPaid ? 'Đã thanh toán' : 'Chờ nộp phí'}
                            </Badge>
                            {rep.roomNumber && (
                              <span className="text-xs text-slate-500">· Phòng P.{rep.roomNumber}</span>
                            )}
                          </div>
                          <h4 className="text-base font-bold text-slate-800">{rep.title}</h4>
                          <p className="text-xs text-slate-600 mt-0.5">{rep.description}</p>
                          <p className="text-[11px] text-slate-400 mt-1">
                            Ngày yêu cầu: {new Date(rep.createdAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-row md:flex-col md:items-end justify-between items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                        <div>
                          <div className="text-[11px] text-slate-400 md:text-right">
                            {isPaid ? 'Đã thanh toán:' : 'Chi phí vật tư/nhân công:'}
                          </div>
                          <div className="font-mono font-bold text-lg text-amber-600">
                            {fmt(rep.repairCost)}đ
                          </div>
                        </div>

                        {!isPaid ? (
                          <Button
                            variant="primary"
                            size="sm"
                            icon={<QrCode size={14} />}
                            className="bg-amber-600 hover:bg-amber-700"
                            onClick={() => handleOpenRepairPayment(rep)}
                          >
                            Nộp phí sửa chữa
                          </Button>
                        ) : (
                          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle2 size={14} /> Đã thanh toán
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        )}

        {/* ================= TAB 4: TIỀN PHẠT VI PHẠM NỘI QUY ================= */}
        {activeTab === 'violations' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800">Khoản phạt vi phạm nội quy KTX</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Các biên bản kỷ luật có áp dụng chế tài tiền phạt theo quy chế ký túc xá
                </p>
              </div>
              <Link to="/student/violations">
                <Button variant="outline" size="sm" icon={<AlertTriangle size={14} />}>
                  Xem chi tiết vi phạm & Điểm trừ
                </Button>
              </Link>
            </div>

            {violations.filter((v) => (v.penaltyAmount || 0) > 0).length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 shadow-sm">
                Bạn không có khoản phạt kỷ luật nào cần nộp.
              </div>
            ) : (
              violations
                .filter((v) => (v.penaltyAmount || 0) > 0)
                .map((vio) => {
                  const isPaid = vio.status === 3;

                  return (
                    <div
                      key={vio.id}
                      className={`bg-white rounded-xl border p-5 shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        isPaid ? 'border-slate-200' : 'border-rose-300 ring-1 ring-rose-100 bg-rose-50/10'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
                          <AlertTriangle size={22} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs font-bold text-slate-500">Biên bản #{vio.id}</span>
                            <Badge variant={isPaid ? 'success' : 'danger'}>
                              {isPaid ? 'Đã nộp phạt' : 'Chờ nộp phạt'}
                            </Badge>
                            <span className="text-xs text-rose-600 font-medium">· {vio.violationType}</span>
                          </div>
                          <h4 className="text-base font-bold text-slate-800">{vio.title}</h4>
                          <p className="text-xs text-slate-600 mt-0.5">{vio.description}</p>
                          <p className="text-[11px] text-slate-400 mt-1">
                            Ngày lập biên bản:{' '}
                            {new Date(vio.violationDate || vio.createdAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-row md:flex-col md:items-end justify-between items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                        <div>
                          <div className="text-[11px] text-slate-400 md:text-right">
                            {isPaid ? 'Đã nộp phạt:' : 'Mức phạt áp dụng:'}
                          </div>
                          <div className="font-mono font-bold text-lg text-rose-600">
                            {fmt(vio.penaltyAmount)}đ
                          </div>
                        </div>

                        {!isPaid ? (
                          <Button
                            variant="primary"
                            size="sm"
                            icon={<QrCode size={14} />}
                            className="bg-rose-600 hover:bg-rose-700"
                            onClick={() => handleOpenViolationPayment(vio)}
                          >
                            Nộp tiền phạt
                          </Button>
                        ) : (
                          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle2 size={14} /> Đã hoàn tất
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        )}

        {/* ================= TAB 5: LỊCH SỬ & BIÊN LAI THANH TOÁN ================= */}
        {activeTab === 'history' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800">Lịch sử giao dịch & Biên lai chuyển khoản</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Toàn bộ các giao dịch thanh toán thành công đã được kế toán ký túc xá ghi nhận
                </p>
              </div>
            </div>

            {payments.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 shadow-sm">
                Chưa có lịch sử giao dịch nào được ghi nhận.
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="py-3 px-4">Mã GD / Biên lai</th>
                        <th className="py-3 px-4">Thời gian</th>
                        <th className="py-3 px-4">Nội dung thanh toán</th>
                        <th className="py-3 px-4">Phương thức</th>
                        <th className="py-3 px-4 text-right">Số tiền</th>
                        <th className="py-3 px-4 text-center">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {payments.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-3 px-4 font-mono font-bold text-slate-800">
                            {p.paymentCode || p.transactionCode || `PAY#${p.id}`}
                          </td>
                          <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                            {p.paymentDate ? new Date(p.paymentDate).toLocaleString('vi-VN') : '—'}
                          </td>
                          <td className="py-3 px-4 text-slate-700 max-w-xs truncate">
                            {p.notes || (p.invoiceCode ? `Thanh toán hóa đơn ${p.invoiceCode}` : 'Nộp tiền KTX')}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {p.paymentMethod === 2
                              ? 'Chuyển khoản VietQR'
                              : p.paymentMethod === 1
                              ? 'Tiền mặt'
                              : 'Cổng trực tuyến'}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 text-sm whitespace-nowrap">
                            +{fmt(p.amount)}đ
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              ✓ Thành công
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================= MODAL CHI TIẾT HÓA ĐƠN ================= */}
      {selectedInvoice && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Chi tiết Hóa đơn ${selectedInvoice.invoiceCode}`}
          size="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-slate-400 block">Kỳ thanh toán:</span>
                <span className="font-bold text-slate-800 text-sm">
                  Tháng {String(selectedInvoice.month).padStart(2, '0')}/{selectedInvoice.year}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-right">Trạng thái:</span>
                <Badge variant={selectedInvoice.status === 3 ? 'success' : 'danger'}>
                  {selectedInvoice.status === 3 ? 'Đã thanh toán đủ' : 'Chưa thanh toán'}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                Các khoản mục chi phí:
              </h5>
              <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Tiền phòng ở:</span>
                  <span className="font-mono font-semibold text-slate-800">{fmt(selectedInvoice.roomFee)}đ</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 flex items-center gap-1">
                    <Zap size={13} className="text-amber-500" /> Tiền điện sinh hoạt:
                  </span>
                  <span className="font-mono font-semibold text-slate-800">{fmt(selectedInvoice.electricityFee)}đ</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 flex items-center gap-1">
                    <Droplets size={13} className="text-blue-500" /> Tiền nước sinh hoạt:
                  </span>
                  <span className="font-mono font-semibold text-slate-800">{fmt(selectedInvoice.waterFee)}đ</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Phí dịch vụ & Quản lý:</span>
                  <span className="font-mono font-semibold text-slate-800">{fmt(selectedInvoice.serviceFee)}đ</span>
                </div>
                {Boolean(selectedInvoice.otherFee) && (
                  <div className="flex justify-between items-center text-amber-700">
                    <span className="flex items-center gap-1">
                      <AlertTriangle size={13} /> {selectedInvoice.otherFeeDescription || 'Chi phí khác / phát sinh'}:
                    </span>
                    <span className="font-mono font-semibold">{fmt(selectedInvoice.otherFee)}đ</span>
                  </div>
                )}
                <div className="flex justify-between items-center border-t border-slate-200 pt-2 font-bold text-sm">
                  <span>Tổng cộng:</span>
                  <span className="font-mono text-blue-600">{fmt(selectedInvoice.totalAmount)}đ</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Đã thanh toán:</span>
                  <span className="font-mono text-emerald-600 font-semibold">{fmt(selectedInvoice.paidAmount)}đ</span>
                </div>
                <div className="flex justify-between items-center text-slate-900 font-bold border-t border-slate-200 pt-1.5">
                  <span>Còn phải nộp:</span>
                  <span className="font-mono text-rose-600 font-extrabold text-base">
                    {fmt(
                      selectedInvoice.remainingAmount !== undefined
                        ? selectedInvoice.remainingAmount
                        : Math.max(0, (selectedInvoice.totalAmount || 0) - (selectedInvoice.paidAmount || 0))
                    )}
                    đ
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                Đóng
              </Button>
              {selectedInvoice.status !== 3 && (
                <Button
                  variant="primary"
                  icon={<QrCode size={14} />}
                  onClick={() => {
                    setIsDetailOpen(false);
                    handleOpenInvoicePayment(selectedInvoice);
                  }}
                >
                  Thanh toán ngay bằng VietQR
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ================= MODAL 1: THANH TOÁN TỪNG KHOẢN (SINGLE PAYMENT) ================= */}
      {paymentTarget && (
        <Modal
          isOpen={isQrOpen}
          onClose={() => setIsQrOpen(false)}
          title={`Thanh toán trực tuyến VietQR — ${paymentTarget.title}`}
          size="md"
        >
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Bank Selector if multiple exist */}
            {bankAccounts.length > 1 && (
              <div className="w-full text-left space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Chọn tài khoản ngân hàng thụ hưởng:</label>
                <div className="grid grid-cols-2 gap-2">
                  {bankAccounts.map((b) => {
                    const isSel = selectedBank?.id === b.id;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setSelectedBank(b)}
                        className={`p-2.5 rounded-xl border text-left flex flex-col transition ${
                          isSel
                            ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-800">{b.bankCode}</span>
                          {b.isDefault && (
                            <span className="text-[10px] text-blue-600 font-semibold bg-blue-100 px-1.5 py-0.2 rounded">
                              Mặc định
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
            <div className="p-3 bg-white border-2 border-blue-100 rounded-2xl shadow-sm relative group flex flex-col items-center w-full max-w-xs mx-auto">
              <img
                src={singleVietQrUrl}
                alt="VietQR Payment"
                loading="lazy"
                className="w-48 sm:w-56 h-auto rounded-lg max-h-64 object-contain max-w-full"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="mt-1.5 text-[11px] text-blue-700 font-semibold flex items-center gap-1">
                <span>Chuẩn VietQR · Napas 24/7</span>
              </div>
            </div>

            {/* Account Details Card with 1-click Copy */}
            <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs text-left">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Ngân hàng:</span>
                <span className="font-semibold text-slate-800 truncate max-w-[220px]">
                  {bankName} ({bankCode})
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Chủ tài khoản:</span>
                <span className="font-bold text-slate-800 uppercase">{accountName}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Số tài khoản:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-slate-900 text-sm">{accountNumber}</span>
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
                <span className="text-slate-500">Số tiền cần chuyển:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-blue-700 text-base">{fmt(singlePayAmount)}đ</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(String(singlePayAmount), 'amount')}
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
                <span className="text-slate-500">Nội dung chuyển khoản (Memo):</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    {singlePayMemo}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(singlePayMemo, 'memo')}
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

            <div className="w-full text-left bg-blue-50/70 border border-blue-100 rounded-lg p-2.5 text-[11px] text-blue-900 leading-relaxed">
              💡 <strong>Hướng dẫn:</strong> Mở app ngân hàng quét mã QR để hệ thống tự điền đúng số tiền và nội dung. Sau khi chuyển xong, nhấn xác nhận bên dưới.
            </div>

            <div className="w-full text-left space-y-1">
              <label className="text-xs font-medium text-slate-700">Mã giao dịch / Mã tham chiếu ngân hàng (nếu có):</label>
              <input
                type="text"
                value={transCode}
                onChange={(e) => setTransCode(e.target.value)}
                placeholder="Ví dụ: MB16799675 hoặc mã tham chiếu chuyển tiền"
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue-400 font-mono"
              />
            </div>

            {payError && (
              <div className="w-full p-2.5 rounded-lg bg-red-50 text-red-600 text-xs text-left">
                {payError}
              </div>
            )}

            {paySuccess && (
              <div className="w-full p-2.5 rounded-lg bg-green-50 text-green-700 text-xs flex items-center justify-center gap-1.5 font-bold">
                <Check size={16} /> Ghi nhận thanh toán thành công! Công nợ đã được tất toán.
              </div>
            )}

            <Button
              className="w-full"
              onClick={handleConfirmSinglePayment}
              disabled={payLoading || paySuccess}
            >
              {payLoading ? 'Đang xác thực thanh toán...' : 'Xác nhận đã chuyển khoản'}
            </Button>
          </div>
        </Modal>
      )}

      {/* ================= MODAL 2: THANH TOÁN GỘP / TẤT CẢ (BATCH PAYMENT) ================= */}
      {batchTarget && (
        <Modal
          isOpen={isBatchQrOpen}
          onClose={() => setIsBatchQrOpen(false)}
          title={`Thanh toán gộp — ${batchTarget.items.length} khoản phí`}
          size="lg"
        >
          <div className="flex flex-col items-center text-center space-y-4">
            {/* List of items being paid in this batch */}
            <div className="w-full max-h-44 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/80 p-3 space-y-2 text-left text-xs">
              <div className="font-bold text-slate-700 text-[11px] uppercase tracking-wider flex items-center justify-between pb-1 border-b border-slate-200">
                <span>Các khoản phí gộp ({batchTarget.items.length}):</span>
                <span className="font-mono text-blue-700 font-bold text-xs">Tổng: {fmt(batchTarget.totalAmount)}đ</span>
              </div>
              {batchTarget.items.map((it) => (
                <div key={it.key} className="flex items-center justify-between py-1 border-b border-slate-200/50 last:border-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase shrink-0 ${
                        it.sourceType === 'invoice'
                          ? 'bg-blue-100 text-blue-700'
                          : it.sourceType === 'repair'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {it.sourceType === 'invoice' ? 'Phòng' : it.sourceType === 'repair' ? 'Sửa chữa' : 'Vi phạm'}
                    </span>
                    <span className="truncate text-slate-700 font-semibold">{it.title}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-800 shrink-0 ml-2">
                    {fmt(it.amount)}đ
                  </span>
                </div>
              ))}
            </div>

            {/* Bank Selector if multiple exist */}
            {bankAccounts.length > 1 && (
              <div className="w-full text-left space-y-1">
                <label className="text-xs font-semibold text-slate-700">Tài khoản ngân hàng thụ hưởng:</label>
                <div className="grid grid-cols-2 gap-2">
                  {bankAccounts.map((b) => {
                    const isSel = selectedBank?.id === b.id;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setSelectedBank(b)}
                        className={`p-2 rounded-xl border text-left flex flex-col transition text-xs ${
                          isSel
                            ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">{b.bankCode}</span>
                          {b.isDefault && (
                            <span className="text-[10px] text-blue-600 font-semibold bg-blue-100 px-1 py-0.2 rounded">
                              Mặc định
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-slate-500 truncate">{b.accountNumber}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Batch VietQR Napas Code */}
            <div className="p-3 bg-white border-2 border-emerald-200 rounded-2xl shadow-sm relative group flex flex-col items-center w-full max-w-xs mx-auto">
              <img
                src={batchVietQrUrl}
                alt="VietQR Batch Payment"
                loading="lazy"
                className="w-48 sm:w-56 h-auto rounded-lg max-h-64 object-contain max-w-full"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="mt-1.5 text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                <span>Thanh toán Gộp VietQR · Napas 24/7</span>
              </div>
            </div>

            {/* Account Details Card with 1-click Copy */}
            <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs text-left">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Ngân hàng:</span>
                <span className="font-semibold text-slate-800 truncate">
                  {bankName} ({bankCode})
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Chủ tài khoản:</span>
                <span className="font-bold text-slate-800 uppercase">{accountName}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Số tài khoản:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-slate-900 text-sm">{accountNumber}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(accountNumber, 'accNumBatch')}
                    className="p-1 text-slate-500 hover:text-blue-600 rounded bg-white border border-slate-200 hover:border-blue-400 transition"
                    title="Sao chép số tài khoản"
                  >
                    {copiedField === 'accNumBatch' ? (
                      <Check size={13} className="text-green-600" />
                    ) : (
                      <Copy size={13} />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                <span className="text-slate-500 font-bold">Tổng tiền gộp cần chuyển:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-extrabold text-emerald-700 text-lg">
                    {fmt(batchPayAmount)}đ
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(String(batchPayAmount), 'amountBatch')}
                    className="p-1 text-slate-500 hover:text-blue-600 rounded bg-white border border-slate-200 hover:border-blue-400 transition"
                    title="Sao chép tổng số tiền"
                  >
                    {copiedField === 'amountBatch' ? (
                      <Check size={13} className="text-green-600" />
                    ) : (
                      <Copy size={13} />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Nội dung chuyển khoản (Memo):</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    {batchPayMemo}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(batchPayMemo, 'memoBatch')}
                    className="p-1 text-slate-500 hover:text-blue-600 rounded bg-white border border-slate-200 hover:border-indigo-400 transition"
                    title="Sao chép nội dung chuyển khoản"
                  >
                    {copiedField === 'memoBatch' ? (
                      <Check size={13} className="text-green-600" />
                    ) : (
                      <Copy size={13} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="w-full text-left bg-emerald-50/70 border border-emerald-200 rounded-lg p-2.5 text-[11px] text-emerald-950 leading-relaxed">
              💡 <strong>Lợi ích thanh toán gộp:</strong> Bạn chỉ cần chuyển khoản <strong>1 lần duy nhất</strong> bằng mã QR trên. Hệ thống sẽ tự động gạch nợ đồng thời cho toàn bộ <strong>{batchTarget.items.length} khoản phí</strong> này.
            </div>

            <div className="w-full text-left space-y-1">
              <label className="text-xs font-medium text-slate-700">Mã giao dịch / Mã tham chiếu ngân hàng (nếu có):</label>
              <input
                type="text"
                value={batchTransCode}
                onChange={(e) => setBatchTransCode(e.target.value)}
                placeholder="Ví dụ: MB99182371 hoặc mã tham chiếu chuyển tiền"
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            {batchPayError && (
              <div className="w-full p-2.5 rounded-lg bg-red-50 text-red-600 text-xs text-left">
                {batchPayError}
              </div>
            )}

            {batchPaySuccess && (
              <div className="w-full p-2.5 rounded-lg bg-green-50 text-green-700 text-xs flex items-center justify-center gap-1.5 font-bold">
                <Check size={16} /> Ghi nhận thanh toán gộp thành công! Toàn bộ {batchTarget.items.length} khoản nợ đã được tất toán.
              </div>
            )}

            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              onClick={handleConfirmBatchPayment}
              disabled={batchPayLoading || batchPaySuccess}
            >
              {batchPayLoading ? 'Đang xử lý thanh toán gộp...' : `Xác nhận đã chuyển ${fmt(batchPayAmount)}đ`}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};
