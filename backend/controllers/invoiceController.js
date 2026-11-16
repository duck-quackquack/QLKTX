import { Invoice } from '../models/Invoice.js';
import { Payment } from '../models/Payment.js';
import { Student } from '../models/Student.js';
import { Contract } from '../models/Contract.js';
import { Room } from '../models/Room.js';
import { Building } from '../models/Building.js';
import { MeterReading } from '../models/MeterReading.js';
import { Notification } from '../models/Notification.js';
import { getNextSequence } from '../models/Counter.js';
import { syncExpiredContracts } from './contractController.js';

export const syncOverdueInvoices = async () => {
  const now = new Date();
  await Invoice.updateMany(
    {
      status: { $in: [1, 2] },
      dueDate: { $lt: now },
    },
    {
      $set: { status: 4 }, // 4: Overdue
    }
  );
};

export const getInvoices = async (req, res, next) => {
  try {
    await syncOverdueInvoices();
    const { status, studentId, month, year, searchTerm, pageNumber = 1, pageSize = 10 } = req.query;
    const query = {};

    if (status) {
      const s = Number(status);
      if (s === 4) {
        query.$or = [{ status: 4 }, { status: { $in: [1, 2] }, dueDate: { $lt: new Date() } }];
      } else {
        query.status = s;
      }
    }
    if (studentId) query.studentId = Number(studentId);
    if (month) query.month = Number(month);
    if (year) query.year = Number(year);

    const page = parseInt(pageNumber, 10) || 1;
    const limit = parseInt(pageSize, 10) || 10;
    const skip = (page - 1) * limit;

    const totalCount = await Invoice.countDocuments(query);
    const invoices = await Invoice.find(query).sort({ year: -1, month: -1, id: -1 }).skip(skip).limit(limit).lean();

    const students = await Student.find().lean();
    const studentMap = new Map(students.map((s) => [s.id, s]));

    const contracts = await Contract.find().lean();
    const contractMap = new Map(contracts.map((c) => [c.id, c]));

    const rooms = await Room.find().lean();
    const roomMap = new Map(rooms.map((r) => [r.id, r]));

    const buildings = await Building.find().lean();
    const buildingMap = new Map(buildings.map((b) => [b.id, b]));

    const payments = await Payment.find().lean();
    const paymentMap = new Map();
    payments.forEach((p) => {
      if (!paymentMap.has(p.invoiceId)) paymentMap.set(p.invoiceId, []);
      paymentMap.get(p.invoiceId).push(p);
    });

    let items = invoices.map((inv) => {
      const student = studentMap.get(inv.studentId);
      const contract = contractMap.get(inv.contractId);
      const room = contract ? roomMap.get(contract.roomId) : null;
      const building = room ? buildingMap.get(room.buildingId) : null;
      const invPayments = paymentMap.get(inv.id) || [];
      const remainingAmount = Math.max(0, (inv.totalAmount || 0) - (inv.paidAmount || 0));

      return {
        ...inv,
        remainingAmount,
        payments: invPayments,
        studentName: student?.fullName || '',
        studentCode: student?.studentCode || '',
        studentPhone: student?.phone || '',
        roomNumber: room?.roomNumber || '',
        buildingName: building?.name || '',
      };
    });

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      items = items.filter(
        (i) =>
          i.invoiceCode.toLowerCase().includes(term) ||
          i.studentName.toLowerCase().includes(term) ||
          i.studentCode.toLowerCase().includes(term) ||
          i.roomNumber.toLowerCase().includes(term)
      );
    }

    res.json({
      success: true,
      data: {
        items,
        totalItems: totalCount,
        totalCount,
        page,
        pageNumber: page,
        pageSize: limit,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMyInvoices = async (req, res, next) => {
  try {
    await syncOverdueInvoices();
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.json({ success: true, data: [] });
    }

    const invoices = await Invoice.find({ studentId: student.id }).sort({ year: -1, month: -1, id: -1 }).lean();
    const contracts = await Contract.find().lean();
    const contractMap = new Map(contracts.map((c) => [c.id, c]));
    const rooms = await Room.find().lean();
    const roomMap = new Map(rooms.map((r) => [r.id, r]));
    const buildings = await Building.find().lean();
    const buildingMap = new Map(buildings.map((b) => [b.id, b]));

    const invoiceIds = invoices.map((i) => i.id);
    const payments = await Payment.find({ invoiceId: { $in: invoiceIds } }).lean();
    const paymentMap = new Map();
    payments.forEach((p) => {
      if (!paymentMap.has(p.invoiceId)) paymentMap.set(p.invoiceId, []);
      paymentMap.get(p.invoiceId).push(p);
    });

    const result = invoices.map((inv) => {
      const contract = contractMap.get(inv.contractId);
      const room = contract ? roomMap.get(contract.roomId) : null;
      const building = room ? buildingMap.get(room.buildingId) : null;
      const invPayments = paymentMap.get(inv.id) || [];
      const remainingAmount = Math.max(0, (inv.totalAmount || 0) - (inv.paidAmount || 0));

      return {
        ...inv,
        remainingAmount,
        payments: invPayments,
        studentName: student.fullName,
        studentCode: student.studentCode,
        roomNumber: room?.roomNumber || '',
        buildingName: building?.name || '',
      };
    });

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getInvoiceById = async (req, res, next) => {
  try {
    const invId = Number(req.params.id);
    if (isNaN(invId)) {
      return res.status(404).json({ success: false, message: 'Mã hóa đơn không hợp lệ.' });
    }
    const inv = await Invoice.findOne({ id: invId }).lean();
    if (!inv) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hóa đơn.' });
    }

    // IDOR protection: Student can only view their own invoice
    if (req.user.role === 'Student' && inv.studentId !== req.user.studentId) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xem hóa đơn này.' });
    }

    const student = await Student.findOne({ id: inv.studentId }).lean();
    const contract = await Contract.findOne({ id: inv.contractId }).lean();
    const room = contract ? await Room.findOne({ id: contract.roomId }).lean() : null;
    const building = room ? await Building.findOne({ id: room.buildingId }).lean() : null;
    const payments = await Payment.find({ invoiceId: inv.id }).lean();
    const remainingAmount = Math.max(0, (inv.totalAmount || 0) - (inv.paidAmount || 0));

    res.json({
      success: true,
      data: {
        ...inv,
        remainingAmount,
        payments: payments || [],
        studentName: student?.fullName || '',
        studentCode: student?.studentCode || '',
        studentPhone: student?.phone || '',
        roomNumber: room?.roomNumber || '',
        buildingName: building?.name || '',
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createInvoice = async (req, res, next) => {
  try {
    const {
      studentId,
      contractId,
      month,
      year,
      roomFee,
      electricityFee,
      waterFee,
      serviceFee,
      otherFee,
      otherFeeDescription,
      dueDate,
      notes,
    } = req.body;

    const m = Number(month);
    const y = Number(year);
    const cId = Number(contractId);
    const sId = Number(studentId);

    if (!cId || !sId || !m || !y) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ thông tin sinh viên, hợp đồng và kỳ hóa đơn.' });
    }

    // Rule 3.6: Prevent duplicate invoice for same contract and period
    const existing = await Invoice.findOne({ contractId: cId, month: m, year: y });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Hóa đơn kỳ ${m}/${y} cho hợp đồng này đã tồn tại (${existing.invoiceCode}). Không thể tạo trùng.`,
      });
    }

    const rFee = Number(roomFee) || 0;
    const eFee = Number(electricityFee) || 0;
    const wFee = Number(waterFee) || 0;
    const sFee = Number(serviceFee) || 0;
    const oFee = Number(otherFee) || 0;
    const totalAmount = rFee + eFee + wFee + sFee + oFee;

    const id = await getNextSequence('invoice_id');
    let invoiceCode = `INV-${y}${String(m).padStart(2, '0')}-${String(sId).padStart(4, '0')}`;
    const duplicateCode = await Invoice.findOne({ invoiceCode });
    if (duplicateCode) {
      invoiceCode = `INV-${y}${String(m).padStart(2, '0')}-${String(sId).padStart(4, '0')}-${String(id).padStart(3, '0')}`;
    }

    const invoice = await Invoice.create({
      id,
      invoiceCode,
      studentId: sId,
      contractId: cId,
      month: m,
      year: y,
      roomFee: rFee,
      electricityFee: eFee,
      waterFee: wFee,
      serviceFee: sFee,
      otherFee: oFee,
      otherFeeDescription: otherFeeDescription || null,
      totalAmount,
      paidAmount: 0,
      dueDate: dueDate ? new Date(dueDate) : new Date(new Date().setDate(new Date().getDate() + 15)),
      status: 1, // Unpaid
      notes: notes || null,
    });

    res.status(201).json({ success: true, message: 'Tạo hóa đơn thành công', data: invoice });
  } catch (error) {
    next(error);
  }
};

export const generateMonthlyInvoices = async (req, res, next) => {
  try {
    await syncExpiredContracts();

    const { month, year, dueDate, serviceFeePerPerson = 30000, serviceFee } = req.body;
    const m = Number(month);
    const y = Number(year);
    const sFee = Number(serviceFee || serviceFeePerPerson) || 30000;
    const due = dueDate ? new Date(dueDate) : new Date(y, m - 1, 28);

    // Query active contracts with status 2
    const activeContracts = await Contract.find({ status: 2 }).lean();
    let generatedCount = 0;

    for (const contract of activeContracts) {
      const reading = await MeterReading.findOne({ roomId: contract.roomId, month: m, year: y }).lean();
      const roomContracts = activeContracts.filter((c) => c.roomId === contract.roomId);
      const studentCountInRoom = Math.max(1, roomContracts.length);

      let elecFee = 0;
      let waterFee = 0;
      if (reading) {
        const elecUsage = Math.max(0, reading.electricityNew - reading.electricityOld);
        const waterUsage = Math.max(0, reading.waterNew - reading.waterOld);
        elecFee = Math.round((elecUsage * (reading.electricityUnitPrice || 3500)) / studentCountInRoom);
        waterFee = Math.round((waterUsage * (reading.waterUnitPrice || 15000)) / studentCountInRoom);
      }

      const existing = await Invoice.findOne({ contractId: contract.id, month: m, year: y });
      if (existing) {
        // Automatically supplement or update electricity, water, and service fees into existing invoice
        existing.electricityFee = elecFee;
        existing.waterFee = waterFee;
        existing.serviceFee = sFee;
        const newTotal = (existing.roomFee || contract.monthlyRent) + elecFee + waterFee + sFee + (existing.otherFee || 0);
        existing.totalAmount = newTotal;
        if (due) {
          existing.dueDate = due;
        }
        if ((existing.paidAmount || 0) >= newTotal) {
          existing.status = 3; // Fully paid
        } else {
          existing.status = 1; // Unpaid / Incomplete
        }
        await existing.save();
        generatedCount++;
        continue;
      }

      const total = contract.monthlyRent + elecFee + waterFee + sFee;
      const id = await getNextSequence('invoice_id');
      let invoiceCode = `INV-${y}${String(m).padStart(2, '0')}-${String(contract.studentId).padStart(4, '0')}`;
      const duplicateCode = await Invoice.findOne({ invoiceCode });
      if (duplicateCode) {
        invoiceCode = `INV-${y}${String(m).padStart(2, '0')}-${String(contract.studentId).padStart(4, '0')}-${String(id).padStart(3, '0')}`;
      }

      await Invoice.create({
        id,
        invoiceCode,
        studentId: contract.studentId,
        contractId: contract.id,
        month: m,
        year: y,
        roomFee: contract.monthlyRent,
        electricityFee: elecFee,
        waterFee: waterFee,
        serviceFee: sFee,
        otherFee: 0,
        totalAmount: total,
        paidAmount: 0,
        dueDate: due,
        status: 1, // Unpaid
        notes: `Hóa đơn tiền phòng & dịch vụ tháng ${String(m).padStart(2, '0')}/${y}`,
      });

      const student = await Student.findOne({ id: contract.studentId });
      if (student?.userId) {
        const notifId = await getNextSequence('notification_id');
        await Notification.create({
          id: notifId,
          userId: student.userId,
          title: `Hóa đơn tháng ${String(m).padStart(2, '0')}/${y}`,
          content: `Hóa đơn kỳ ${String(m).padStart(2, '0')}/${y} với tổng số tiền ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)} đã được phát hành.`,
          type: 2,
        });
      }

      generatedCount++;
    }

    res.json({
      success: true,
      message: `Đã tự động tạo thành công ${generatedCount} hóa đơn cho kỳ tháng ${m}/${y}`,
      data: generatedCount,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelInvoice = async (req, res, next) => {
  try {
    const { reason } = req.query;
    const inv = await Invoice.findOne({ id: Number(req.params.id) });
    if (!inv) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hóa đơn.' });
    }

    if (inv.status === 3) {
      return res.status(400).json({ success: false, message: 'Hóa đơn đã được thanh toán hoàn tất, không thể hủy.' });
    }

    inv.status = 5; // 5: Cancelled
    inv.notes = reason ? `Hủy: ${reason}` : 'Hóa đơn đã bị hủy bởi quản trị viên.';
    await inv.save();

    res.json({ success: true, message: 'Đã hủy hóa đơn thành công', data: true });
  } catch (error) {
    next(error);
  }
};

