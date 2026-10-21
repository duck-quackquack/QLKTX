import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal, ConfirmDialog } from '../../components/common/Modal';
import { Badge, statusBadge } from '../../components/common/Badge';
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
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n);

export const RoomsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<number | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isBedDetailOpen, setIsBedDetailOpen] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
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

  const handleDeleteRoomConfirm = async () => {
    if (!selectedRoom) return;
    try {
      await roomApi.delete(selectedRoom.id);
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

  const filtered = rooms.filter((r) => {
    const matchesSearch = !search || r.roomNumber.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      !statusFilter ||
      (statusFilter === 'available' && r.status === 1) ||
      (statusFilter === 'full' && r.status === 2) ||
      (statusFilter === 'maintenance' && r.status === 3);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex-1 pb-12 bg-slate-50 min-h-screen">
      <Header
        title="Quản lý Phòng ở"
        subtitle={`Tổng: ${rooms.length} phòng trong tòa đang chọn`}
      />

      <div className="max-w-7xl mx-auto px-6 mt-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Quản lý Phòng ở</h1>
            <p className="text-sm text-slate-500 mt-0.5">Danh sách phòng & giường ký túc xá</p>
          </div>
          <Button icon={<Plus size={15} />} onClick={() => setIsCreateOpen(true)}>
            Thêm phòng
          </Button>
        </div>

        {/* Building selector & Filters Container */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          {/* Building Tabs Header */}
          <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100 overflow-x-auto">
            <span className="text-xs font-semibold text-slate-400 mr-2 uppercase tracking-wide">Tòa nhà:</span>
            {buildings.map((b) => (
              <button
                key={b.id}
                onClick={() => handleBuildingChange(b.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                  selectedBuildingId === b.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tòa {b.code} ({b.name})
              </button>
            ))}
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-slate-100">
            <div className="relative w-48">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm phòng..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg outline-none bg-white text-slate-800 placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg outline-none bg-white text-slate-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="available">Còn chỗ</option>
              <option value="full">Đầy</option>
              <option value="maintenance">Bảo trì</option>
            </select>

            {/* View Switch: Table / Grid */}
            <div className="ml-auto flex items-center gap-1 border border-slate-200 rounded-lg p-1 bg-slate-50">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded transition ${viewMode === 'table' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                title="Dạng bảng"
              >
                <List size={15} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                title="Dạng ô lưới"
              >
                <LayoutGrid size={15} />
              </button>
            </div>
          </div>

          {/* Table View */}
          {viewMode === 'table' && (
            <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['Mã phòng', 'Tòa', 'Tầng', 'Loại phòng', 'Sức chứa', 'Đang ở', 'Còn trống', 'Giá thuê/tháng', 'Trạng thái', ''].map((h) => (
                      <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((r) => {
                    const avail = Math.max(0, r.capacity - r.occupiedCount);
                    return (
                      <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-600">P.{r.roomNumber}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{r.buildingName || '—'}</td>
                        <td className="px-4 py-3 text-sm text-slate-600 text-center">Tầng {r.floor}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{r.roomType}</td>
                        <td className="px-4 py-3 text-sm text-center">{r.capacity}</td>
                        <td className="px-4 py-3 text-sm text-center font-semibold text-slate-700">{r.occupiedCount}</td>
                        <td className="px-4 py-3 text-sm text-center font-bold text-green-600">{avail}</td>
                        <td className="px-4 py-3 text-sm font-mono text-slate-700">{fmt(r.basePrice)}đ</td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              r.status === 1 ? 'success' : r.status === 2 ? 'info' : 'warning'
                            }
                          >
                            {r.status === 1 ? 'Còn chỗ' : r.status === 2 ? 'Đầy' : 'Bảo trì'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setSelectedRoom(r);
                                setIsBedDetailOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Xem giường"
                            >
                              <BedDouble size={14} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRoom(r);
                                setIsEditOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                              title="Sửa"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRoom(r);
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
                  {filtered.length === 0 && !loading && (
                    <tr>
                      <td colSpan={10} className="text-center py-10 text-xs text-slate-400">
                        Không có phòng nào trong danh sách.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((r) => {
                const pct = Math.round((r.occupiedCount / r.capacity) * 100);
                const isFull = r.occupiedCount >= r.capacity || r.status === 2;
                const isMaint = r.status === 3;

                return (
                  <div
                    key={r.id}
                    onClick={() => {
                      setSelectedRoom(r);
                      setIsBedDetailOpen(true);
                    }}
                    className={`border rounded-xl p-4 cursor-pointer hover:shadow-md transition-all ${
                      isMaint
                        ? 'border-amber-200 bg-amber-50/40'
                        : isFull
                        ? 'border-blue-200 bg-blue-50/40'
                        : 'border-green-200 bg-green-50/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm font-bold text-slate-800">P.{r.roomNumber}</span>
                      <Badge variant={isMaint ? 'warning' : isFull ? 'info' : 'success'}>
                        {isMaint ? 'Bảo trì' : isFull ? 'Đầy' : 'Còn chỗ'}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mb-3">{r.roomType} &bull; Tầng {r.floor}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Sức chứa</span>
                      <span className="font-semibold text-slate-700">{r.occupiedCount}/{r.capacity}</span>
                    </div>
                    <div className="mt-2 h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs font-mono text-slate-600 mt-2.5 font-semibold">{fmt(r.basePrice)}đ/tháng</p>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 text-xs text-slate-400">
            <span>Hiển thị {filtered.length}/{rooms.length} phòng</span>
          </div>
        </div>
      </div>

      {/* Modal Thêm Phòng */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Thêm phòng mới" size="lg">
        {formErr && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
            {formErr}
          </div>
        )}
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Số phòng"
              placeholder="VD: 101, 202..."
              value={form.roomNumber}
              onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
              required
            />
            <Input
              label="Tầng"
              type="number"
              min={1}
              value={form.floor}
              onChange={(e) => setForm({ ...form, floor: Number(e.target.value) })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Loại phòng</label>
              <select
                value={form.roomType}
                onChange={(e) => {
                  const type = e.target.value;
                  const cap = type === '2 người' ? 2 : type === '4 người' ? 4 : type === '6 người' ? 6 : 8;
                  setForm({ ...form, roomType: type, capacity: cap });
                }}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none bg-white text-slate-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                <option value="2 người">Phòng 2 người</option>
                <option value="4 người">Phòng 4 người</option>
                <option value="6 người">Phòng 6 người</option>
                <option value="8 người">Phòng 8 người</option>
              </select>
            </div>

            <Input
              label="Giá thuê/người/tháng (VNĐ)"
              type="number"
              value={form.basePrice}
              onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })}
              required
            />
          </div>

          <Input
            label="Mô tả / Trang thiết bị"
            placeholder="Điều hòa, ban công, bình nóng lạnh..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={() => setIsCreateOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" loading={actionLoading}>
              Xác nhận thêm
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Sửa Phòng */}
      {selectedRoom && (
        <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title={`Chỉnh sửa Phòng ${selectedRoom.roomNumber}`}>
          {formErr && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
              {formErr}
            </div>
          )}
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Số phòng"
                value={selectedRoom.roomNumber}
                onChange={(e) => setSelectedRoom({ ...selectedRoom, roomNumber: e.target.value })}
                required
              />
              <Input
                label="Tầng"
                type="number"
                min={1}
                value={selectedRoom.floor}
                onChange={(e) => setSelectedRoom({ ...selectedRoom, floor: Number(e.target.value) })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Giá thuê (VNĐ)"
                type="number"
                value={selectedRoom.basePrice}
                onChange={(e) => setSelectedRoom({ ...selectedRoom, basePrice: Number(e.target.value) })}
                required
              />
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-600">Trạng thái phòng</label>
                <select
                  value={selectedRoom.status}
                  onChange={(e) => setSelectedRoom({ ...selectedRoom, status: Number(e.target.value) as 1 | 2 | 3 })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none bg-white text-slate-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                >
                  <option value={1}>Hoạt động bình thường</option>
                  <option value={2}>Đã đầy</option>
                  <option value={3}>Đang sửa chữa / Bảo trì</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
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

      {/* Modal Chi Tiết Giường Trong Phòng */}
      {selectedRoom && (
        <Modal
          isOpen={isBedDetailOpen}
          onClose={() => setIsBedDetailOpen(false)}
          title={`Phòng ${selectedRoom.roomNumber} — ${selectedRoom.buildingName}`}
          size="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg">
              <div><span className="text-slate-400">Tầng:</span> <strong className="text-slate-800">{selectedRoom.floor}</strong></div>
              <div><span className="text-slate-400">Loại:</span> <strong className="text-slate-800">{selectedRoom.roomType}</strong></div>
              <div><span className="text-slate-400">Giá thuê:</span> <strong className="text-blue-600 font-mono">{fmt(selectedRoom.basePrice)}đ/tháng</strong></div>
            </div>

            <h4 className="font-semibold text-slate-800 text-sm pt-2">Danh sách giường:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedRoom.beds?.map((bed) => (
                <div key={bed.id} className="p-3 border border-slate-200 rounded-xl bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">Giường số {bed.bedNumber}</span>
                    <Badge variant={bed.status === 2 ? 'danger' : bed.status === 3 ? 'warning' : 'success'}>
                      {bed.status === 2 ? 'Đang ở' : bed.status === 3 ? 'Bảo trì' : 'Còn trống'}
                    </Badge>
                  </div>
                  {bed.status === 2 ? (
                    <div className="text-slate-600 text-xs">
                      <p>Sinh viên: <strong className="text-slate-900">{bed.studentName}</strong></p>
                      <p>MSSV: <span className="font-mono">{bed.studentCode}</span></p>
                    </div>
                  ) : (
                    <p className="text-slate-400 italic">Chưa có người ở</p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setIsBedDetailOpen(false)}>
                Đóng
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDeleteRoomConfirm}
        title="Xác nhận xóa phòng"
        message={`Bạn có chắc muốn xóa Phòng ${selectedRoom?.roomNumber}? Hành động này sẽ xóa toàn bộ danh sách giường thuộc phòng.`}
        confirmLabel="Xóa phòng"
      />
    </div>
  );
};
