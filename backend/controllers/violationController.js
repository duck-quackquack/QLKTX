import { Violation } from '../models/Violation.js';
import { Student } from '../models/Student.js';
import { Notification } from '../models/Notification.js';
import { getNextSequence } from '../models/Counter.js';

export const getViolations = async (req, res, next) => {
  try {
    const { studentId, status, violationType, searchTerm, pageNumber = 1, pageSize = 10 } = req.query;
    const query = {};

    if (studentId) query.studentId = Number(studentId);
    if (status) query.status = Number(status);
    if (violationType) query.violationType = violationType;
    if (searchTerm) {
      query.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    const page = parseInt(pageNumber, 10) || 1;
    const limit = parseInt(pageSize, 10) || 10;
    const skip = (page - 1) * limit;

    const totalCount = await Violation.countDocuments(query);
    const violations = await Violation.find(query).sort({ violationDate: -1, id: -1 }).skip(skip).limit(limit).lean();

    const students = await Student.find().lean();
    const studentMap = new Map(students.map((s) => [s.id, s]));

    const items = violations.map((v) => {
      const student = studentMap.get(v.studentId);
      return {
        ...v,
        studentName: student?.fullName || '',
        studentCode: student?.studentCode || '',
        studentPhone: student?.phone || '',
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

export const getMyViolations = async (req, res, next) => {
  try {
    const student = await Student.findOne({
      $or: [{ userId: req.user.id }, { id: req.user.studentId }],
    });

    if (!student) {
      return res.json({ success: true, data: [] });
    }

    const violations = await Violation.find({ studentId: student.id })
      .sort({ violationDate: -1, id: -1 })
      .lean();

    const items = violations.map((v) => ({
      ...v,
      studentName: student.fullName,
      studentCode: student.studentCode,
      studentPhone: student.phone,
    }));

    res.json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};

export const getViolationById = async (req, res, next) => {
  try {
    const violation = await Violation.findOne({ id: Number(req.params.id) }).lean();
    if (!violation) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin vi phạm.' });
    }

    const student = await Student.findOne({ id: violation.studentId }).lean();

    res.json({
      success: true,
      data: {
        ...violation,
        studentName: student?.fullName || '',
        studentCode: student?.studentCode || '',
        studentPhone: student?.phone || '',
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createViolation = async (req, res, next) => {
  try {
    const { studentId, title, description, violationType, penaltyAmount, violationDate } = req.body;

    const student = await Student.findOne({ id: Number(studentId) });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sinh viên.' });
    }

    const id = await getNextSequence('violation_id');
    const violation = await Violation.create({
      id,
      studentId: student.id,
      title,
      description: description || '',
      violationType: violationType || 'Nội quy phòng ở',
      penaltyAmount: Number(penaltyAmount) || 0,
      violationDate: violationDate ? new Date(violationDate) : new Date(),
      status: 1, // Pending
      createdBy: req.user.fullName || req.user.username,
    });

    if (student.userId) {
      const notifId = await getNextSequence('notification_id');
      await Notification.create({
        id: notifId,
        userId: student.userId,
        title: 'Thông báo biên bản vi phạm nội quy',
        content: `Bạn vừa bị ghi nhận vi phạm: "${title}". Vui lòng liên hệ ban quản lý KTX để giải quyết.`,
        type: 5, // Violation
      });
    }

    res.status(201).json({
      success: true,
      message: 'Ghi nhận vi phạm thành công',
      data: {
        ...violation.toObject(),
        studentName: student.fullName,
        studentCode: student.studentCode,
        studentPhone: student.phone,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateViolationStatus = async (req, res, next) => {
  try {
    const { status, resolutionNotes } = req.body;
    const violation = await Violation.findOne({ id: Number(req.params.id) });

    if (!violation) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin vi phạm.' });
    }

    if (status !== undefined) violation.status = Number(status);
    if (resolutionNotes !== undefined) violation.resolutionNotes = resolutionNotes;

    await violation.save();

    const student = await Student.findOne({ id: violation.studentId });

    res.json({
      success: true,
      message: 'Cập nhật trạng thái vi phạm thành công',
      data: {
        ...violation.toObject(),
        studentName: student?.fullName || '',
        studentCode: student?.studentCode || '',
        studentPhone: student?.phone || '',
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteViolation = async (req, res, next) => {
  try {
    const violation = await Violation.findOneAndDelete({ id: Number(req.params.id) });
    if (!violation) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy vi phạm cần xóa.' });
    }

    res.json({ success: true, message: 'Xóa biên bản vi phạm thành công' });
  } catch (error) {
    next(error);
  }
};

