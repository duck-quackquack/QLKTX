import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { repairApi } from '../../api';
import { RepairRequest } from '../../types';
import { Wrench, Plus, CheckCircle2, Clock } from 'lucide-react';

export const StudentRepairsPage: React.FC = () => {
  const [repairs, setRepairs] = useState<RepairRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 2, // Medium
  });

  const [formErr, setFormErr] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRepairs = async () => {
    setLoading(true);
    try {
      const res = await repairApi.getMy();
      if (res.success) setRepairs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepairs();
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
        fetchRepairs();
      }
    } catch (err: any) {
      setFormErr(err.message || 'Gửi yêu cầu thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex-1 pb-12">
      <Header
        title="Báo Hỏng Thiết Bị & Sửa Chữa"
        subtitle="Gửi yêu cầu sửa chữa cơ sở vật chất phòng ở đến ban quản lý KTX"
      />

      <div className="max-w-4xl mx-auto px-6 mt-6 space-y-4">
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">
            Bạn đã gửi {repairs.length} yêu cầu sửa chữa
          </p>
          <Button onClick={() => setIsCreateOpen(true)} icon={<Plus className="w-4 h-4" />}>
            Gửi Báo Hỏng Mới
          </Button>
        </div>

        <div className="space-y-3">
          {repairs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              Bạn chưa có yêu cầu sửa chữa nào.
            </div>
          ) : (
            repairs.map((r) => (
              <div key={r.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{r.title}</h4>
                    <p className="text-xs text-slate-400">Phòng {r.roomNumber} ({r.buildingName})</p>
                  </div>
                  <Badge
                    variant={
                      r.status === 3 ? 'success' : r.status === 2 ? 'warning' : 'danger'
                    }
                  >
                    {r.status === 3 ? 'Đã hoàn thành' : r.status === 2 ? 'Đang xử lý' : 'Chờ tiếp nhận'}
                  </Badge>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{r.description}</p>

                {r.staffNotes && (
                  <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-900">
                    <span className="font-bold block mb-0.5">Phản hồi của ban quản lý:</span>
                    {r.staffNotes}
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Ngày gửi: {new Date(r.createdAt).toLocaleString('vi-VN')}</span>
                  {r.completedAt && (
                    <span className="text-emerald-600 font-semibold">
                      Hoàn tất: {new Date(r.completedAt).toLocaleDateString('vi-VN')}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Báo Hỏng */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Gửi Yêu Cầu Sửa Chữa Thiết Bị">
        {formErr && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
            {formErr}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Thiết bị / Sự cố cần sửa"
            placeholder="VD: Hỏng vòi nước, Quạt trần kêu to, Cháy bóng đèn..."
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mức độ ưu tiên</label>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
              className="block w-full rounded-lg border border-slate-300 text-sm px-3.5 py-2 text-slate-900 bg-white"
            >
              <option value="1">Thấp (Bình thường)</option>
              <option value="2">Trung bình</option>
              <option value="3">Cao</option>
              <option value="4">Khẩn cấp (Mất điện, tràn nước...)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả chi tiết tình trạng</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="block w-full rounded-lg border border-slate-300 text-sm p-3 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
              placeholder="Mô tả cụ thể vị trí hoặc tình trạng hư hỏng..."
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(false)}>
              Hủy bỏ
            </Button>
            <Button type="submit" loading={actionLoading}>
              Gửi yêu cầu
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

