import { Payment } from '../models/Payment.js';
import { Invoice } from '../models/Invoice.js';
import { Student } from '../models/Student.js';
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

    const items = payments.map((p) => {
      const inv = invoiceMap.get(p.invoiceId);
      return {
        ...p,
        invoiceCode: inv?.invoiceCode || '',
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

    const payments = await Payment.find({ invoiceId: { $in: invoiceIds } })
      .sort({ paymentDate: -1, id: -1 })
      .lean();

    const items = payments.map((p) => ({
      ...p,
      invoiceCode: invoiceMap.get(p.invoiceId)?.invoiceCode || '',
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

    const payAmount = Number(amount);
    if (payAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Số tiền thanh toán phải lớn hơn 0.' });
    }

    const id = await getNextSequence('payment_id');
    const paymentCode = `PAY-${Date.now().toString().slice(-6)}-${String(id).padStart(4, '0')}`;

    const payment = await Payment.create({
      id,
      invoiceId: invoice.id,
      paymentCode,
      amount: payAmount,
      paymentDate: new Date(),
      paymentMethod: Number(paymentMethod) || 1,
      transactionCode: transactionCode || '',
      status: 2, // Completed
      notes: notes || '',
      receivedBy: req.user.fullName || req.user.username,
    });

    // Update invoice
    invoice.paidAmount = (invoice.paidAmount || 0) + payAmount;
    invoice.remainingAmount = Math.max(0, invoice.totalAmount - invoice.paidAmount);

    if (invoice.paidAmount >= invoice.totalAmount) {
      invoice.status = 3; // Paid
    } else if (invoice.paidAmount > 0) {
      invoice.status = 2; // PartiallyPaid
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

