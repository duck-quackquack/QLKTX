import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Badge } from '../../components/common/Badge';
import { contractApi } from '../../api';
import { Contract } from '../../types';
import { FileSignature, ShieldCheck, Calendar, DollarSign } from 'lucide-react';

export const StudentContractsPage: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const res = await contractApi.getMy();
        if (res.success) setContracts(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchContracts();
  }, []);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  return (
    <div className="flex-1 pb-12">
      <Header
        title="Hợp Đồng Lưu Trú Của Bạn"
        subtitle="Theo dõi hợp đồng nội trú, thời hạn thuê phòng và số tiền cọc"
      />

      <div className="max-w-4xl mx-auto px-6 mt-6 space-y-4">
        {contracts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
            Bạn chưa có hợp đồng lưu trú nào trong hệ thống.
          </div>
        ) : (
          contracts.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <FileSignature className="w-5 h-5 text-indigo-600" />
                  <span className="font-mono font-bold text-slate-900">{c.contractNumber}</span>
                </div>
                <Badge variant={c.status === 2 ? 'success' : c.status === 3 ? 'warning' : 'danger'}>
                  {c.status === 2 ? 'Đang hiệu lực' : c.status === 3 ? 'Đã hết hạn' : 'Đã thanh lý'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">Phòng & Giường:</span>
                  <span className="font-bold text-indigo-700">{c.buildingName} - P.{c.roomNumber} ({c.bedNumber})</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">Thời hạn:</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(c.startDate).toLocaleDateString('vi-VN')} → {new Date(c.endDate).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">Tiền phòng / tháng:</span>
                  <span className="font-bold text-slate-900">{formatCurrency(c.monthlyRent)}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">Tiền đặt cọc:</span>
                  <span className="font-bold text-emerald-700">{formatCurrency(c.depositAmount)}</span>
                </div>
              </div>

              {c.terms && (
                <div className="p-3.5 rounded-xl bg-slate-50 text-xs text-slate-600">
                  <span className="font-bold text-slate-700 block mb-1">Điều khoản cam kết:</span>
                  {c.terms}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

