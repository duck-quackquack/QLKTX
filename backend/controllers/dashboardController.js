import { Student } from '../models/Student.js';
import { Building } from '../models/Building.js';
import { Room } from '../models/Room.js';
import { Bed } from '../models/Bed.js';
import { Contract } from '../models/Contract.js';
import { Invoice } from '../models/Invoice.js';
import { Payment } from '../models/Payment.js';
import { Registration } from '../models/Registration.js';
import { RepairRequest } from '../models/RepairRequest.js';
import { Violation } from '../models/Violation.js';

export const getStatistics = async (req, res, next) => {
  try {
    const totalStudents = await Student.countDocuments();
    const activeStayingStudents = await Contract.countDocuments({ status: 2 });
    const totalBuildings = await Building.countDocuments();
    const totalRooms = await Room.countDocuments();
    const totalBeds = await Bed.countDocuments();
    const occupiedBeds = await Bed.countDocuments({ status: 2 });
    const availableBeds = Math.max(0, totalBeds - occupiedBeds);
    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 1000) / 10 : 0;

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Monthly revenue (current month collected payments)
    const currentMonthPayments = await Payment.find({
      paymentDate: {
        $gte: new Date(currentYear, currentMonth - 1, 1),
        $lte: new Date(currentYear, currentMonth, 0, 23, 59, 59),
      },
      status: 2, // Completed
    }).lean();
    const monthlyRevenue = currentMonthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Total unpaid amount
    const unpaidInvoices = await Invoice.find({ status: { $in: [1, 2, 4] } }).lean();
    const totalUnpaidAmount = unpaidInvoices.reduce((sum, inv) => sum + ((inv.totalAmount || 0) - (inv.paidAmount || 0)), 0);

    // Pending counts
    const pendingRegistrations = await Registration.countDocuments({ status: 1 });
    const pendingRepairs = await RepairRequest.countDocuments({ status: { $in: [1, 2] } });
    const pendingViolations = await Violation.countDocuments({ status: 1 });

    // Monthly revenues for last 6 months
    const monthlyRevenues = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - 1 - i, 1);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      const monthLabel = `${String(m).padStart(2, '0')}/${y}`;

      const invoicesInMonth = await Invoice.find({ month: m, year: y }).lean();
      const totalBilled = invoicesInMonth.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

      const startOfMonth = new Date(y, m - 1, 1);
      const endOfMonth = new Date(y, m, 0, 23, 59, 59);
      const paymentsInMonth = await Payment.find({
        paymentDate: { $gte: startOfMonth, $lte: endOfMonth },
        status: 2,
      }).lean();
      const totalCollected = paymentsInMonth.reduce((sum, p) => sum + (p.amount || 0), 0);

      monthlyRevenues.push({
        monthYear: monthLabel,
        totalBilled,
        totalCollected,
      });
    }

    // Building occupancies
    const buildings = await Building.find().lean();
    const rooms = await Room.find().lean();
    const beds = await Bed.find().lean();

    const buildingOccupancies = buildings.map((b) => {
      const bRooms = rooms.filter((r) => r.buildingId === b.id);
      const bRoomIds = new Set(bRooms.map((r) => r.id));
      const bBeds = beds.filter((bed) => bRoomIds.has(bed.roomId));
      const bTotalBeds = bBeds.length;
      const bOccupiedBeds = bBeds.filter((bed) => bed.status === 2).length;
      const bAvailableBeds = Math.max(0, bTotalBeds - bOccupiedBeds);
      const rate = bTotalBeds > 0 ? Math.round((bOccupiedBeds / bTotalBeds) * 1000) / 10 : 0;

      return {
        buildingCode: b.code || '',
        buildingName: b.name || '',
        totalBeds: bTotalBeds,
        occupiedBeds: bOccupiedBeds,
        availableBeds: bAvailableBeds,
        rate,
      };
    });

    // Recent activities (combine recent registrations, repairs, payments)
    const recentRegistrations = await Registration.find().sort({ createdAt: -1 }).limit(5).lean();
    const recentRepairs = await RepairRequest.find().sort({ createdAt: -1 }).limit(5).lean();
    const recentPayments = await Payment.find().sort({ paymentDate: -1 }).limit(5).lean();

    const activities = [
      ...recentRegistrations.map((r) => ({
        title: 'Đăng ký phòng mới',
        description: `Mã phiếu: ${r.registrationCode || `#${r.id}`}`,
        type: 'registration',
        time: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
      })),
      ...recentRepairs.map((r) => ({
        title: 'Yêu cầu sửa chữa',
        description: r.title,
        type: 'repair',
        time: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
      })),
      ...recentPayments.map((p) => ({
        title: 'Thanh toán thành công',
        description: `Số tiền: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.amount || 0)} (${p.paymentCode})`,
        type: 'payment',
        time: p.paymentDate ? new Date(p.paymentDate).toISOString() : new Date().toISOString(),
      })),
    ]
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 10);

    res.json({
      success: true,
      data: {
        totalStudents,
        activeStayingStudents,
        totalBuildings,
        totalRooms,
        totalBeds,
        occupiedBeds,
        availableBeds,
        occupancyRate,
        monthlyRevenue,
        totalUnpaidAmount,
        pendingRegistrations,
        pendingRepairs,
        pendingViolations,
        monthlyRevenues,
        buildingOccupancies,
        recentActivities: activities,
      },
    });
  } catch (error) {
    next(error);
  }
};
