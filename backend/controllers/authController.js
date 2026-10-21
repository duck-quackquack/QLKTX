import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Student } from '../models/Student.js';
import { getNextSequence } from '../models/Counter.js';

const generateToken = (user, studentId, studentCode) => {
  return jwt.sign(
    {
      id: user.id,
      nameid: user.id.toString(),
      username: user.username,
      email: user.email,
      role: user.role === 1 ? 'Admin' : user.role === 2 ? 'Staff' : 'Student',
      FullName: user.fullName,
      StudentId: studentId ? studentId.toString() : null,
      StudentCode: studentCode || null,
    },
    process.env.JWT_SECRET || 'DormitoryManagementSecretSuperKey2026!@#$%^&*()_+',
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập tên đăng nhập / Mã SV và mật khẩu.' });
    }

    const cleanInput = username.trim();

    // 1. Try finding by username
    let user = await User.findOne({ username: new RegExp(`^${cleanInput}$`, 'i') });

    // 2. If not found by username, try finding by Student Code (MSSV)
    let student = null;
    if (!user) {
      student = await Student.findOne({ studentCode: new RegExp(`^${cleanInput}$`, 'i') });
      if (student && student.userId) {
        user = await User.findOne({ id: student.userId });
      }
    } else {
      student = await Student.findOne({ userId: user.id });
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không chính xác.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không chính xác.' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Tài khoản đã bị khóa. Vui lòng liên hệ ban quản lý.' });
    }

    const token = generateToken(user, student?.id, student?.studentCode);
    const refreshToken = Math.random().toString(36).substring(2) + Date.now().toString(36);

    user.refreshToken = refreshToken;
    user.refreshTokenExpiryTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await user.save();

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        token,
        refreshToken,
        expiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          avatarUrl: user.avatarUrl,
          role: user.role,
          studentId: student?.id || null,
          studentCode: student?.studentCode || null,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const socialLogin = async (req, res, next) => {
  try {
    const { provider, email, name, avatarUrl, providerId } = req.body;

    if (!provider || !email) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin xác thực từ ' + (provider || 'mạng xã hội') });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name || cleanEmail.split('@')[0]).trim();

    // Check if user with this email already exists
    let user = await User.findOne({ email: new RegExp(`^${cleanEmail}$`, 'i') });
    let student = null;

    if (user) {
      student = await Student.findOne({ userId: user.id });
      if (avatarUrl && !user.avatarUrl) {
        user.avatarUrl = avatarUrl;
        await user.save();
      }
    } else {
      // Create new student account automatically
      const userId = await getNextSequence('user_id');
      const studentId = await getNextSequence('student_id');
      const studentCode = `SV${new Date().getFullYear()}${String(studentId).padStart(3, '0')}`;
      const defaultPasswordHash = await bcrypt.hash('Ktx@123456', 10);

      user = await User.create({
        id: userId,
        username: cleanEmail.split('@')[0] + '_' + provider.toLowerCase().slice(0, 2),
        email: cleanEmail,
        fullName: cleanName,
        passwordHash: defaultPasswordHash,
        phone: '090' + Math.floor(1000000 + Math.random() * 9000000),
        avatarUrl: avatarUrl || null,
        role: 3, // Student
        isActive: true,
      });

      student = await Student.create({
        id: studentId,
        userId: user.id,
        studentCode,
        fullName: cleanName,
        dateOfBirth: new Date('2005-01-01'),
        gender: 'Nam',
        phone: user.phone,
        email: cleanEmail,
        address: 'Hà Nội',
        faculty: 'Công nghệ Thông tin',
        className: 'CNTT-K18',
        avatarUrl: avatarUrl || null,
        isStaying: false,
      });
    }

    const token = generateToken(user, student?.id, student?.studentCode);
    const refreshToken = Math.random().toString(36).substring(2) + Date.now().toString(36);

    user.refreshToken = refreshToken;
    user.refreshTokenExpiryTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await user.save();

    res.json({
      success: true,
      message: `Đăng nhập thành công bằng ${provider === 'google' ? 'Google' : 'Facebook'}`,
      data: {
        token,
        refreshToken,
        expiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          avatarUrl: user.avatarUrl,
          role: user.role,
          studentId: student?.id || null,
          studentCode: student?.studentCode || null,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const register = async (req, res, next) => {
  try {
    const {
      username,
      password,
      email,
      fullName,
      studentCode,
      phone,
      gender,
      dateOfBirth,
      faculty,
      className,
      address,
    } = req.body;

    if (!username || !password || !email || !fullName || !studentCode) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ các trường bắt buộc.' });
    }

    const existingUser = await User.findOne({
      $or: [
        { username: new RegExp(`^${username.trim()}$`, 'i') },
        { email: new RegExp(`^${email.trim()}$`, 'i') },
      ],
    });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Tên đăng nhập hoặc Email đã tồn tại trong hệ thống.' });
    }

    const existingStudent = await Student.findOne({
      studentCode: new RegExp(`^${studentCode.trim()}$`, 'i'),
    });
    if (existingStudent) {
      return res.status(409).json({ success: false, message: 'Mã sinh viên này đã được đăng ký trong hệ thống.' });
    }

    const userId = await getNextSequence('user_id');
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      id: userId,
      username: username.trim(),
      email: email.trim(),
      fullName: fullName.trim(),
      passwordHash: hashedPassword,
      phone: phone?.trim() || null,
      role: 3, // Student
      isActive: true,
    });

    const studentId = await getNextSequence('student_id');
    const newStudent = await Student.create({
      id: studentId,
      userId: newUser.id,
      studentCode: studentCode.trim(),
      fullName: fullName.trim(),
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date('2005-01-01'),
      gender: gender || 'Nam',
      phone: phone?.trim() || '',
      email: email.trim(),
      address: address?.trim() || '',
      faculty: faculty?.trim() || '',
      className: className?.trim() || '',
      isStaying: false,
    });

    const token = generateToken(newUser, newStudent.id, newStudent.studentCode);
    const refreshToken = Math.random().toString(36).substring(2) + Date.now().toString(36);

    newUser.refreshToken = refreshToken;
    newUser.refreshTokenExpiryTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công',
      data: {
        token,
        refreshToken,
        expiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          fullName: newUser.fullName,
          phone: newUser.phone,
          avatarUrl: newUser.avatarUrl,
          role: newUser.role,
          studentId: newStudent.id,
          studentCode: newStudent.studentCode,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findOne({ id: req.user.id });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Người dùng không tồn tại.' });
    }
    const student = await Student.findOne({ userId: user.id });

    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        role: user.role,
        studentId: student?.id || null,
        studentCode: student?.studentCode || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findOne({ id: req.user.id });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Người dùng không tồn tại.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không đúng.' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ success: true, message: 'Đổi mật khẩu thành công', data: true });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { fullName, email, phone, avatarUrl } = req.body;
    const user = await User.findOne({ id: req.user.id });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Người dùng không tồn tại.' });
    }

    if (fullName) user.fullName = fullName.trim();
    if (email) user.email = email.trim();
    if (phone !== undefined) user.phone = phone;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    await user.save();

    const student = await Student.findOne({ userId: user.id });
    if (student) {
      if (fullName) student.fullName = fullName.trim();
      if (email) student.email = email.trim();
      if (phone !== undefined) student.phone = phone;
      if (avatarUrl !== undefined) student.avatarUrl = avatarUrl;
      await student.save();
    }

    res.json({
      success: true,
      message: 'Cập nhật thông tin cá nhân thành công',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        role: user.role,
        studentId: student?.id || null,
        studentCode: student?.studentCode || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { usernameOrStudentCode, email, newPassword } = req.body;

    if (!usernameOrStudentCode || !email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ Tên đăng nhập/Mã SV, Email và Mật khẩu mới.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu mới phải có ít nhất 6 ký tự.',
      });
    }

    const cleanInput = usernameOrStudentCode.trim();
    const cleanEmail = email.trim();

    // Find student by studentCode first or user by username
    const student = await Student.findOne({
      studentCode: new RegExp(`^${cleanInput}$`, 'i'),
    });

    let user = null;
    if (student) {
      user = await User.findOne({ id: student.userId });
    }

    if (!user) {
      user = await User.findOne({
        username: new RegExp(`^${cleanInput}$`, 'i'),
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài khoản tương ứng với thông tin đã nhập.',
      });
    }

    // Verify email matches (check either user.email or student.email)
    const userEmailMatches = user.email && user.email.toLowerCase() === cleanEmail.toLowerCase();
    const studentEmailMatches = student && student.email && student.email.toLowerCase() === cleanEmail.toLowerCase();

    if (!userEmailMatches && !studentEmailMatches) {
      return res.status(400).json({
        success: false,
        message: 'Email không khớp với thông tin đã đăng ký của tài khoản này.',
      });
    }

    // Hash and update password
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({
      success: true,
      message: 'Đặt lại mật khẩu thành công! Bạn có thể dùng mật khẩu mới để đăng nhập.',
      data: true,
    });
  } catch (error) {
    next(error);
  }
};

