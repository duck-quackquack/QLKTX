import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Badge, statusBadge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { registrationApi, buildingApi, roomApi, contractApi } from '../../api';
import { Building, Registration, Room, Contract } from '../../types';
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
  Calendar,
  ShieldCheck,
  Info,
} from 'lucide-react';

const steps = [
  { id: 1, label: 'Chọn tòa nhà', icon: <Building2 size={16} /> },
  { id: 2, label: 'Loại phòng & thời hạn', icon: <DoorOpen size={16} /> },
  { id: 3, label: 'Xác nhận đăng ký', icon: <ClipboardList size={16} /> },
];

const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const StudentRegisterPage: React.FC = () => {
  const { user } = useAuth();
  const studentGender = user?.studentGender;

  const [step, setStep] = useState(1);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [buildingRooms, setBuildingRooms] = useState<Room[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [myRegistrations, setMyRegistrations] = useState<Registration[]>([]);
  const [activeContract, setActiveContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    preferredBuildingId: 1,
    preferredRoomType: '4 người',
    preferredRoomId: null as number | null,
    preferredRoomNumber: '',
    desiredStartDate: getTodayDateString(),
    durationMonths: 6,
    reasonOrNote: '',
  });

  const [formErr, setFormErr] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submittedReg, setSubmittedReg] = useState<Registration | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bRes, rRes, cRes] = await Promise.all([
        buildingApi.getAll(),
        registrationApi.getMy(),
        contractApi.getMyActive(),
      ]);
      if (bRes.success) {
        setBuildings(bRes.data);
        setForm((prev) => {
          if (prev.preferredBuildingId) return prev;
          const eligible = bRes.data.find((b: Building) => {
            if (!studentGender || !b.genderAllowed || b.genderAllowed === 'Tất cả') return true;
            return b.genderAllowed === studentGender;
          }) || bRes.data[0];
          return eligible ? { ...prev, preferredBuildingId: eligible.id } : prev;
        });
      }
      if (rRes.success) setMyRegistrations(rRes.data);
      if (cRes.success) setActiveContract(cRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch rooms dynamically for the chosen building
  useEffect(() => {
    if (!form.preferredBuildingId) return;
    const fetchBuildingRooms = async () => {
      setRoomsLoading(true);
      try {
        const res = await roomApi.getByBuilding(form.preferredBuildingId);
        if (res.success) {
          setBuildingRooms(res.data);
          const types = Array.from(new Set(res.data.map((r) => r.roomType).filter(Boolean)));
          if (types.length > 0 && !types.includes(form.preferredRoomType)) {
            setForm((prev) => ({
              ...prev,
              preferredRoomType: types[0],
              preferredRoomId: null,
              preferredRoomNumber: '',
            }));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setRoomsLoading(false);
      }
    };
    fetchBuildingRooms();
  }, [form.preferredBuildingId]);

  // Auto reset preferred room if selected room is in maintenance or full
  useEffect(() => {
    if (form.preferredRoomId) {
      const chosenRoom = buildingRooms.find((r) => r.id === form.preferredRoomId);
      if (
        chosenRoom &&
        (chosenRoom.status === 3 || chosenRoom.status === 2 || (chosenRoom.availableCount ?? 0) <= 0)
      ) {
        setForm((prev) => ({
          ...prev,
          preferredRoomId: null,
          preferredRoomNumber: '',
        }));
      }
    }
  }, [buildingRooms, form.preferredRoomId]);

  // Aggregate unique room types with real prices and capacities from DB
  const availableRoomTypes = React.useMemo(() => {
    const grouped = new Map<string, {
      type: string;
      desc: string;
      minPrice: number;
      maxPrice: number;
      totalBeds: number;
      availableBeds: number;
      roomCount: number;
      activeRoomCount: number;
    }>();

    buildingRooms.forEach((r) => {
      const type = r.roomType || `${r.capacity} người`;
      const price = r.basePrice || 0;
      const isMaint = r.status === 3;
      const avail = isMaint ? 0 : (r.availableCount || 0);

      if (!grouped.has(type)) {
        grouped.set(type, {
          type,
          desc: `Phòng ${r.capacity} người`,
          minPrice: price,
          maxPrice: price,
          totalBeds: r.capacity || 0,
          availableBeds: avail,
          roomCount: 1,
          activeRoomCount: isMaint ? 0 : 1,
        });
      } else {
        const item = grouped.get(type)!;
        item.minPrice = Math.min(item.minPrice, price);
        item.maxPrice = Math.max(item.maxPrice, price);
        item.totalBeds += r.capacity || 0;
        item.availableBeds += avail;
        item.roomCount += 1;
        if (!isMaint) item.activeRoomCount += 1;
      }
    });

    return Array.from(grouped.values());
  }, [buildingRooms]);

  const selectedRoomTypeObj = availableRoomTypes.find((r) => r.type === form.preferredRoomType);
  const filteredRooms = React.useMemo(() => {
    return buildingRooms.filter((r) => !form.preferredRoomType || r.roomType === form.preferredRoomType);
  }, [buildingRooms, form.preferredRoomType]);
  const selectedRoomObj = buildingRooms.find((r) => r.id === form.preferredRoomId);

  const formatPriceRange = (min: number, max: number) => {
    if (min === max) {
      return `${new Intl.NumberFormat('vi-VN').format(min)}đ/tháng`;
    }
    return `${new Intl.NumberFormat('vi-VN').format(min)} - ${new Intl.NumberFormat('vi-VN').format(max)}đ/tháng`;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFormErr('');

    const todayStr = getTodayDateString();
    if (form.desiredStartDate && form.desiredStartDate < todayStr) {
      setFormErr(`Ngày bắt đầu mong muốn không được là ngày trong quá khứ (tối thiểu từ ngày hôm nay ${new Date().toLocaleDateString('vi-VN')}).`);
      return;
    }

    if (selectedRoomObj && (selectedRoomObj.status === 3 || (selectedRoomObj.availableCount ?? 0) <= 0)) {
      setFormErr(`Phòng P.${selectedRoomObj.roomNumber} hiện đang bảo trì hoặc hết chỗ. Vui lòng chọn phòng khác.`);
      return;
    }

    setActionLoading(true);

    try {
      const res = await registrationApi.submit(form);
      if (res.success && res.data) {
        setSubmittedReg({
          ...res.data,
          preferredBuildingName: selectedBuildingObj?.name || res.data.preferredBuildingName,
        });
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
  const selectedBuildingIsMismatched = !!(
    studentGender &&
    selectedBuildingObj?.genderAllowed &&
    selectedBuildingObj.genderAllowed !== 'Tất cả' &&
    selectedBuildingObj.genderAllowed !== studentGender
  );

  if (loading) {
    return (
      <div className="flex-1 bg-slate-50 min-h-screen">
        <Header title="Đăng ký nội trú" subtitle="Hoàn thành các bước để gửi đơn đăng ký chỗ ở ký túc xá" />
        <LoadingSpinner message="Đang nạp thông tin đăng ký..." />
      </div>
    );
  }

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
              Đơn của bạn đã được chuyển đến Ban Quản Lý Ký Túc Xá. Vui lòng theo dõi trạng thái phê duyệt tại mục Thông báo hoặc trang này.
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-xl px-6 py-3.5 mb-6 text-left w-full max-w-md">
              <p className="text-sm font-semibold text-amber-800 mb-0.5">Trạng thái: Đang chờ duyệt</p>
              <p className="text-xs text-amber-700">Thời gian duyệt thông thường từ 1 - 2 ngày làm việc</p>
            </div>

            <div className="text-xs text-slate-600 space-y-2 text-left bg-slate-50 rounded-xl p-4 w-full max-w-md border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-400">Tòa nhà nguyện vọng:</span>
                <span className="font-semibold text-slate-800">
                  {submittedReg?.preferredBuildingName || selectedBuildingObj?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Loại phòng:</span>
                <span className="font-semibold text-slate-800">
                  {submittedReg?.preferredRoomType || form.preferredRoomType}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Phòng mong muốn:</span>
                <span className="font-semibold text-blue-700">
                  {submittedReg?.preferredRoomNumber
                    ? `Phòng P.${submittedReg.preferredRoomNumber}`
                    : form.preferredRoomNumber
                    ? `Phòng P.${form.preferredRoomNumber}`
                    : 'Để BQL tự xếp phòng'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Thời hạn lưu trú:</span>
                <span className="font-semibold text-slate-800">
                  {submittedReg?.durationMonths || form.durationMonths} tháng
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setSubmitted(false);
                setSubmittedReg(null);
                setStep(1);
              }}
              className="mt-6 text-sm text-blue-600 hover:text-blue-700 font-semibold"
            >
              Xem danh sách đơn đăng ký bên dưới ↓
            </button>
          </div>
        ) : activeContract ? (
          <div className="bg-white rounded-2xl border border-blue-200 shadow-sm p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <ShieldCheck size={28} />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-lg font-bold text-slate-900">
                    Bạn hiện đang có phòng và hợp đồng lưu trú còn hiệu lực
                  </h2>
                  <Badge variant="success">Đang nội trú</Badge>
                </div>
                <p className="text-sm text-slate-600 mt-1">
                  Theo quy chế của Ký túc xá, mỗi sinh viên chỉ được phép có 01 hợp đồng nội trú đang có hiệu lực. Bạn không cần đăng ký thêm phòng mới.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-5 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div>
                    <span className="text-xs text-slate-400 block">Tòa nhà & Phòng</span>
                    <span className="text-sm font-bold text-slate-800">
                      {activeContract.buildingName || 'Tòa KTX'} - P.{activeContract.roomNumber || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Vị trí giường</span>
                    <span className="text-sm font-bold text-blue-700">
                      Giường {activeContract.bedNumber || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Mã số hợp đồng</span>
                    <span className="text-xs font-mono font-bold text-slate-800">
                      {activeContract.contractNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Thời hạn lưu trú</span>
                    <span className="text-xs font-semibold text-slate-700">
                      {new Date(activeContract.startDate).toLocaleDateString('vi-VN')} → {new Date(activeContract.endDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-6 pt-4 border-t border-slate-100">
                  <Link to="/student/room">
                    <Button icon={<DoorOpen size={16} />}>
                      Xem phòng & giường của tôi
                    </Button>
                  </Link>
                  <Link to="/student/contracts">
                    <Button variant="secondary" icon={<ClipboardList size={16} />}>
                      Xem hợp đồng nội trú
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : myRegistrations.some((r) => r.status === 1) ? (
          (() => {
            const pendingReg = myRegistrations.find((r) => r.status === 1)!;
            return (
              <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Clock size={28} />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h2 className="text-lg font-bold text-slate-900">
                        Đơn đăng ký nội trú của bạn đang chờ xét duyệt
                      </h2>
                      <Badge variant="warning">Chờ duyệt</Badge>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                      Hệ thống ghi nhận bạn đã gửi đơn đăng ký chỗ ở ký túc xá. Trong thời gian chờ Ban Quản Lý xét duyệt phân phòng, bạn không thể tạo thêm đơn đăng ký mới.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 p-4 rounded-xl bg-amber-50/50 border border-amber-100">
                      <div>
                        <span className="text-xs text-slate-400 block">Mã đơn đăng ký</span>
                        <span className="text-sm font-mono font-bold text-blue-700">
                          {pendingReg.registrationCode || `ĐK#${pendingReg.id}`}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 block">Nguyện vọng xếp phòng</span>
                        <span className="text-sm font-semibold text-slate-800">
                          Tòa {pendingReg.preferredBuildingName || '—'} · {pendingReg.preferredRoomType}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 block">Ngày nộp đơn</span>
                        <span className="text-sm font-semibold text-slate-700">
                          {new Date(pendingReg.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-6 pt-4 border-t border-slate-100">
                      <Button
                        variant="danger"
                        icon={<XCircle size={16} />}
                        onClick={() => handleCancel(pendingReg.id)}
                      >
                        Hủy đơn đăng ký này
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()
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
                <div>
                  <h3 className="text-base font-semibold text-slate-800">1. Chọn tòa nhà mong muốn</h3>
                  {studentGender && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      Giới tính hồ sơ của bạn: <strong className="text-blue-700">{studentGender}</strong> (Chỉ được phép đăng ký tòa dành cho {studentGender} hoặc chung cho Tất cả)
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {buildings.map((b) => {
                    const isGenderMismatch = !!(
                      studentGender &&
                      b.genderAllowed &&
                      b.genderAllowed !== 'Tất cả' &&
                      b.genderAllowed !== studentGender
                    );
                    const isSelected = form.preferredBuildingId === b.id;

                    return (
                      <button
                        key={b.id}
                        type="button"
                        disabled={isGenderMismatch}
                        onClick={() => {
                          if (isGenderMismatch) return;
                          setForm((prev) => ({
                            ...prev,
                            preferredBuildingId: b.id,
                            preferredRoomId: null,
                            preferredRoomNumber: '',
                          }));
                        }}
                        className={`border-2 rounded-xl p-5 text-left transition-all relative ${
                          isGenderMismatch
                            ? 'opacity-60 bg-slate-50 border-slate-200 cursor-not-allowed'
                            : isSelected
                            ? 'border-blue-600 bg-blue-50/50 shadow-sm cursor-pointer'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md cursor-pointer'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              isGenderMismatch ? 'bg-slate-200 text-slate-500' : 'bg-blue-100 text-blue-600'
                            }`}
                          >
                            <Building2 size={20} />
                          </div>
                          {isSelected && !isGenderMismatch && (
                            <span className="text-xs font-semibold text-blue-600 flex items-center gap-1 bg-blue-100 px-2 py-0.5 rounded-full">
                              <Check size={12} /> Đang chọn
                            </span>
                          )}
                        </div>
                        <p className="font-bold text-slate-800 text-base">{b.name}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          Tòa {b.code} · {b.numberOfFloors} tầng · {b.totalRooms ?? b.roomCount ?? 0} phòng
                        </p>

                        {isGenderMismatch ? (
                          <div className="mt-3 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-1.5">
                            <XCircle size={14} className="shrink-0 text-rose-500" />
                            <span>Chỉ dành cho {b.genderAllowed} (Không phù hợp)</span>
                          </div>
                        ) : (
                          <p className="text-xs text-blue-700 font-medium mt-2 flex items-center gap-1">
                            <span>Dành cho: {b.genderAllowed || 'Tất cả'}</span>
                            {studentGender && b.genderAllowed === studentGender && (
                              <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-semibold">
                                Phù hợp
                              </span>
                            )}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <Button
                    onClick={() => setStep(2)}
                    disabled={selectedBuildingIsMismatched}
                    title={selectedBuildingIsMismatched ? 'Tòa nhà đã chọn không phù hợp với giới tính' : ''}
                  >
                    Tiếp tục: Chọn loại phòng →
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Chọn Loại Phòng & Thời Hạn */}
            {step === 2 && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-semibold text-slate-800">2. Loại phòng & Thời gian lưu trú</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Đang chọn: <strong className="text-blue-700">{selectedBuildingObj?.name?.includes(selectedBuildingObj?.code || '') ? selectedBuildingObj?.name : `${selectedBuildingObj?.name} (Tòa ${selectedBuildingObj?.code})`}</strong>
                    </p>
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="text-xs text-blue-600 hover:underline font-semibold"
                  >
                    Đổi tòa nhà
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-2">Loại phòng có sẵn trong tòa</label>
                    {roomsLoading ? (
                      <div className="py-8 text-center text-xs text-slate-400">Đang nạp danh sách loại phòng của tòa nhà...</div>
                    ) : availableRoomTypes.length === 0 ? (
                      <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl text-center text-xs text-amber-800">
                        <p className="font-semibold text-sm">Tòa nhà này hiện chưa có phòng nào được tạo trong hệ thống.</p>
                        <p className="mt-1 text-slate-500">Vui lòng quay lại Bước 1 để chọn tòa nhà khác có phòng khả dụng.</p>
                        <Button variant="secondary" size="sm" className="mt-4" onClick={() => setStep(1)}>
                          ← Quay lại chọn tòa nhà khác
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {availableRoomTypes.map((item) => {
                          const isTypeDisabled = item.availableBeds <= 0;
                          return (
                            <div
                              key={item.type}
                              onClick={() => {
                                if (isTypeDisabled) return;
                                setForm((prev) => ({
                                  ...prev,
                                  preferredRoomType: item.type,
                                  preferredRoomId: null,
                                  preferredRoomNumber: '',
                                }));
                              }}
                              className={`border-2 rounded-xl p-4 transition-all ${
                                isTypeDisabled
                                  ? 'opacity-60 bg-slate-50 border-slate-200 cursor-not-allowed select-none'
                                  : form.preferredRoomType === item.type
                                  ? 'border-blue-600 bg-blue-50/50 shadow-sm cursor-pointer'
                                  : 'border-slate-200 hover:border-slate-300 cursor-pointer'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <p className="font-bold text-slate-800 text-sm">Loại {item.type}</p>
                                <span
                                  className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                                    isTypeDisabled
                                      ? 'text-amber-800 bg-amber-100 border border-amber-300 font-semibold'
                                      : 'text-slate-500 bg-slate-100'
                                  }`}
                                >
                                  {item.availableBeds > 0
                                    ? `${item.availableBeds} chỗ trống`
                                    : item.activeRoomCount === 0
                                    ? 'Đang bảo trì'
                                    : 'Hết chỗ'}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1">{item.desc} • {item.roomCount} phòng</p>
                              <p className="text-sm font-mono font-bold text-blue-600 mt-3">
                                {formatPriceRange(item.minPrice, item.maxPrice)}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {selectedRoomTypeObj && selectedRoomTypeObj.availableBeds <= 0 && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2">
                        <Info size={16} className="shrink-0 text-amber-600" />
                        <span>
                          {selectedRoomTypeObj.activeRoomCount === 0
                            ? `Loại ${selectedRoomTypeObj.type} hiện đang trong kế hoạch bảo trì, không thể tiếp nhận đăng ký.`
                            : `Loại ${selectedRoomTypeObj.type} hiện đã hết chỗ trống.`}{' '}
                          Vui lòng chọn loại phòng khác hoặc quay lại Bước 1 để chọn tòa nhà khác.
                        </span>
                      </div>
                    )}
                    {/* Selection of specific room */}
                    {availableRoomTypes.length > 0 && (
                      <div className="pt-2 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-xs font-semibold text-slate-600">
                            Chọn phòng mong muốn (Nguyện vọng)
                          </label>
                          <span className="text-[11px] text-slate-500">
                            {form.preferredRoomId ? (
                              <span className="text-blue-600 font-semibold">Đang chọn: Phòng P.{form.preferredRoomNumber}</span>
                            ) : (
                              'Để Ban Quản Lý tự động xếp phòng'
                            )}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {/* Card 1: BQL tự xếp phòng */}
                          <div
                            onClick={() => {
                              if ((selectedRoomTypeObj?.availableBeds ?? 0) <= 0) return;
                              setForm((prev) => ({ ...prev, preferredRoomId: null, preferredRoomNumber: '' }));
                            }}
                            className={`border-2 rounded-xl p-3.5 transition-all flex flex-col justify-between ${
                              (selectedRoomTypeObj?.availableBeds ?? 0) <= 0
                                ? 'opacity-60 border-slate-200 bg-slate-50 cursor-not-allowed select-none'
                                : form.preferredRoomId === null
                                ? 'border-blue-600 bg-blue-50/60 shadow-sm cursor-pointer'
                                : 'border-slate-200 hover:border-slate-300 bg-white cursor-pointer'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between">
                                <p className="font-bold text-slate-800 text-sm">Để BQL tự xếp phòng</p>
                                <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                                  Khuyến nghị
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1">
                                Hệ thống & BQL sẽ sắp xếp giường tối ưu nhất trong tòa theo loại phòng bạn đã chọn.
                              </p>
                            </div>
                            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                              <span className="text-xs text-slate-600 font-medium">Tự động phân bổ</span>
                              {form.preferredRoomId === null && (selectedRoomTypeObj?.availableBeds ?? 0) > 0 && (
                                <span className="text-[11px] font-semibold text-blue-700 flex items-center gap-0.5">
                                  <Check size={12} /> Đã chọn
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Room cards from filteredRooms */}
                          {filteredRooms.map((r) => {
                            const isMaintenance = r.status === 3;
                            const isFull = r.status === 2 || (r.availableCount ?? 0) <= 0;
                            const isAvailable = !isMaintenance && !isFull;
                            const isSelected = form.preferredRoomId === r.id;

                            return (
                              <div
                                key={r.id}
                                onClick={() => {
                                  if (!isAvailable) return;
                                  setForm((prev) => ({
                                    ...prev,
                                    preferredRoomId: r.id,
                                    preferredRoomNumber: r.roomNumber,
                                    preferredRoomType: r.roomType || prev.preferredRoomType,
                                  }));
                                }}
                                className={`border-2 rounded-xl p-3.5 transition-all flex flex-col justify-between ${
                                  !isAvailable
                                    ? 'opacity-60 border-slate-200 bg-slate-50 cursor-not-allowed select-none'
                                    : isSelected
                                    ? 'border-blue-600 bg-blue-50/60 shadow-sm cursor-pointer'
                                    : 'border-slate-200 hover:border-slate-300 bg-white cursor-pointer'
                                }`}
                              >
                                <div>
                                  <div className="flex items-center justify-between">
                                    <p className="font-bold text-slate-800 text-sm">Phòng P.{r.roomNumber}</p>
                                    <span
                                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                                        isMaintenance
                                          ? 'text-amber-800 bg-amber-100 border border-amber-300 font-semibold'
                                          : isAvailable
                                          ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                                          : 'text-slate-500 bg-slate-200'
                                      }`}
                                    >
                                      {isMaintenance
                                        ? 'Đang bảo trì'
                                        : isAvailable
                                        ? `Còn ${r.availableCount}/${r.capacity} chỗ`
                                        : 'Đầy'}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-500 mt-1">
                                    Tầng {r.floor} · Sức chứa {r.capacity} người
                                  </p>
                                </div>
                                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                                  <span className="text-xs font-mono font-bold text-blue-600">
                                    {new Intl.NumberFormat('vi-VN').format(r.basePrice)}đ/tháng
                                  </span>
                                  {isSelected && (
                                    <span className="text-[11px] font-semibold text-blue-700 flex items-center gap-0.5">
                                      <Check size={12} /> Đã chọn
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Ngày bắt đầu mong muốn"
                      type="date"
                      min={getTodayDateString()}
                      value={form.desiredStartDate}
                      onChange={(e) => setForm({ ...form, desiredStartDate: e.target.value })}
                      helperText="Tối thiểu từ hôm nay trở đi, không được chọn ngày trong quá khứ"
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
                  <Button
                    onClick={() => {
                      if (form.desiredStartDate < getTodayDateString()) {
                        alert('Ngày bắt đầu mong muốn không được là ngày trong quá khứ. Vui lòng chọn từ hôm nay trở đi.');
                        return;
                      }
                      setStep(3);
                    }}
                    disabled={
                      availableRoomTypes.length === 0 ||
                      (selectedRoomTypeObj && selectedRoomTypeObj.availableBeds <= 0)
                    }
                  >
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
                    <span className="text-slate-400">Phòng mong muốn:</span>
                    <strong className="text-blue-700">
                      {form.preferredRoomNumber
                        ? `Phòng P.${form.preferredRoomNumber} (Tầng ${selectedRoomObj?.floor || '—'})`
                        : 'Để Ban Quản Lý tự động xếp phòng'}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Mức giá dự kiến:</span>
                    <strong className="text-blue-700 font-mono">
                      {selectedRoomObj
                        ? `${new Intl.NumberFormat('vi-VN').format(selectedRoomObj.basePrice)}đ/tháng`
                        : selectedRoomTypeObj
                        ? formatPriceRange(selectedRoomTypeObj.minPrice, selectedRoomTypeObj.maxPrice)
                        : '—'}
                    </strong>
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
                      <div>{r.preferredBuildingName ? (r.preferredBuildingName.startsWith('Tòa') ? r.preferredBuildingName : `Tòa ${r.preferredBuildingName}`) : '—'} · {r.preferredRoomType}</div>
                      {r.preferredRoomNumber && (
                        <div className="text-[11px] font-semibold text-blue-600 mt-0.5">
                          Nguyện vọng: {r.preferredRoomNumber.startsWith('P.') ? r.preferredRoomNumber : `P.${r.preferredRoomNumber}`}
                        </div>
                      )}
                      {r.status === 2 && r.approvedRoomNumber && (
                        <div className="text-[11px] font-semibold text-emerald-700 mt-0.5">
                          Đã xếp: {r.approvedRoomNumber.startsWith('P.') ? r.approvedRoomNumber : `P.${r.approvedRoomNumber}`} - Giường {r.approvedBedNumber}
                        </div>
                      )}
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
                          r.status === 2
                            ? 'success'
                            : r.status === 3
                            ? 'danger'
                            : r.status === 4
                            ? 'default'
                            : 'warning'
                        }
                      >
                        {r.status === 2
                          ? 'Đã duyệt'
                          : r.status === 3
                          ? 'Từ chối'
                          : r.status === 4
                          ? 'Đã hủy'
                          : 'Chờ duyệt'}
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
