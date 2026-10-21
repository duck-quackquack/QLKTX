import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Table } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { roomApi, buildingApi } from '../../api';
import { Room, Building, Bed } from '../../types';
import {
  Plus,
  Edit2,
  Trash2,
  DoorOpen,
  LayoutGrid,
  List,
  BedDouble,
  User,
  ShieldAlert,
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const RoomsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'map' | 'table'>('map');
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<number | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isBedDetailOpen, setIsBedDetailOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const [form, setForm] = useState({
    buildingId: 1,
    roomNumber: '',
    floor: 1,
    roomType: '4 người',
    capacity: 4,
    basePrice: 650000,
    description: '',
    genderAllowed: 'Nam',
    autoGenerateBeds: true,
  });

  const [formErr, setFormErr] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const bRes = await buildingApi.getAll();
      if (bRes.success && bRes.data.length > 0) {
        setBuildings(bRes.data);
        const bId = selectedBuildingId || bRes.data[0].id;
        setSelectedBuildingId(bId);
        const rRes = await roomApi.getByBuilding(bId);
        if (rRes.success) {
          setRooms(rRes.data);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleBuildingChange = async (bId: number) => {
    setSelectedBuildingId(bId);
    setLoading(true);
    try {
      const rRes = await roomApi.getByBuilding(bId);
      if (rRes.success) {
        setRooms(rRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErr('');
    setActionLoading(true);

    try {
      const res = await roomApi.create({
        ...form,
        buildingId: selectedBuildingId || form.buildingId,
      });
      if (res.success) {
        setIsCreateOpen(false);
        setForm({
          buildingId: selectedBuildingId || 1,
          roomNumber: '',
          floor: 1,
          roomType: '4 người',
          capacity: 4,
          basePrice: 650000,
          description: '',
          genderAllowed: 'Nam',
          autoGenerateBeds: true,
        });
        if (selectedBuildingId) {
          handleBuildingChange(selectedBuildingId);
        }
      }
    } catch (err: any) {
      setFormErr(err.message || 'Tạo phòng thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) return;
    setFormErr('');
    setActionLoading(true);

    try {
      const res = await roomApi.update(selectedRoom.id, {
        roomNumber: selectedRoom.roomNumber,
        floor: selectedRoom.floor,
        roomType: selectedRoom.roomType,
        capacity: selectedRoom.capacity,
        basePrice: selectedRoom.basePrice,
        status: selectedRoom.status,
        description: selectedRoom.description,
        genderAllowed: selectedRoom.genderAllowed,
      });
      if (res.success) {
        setIsEditOpen(false);
        if (selectedBuildingId) handleBuildingChange(selectedBuildingId);
      }
    } catch (err: any) {
      setFormErr(err.message || 'Cập nhật phòng thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteRoom = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa phòng này? Tất cả giường và liên kết sẽ bị xóa.')) return;
    try {
      await roomApi.delete(id);
      if (selectedBuildingId) handleBuildingChange(selectedBuildingId);
      setIsBedDetailOpen(false);
    } catch (err: any) {
      alert(err.message || 'Không thể xóa phòng');
    }
  };

  const handleUpdateBedStatus = async (bedId: number, status: number) => {
    try {
      await roomApi.updateBedStatus(bedId, status);
      if (selectedBuildingId) {
        const rRes = await roomApi.getByBuilding(selectedBuildingId);
        if (rRes.success) {
          setRooms(rRes.data);
          const updatedRoom = rRes.data.find((r) => r.id === selectedRoom?.id);
          if (updatedRoom) setSelectedRoom(updatedRoom);
        }
      }
    } catch (err: any) {
      alert(err.message || 'Cập nhật trạng thái giường thất bại');
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  // Group rooms by floor
  const floors = Array.from(new Set(rooms.map((r) => r.floor))).sort((a, b) => a - b);

  return (
    <div className="flex-1 pb-12">
      <Header
        title="Quản Lý Phòng & Sơ Đồ KTX"
        subtitle="Sơ đồ bố trí phòng ốc, tình trạng giường và quản trị lưu trú"
      />

      <div className="max-w-7xl mx-auto px-6 mt-6 space-y-6">
        {/* Top Control: Building selector, View switch, Add room button */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Building Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {buildings.map((b) => (
              <button
                key={b.id}
                onClick={() => handleBuildingChange(b.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-2 ${
                  selectedBuildingId === b.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <DoorOpen className="w-4 h-4" />
                {b.name}
              </button>
            ))}
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  viewMode === 'map' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Sơ đồ (Map)
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  viewMode === 'table' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                Danh sách
              </button>
            </div>

            <Button onClick={() => setIsCreateOpen(true)} icon={<Plus className="w-4 h-4" />}>
              Thêm Phòng Mới
            </Button>
          </div>
        </div>

        {/* Legend */}
        {viewMode === 'map' && (
          <div className="flex items-center gap-6 px-2 text-xs font-medium text-slate-600">
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-md bg-emerald-500 shadow-sm shadow-emerald-500/30" />
              🟢 Còn chỗ trống
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-md bg-rose-500 shadow-sm shadow-rose-500/30" />
              🔴 Đã đầy phòng
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-md bg-amber-500 shadow-sm shadow-amber-500/30" />
              🟡 Đang bảo trì
            </span>
          </div>
        )}

        {/* Visual Map Mode */}
        {viewMode === 'map' && (
          <div className="space-y-6">
            {floors.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
                Tòa nhà này chưa có phòng nào được tạo.
              </div>
            ) : (
              floors.map((floorNum) => {
                const floorRooms = rooms.filter((r) => r.floor === floorNum);

                return (
                  <div key={floorNum} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                      <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-4 bg-indigo-600 rounded-full" />
                        TẦNG {floorNum} ({floorRooms.length} Phòng)
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {floorRooms.map((room) => {
                        const isFull = room.occupiedCount >= room.capacity || room.status === 2;
                        const isMaint = room.status === 3;

                        return (
                          <div
                            key={room.id}
                            onClick={() => {
                              setSelectedRoom(room);
                              setIsBedDetailOpen(true);
                            }}
                            className={`group relative rounded-2xl border p-4 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg ${
                              isMaint
                                ? 'bg-amber-50/70 border-amber-200 hover:border-amber-300'
                                : isFull
                                ? 'bg-rose-50/70 border-rose-200 hover:border-rose-300'
                                : 'bg-emerald-50/70 border-emerald-200 hover:border-emerald-300'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-extrabold text-slate-900 group-hover:text-indigo-600 transition">
                                P.{room.roomNumber}
                              </span>
                              <span
                                className={`w-2.5 h-2.5 rounded-full ${
                                  isMaint ? 'bg-amber-500' : isFull ? 'bg-rose-500' : 'bg-emerald-500'
                                }`}
                              />
                            </div>

                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between text-slate-600">
                                <span>Ở:</span>
                                <span className="font-bold text-slate-900">
                                  {room.occupiedCount}/{room.capacity}
                                </span>
                              </div>
                              <div className="flex justify-between text-slate-500 text-[11px]">
                                <span>Giá:</span>
                                <span>{room.basePrice.toLocaleString()}đ</span>
                              </div>
                            </div>

                            {/* Mini bed indicator bars */}
                            <div className="mt-3 flex gap-1">
                              {room.beds.map((bed, bIdx) => (
                                <div
                                  key={bIdx}
                                  className={`h-1.5 flex-1 rounded-full ${
                                    bed.status === 2
                                      ? 'bg-rose-500'
                                      : bed.status === 3
                                      ? 'bg-amber-500'
                                      : 'bg-emerald-500'
                                  }`}
                                  title={`Giường ${bed.bedNumber}: ${
                                    bed.status === 2 ? 'Đang ở (' + bed.studentName + ')' : 'Trống'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Table View Mode */}
        {viewMode === 'table' && (
          <Table
            columns={[
              {
                header: 'Số Phòng',
                render: (r: Room) => <span className="font-bold text-slate-900">P.{r.roomNumber}</span>,
              },
              { header: 'Tầng', accessor: 'floor' },
              { header: 'Loại phòng', accessor: 'roomType' },
              {
                header: 'Sức chứa',
                render: (r: Room) => <span>{r.occupiedCount} / {r.capacity} giường</span>,
              },
              {
                header: 'Giá thuê / tháng',
                render: (r: Room) => <span className="font-semibold text-slate-800">{formatCurrency(r.basePrice)}</span>,
              },
              {
                header: 'Trạng thái',
                render: (r: Room) => (
                  <Badge variant={r.status === 1 ? 'success' : r.status === 2 ? 'danger' : 'warning'}>
                    {r.status === 1 ? 'Còn chỗ' : r.status === 2 ? 'Đã đầy' : 'Đang sửa chữa'}
                  </Badge>
                ),
              },
              {
                header: 'Thao tác',
                render: (r: Room) => (
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => {
                        setSelectedRoom(r);
                        setIsBedDetailOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                      title="Xem giường"
                    >
                      <BedDouble className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRoom(r);
                        setIsEditOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50"
                      title="Sửa phòng"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteRoom(r.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                      title="Xóa phòng"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ),
              },
            ]}
            data={rooms}
            loading={loading}
          />
        )}
      </div>

      {/* Modal Chi tiết Phòng & Danh sách Giường (Bed Management) */}
      {selectedRoom && (
        <Modal
          isOpen={isBedDetailOpen}
          onClose={() => setIsBedDetailOpen(false)}
          title={`Chi Tiết Phòng ${selectedRoom.roomNumber} - Tòa ${selectedRoom.buildingName}`}
          maxWidth="2xl"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-0.5">Tầng:</span>
                <span className="font-bold text-slate-800">Tầng {selectedRoom.floor}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-0.5">Loại phòng:</span>
                <span className="font-bold text-slate-800">{selectedRoom.roomType}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-0.5">Giá phòng:</span>
                <span className="font-bold text-slate-800">{formatCurrency(selectedRoom.basePrice)}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-0.5">Tình trạng:</span>
                <Badge variant={selectedRoom.status === 1 ? 'success' : selectedRoom.status === 2 ? 'danger' : 'warning'}>
                  {selectedRoom.occupiedCount}/{selectedRoom.capacity} Giường
                </Badge>
              </div>
            </div>

            {/* Beds List */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Danh Sách Giường & Sinh Viên Cư Trú
              </h4>

              <div className="space-y-2.5">
                {selectedRoom.beds.map((bed) => (
                  <div
                    key={bed.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold ${
                          bed.status === 2
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : bed.status === 3
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        <BedDouble className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">Giường {bed.bedNumber}</span>
                          <Badge variant={bed.status === 1 ? 'success' : bed.status === 2 ? 'danger' : 'warning'}>
                            {bed.status === 1 ? 'Trống' : bed.status === 2 ? 'Đang ở' : 'Bảo trì'}
                          </Badge>
                        </div>
                        {bed.status === 2 && bed.studentName && (
                          <p className="text-xs text-slate-600 mt-0.5">
                            Sinh viên: <span className="font-semibold text-slate-900">{bed.studentName}</span> ({bed.studentCode})
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {bed.status === 1 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateBedStatus(bed.id, 3)}
                        >
                          Bảo trì
                        </Button>
                      )}
                      {bed.status === 3 && (
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleUpdateBedStatus(bed.id, 1)}
                        >
                          Mở lại
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDeleteRoom(selectedRoom.id)}
              >
                Xóa phòng này
              </Button>
              <Button variant="secondary" onClick={() => setIsBedDetailOpen(false)}>
                Đóng
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Thêm Phòng Mới */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Thêm Phòng Mới Vào Tòa">
        {formErr && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
            {formErr}
          </div>
        )}
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Số phòng"
              placeholder="VD: A103, B202..."
              value={form.roomNumber}
              onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
              required
            />
            <Input
              label="Tầng"
              type="number"
              min={1}
              max={20}
              value={form.floor}
              onChange={(e) => setForm({ ...form, floor: Number(e.target.value) })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Loại phòng</label>
              <select
                value={form.roomType}
                onChange={(e) => {
                  const rType = e.target.value;
                  const cap = rType.includes('2') ? 2 : rType.includes('4') ? 4 : rType.includes('6') ? 6 : 8;
                  setForm({ ...form, roomType: rType, capacity: cap });
                }}
                className="block w-full rounded-lg border border-slate-300 text-sm px-3.5 py-2 text-slate-900"
              >
                <option value="2 người">2 người (VIP)</option>
                <option value="4 người">4 người (Chuẩn)</option>
                <option value="6 người">6 người</option>
                <option value="8 người">8 người</option>
              </select>
            </div>
            <Input
              label="Số giường tối đa"
              type="number"
              min={1}
              max={12}
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
              required
            />
          </div>

          <Input
            label="Giá thuê phòng / tháng (VNĐ)"
            type="number"
            step={50000}
            value={form.basePrice}
            onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })}
            required
          />

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="autoBeds"
              checked={form.autoGenerateBeds}
              onChange={(e) => setForm({ ...form, autoGenerateBeds: e.target.checked })}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="autoBeds" className="text-sm text-slate-700 cursor-pointer">
              Tự động tạo danh sách {form.capacity} giường (G01, G02, ...)
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(false)}>
              Hủy bỏ
            </Button>
            <Button type="submit" loading={actionLoading}>
              Tạo phòng
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

