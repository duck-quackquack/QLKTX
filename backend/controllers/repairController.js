import { RepairRequest } from '../models/RepairRequest.js';
import { Student } from '../models/Student.js';
import { Room } from '../models/Room.js';
import { Building } from '../models/Building.js';
import { Contract } from '../models/Contract.js';
import { Notification } from '../models/Notification.js';
import { getNextSequence } from '../models/Counter.js';

export const getRepairs = async (req, res, next) => {
  try {
    const { roomId, studentId, status, priority, searchTerm, pageNumber = 1, pageSize = 10 } = req.query;
    const query = {};

    if (roomId) query.roomId = Number(roomId);
    if (studentId) query.studentId = Number(studentId);
    if (status) query.status = Number(status);
    if (priority) query.priority = Number(priority);
    if (searchTerm) {
      query.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    const page = parseInt(pageNumber, 10) || 1;
    const limit = parseInt(pageSize, 10) || 10;
    const skip = (page - 1) * limit;

    const totalCount = await RepairRequest.countDocuments(query);
    const repairs = await RepairRequest.find(query).sort({ createdAt: -1, id: -1 }).skip(skip).limit(limit).lean();

    const students = await Student.find().lean();
    const studentMap = new Map(students.map((s) => [s.id, s]));

    const rooms = await Room.find().lean();
    const roomMap = new Map(rooms.map((r) => [r.id, r]));

    const buildings = await Building.find().lean();
    const buildingMap = new Map(buildings.map((b) => [b.id, b]));

    const items = repairs.map((r) => {
      const student = studentMap.get(r.studentId);
      const room = roomMap.get(r.roomId);
      const building = room ? buildingMap.get(room.buildingId) : null;

      return {
        ...r,
        studentName: student?.fullName || '',
        studentCode: student?.studentCode || '',
        studentPhone: student?.phone || '',
        roomNumber: room?.roomNumber || '',
        buildingName: building?.name || '',
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

export const getMyRepairs = async (req, res, next) => {
  try {
    const student = await Student.findOne({
      $or: [{ userId: req.user.id }, { id: req.user.studentId }],
    });

    if (!student) {
      return res.json({ success: true, data: [] });
    }

    const repairs = await RepairRequest.find({ studentId: student.id })
      .sort({ createdAt: -1, id: -1 })
      .lean();

    const rooms = await Room.find().lean();
    const roomMap = new Map(rooms.map((r) => [r.id, r]));

    const buildings = await Building.find().lean();
    const buildingMap = new Map(buildings.map((b) => [b.id, b]));

    const items = repairs.map((r) => {
      const room = roomMap.get(r.roomId);
      const building = room ? buildingMap.get(room.buildingId) : null;

      return {
        ...r,
        studentName: student.fullName,
        studentCode: student.studentCode,
        studentPhone: student.phone,
        roomNumber: room?.roomNumber || '',
        buildingName: building?.name || '',
      };
    });

    res.json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};

export const getRepairById = async (req, res, next) => {
  try {
    const repair = await RepairRequest.findOne({ id: Number(req.params.id) }).lean();
    if (!repair) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy yêu cầu sửa chữa.' });
    }

    const student = await Student.findOne({ id: repair.studentId }).lean();
    const room = await Room.findOne({ id: repair.roomId }).lean();
    const building = room ? await Building.findOne({ id: room.buildingId }).lean() : null;

    res.json({
      success: true,
      data: {
        ...repair,
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

export const createRepair = async (req, res, next) => {
  try {
    let { studentId, roomId, title, description, imageUrl, priority } = req.body;

    let student = null;
    if (req.user.role === 'Student') {
      student = await Student.findOne({
        $or: [{ userId: req.user.id }, { id: req.user.studentId }],
      });
      if (!student) {
        return res.status(400).json({ success: false, message: 'Không tìm thấy hồ sơ sinh viên.' });
      }
      studentId = student.id;

      if (!roomId) {
        const activeContract = await Contract.findOne({ studentId: student.id, status: 2 });
        if (activeContract) {
          roomId = activeContract.roomId;
        }
      }
    } else {
      if (studentId) {
        student = await Student.findOne({ id: Number(studentId) });
      }
    }

    if (!roomId) {
      return res.status(400).json({ success: false, message: 'Vui lòng chỉ định phòng cần sửa chữa.' });
    }

    const room = await Room.findOne({ id: Number(roomId) });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy phòng.' });
    }

    const id = await getNextSequence('repair_id');
    const repair = await RepairRequest.create({
      id,
      studentId: studentId ? Number(studentId) : 0,
      roomId: room.id,
      title,
      description: description || '',
      imageUrl: imageUrl || '',
      priority: Number(priority) || 2, // 2: Medium
      status: 1, // Pending
      repairCost: 0,
    });

    const building = await Building.findOne({ id: room.buildingId });

    res.status(201).json({
      success: true,
      message: 'Gửi yêu cầu sửa chữa thành công',
      data: {
        ...repair.toObject(),
        studentName: student?.fullName || '',
        studentCode: student?.studentCode || '',
        studentPhone: student?.phone || '',
        roomNumber: room.roomNumber,
        buildingName: building?.name || '',
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateRepairStatus = async (req, res, next) => {
  try {
    const { status, repairCost, staffNotes } = req.body;
    const repair = await RepairRequest.findOne({ id: Number(req.params.id) });

    if (!repair) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy yêu cầu sửa chữa.' });
    }

    if (status !== undefined) {
      repair.status = Number(status);
      if (Number(status) === 3) { // Completed
        repair.completedAt = new Date();
      }
    }
    if (repairCost !== undefined) repair.repairCost = Number(repairCost);
    if (staffNotes !== undefined) repair.staffNotes = staffNotes;

    await repair.save();

    if (repair.studentId) {
      const student = await Student.findOne({ id: repair.studentId });
      if (student?.userId) {
        const notifId = await getNextSequence('notification_id');
        const statusText = Number(status) === 2 ? 'đang được xử lý' : Number(status) === 3 ? 'đã hoàn thành' : 'đã cập nhật';
        await Notification.create({
          id: notifId,
          userId: student.userId,
          title: 'Cập nhật yêu cầu sửa chữa',
          content: `Yêu cầu sửa chữa "${repair.title}" của bạn ${statusText}.`,
          type: 4, // Repair
        });
      }
    }

    res.json({
      success: true,
      message: 'Cập nhật trạng thái sửa chữa thành công',
      data: repair,
    });
  } catch (error) {
    next(error);
  }
};

