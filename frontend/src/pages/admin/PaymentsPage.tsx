import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Table } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import { paymentApi } from '../../api';
import { Payment } from '../../types';
import { Search, CreditCard, DollarSign } from 'lucide-react';

export const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

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

  useEffect(() => {
    fetchPayments();
  }, [page]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const getMethodName = (m: number) => {
    switch (m) {
      case 1: return 'Tiền mặt';
      case 2: return 'Chuyển khoản';
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
      header: 'Người Nhận',
      render: (p: Payment) => <span className="text-xs font-medium text-slate-700">{p.receivedBy || 'Admin'}</span>,
    },
  ];

  return (
    <div className="flex-1 pb-12">
      <Header
        title="Lịch Sử Giao Dịch & Thu Tiền"
        subtitle="Sổ quỹ và lịch sử thanh toán toàn bộ hóa đơn của sinh viên"
      />

      <div className="max-w-7xl mx-auto px-6 mt-6 space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
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
    </div>
  );
};

