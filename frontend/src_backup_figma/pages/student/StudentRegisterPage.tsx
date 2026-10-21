import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { registrationApi, buildingApi } from '../../api';
import { Building, Registration } from '../../types';
import { ClipboardList, CheckCircle2, Clock, XCircle } from 'lucide-react';

export const StudentRegisterPage: React.FC = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    preferredBuildingId: 1,
    preferredRoomType: '4 người',
    desiredStartDate: new Date().toISOString().split('T')[0],
    durationMonths: 6,
    reasonOrNote: '',
  });

  const [formErr, setFormErr] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bRes, rRes] = await Promise.all([
        buildingApi.getAll(),
        registrationApi.getMy(),
      ]);
      if (bRes.success) {
        setBuildings(bRes.data);
        if (bRes.data.length > 0) {
          setForm((prev) => ({ ...prev, preferredBuildingId: bRes.data[0].id }));
        }
      }
      if (rRes.success) setMyRegistrations(rRes.data);
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
    setFormSuccess('');
    setActionLoading(true);

    try {
      const res = await registrationApi.submit(form);
      if (res.success) {
        setFormSuccess('Gửi đơn đăng ký thành công! Ban quản lý sẽ sớm xét duyệt hồ sơ của bạn.');
        fetchData();
      }
    } catch (err: any) {
      setFormErr(err.message || 'Gửi đơn đăng ký thất bại.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn đăng ký này?')) return;
    try {
      await registrationApi.cancel(id);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Hủy đơn thất bại');
    }
  };

  return (
    <div className="flex-1 pb-12">
      <Header
        title="Đăng Ký Lưu Trú Ký Túc Xá"
        subtitle="Nộp đơn trực tuyến chọn tòa nhà, loại phòng và thời hạn lưu trú"
      />

      <div className="max-w-4xl mx-auto px-6 mt-6 space-y-6">
        {/* Registration Form */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-indigo-600" />
            Phiếu Đăng Ký Chỗ Ở KTX
          </h3>

          {formSuccess && (
            <div className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              {formSuccess}
            </div>
          )}

          {formErr && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
              {formErr}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tòa nhà mong muốn</label>
                <select
                  value={form.preferredBuildingId}
                  onChange={(e) => setForm({ ...form, preferredBuildingId: Number(e.target.value) })}
                  className="block w-full rounded-lg border border-slate-300 text-sm px-3.5 py-2 text-slate-900 bg-white"
                >
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.genderAllowed}) - {b.availableBeds} giường trống
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Loại phòng</label>
                <select
                  value={form.preferredRoomType}
                  onChange={(e) => setForm({ ...form, preferredRoomType: e.target.value })}
                  className="block w-full rounded-lg border border-slate-300 text-sm px-3.5 py-2 text-slate-900 bg-white"
                >
                  <option value="2 người">Phòng 2 người (VIP)</option>
                  <option value="4 người">Phòng 4 người (Tiêu chuẩn)</option>
                  <option value="6 người">Phòng 6 người</option>
                  <option value="8 người">Phòng 8 người</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Ngày bắt đầu muốn vào ở"
                type="date"
                value={form.desiredStartDate}
                onChange={(e) => setForm({ ...form, desiredStartDate: e.target.value })}
                required
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Thời hạn đăng ký</label>
                <select
                  value={form.durationMonths}
                  onChange={(e) => setForm({ ...form, durationMonths: Number(e.target.value) })}
                  className="block w-full rounded-lg border border-slate-300 text-sm px-3.5 py-2 text-slate-900 bg-white"
                >
                  <option value="5">1 Học kỳ (5 Tháng)</option>
                  <option value="6">Nửa năm (6 Tháng)</option>
                  <option value="10">1 Năm học (10 Tháng)</option>
                  <option value="12">Cả năm (12 Tháng)</option>
                </select>
              </div>
            </div>

            <Input
              label="Lý do đăng ký / Đối tượng ưu tiên (Hộ nghèo, xa nhà, đồ án...)"
              placeholder="Nhập lý do hoặc nguyện vọng ở cùng bạn..."
              value={form.reasonOrNote}
              onChange={(e) => setForm({ ...form, reasonOrNote: e.target.value })}
            />

            <Button type="submit" loading={actionLoading} size="lg" className="w-full sm:w-auto">
              Nộp đơn đăng ký
            </Button>
          </form>
        </div>

        {/* History of submissions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4">Lịch Sử Đơn Đăng Ký Của Bạn</h3>

          <div className="space-y-3">
            {myRegistrations.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Bạn chưa có đơn đăng ký nào.</p>
            ) : (
              myRegistrations.map((reg) => (
                <div key={reg.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-slate-900">
                        {reg.preferredBuildingName || 'Tùy chọn'} ({reg.preferredRoomType})
                      </span>
                      <Badge
                        variant={
                          reg.status === 1 ? 'warning' : reg.status === 2 ? 'success' : reg.status === 3 ? 'danger' : 'slate'
                        }
                      >
                        {reg.status === 1 ? 'Chờ duyệt' : reg.status === 2 ? 'Đã duyệt' : reg.status === 3 ? 'Từ chối' : 'Đã hủy'}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">
                      Ngày nộp: {new Date(reg.createdAt).toLocaleDateString('vi-VN')} &bull; Thời hạn: {reg.durationMonths} tháng
                    </p>
                    {reg.adminNote && (
                      <p className="text-xs text-indigo-700 font-medium mt-1">Ghi chú BQL: {reg.adminNote}</p>
                    )}
                  </div>

                  {reg.status === 1 && (
                    <Button variant="danger" size="sm" onClick={() => handleCancel(reg.id)}>
                      Hủy đơn
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

