import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Table } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { buildingApi } from '../../api';
import { Building } from '../../types';
import { Plus, Edit2, Trash2, Building as BuildingIcon, Layers, BedDouble, Users } from 'lucide-react';

export const BuildingsPage: React.FC = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
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

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tòa nhà này?')) return;
    try {
      await buildingApi.delete(id);
      fetchBuildings();
    } catch (err: any) {
      alert(err.message || 'Không thể xóa tòa nhà');
    }
  };

  const columns = [
    {
      header: 'Mã Tòa',
      render: (b: Building) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
          Tòa {b.code}
        </span>
      ),
    },
    {
      header: 'Tên Tòa Nhà',
      render: (b: Building) => (
        <div>
          <p className="font-bold text-slate-800">{b.name}</p>
          <p className="text-xs text-slate-400">{b.address}</p>
        </div>
      ),
    },
    {
      header: 'Số Tầng',
      accessor: 'numberOfFloors' as keyof Building,
    },
    {
      header: 'Đối tượng',
      render: (b: Building) => (
        <Badge variant={b.genderAllowed === 'Nam' ? 'primary' : b.genderAllowed === 'Nữ' ? 'purple' : 'slate'}>
          {b.genderAllowed || 'Tất cả'}
        </Badge>
      ),
    },
    {
      header: 'Quy mô',
      render: (b: Building) => (
        <div className="text-xs text-slate-600">
          <p><span className="font-semibold">{b.totalRooms}</span> phòng</p>
          <p className="text-slate-400"><span className="font-semibold">{b.totalBeds}</span> giường</p>
        </div>
      ),
    },
    {
      header: 'Tình trạng giường',
      render: (b: Building) => {
        const rate = b.totalBeds > 0 ? Math.round((b.occupiedBeds / b.totalBeds) * 100) : 0;
        return (
          <div className="w-36">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500">{b.occupiedBeds}/{b.totalBeds}</span>
              <span className="font-bold text-indigo-600">{rate}%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${rate}%` }} />
            </div>
          </div>
        );
      },
    },
    {
      header: 'Thao tác',
      render: (b: Building) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => {
              setSelectedBuilding(b);
              setIsEditOpen(true);
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50"
            title="Sửa"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(b.id)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50"
            title="Xóa"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex-1 pb-12">
      <Header title="Quản Lý Tòa Nhà" subtitle="Quản lý danh sách các block ký túc xá và khu nhà ở" />

      <div className="max-w-7xl mx-auto px-6 mt-6 space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-xs text-slate-500 font-medium">Hiện có {buildings.length} tòa nhà trong hệ thống</p>
          <Button onClick={() => setIsCreateOpen(true)} icon={<Plus className="w-4 h-4" />}>
            Thêm Tòa Nhà Mới
          </Button>
        </div>

        {/* Table */}
        <Table columns={columns} data={buildings} loading={loading} />
      </div>

      {/* Modal Thêm Tòa Nhà */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Thêm Mới Tòa Nhà KTX">
        {formErr && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
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
            placeholder="VD: Tòa Nhà A (Khu Nam)"
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

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Dành cho đối tượng</label>
            <select
              value={form.genderAllowed}
              onChange={(e) => setForm({ ...form, genderAllowed: e.target.value })}
              className="block w-full rounded-lg border border-slate-300 text-sm px-3.5 py-2 text-slate-900"
            >
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Tất cả">Tất cả (Hỗn hợp)</option>
            </select>
          </div>

          <Input
            label="Mô tả / Tiện ích"
            placeholder="Phòng đầy đủ điều hòa, quạt trần..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(false)}>
              Hủy bỏ
            </Button>
            <Button type="submit" loading={actionLoading}>
              Lưu tòa nhà
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Sửa Tòa Nhà */}
      {selectedBuilding && (
        <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Cập Nhật Tòa Nhà">
          {formErr && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
              {formErr}
            </div>
          )}
          <form onSubmit={handleEditSubmit} className="space-y-4">
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
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Số tầng"
                type="number"
                value={selectedBuilding.numberOfFloors}
                onChange={(e) => setSelectedBuilding({ ...selectedBuilding, numberOfFloors: Number(e.target.value) })}
                required
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Dành cho</label>
                <select
                  value={selectedBuilding.genderAllowed || 'Tất cả'}
                  onChange={(e) => setSelectedBuilding({ ...selectedBuilding, genderAllowed: e.target.value })}
                  className="block w-full rounded-lg border border-slate-300 text-sm px-3.5 py-2 text-slate-900"
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Tất cả">Tất cả</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button type="button" variant="secondary" onClick={() => setIsEditOpen(false)}>
                Hủy bỏ
              </Button>
              <Button type="submit" loading={actionLoading}>
                Cập nhật
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

