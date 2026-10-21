import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Badge } from '../../components/common/Badge';
import { violationApi } from '../../api';
import { Violation } from '../../types';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export const StudentViolationsPage: React.FC = () => {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchViolations = async () => {
      try {
        const res = await violationApi.getMy();
        if (res.success) setViolations(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchViolations();
  }, []);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  return (
    <div className="flex-1 pb-12">
      <Header
        title="Lịch Sử Vi Phạm & Kỷ Luật"
        subtitle="Theo dõi các biên bản nhắc nhở, vi phạm nội quy và tình trạng nộp phạt"
      />

      <div className="max-w-4xl mx-auto px-6 mt-6 space-y-4">
        {violations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">Không Có Vi Phạm</h3>
            <p className="text-xs text-slate-500 mt-1">
              Bạn luôn chấp hành tốt nội quy và quy chế ký túc xá!
            </p>
          </div>
        ) : (
          violations.map((v) => (
            <div key={v.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{v.title}</h4>
                  <p className="text-xs text-slate-400">Loại vi phạm: {v.violationType}</p>
                </div>
                <Badge variant={v.status === 3 ? 'success' : 'danger'}>
                  {v.status === 3 ? 'Đã xử lý / Nộp phạt' : 'Chưa xử lý'}
                </Badge>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{v.description}</p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-400">
                  Ngày lập: {new Date(v.violationDate).toLocaleDateString('vi-VN')}
                </span>
                <span className="font-bold text-rose-600">
                  Mức phạt: {v.penaltyAmount > 0 ? formatCurrency(v.penaltyAmount) : 'Nhắc nhở'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

