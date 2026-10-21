import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/common/Button';
import { Badge, statusBadge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { contractApi, roomApi } from '../../api';
import { Contract, Room } from '../../types';
import { Link } from 'react-router-dom';
import { DoorOpen, Users, BedDouble, ShieldCheck, Wrench } from 'lucide-react';

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n);

export const StudentRoomPage: React.FC = () => {
  const [contract, setContract] = useState<Contract | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const cRes = await contractApi.getMyActive();
        if (cRes.success && cRes.data) {
          setContract(cRes.data);
          const rRes = await roomApi.getById(cRes.data.roomId);
          if (rRes.success) {
            setRoom(rRes.data);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 bg-slate-50 min-h-screen">
        <Header title="Phòng của tôi" />
        <LoadingSpinner message="Đang nạp thông tin phòng ở..." />
      </div>
    );
  }

  if (!contract || !room) {
    return (
      <div className="flex-1 pb-12 bg-slate-50 min-h-screen">
        <Header title="Phòng & Giường của tôi" />
        <div className="max-w-2xl mx-auto mt-16 bg-white rounded-xl border border-slate-200 p-8 text-center shadow-sm">
          <DoorOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">Bạn hiện chưa được xếp phòng</h3>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            Vui lòng nộp đơn đăng ký nội trú để ban quản lý tiến hành xếp chỗ cho bạn.
          </p>
          <Link to="/student/register-room">
            <Button>Đăng ký phòng ngay</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 pb-12 bg-slate-50 min-h-screen">
      <Header
        title={`Phòng ${room.roomNumber} - ${room.buildingName}`}
        subtitle={`Giường của bạn: ${contract.bedNumber} &bull; Tầng ${room.floor}`}
      />

      <div className="max-w-5xl mx-auto px-6 mt-6 flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Phòng & Giường của tôi</h1>
          <p className="text-sm text-slate-500 mt-0.5">Thông tin chi tiết về phòng ở, các bạn cùng phòng và hợp đồng</p>
        </div>

        {/* Room Header Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl shrink-0">
              P.{room.roomNumber}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                Phòng {room.roomNumber} &bull; {room.buildingName}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Loại phòng: <span className="font-semibold text-slate-700">{room.roomType}</span> &bull; Tiền phòng:{' '}
                <span className="font-mono font-bold text-blue-600">{fmt(room.basePrice)}đ/tháng</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/student/repairs">
              <Button variant="outline" size="sm" icon={<Wrench size={14} />}>
                Báo hỏng phòng này
              </Button>
            </Link>
          </div>
        </div>

        {/* Roommates / Beds Grid */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h4 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Users size={16} className="text-blue-600" />
            Danh sách bạn cùng phòng ({room.occupiedCount}/{room.capacity} Người)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {room.beds.map((bed) => {
              const isMe = bed.id === contract.bedId;

              return (
                <div
                  key={bed.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isMe
                      ? 'bg-blue-50/60 border-blue-300 ring-1 ring-blue-500'
                      : bed.status === 2
                      ? 'bg-slate-50/60 border-slate-200'
                      : 'bg-white border-dashed border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <BedDouble size={16} className={isMe ? 'text-blue-600' : 'text-slate-400'} />
                      <span className="font-bold text-sm text-slate-800">Giường số {bed.bedNumber}</span>
                    </div>
                    {isMe ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white uppercase tracking-wider">
                        Chỗ của bạn
                      </span>
                    ) : (
                      <Badge variant={bed.status === 2 ? 'success' : 'default'}>
                        {bed.status === 2 ? 'Đang ở' : 'Trống'}
                      </Badge>
                    )}
                  </div>

                  {bed.status === 2 && bed.studentName ? (
                    <div className="text-xs text-slate-600 space-y-0.5">
                      <p className="font-semibold text-slate-800">{bed.studentName}</p>
                      <p className="text-slate-400 font-mono">MSSV: {bed.studentCode}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Vị trí giường còn trống</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Contract specs */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <ShieldCheck size={16} className="text-green-600" />
            Hợp đồng nội trú liên kết
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block mb-0.5">Mã hợp đồng:</span>
              <span className="font-mono font-bold text-slate-800">{contract.contractNumber}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block mb-0.5">Ngày bắt đầu:</span>
              <span className="font-bold text-slate-800">{new Date(contract.startDate).toLocaleDateString('vi-VN')}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block mb-0.5">Ngày hết hạn:</span>
              <span className="font-bold text-slate-800">{new Date(contract.endDate).toLocaleDateString('vi-VN')}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block mb-0.5">Tiền đặt cọc:</span>
              <span className="font-mono font-bold text-green-600">{fmt(contract.depositAmount)}đ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
