import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authApi } from '../../api';
import {
  GraduationCap,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Building2,
  DoorOpen,
  BedDouble,
  User,
  ArrowLeft,
  Sparkles,
  QrCode,
  Download,
  Printer
} from 'lucide-react';

export const VerifyPassPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code') || searchParams.get('studentCode') || '';

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!code) {
      setError('Thiếu mã số sinh viên cần kiểm tra.');
      setLoading(false);
      return;
    }

    const fetchVerification = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await authApi.verifyPass(code);
        if (res.success && res.data) {
          setData(res.data);
        } else {
          setError(res.message || 'Không tìm thấy hồ sơ lưu trú.');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Không thể xác thực thẻ.');
      } finally {
        setLoading(false);
      }
    };

    fetchVerification();
  }, [code]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 print:bg-white print:p-0">
      {/* Top Brand Logo */}
      <div className="mb-6 text-center print:hidden">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">QLKTX</p>
            <p className="text-[11px] text-slate-500 font-medium">Hệ Thống Xác Thực Cư Dân Ký Túc Xá</p>
          </div>
        </Link>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl p-8 shadow-xl max-w-md w-full text-center space-y-4 border border-slate-200">
          <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-700">Đang xác thực thông tin cư dân...</p>
          <p className="text-xs text-slate-400">Vui lòng chờ trong giây lát</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-3xl p-8 shadow-xl max-w-md w-full text-center space-y-4 border border-rose-200">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Xác thực thất bại</h2>
          <p className="text-xs text-rose-600 bg-rose-50 p-3 rounded-xl">{error}</p>
          <div className="pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
            >
              <ArrowLeft className="w-4 h-4" /> Về trang đăng nhập
            </Link>
          </div>
        </div>
      ) : data ? (
        <div className="max-w-md w-full space-y-4 print:max-w-none print:w-full">
          {/* Status Alert Bar */}
          <div
            className={`p-3.5 rounded-2xl flex items-center gap-3 border shadow-xs print:hidden ${
              data.isValid
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            {data.isValid ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            )}
            <div className="min-w-0 text-xs">
              <p className="font-bold">{data.isValid ? 'XÁC THỰC THÀNH CÔNG' : 'CẢNH BÁO LƯU TRÚ'}</p>
              <p className="text-[11px] opacity-90">{data.statusText}</p>
            </div>
          </div>

          {/* Official Digital Resident Card */}
          <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-6 sm:p-7 text-white shadow-2xl relative overflow-hidden border border-blue-900/40">
            {/* Background Holographic Ring */}
            <div
              className="absolute right-0 top-0 w-80 h-80 opacity-20 pointer-events-none"
              style={{ background: 'radial-gradient(circle, #60a5fa, transparent)' }}
            />

            {/* University / Card Header */}
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-white/10 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-blue-300 border border-white/15">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] tracking-widest uppercase font-semibold text-blue-200">
                    BAN QUẢN LÝ KÝ TÚC XÁ
                  </p>
                  <p className="text-xs font-black tracking-tight text-white uppercase">
                    THẺ NỘI TRÚ SINH VIÊN
                  </p>
                </div>
              </div>

              {/* Digital Chip icon */}
              <div className="w-8 h-6 rounded-md bg-gradient-to-r from-amber-400 to-yellow-300 opacity-90 border border-amber-300 shadow-xs flex items-center justify-center">
                <div className="w-4 h-3 border border-amber-800/40 rounded-xs" />
              </div>
            </div>

            {/* Card Body */}
            <div className="pt-5 space-y-4 relative z-10">
              {/* Photo & Name */}
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-extrabold text-3xl flex items-center justify-center shadow-lg shadow-blue-500/30 border-2 border-white/20">
                    {data.student.avatarUrl ? (
                      <img
                        src={data.student.avatarUrl}
                        alt={data.student.fullName}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    ) : (
                      data.student.fullName?.split(' ').pop()?.charAt(0) || 'S'
                    )}
                  </div>
                  {data.isValid && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-slate-900 shadow">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase truncate">
                    {data.student.fullName}
                  </h1>
                  <p className="text-blue-300 font-mono text-sm mt-0.5 font-bold">
                    MSSV: {data.student.studentCode}
                  </p>
                  <p className="text-slate-300 text-xs mt-1 truncate">
                    {data.student.faculty} {data.student.className ? `· ${data.student.className}` : ''}
                  </p>
                </div>
              </div>

              {/* Residence Details Grid */}
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <div className="bg-white/5 rounded-xl p-3 border border-white/10 backdrop-blur-xs">
                  <p className="text-slate-400 text-[10px] mb-0.5 uppercase tracking-wider">Tòa nhà</p>
                  <p className="font-bold text-sm text-white truncate">
                    {data.dormInfo?.buildingName || 'Chưa xếp phòng'}
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 border border-white/10 backdrop-blur-xs">
                  <p className="text-slate-400 text-[10px] mb-0.5 uppercase tracking-wider">Phòng & Giường</p>
                  <p className="font-bold text-sm text-blue-300 truncate">
                    {data.dormInfo ? `${data.dormInfo.roomNumber} · ${data.dormInfo.bedNumber}` : '—'}
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 border border-white/10 backdrop-blur-xs col-span-2">
                  <p className="text-slate-400 text-[10px] mb-0.5 uppercase tracking-wider">Thời hạn hợp đồng</p>
                  <p className="font-semibold text-xs text-emerald-300 truncate">
                    {data.dormInfo
                      ? `Hiệu lực đến: ${new Date(data.dormInfo.endDate).toLocaleDateString('vi-VN')}`
                      : 'Chưa có hợp đồng nội trú'}
                  </p>
                </div>
              </div>

              {/* Digital Stamp & Barcode Footer */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                <div>
                  <p className="font-mono text-slate-300">PASS: QLKTX-{data.student.studentCode}</p>
                  <p className="text-[9px] text-slate-500">
                    Xác thực lúc: {new Date(data.verifiedAt).toLocaleTimeString('vi-VN')} · {new Date(data.verifiedAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>

                {/* Red Circular Seal */}
                <div className="w-14 h-14 rounded-full border-2 border-dashed border-rose-500/80 text-rose-400 flex flex-col items-center justify-center rotate-[-12deg] font-black text-[7px] leading-tight text-center shadow-inner">
                  <span>KTX ĐẠI HỌC</span>
                  <span className="text-[8px] text-rose-300 font-extrabold uppercase">ĐÃ DUYỆT</span>
                  <span>VERIFIED</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2 print:hidden">
            <button
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition shadow-xs"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              In / Lưu ảnh thẻ
            </button>
            <Link
              to="/student/dashboard"
              className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition shadow-xs"
            >
              Vào cổng KTX
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
};
