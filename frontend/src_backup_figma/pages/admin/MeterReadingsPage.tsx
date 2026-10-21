import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Table } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import { meterReadingApi, roomApi } from '../../api';
import { MeterReading, Room } from '../../types';
import { Gauge, Plus, Search, Zap, Droplets } from 'lucide-react';

export const MeterReadingsPage: React.FC = () => {
  const [readings, setReadings] = useState<MeterReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [monthFilter, setMonthFilter] = useState<number>(new Date().getMonth() + 1);
  const [yearFilter, setYearFilter] = useState<number>(new Date().getFullYear());

  const [rooms, setRooms] = useState<Room[]>([]);
  const [isRecordOpen, setIsRecordOpen] = useState(false);

  const [form, setForm] = useState({
    roomId: 1,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    electricityOld: 0,
    electricityNew: 0,
    waterOld: 0,
    waterNew: 0,
    electricityUnitPrice: 3500,
    waterUnitPrice: 15000,
    autoGenerateInvoicesForRoom: true,
  });

  const [formErr, setFormErr] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReadings = async () => {
    setLoading(true);
    try {
      const res = await meterReadingApi.getAll({
        page,
        pageSize: 10,
        month: monthFilter || undefined,
        year: yearFilter || undefined,
      });
      if (res.success) {
        setReadings(res.data.items);
        setTotalPages(res.data.totalPages);
        setTotalItems(res.data.totalItems);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await roomApi.getAll({ pageSize: 100 });
      if (res.success && res.data.items.length > 0) {
        setRooms(res.data.items);
        setForm((prev) => ({ ...prev, roomId: res.data.items[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReadings();
    fetchRooms();
  }, [page, monthFilter, yearFilter]);

  const handleRoomSelectInForm = async (roomId: number) => {
    setForm((prev) => ({ ...prev, roomId }));
    try {
      const prevRes = await meterReadingApi.getPrevious(roomId, form.month, form.year);
      if (prevRes.success && prevRes.data) {
        setForm((prev) => ({
          ...prev,
          roomId,
          electricityOld: prevRes.data!.electricityNew,
          waterOld: prevRes.data!.waterNew,
          electricityNew: prevRes.data!.electricityNew + 50,
          waterNew: prevRes.data!.waterNew + 5,
        }));
      }
    } catch (err) {
      // ignore
    }
  };

  const handleRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErr('');
    setActionLoading(true);

    try {
      const res = await meterReadingApi.record(form);
      if (res.success) {
        setIsRecordOpen(false);
        fetchReadings();
      }
    } catch (err: any) {
      setFormErr(err.message || 'Ghi chỉ số thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const columns = [
    {
      header: 'Kỳ Thu',
      render: (m: MeterReading) => (
        <span className="font-bold text-slate-900">
          Tháng {String(m.month).padStart(2, '0')}/{m.year}
        </span>
      ),
    },
    {
      header: 'Phòng & Tòa',
      render: (m: MeterReading) => (
        <div>
          <p className="font-bold text-indigo-700">P.{m.roomNumber}</p>
          <p className="text-xs text-slate-400">{m.buildingName}</p>
        </div>
      ),
    },
    {
      header: 'Chỉ số Điện (kWh)',
      render: (m: MeterReading) => (
        <div className="text-xs">
          <p className="font-semibold text-slate-800">{m.electricityOld} → {m.electricityNew}</p>
          <p className="text-amber-600 font-bold">Dùng: {m.electricityUsage} kWh ({formatCurrency(m.totalElectricityCost)})</p>
        </div>
      ),
    },
    {
      header: 'Chỉ số Nước (m³)',
      render: (m: MeterReading) => (
        <div className="text-xs">
          <p className="font-semibold text-slate-800">{m.waterOld} → {m.waterNew}</p>
          <p className="text-sky-600 font-bold">Dùng: {m.waterUsage} m³ ({formatCurrency(m.totalWaterCost)})</p>
        </div>
      ),
    },
    {
      header: 'Tổng Tiền Điện Nước',
      render: (m: MeterReading) => (
        <span className="font-bold text-slate-900">
          {formatCurrency(m.totalElectricityCost + m.totalWaterCost)}
        </span>
      ),
    },
    {
      header: 'Người Ghi',
      render: (m: MeterReading) => (
        <span className="text-xs text-slate-500">
          {m.recordedBy || 'Admin'} &bull; {new Date(m.recordedDate).toLocaleDateString('vi-VN')}
        </span>
      ),
    },
  ];

  return (
    <div className="flex-1 pb-12">
      <Header
        title="Quản Lý Chỉ Số Điện & Nước"
        subtitle="Ghi nhận chỉ số công tơ điện nước theo phòng và tự động phân bổ hóa đơn"
      />

      <div className="max-w-7xl mx-auto px-6 mt-6 space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-semibold text-slate-500">Kỳ tra cứu:</span>
            <select
              value={monthFilter}
              onChange={(e) => {
                setMonthFilter(Number(e.target.value));
                setPage(1);
              }}
              className="rounded-lg border border-slate-300 text-xs px-3 py-1.5 text-slate-700 bg-white"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  Tháng {m}
                </option>
              ))}
            </select>

            <select
              value={yearFilter}
              onChange={(e) => {
                setYearFilter(Number(e.target.value));
                setPage(1);
              }}
              className="rounded-lg border border-slate-300 text-xs px-3 py-1.5 text-slate-700 bg-white"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>

          <Button onClick={() => setIsRecordOpen(true)} icon={<Plus className="w-4 h-4" />}>
            Ghi Chỉ Số Mới
          </Button>
        </div>

        <Table columns={columns} data={readings} loading={loading} />

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={10}
          onPageChange={(p) => setPage(p)}
        />
      </div>

      {/* Modal Ghi Chỉ Số Điện Nước */}
      <Modal isOpen={isRecordOpen} onClose={() => setIsRecordOpen(false)} title="Ghi Chỉ Số Điện Nước Hàng Tháng" maxWidth="xl">
        {formErr && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
            {formErr}
          </div>
        )}
        <form onSubmit={handleRecordSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Chọn phòng</label>
              <select
                value={form.roomId}
                onChange={(e) => handleRoomSelectInForm(Number(e.target.value))}
                className="block w-full rounded-lg border border-slate-300 text-sm px-3.5 py-2 text-slate-900 bg-white"
                required
              >
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    P.{r.roomNumber} ({r.buildingName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tháng</label>
              <select
                value={form.month}
                onChange={(e) => setForm({ ...form, month: Number(e.target.value) })}
                className="block w-full rounded-lg border border-slate-300 text-sm px-3.5 py-2 text-slate-900 bg-white"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>Tháng {m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Năm</label>
              <select
                value={form.year}
                onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
                className="block w-full rounded-lg border border-slate-300 text-sm px-3.5 py-2 text-slate-900 bg-white"
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
              </select>
            </div>
          </div>

          {/* Điện Block */}
          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-3">
            <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5 uppercase">
              <Zap className="w-4 h-4 text-amber-600" />
              Chỉ số Công Tơ Điện (kWh)
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Số điện cũ"
                type="number"
                value={form.electricityOld}
                onChange={(e) => setForm({ ...form, electricityOld: Number(e.target.value) })}
                required
              />
              <Input
                label="Số điện mới"
                type="number"
                value={form.electricityNew}
                onChange={(e) => setForm({ ...form, electricityNew: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          {/* Nước Block */}
          <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-200/80 space-y-3">
            <h4 className="text-xs font-bold text-sky-900 flex items-center gap-1.5 uppercase">
              <Droplets className="w-4 h-4 text-sky-600" />
              Chỉ số Công Tơ Nước (m³)
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Số nước cũ"
                type="number"
                value={form.waterOld}
                onChange={(e) => setForm({ ...form, waterOld: Number(e.target.value) })}
                required
              />
              <Input
                label="Số nước mới"
                type="number"
                value={form.waterNew}
                onChange={(e) => setForm({ ...form, waterNew: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="autoSplit"
              checked={form.autoGenerateInvoicesForRoom}
              onChange={(e) => setForm({ ...form, autoGenerateInvoicesForRoom: e.target.checked })}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="autoSplit" className="text-xs text-slate-700 cursor-pointer font-medium">
              Tự động chia đều chi phí điện nước và cập nhật vào Hóa đơn của các sinh viên trong phòng
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="secondary" onClick={() => setIsRecordOpen(false)}>
              Hủy bỏ
            </Button>
            <Button type="submit" loading={actionLoading}>
              Lưu chỉ số & Tính tiền
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

