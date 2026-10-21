import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Badge, statusBadge } from '../../components/common/Badge';
import { registrationApi, buildingApi, roomApi } from '../../api';
import { Building, Registration, Room } from '../../types';
import {
  Building2,
  DoorOpen,
  BedDouble,
  ClipboardList,
  CheckCircle,
  Check,
  ChevronRight,
  Clock,
  XCircle,
  Calendar
} from 'lucide-react';

const steps = [
  { id: 1, label: 'Chọn tòa nhà', icon: <Building2 size={16} /> },
  { id: 2, label: 'Loại phòng & thời hạn', icon: <DoorOpen size={16} /> },
  { id: 3, label: 'Xác nhận đăng ký', icon: <ClipboardList size={16} /> },
];

export const StudentRegisterPage: React.FC = () => {
  const [step, setStep] = useState(1);
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
  const [submitted, setSubmitted] = useState(false);
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFormErr('');
    setActionLoading(true);

    try {
      const res = await registrationApi.submit(form);
      if (res.success) {
        setSubmitted(true);
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

  const selectedBuildingObj = buildings.find((b) => b.id === form.preferredBuildingId);

  return (
    <div className="flex-1 pb-12 bg-slate-50 min-h-screen">
      <Header
        title="Đăng ký nội trú"
        subtitle="Hoàn thành các bước để gửi đơn đăng ký chỗ ở ký túc xá"
      />

      <div className="max-w-5xl mx-auto px-6 mt-6 flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Đăng ký nội trú</h1>
          <p className="text-sm text-slate-500 mt-0.5">Chọn tòa nhà, loại phòng và thời gian mong muốn</p>
        </div>

        {submitted ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 flex flex-col items-center text-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Đã gửi đơn đăng ký thành công!</h2>
            <p className="text-sm text-slate-500 mb-6 max-w-md">
              Đơn của bạn đã được chuyển đến ban quản lý ký túc xá. Vui lòng theo dõi trạng thái phê duyệt tại mục Thông báo hoặc trang này.
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-xl px-6 py-3.5 mb-6 text-left w-full max-w-md">
              <p className="text-sm font-semibold text-amber-800 mb-0.5">Trạng thái: Đang chờ duyệt</p>
              <p className="text-xs text-amber-700">Thời gian duyệt thông thường từ 1 - 2 ngày làm việc</p>
            </div>

            <div className="text-xs text-slate-600 space-y-2 text-left bg-slate-50 rounded-xl p-4 w-full max-w-md border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-400">Tòa nhà nguyện vọng:</span>
                <span className="font-semibold text-slate-800">{selectedBuildingObj?.name} (Tòa {selectedBuildingObj?.code})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Loại phòng:</span>
                <span className="font-semibold text-slate-800">{form.preferredRoomType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Thời hạn lưu trú:</span>
                <span className="font-semibold text-slate-800">{form.durationMonths} tháng</span>
              </div>
            </div>

            <button
              onClick={() => {
                setSubmitted(false);
                setStep(1);
              }}
              className="mt-6 text-sm text-blue-600 hover:text-blue-700 font-semibold"
            >
              Nộp thêm đơn khác
            </button>
          </div>
        ) : (
          <>
            {/* Step Wizard Indicator */}
            <div className="flex items-center gap-0">
              {steps.map((s, i) => (
                <div key={s.id} className="flex items-center flex-1 last:flex-none">
                  <div
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all font-medium text-xs ${
                      step === s.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : step > s.id
                        ? 'bg-green-100 text-green-700 font-semibold'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {step > s.id ? <Check size={14} className="shrink-0" /> : s.icon}
                    <span className="hidden sm:inline whitespace-nowrap">{s.label}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${step > s.id ? 'bg-green-300' : 'bg-slate-200'}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Chọn Tòa Nhà */}
            {step === 1 && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
                <h3 className="text-base font-semibold text-slate-800">1. Chọn tòa nhà mong muốn</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {buildings.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setForm({ ...form, preferredBuildingId: b.id })}
                      className={`border-2 rounded-xl p-5 text-left transition-all hover:shadow-md ${
                        form.preferredBuildingId === b.id
                          ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                        <Building2 size={20} />
                      </div>
                      <p className="font-bold text-slate-800 text-base">{b.name}</p>
                      <p className="text-xs text-slate-500 mt-1">Tòa {b.code} &bull; {b.numberOfFloors} tầng</p>
                      <p className="text-xs text-blue-700 font-medium mt-1">Dành cho: {b.genderAllowed || 'Tất cả'}</p>
                    </button>
                  ))}
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <Button onClick={() => setStep(2)}>
                    Tiếp tục: Chọn loại phòng →
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Chọn Loại Phòng & Thời Hạn */}
            {step === 2 && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
                <h3 className="text-base font-semibold text-slate-800">2. Loại phòng & Thời gian lưu trú</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-2">Loại phòng</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { type: '2 người', desc: 'Phòng VIP 2 giường đôi', price: '1.200.000đ/tháng' },
                        { type: '4 người', desc: 'Phòng tiêu chuẩn 4 giường đơn', price: '650.000đ/tháng' },
                        { type: '6 người', desc: 'Phòng tiết kiệm 6 giường tầng', price: '450.000đ/tháng' },
                      ].map((item) => (
                        <div
                          key={item.type}
                          onClick={() => setForm({ ...form, preferredRoomType: item.type })}
                          className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                            form.preferredRoomType === item.type
                              ? 'border-blue-600 bg-blue-50/50'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <p className="font-bold text-slate-800 text-sm">{item.type}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                          <p className="text-xs font-mono font-bold text-blue-600 mt-2">{item.price}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Ngày bắt đầu mong muốn"
                      type="date"
                      value={form.desiredStartDate}
                      onChange={(e) => setForm({ ...form, desiredStartDate: e.target.value })}
                      required
                    />

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-600">Thời hạn đăng ký</label>
                      <select
                        value={form.durationMonths}
                        onChange={(e) => setForm({ ...form, durationMonths: Number(e.target.value) })}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none bg-white text-slate-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      >
                        <option value={5}>1 Học kỳ (5 tháng)</option>
                        <option value={6}>6 Tháng (Nửa năm)</option>
                        <option value={10}>1 Năm học (10 tháng)</option>
                        <option value={12}>12 Tháng (Trọn năm)</option>
                      </select>
                    </div>
                  </div>

                  <Input
                    label="Ghi chú thêm (nếu có nguyện vọng đặc biệt)"
                    placeholder="VD: Ở cùng bạn SV2026002, ở tầng thấp..."
                    value={form.reasonOrNote}
                    onChange={(e) => setForm({ ...form, reasonOrNote: e.target.value })}
                  />
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-100">
                  <Button variant="secondary" onClick={() => setStep(1)}>
                    ← Quay lại
                  </Button>
                  <Button onClick={() => setStep(3)}>
                    Tiếp tục: Xác nhận đơn →
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Xác Nhận & Gửi */}
            {step === 3 && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
                <h3 className="text-base font-semibold text-slate-800">3. Xác nhận thông tin đăng ký</h3>

                {formErr && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
                    {formErr}
                  </div>
                )}

                <div className="p-4 bg-slate-50 rounded-xl space-y-2.5 text-xs text-slate-700 border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tòa nhà đăng ký:</span>
                    <strong className="text-slate-900">{selectedBuildingObj?.name} (Tòa {selectedBuildingObj?.code})</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Loại phòng:</span>
                    <strong className="text-slate-900">{form.preferredRoomType}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ngày bắt đầu ở:</span>
                    <strong className="text-slate-900">{new Date(form.desiredStartDate).toLocaleDateString('vi-VN')}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Thời hạn đăng ký:</span>
                    <strong className="text-slate-900">{form.durationMonths} tháng</strong>
                  </div>
                  {form.reasonOrNote && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Ghi chú:</span>
                      <span className="text-slate-800">{form.reasonOrNote}</span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-500 italic">
                  * Bằng việc gửi đơn, bạn cam kết tuân thủ đầy đủ nội quy Ký túc xá và thanh toán các khoản tiền phòng đúng hạn.
                </p>

                <div className="flex justify-between pt-4 border-t border-slate-100">
                  <Button variant="secondary" onClick={() => setStep(2)}>
                    ← Quay lại
                  </Button>
                  <Button onClick={() => handleSubmit()} loading={actionLoading}>
                    Xác nhận và gửi đơn
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Lịch Sử Đơn Đăng Ký */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Lịch sử nộp đơn của bạn</h3>
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Mã đơn', 'Tòa / Nguyện vọng', 'Ngày nộp', 'Ghi chú BQL', 'Trạng thái', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {myRegistrations.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-600">ĐK#{r.id}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      Tòa {r.preferredBuildingName || '—'} &bull; {r.preferredRoomType}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 max-w-[200px] truncate">
                      {r.adminNote || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          r.status === 2 ? 'success' : r.status === 3 ? 'danger' : 'warning'
                        }
                      >
                        {r.status === 2 ? 'Đã duyệt' : r.status === 3 ? 'Từ chối' : 'Chờ duyệt'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {r.status === 1 && (
                        <button
                          onClick={() => handleCancel(r.id)}
                          className="text-xs text-red-600 hover:underline font-semibold"
                        >
                          Hủy đơn
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {myRegistrations.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-xs text-slate-400">
                      Bạn chưa gửi đơn đăng ký nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
