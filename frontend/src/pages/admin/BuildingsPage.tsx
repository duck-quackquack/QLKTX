import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal, ConfirmDialog } from '../../components/common/Modal';
import { Badge, statusBadge } from '../../components/common/Badge';
import { buildingApi } from '../../api';
import { Building } from '../../types';
import { Plus, Edit2, Trash2, Building2, Search } from 'lucide-react';

export const BuildingsPage: React.FC = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);

  const [form, setForm] = useState({
    code: '',
    name: '',
    address: '',
    numberOfFloors: 4,
    description: '',
    genderAllowed: 'Nam',
  });

  const [formErr, setFormErr] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBuildings = async () => {
    setLoading(true);
    try {
      const res = await buildingApi.getAll();
      if (res.success) {
        setBuildings(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuildings();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErr('');
    setActionLoading(true);

    try {
      const res = await buildingApi.create(form);
      if (res.success) {
        setIsCreateOpen(false);
        setForm({ code: '', name: '', address: '', numberOfFloors: 4, description: '', genderAllowed: 'Nam' });
        fetchBuildings();
      }
    } catch (err: any) {
      setFormErr(err.message || 'Thêm tòa nhà thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBuilding) return;
    setFormErr('');
    setActionLoading(true);

    try {
      const res = await buildingApi.update(selectedBuilding.id, {
        code: selectedBuilding.code,
        name: selectedBuilding.name,
        address: selectedBuilding.address,
        numberOfFloors: selectedBuilding.numberOfFloors,
        description: selectedBuilding.description,
        genderAllowed: selectedBuilding.genderAllowed,
      });
      if (res.success) {
        setIsEditOpen(false);
        fetchBuildings();
      }
    } catch (err: any) {
      setFormErr(err.message || 'Cập nhật thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBuilding) return;
    try {
      await buildingApi.delete(selectedBuilding.id);
      fetchBuildings();
    } catch (err: any) {
      alert(err.message || 'Không thể xóa tòa nhà');
    }
  };

  const filtered = buildings.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.code.toLowerCase().includes(search.toLowerCase())
  );

  const totalRooms = buildings.reduce((a, b) => a + (b.totalRooms || 0), 0);
  const totalBeds = buildings.reduce((a, b) => a + (b.totalBeds || 0), 0);
  const occupiedBeds = buildings.reduce((a, b) => a + (b.occupiedBeds || 0), 0);
  const availableBeds = totalBeds - occupiedBeds;

  return (
    <div className="flex-1 pb-12 bg-slate-50 min-h-screen">
      <Header
        title="Quản lý Tòa nhà"
        subtitle={`Tổng: ${buildings.length} tòa nhà ký túc xá`}
      />

      <div className="max-w-7xl mx-auto px-6 mt-6 flex flex-col gap-5">
        {/* Header Action Row */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Quản lý Tòa nhà</h1>
            <p className="text-sm text-slate-500 mt-0.5">Tổng cộng {buildings.length} tòa nhà trong hệ thống</p>
          </div>
          <Button icon={<Plus size={15} />} onClick={() => setIsCreateOpen(true)}>
            Thêm tòa nhà
          </Button>
        </div>

        {/* Summary Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Tổng tòa nhà', value: buildings.length, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Tổng số phòng', value: totalRooms, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Giường đang ở', value: occupiedBeds, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Giường còn trống', value: availableBeds, color: 'text-amber-600', bg: 'bg-amber-50' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <p className="text-xs text-slate-500 mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="relative w-64">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm tòa nhà..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg outline-none bg-white text-slate-800 placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors"
              />
            </div>
            <span className="text-xs text-slate-400">{filtered.length} kết quả</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Mã tòa', 'Tên tòa nhà', 'Đối tượng', 'Số tầng', 'Tổng phòng', 'Tổng giường', 'Đang ở', 'Trống', 'Lấp đầy', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((b) => {
                  const rate = b.totalBeds > 0 ? Math.round(((b.occupiedBeds || 0) / b.totalBeds) * 100) : 0;
                  const avail = (b.totalBeds || 0) - (b.occupiedBeds || 0);

                  return (
                    <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-600">Tòa {b.code}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                            <Building2 size={14} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{b.name}</p>
                            <p className="text-xs text-slate-400">{b.address}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={b.genderAllowed === 'Nam' ? 'primary' : b.genderAllowed === 'Nữ' ? 'purple' : 'default'}>
                          {b.genderAllowed || 'Tất cả'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 text-center">{b.numberOfFloors} tầng</td>
                      <td className="px-4 py-3 text-sm text-slate-700 font-semibold text-center">{b.totalRooms || 0}</td>
                      <td className="px-4 py-3 text-sm text-slate-700 font-semibold text-center">{b.totalBeds || 0}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 text-center">{b.occupiedBeds || 0}</td>
                      <td className="px-4 py-3 text-sm text-green-600 font-bold text-center">{avail}</td>
                      <td className="px-4 py-3 min-w-[120px]">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${rate}%` }} />
                          </div>
                          <span className="text-xs text-slate-500 font-mono w-8 text-right">{rate}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setSelectedBuilding(b);
                              setIsEditOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            title="Sửa"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedBuilding(b);
                              setShowDelete(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Xóa"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 text-xs text-slate-400">
            <span>Hiển thị {filtered.length}/{buildings.length} tòa nhà</span>
          </div>
        </div>
      </div>

      {/* Modal Thêm Tòa Nhà */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Thêm tòa nhà mới">
        {formErr && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
            {formErr}
          </div>
        )}
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Mã tòa"
              placeholder="VD: A, B, C..."
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              required
            />
            <Input
              label="Số tầng"
              type="number"
              min={1}
              max={20}
              value={form.numberOfFloors}
              onChange={(e) => setForm({ ...form, numberOfFloors: Number(e.target.value) })}
              required
            />
          </div>

          <Input
            label="Tên tòa nhà"
            placeholder="VD: Tòa A (Khu Nam)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <Input
            label="Địa chỉ / Vị trí"
            placeholder="Khu ký túc xá phía Đông..."
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            required
          />

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600">Dành cho đối tượng</label>
            <select
              value={form.genderAllowed}
              onChange={(e) => setForm({ ...form, genderAllowed: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none bg-white text-slate-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Tất cả">Tất cả (Hỗn hợp)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="secondary" type="button" onClick={() => setIsCreateOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" loading={actionLoading}>
              Xác nhận thêm
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Chỉnh sửa Tòa Nhà */}
      {selectedBuilding && (
        <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title={`Chỉnh sửa Tòa ${selectedBuilding.code}`}>
          {formErr && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
              {formErr}
            </div>
          )}
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Mã tòa"
                value={selectedBuilding.code}
                onChange={(e) => setSelectedBuilding({ ...selectedBuilding, code: e.target.value })}
                required
              />
              <Input
                label="Số tầng"
                type="number"
                min={1}
                max={20}
                value={selectedBuilding.numberOfFloors}
                onChange={(e) =>
                  setSelectedBuilding({ ...selectedBuilding, numberOfFloors: Number(e.target.value) })
                }
                required
              />
            </div>

            <Input
              label="Tên tòa nhà"
              value={selectedBuilding.name}
              onChange={(e) => setSelectedBuilding({ ...selectedBuilding, name: e.target.value })}
              required
            />

            <Input
              label="Địa chỉ / Vị trí"
              value={selectedBuilding.address}
              onChange={(e) => setSelectedBuilding({ ...selectedBuilding, address: e.target.value })}
              required
            />

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Dành cho đối tượng</label>
              <select
                value={selectedBuilding.genderAllowed}
                onChange={(e) =>
                  setSelectedBuilding({ ...selectedBuilding, genderAllowed: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none bg-white text-slate-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Tất cả">Tất cả (Hỗn hợp)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <Button variant="secondary" type="button" onClick={() => setIsEditOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" loading={actionLoading}>
                Lưu thay đổi
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa tòa nhà"
        message={`Bạn có chắc chắn muốn xóa Tòa ${selectedBuilding?.code} (${selectedBuilding?.name})? Hành động này không thể hoàn tác nếu tòa nhà đang chứa phòng ở.`}
        confirmLabel="Xóa tòa nhà"
      />
    </div>
  );
};
