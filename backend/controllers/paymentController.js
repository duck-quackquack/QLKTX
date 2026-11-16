import { Payment } from '../models/Payment.js';
import { Invoice } from '../models/Invoice.js';
import { Student } from '../models/Student.js';
import { Contract } from '../models/Contract.js';
import { Room } from '../models/Room.js';
import { Notification } from '../models/Notification.js';
import { getNextSequence } from '../models/Counter.js';

export const getPayments = async (req, res, next) => {
  try {
    const { invoiceId, status, paymentMethod, searchTerm, pageNumber = 1, pageSize = 10 } = req.query;
    const query = {};

    if (invoiceId) query.invoiceId = Number(invoiceId);
    if (status) query.status = Number(status);
    if (paymentMethod) query.paymentMethod = Number(paymentMethod);
    if (searchTerm) {
      query.$or = [
        { paymentCode: { $regex: searchTerm, $options: 'i' } },
        { transactionCode: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    const page = parseInt(pageNumber, 10) || 1;
    const limit = parseInt(pageSize, 10) || 10;
    const skip = (page - 1) * limit;

    const totalCount = await Payment.countDocuments(query);
    const payments = await Payment.find(query).sort({ paymentDate: -1, id: -1 }).skip(skip).limit(limit).lean();

    const invoices = await Invoice.find().lean();
    const invoiceMap = new Map(invoices.map((inv) => [inv.id, inv]));

    const students = await Student.find().lean();
    const studentMap = new Map(students.map((s) => [s.id, s]));

    const contracts = await Contract.find().lean();
    const contractMap = new Map(contracts.map((c) => [c.id, c]));

    const rooms = await Room.find().lean();
    const roomMap = new Map(rooms.map((r) => [r.id, r]));

    const items = payments.map((p) => {
      const inv = invoiceMap.get(p.invoiceId);
      const student = (inv ? studentMap.get(inv.studentId) : null) || (p.studentId ? studentMap.get(p.studentId) : null);
      const contract = inv ? contractMap.get(inv.contractId) : (student ? contracts.find((c) => c.studentId === student.id && (c.status === 2 || c.status === 1)) : null);
      const room = contract ? roomMap.get(contract.roomId) : null;

      // Determine proper recipient / channel
      let receivedBy = p.receivedBy;
      if (!receivedBy || receivedBy === student?.fullName) {
        receivedBy = p.paymentMethod === 2 ? 'Ban Quản Trị KTX (VietQR)' : 'Ban Quản Trị KTX';
      }

      return {
        ...p,
        invoiceCode: inv?.invoiceCode || (p.notes?.includes('vi phạm') ? 'Phạt vi phạm' : p.notes?.includes('sửa chữa') ? 'Phí sửa chữa' : ''),
        studentName: student?.fullName || '',
        studentCode: student?.studentCode || '',
        roomNumber: room?.roomNumber || student?.currentRoomNumber || '',
        receivedBy,
      };
    });

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

export const getMyPayments = async (req, res, next) => {
  try {
    const student = await Student.findOne({
      $or: [{ userId: req.user.id }, { id: req.user.studentId }],
    });

    if (!student) {
      return res.json({ success: true, data: [] });
    }

    const invoices = await Invoice.find({ studentId: student.id }).lean();
    const invoiceIds = invoices.map((i) => i.id);
    const invoiceMap = new Map(invoices.map((i) => [i.id, i]));

    const payments = await Payment.find({
      $or: [
        { invoiceId: { $in: invoiceIds } },
        { studentId: student.id },
      ],
    })
      .sort({ paymentDate: -1, id: -1 })
      .lean();

    const items = payments.map((p) => ({
      ...p,
      invoiceCode: invoiceMap.get(p.invoiceId)?.invoiceCode || p.notes || '',
    }));

    res.json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};

export const getPaymentById = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({ id: Number(req.params.id) }).lean();
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin thanh toán.' });
    }

    const inv = await Invoice.findOne({ id: payment.invoiceId }).lean();

    // IDOR protection: Student can only view their own payment
    if (req.user.role === 'Student' && inv && inv.studentId !== req.user.studentId) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xem thông tin thanh toán này.' });
    }

    res.json({
      success: true,
      data: {
        ...payment,
        invoiceCode: inv?.invoiceCode || '',
      },
    });
  } catch (error) {
    next(error);
  }
};

export const recordPayment = async (req, res, next) => {
  try {
    const { invoiceId, amount, paymentMethod, transactionCode, notes } = req.body;

    const invoice = await Invoice.findOne({ id: Number(invoiceId) });
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hóa đơn cần thanh toán.' });
    }

    // IDOR check: If student is recording payment, verify it's their own invoice
    if (req.user.role === 'Student' && invoice.studentId !== req.user.studentId) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền thanh toán hóa đơn của sinh viên khác.' });
    }

    if (invoice.status === 3) {
      return res.status(400).json({ success: false, message: 'Hóa đơn này đã được thanh toán đầy đủ trước đó.' });
    }

    if (invoice.status === 5) {
      return res.status(400).json({ success: false, message: 'Hóa đơn này đã bị hủy, không thể thanh toán.' });
    }

    const payAmount = Number(amount);
    if (isNaN(payAmount) || payAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Số tiền thanh toán phải là số lớn hơn 0.' });
    }

    // Rule 3.6: Do not allow duplicate payment transaction codes
    if (transactionCode && transactionCode.trim()) {
      const existingTx = await Payment.findOne({
        transactionCode: transactionCode.trim(),
        status: 2,
      });
      if (existingTx) {
        return res.status(400).json({
          success: false,
          message: `Mã giao dịch "${transactionCode.trim()}" đã được ghi nhận trong hệ thống (Mã phiếu thu #${existingTx.paymentCode}). Không thể thanh toán trùng.`,
        });
      }
    }

    // Rule 3.6: Do not allow overpayment exceeding remaining debt
    const remainingDebt = Math.max(0, (invoice.totalAmount || 0) - (invoice.paidAmount || 0));
    if (payAmount > remainingDebt) {
      return res.status(400).json({
        success: false,
        message: `Số tiền thanh toán (${payAmount.toLocaleString('vi-VN')} đ) không được vượt quá số tiền còn nợ (${remainingDebt.toLocaleString('vi-VN')} đ).`,
      });
    }

    const id = await getNextSequence('payment_id');
    const paymentCode = `PAY-${Date.now().toString().slice(-6)}-${String(id).padStart(4, '0')}`;

    const payment = await Payment.create({
      id,
      invoiceId: invoice.id,
      paymentCode,
      amount: payAmount,
      paymentDate: new Date(),
      paymentMethod: Number(paymentMethod) || 2,
      transactionCode: transactionCode || '',
      status: 2, // Completed
      notes: notes || '',
      receivedBy: req.user.role === 'Student'
        ? 'Ban Quản Trị KTX (VietQR)'
        : (req.user.fullName || req.user.username || 'Ban Quản Trị KTX'),
    });

    // Update invoice
    invoice.paidAmount = (invoice.paidAmount || 0) + payAmount;
    invoice.remainingAmount = Math.max(0, invoice.totalAmount - invoice.paidAmount);

    if (invoice.paidAmount >= invoice.totalAmount) {
      invoice.status = 3; // Paid
    } else {
      const now = new Date();
      if (invoice.dueDate && new Date(invoice.dueDate) < now) {
        invoice.status = 4; // Overdue
      } else {
        invoice.status = 1; // Unpaid
      }
    }
    await invoice.save();

    // Notify student
    const student = await Student.findOne({ id: invoice.studentId });
    if (student?.userId) {
      const notifId = await getNextSequence('notification_id');
      await Notification.create({
        id: notifId,
        userId: student.userId,
        title: 'Thanh toán thành công',
        content: `Đã ghi nhận thanh toán ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(payAmount)} cho hóa đơn ${invoice.invoiceCode}.`,
        type: 3, // Payment
      });
    }

    res.status(201).json({
      success: true,
      message: 'Ghi nhận thanh toán thành công',
      data: {
        ...payment.toObject(),
        invoiceCode: invoice.invoiceCode,
      },
    });
  } catch (error) {
    next(error);
  }
};

