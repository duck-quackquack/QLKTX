import { Student } from '../models/Student.js';
import { User } from '../models/User.js';
import { Contract } from '../models/Contract.js';
import { Room } from '../models/Room.js';
import { Bed } from '../models/Bed.js';
import { Building } from '../models/Building.js';
import { Invoice } from '../models/Invoice.js';
import { getNextSequence } from '../models/Counter.js';
import { syncExpiredContracts } from './contractController.js';
import bcrypt from 'bcryptjs';

export const getStudents = async (req, res, next) => {
  try {
    await syncExpiredContracts();

    const { searchTerm, faculty, gender, isStaying, pageNumber = 1, pageSize = 10 } = req.query;
    const query = {};

    if (searchTerm) {
      const reg = new RegExp(searchTerm.trim(), 'i');
      query.$or = [{ fullName: reg }, { studentCode: reg }, { email: reg }, { phone: reg }];
    }
    if (faculty) {
      query.faculty = new RegExp(`^${faculty.trim()}$`, 'i');
    }
    if (gender) {
      query.gender = new RegExp(`^${gender.trim()}$`, 'i');
    }
    if (isStaying !== undefined) {
      query.isStaying = isStaying === 'true' || isStaying === true;
    }

    const page = parseInt(pageNumber, 10) || 1;
    const limit = parseInt(pageSize, 10) || 10;
    const skip = (page - 1) * limit;

    const totalCount = await Student.countDocuments(query);
    const students = await Student.find(query).sort({ id: -1 }).skip(skip).limit(limit).lean();

    // Populate active contract, room, bed, and building information
    const studentIds = students.map((s) => s.id);
    const activeContracts = await Contract.find({ studentId: { $in: studentIds }, status: 2 }).lean();
    const contractMap = new Map(activeContracts.map((c) => [c.studentId, c]));

    const roomIds = [...new Set(activeContracts.map((c) => c.roomId).filter(Boolean))];
    const bedIds = [...new Set(activeContracts.map((c) => c.bedId).filter(Boolean))];

    const rooms = await Room.find({ id: { $in: roomIds } }).lean();
    const roomMap = new Map(rooms.map((r) => [r.id, r]));

    const beds = await Bed.find({ id: { $in: bedIds } }).lean();
    const bedMap = new Map(beds.map((b) => [b.id, b]));

    const buildingIds = [...new Set(rooms.map((r) => r.buildingId).filter(Boolean))];
    const buildings = await Building.find({ id: { $in: buildingIds } }).lean();
    const buildingMap = new Map(buildings.map((b) => [b.id, b]));

    const items = students.map((s) => {
      const contract = contractMap.get(s.id);
      const room = contract ? roomMap.get(contract.roomId) : null;
      const bed = contract ? bedMap.get(contract.bedId) : null;
      const building = room ? buildingMap.get(room.buildingId) : null;

      return {
        ...s,
        currentContractId: contract?.id || null,
        currentRoomId: room?.id || null,
        currentRoomNumber: room?.roomNumber || null,
        currentBedId: bed?.id || null,
        currentBedNumber: bed?.bedNumber || null,
        currentBuildingId: building?.id || null,
        currentBuildingName: building?.name || null,
        currentBuildingCode: building?.code || null,
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

export const getStudentById = async (req, res, next) => {
  try {
    const sId = Number(req.params.id);
    const student = await Student.findOne({ id: sId }).lean();
    if (!student) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ sinh viên.' });
    }

    // IDOR protection: Student can only view their own profile
    if (req.user.role === 'Student' && student.id !== req.user.studentId && student.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xem thông tin sinh viên khác.' });
    }

    const activeContract = await Contract.findOne({ studentId: student.id, status: 2 }).lean();
    let room = null;
    let bed = null;
    let building = null;

    if (activeContract) {
      room = await Room.findOne({ id: activeContract.roomId }).lean();
      bed = await Bed.findOne({ id: activeContract.bedId }).lean();
      if (room) {
        building = await Building.findOne({ id: room.buildingId }).lean();
      }
    }

    res.json({
      success: true,
      data: {
        ...student,
        currentContractId: activeContract?.id || null,
        currentRoomId: room?.id || null,
        currentRoomNumber: room?.roomNumber || null,
        currentBedId: bed?.id || null,
        currentBedNumber: bed?.bedNumber || null,
        currentBuildingId: building?.id || null,
        currentBuildingName: building?.name || null,
        currentBuildingCode: building?.code || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createStudent = async (req, res, next) => {
  try {
    const { studentCode, fullName, username, password, email, phone, gender, dateOfBirth, address, faculty, className, citizenId, createAccount = true } = req.body;

    const existingStudent = await Student.findOne({ studentCode: new RegExp(`^${studentCode.trim()}$`, 'i') });
    if (existingStudent) {
      return res.status(409).json({ success: false, message: 'Mã sinh viên đã tồn tại.' });
    }

    const desiredUsername = (username?.trim() || studentCode.trim()).toLowerCase();
    const existingUser = await User.findOne({ username: desiredUsername });
    if (existingUser) {
      return res.status(409).json({ success: false, message: `Tên đăng nhập "${desiredUsername}" đã tồn tại.` });
    }

    let user = null;
    if (createAccount !== false) {
      const userId = await getNextSequence('user_id');
      const pass = password?.trim() || 'Ktx@123456';
      user = await User.create({
        id: userId,
        username: desiredUsername,
        email: email.trim().toLowerCase(),
        fullName: fullName.trim(),
        passwordHash: await bcrypt.hash(pass, 10),
        phone: phone?.trim() || null,
        role: 3,
        isActive: true,
      });
    }

    const studentId = await getNextSequence('student_id');
    const student = await Student.create({
      id: studentId,
      userId: user ? user.id : null,
      studentCode: studentCode.trim(),
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone?.trim() || '',
      gender: gender || 'Nam',
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date('2004-01-01'),
      address: address?.trim() || '',
      faculty: faculty?.trim() || '',
      className: className?.trim() || '',
      citizenId: citizenId?.trim() || null,
      isStaying: false,
    });

    res.status(201).json({ success: true, message: 'Tạo hồ sơ sinh viên thành công', data: student });
  } catch (error) {
    next(error);
  }
};

export const updateStudent = async (req, res, next) => {
  try {
    const student = await Student.findOne({ id: Number(req.params.id) });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ sinh viên.' });
    }

    const fields = ['fullName', 'email', 'phone', 'gender', 'dateOfBirth', 'address', 'faculty', 'className', 'citizenId', 'avatarUrl', 'isStaying'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) {
        student[f] = req.body[f];
      }
    });

    await student.save();

    // Synchronize user account details if userId is present
    if (student.userId) {
      const user = await User.findOne({ id: student.userId });
      if (user) {
        if (req.body.fullName) user.fullName = req.body.fullName.trim();
        if (req.body.email) user.email = req.body.email.trim();
        if (req.body.phone !== undefined) user.phone = req.body.phone;
        await user.save();
      }
    }

    res.json({ success: true, message: 'Cập nhật sinh viên thành công', data: student });
  } catch (error) {
    next(error);
  }
};

export const deleteStudent = async (req, res, next) => {
  try {
    const studentId = Number(req.params.id);
    const student = await Student.findOne({ id: studentId });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ sinh viên.' });
    }

    // Rule 3.2: Do not delete student with active contracts or staying
    const activeContract = await Contract.findOne({ studentId, status: 2 });
    if (activeContract || student.isStaying) {
      return res.status(400).json({
        success: false,
        message: 'Sinh viên đang có hợp đồng lưu trú còn hiệu lực hoặc đang ở tại ký túc xá. Vui lòng thanh lý hợp đồng trước khi xóa.',
      });
    }

    // Rule 3.2: Do not delete student with unpaid invoices
    const unpaidInvoice = await Invoice.findOne({ studentId, status: { $in: [1, 2, 4] } });
    if (unpaidInvoice) {
      return res.status(400).json({
        success: false,
        message: `Sinh viên còn hóa đơn chưa thanh toán (${unpaidInvoice.invoiceCode}). Vui lòng xử lý công nợ trước khi xóa.`,
      });
    }

    await Student.findOneAndDelete({ id: studentId });
    if (student.userId) {
      await User.findOneAndDelete({ id: student.userId });
    }
    res.json({ success: true, message: 'Xóa sinh viên thành công' });
  } catch (error) {
    next(error);
  }
};

export const getActiveStaying = async (req, res, next) => {
  try {
    const students = await Student.find({ isStaying: true }).sort({ fullName: 1 });
    res.json({ success: true, data: students });
  } catch (error) {
    next(error);
  }
};

export const getFaculties = async (req, res, next) => {
  try {
    const defaultFaculties = [
      'Công nghệ Thông tin',
      'Kinh tế & Quản trị',
      'Điện tử Viễn thông',
      'Ngoại ngữ',
    ];

    const studentFaculties = await Student.distinct('faculty');
    const allFaculties = Array.from(
      new Set(
        [...defaultFaculties, ...studentFaculties]
          .map((f) => f && f.trim())
          .filter(Boolean)
      )
    ).sort();

    // Count students per faculty
    const counts = await Promise.all(
      allFaculties.map(async (name) => {
        const count = await Student.countDocuments({
          faculty: new RegExp(`^${name.trim()}$`, 'i'),
        });
        return { name, count };
      })
    );

    res.json({ success: true, data: counts });
  } catch (error) {
    next(error);
  }
};

export const updateFaculty = async (req, res, next) => {
  try {
    const { oldName, newName } = req.body;
    if (!oldName || !newName || !oldName.trim() || !newName.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp tên khoa cũ và tên khoa mới.' });
    }

    const trimmedOld = oldName.trim();
    const trimmedNew = newName.trim();

    const result = await Student.updateMany(
      { faculty: new RegExp(`^${trimmedOld}$`, 'i') },
      { $set: { faculty: trimmedNew } }
    );

    res.json({
      success: true,
      message: `Đã cập nhật tên khoa từ "${trimmedOld}" thành "${trimmedNew}" (${result.modifiedCount} sinh viên được cập nhật).`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFaculty = async (req, res, next) => {
  try {
    const { facultyName, transferTo } = req.body;
    if (!facultyName || !facultyName.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp tên khoa cần xóa.' });
    }

    const trimmedFaculty = facultyName.trim();
    const targetFaculty = transferTo ? transferTo.trim() : '';

    const result = await Student.updateMany(
      { faculty: new RegExp(`^${trimmedFaculty}$`, 'i') },
      { $set: { faculty: targetFaculty } }
    );

    res.json({
      success: true,
      message: targetFaculty
        ? `Đã xóa khoa "${trimmedFaculty}" và chuyển ${result.modifiedCount} sinh viên sang khoa "${targetFaculty}".`
        : `Đã xóa khoa "${trimmedFaculty}" (${result.modifiedCount} sinh viên được đặt lại).`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    next(error);
  }
};

