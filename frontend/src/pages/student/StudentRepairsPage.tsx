import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Badge, statusBadge } from '../../components/common/Badge';
import { repairApi } from '../../api';
import { RepairRequest } from '../../types';
import { Wrench, Plus, CheckCircle2, Clock, Eye } from 'lucide-react';

export const StudentRepairsPage: React.FC = () => {
  const [repairs, setRepairs] = useState<RepairRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState<RepairRequest | null>(null);

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
                        Phòng {r.roomNumber} ({r.buildingName}) &bull;{' '}
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
              <option value={2}>Bình thường</option>
              <option value={3}>Cao (Cần xử lý sớm)</option>
              <option value={4}>Khẩn cấp (Mất điện, rò nước lớn)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600">Mô tả chi tiết sự cố</label>
            <textarea
              rows={4}
              placeholder="Mô tả cụ thể vị trí, hiện tượng để nhân viên kỹ thuật chuẩn bị dụng cụ..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none bg-white text-slate-800 placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={() => setIsCreateOpen(false)}>
              Hủy
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
