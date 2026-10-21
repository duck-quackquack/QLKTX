import { Student } from '../models/Student.js';
import { User } from '../models/User.js';
import { getNextSequence } from '../models/Counter.js';
import bcrypt from 'bcryptjs';

export const getStudents = async (req, res, next) => {
  try {
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
    const items = await Student.find(query).sort({ id: -1 }).skip(skip).limit(limit);

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
    const student = await Student.findOne({ id: Number(req.params.id) });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ sinh viên.' });
    }
    res.json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
};

export const createStudent = async (req, res, next) => {
  try {
    const { studentCode, fullName, email, phone, gender, dateOfBirth, address, faculty, className, citizenId } = req.body;

    const existingStudent = await Student.findOne({ studentCode: new RegExp(`^${studentCode.trim()}$`, 'i') });
    if (existingStudent) {
      return res.status(409).json({ success: false, message: 'Mã sinh viên đã tồn tại.' });
    }

    let user = await User.findOne({ username: new RegExp(`^${studentCode.trim()}$`, 'i') });
    if (!user) {
      const userId = await getNextSequence('user_id');
      user = await User.create({
        id: userId,
        username: studentCode.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        fullName: fullName.trim(),
        passwordHash: await bcrypt.hash('Ktx@123456', 10),
        phone: phone?.trim() || null,
        role: 3,
        isActive: true,
      });
    }

    const studentId = await getNextSequence('student_id');
    const student = await Student.create({
      id: studentId,
      userId: user.id,
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
    res.json({ success: true, message: 'Cập nhật sinh viên thành công', data: student });
  } catch (error) {
    next(error);
  }
};

export const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findOneAndDelete({ id: Number(req.params.id) });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ sinh viên.' });
    }
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

