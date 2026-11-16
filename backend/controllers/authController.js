import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Student } from '../models/Student.js';
import { Contract } from '../models/Contract.js';
import { Room } from '../models/Room.js';
import { Building } from '../models/Building.js';
import { Bed } from '../models/Bed.js';
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
          facebookId: user.facebookId || null,
          googleId: user.googleId || null,
          role: user.role,
          studentId: student?.id || null,
          studentCode: student?.studentCode || null,
          studentGender: student?.gender || null,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const socialLogin = async (req, res, next) => {
  try {
    const {
      provider,
      email,
      name,
      avatarUrl,
      providerId,
      phone,
      linkUsername,
      linkPassword,
      createNew,
      customStudentCode,
      customPhone,
    } = req.body;

    if (!provider || (!email && !providerId && !phone)) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin xác thực từ ' + (provider || 'mạng xã hội') });
    }

    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const cleanPhone = (customPhone || phone || '').trim();
    const cleanName = (name || (cleanEmail ? cleanEmail.split('@')[0] : 'Sinh viên')).trim();

    let user = null;

    // 1. Check if user already linked with this social providerId
    if (provider === 'facebook' && providerId) {
      user = await User.findOne({ facebookId: providerId.toString() });
    } else if (provider === 'google' && providerId) {
      user = await User.findOne({ googleId: providerId.toString() });
    }

    // 2. If user requested to LINK with an existing KTX account credentials
    if (!user && linkUsername && linkPassword) {
      const cleanInput = linkUsername.trim();
      let existingUser = await User.findOne({ username: new RegExp(`^${cleanInput}$`, 'i') });
      if (!existingUser) {
        const existingStudent = await Student.findOne({ studentCode: new RegExp(`^${cleanInput}$`, 'i') });
        if (existingStudent && existingStudent.userId) {
          existingUser = await User.findOne({ id: existingStudent.userId });
        }
      }

      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy tài khoản Ký túc xá với Tên đăng nhập hoặc Mã SV này.',
        });
      }

      const isMatch = await bcrypt.compare(linkPassword, existingUser.passwordHash);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Mật khẩu tài khoản Ký túc xá không chính xác để liên kết.',
        });
      }

      user = existingUser;
      if (provider === 'facebook' && providerId) user.facebookId = providerId.toString();
      if (provider === 'google' && providerId) user.googleId = providerId.toString();
      if (avatarUrl && !user.avatarUrl) user.avatarUrl = avatarUrl;
      await user.save();
    }

    // 3. Check if user already exists by email (primary auto-link)
    if (!user && cleanEmail && !cleanEmail.endsWith('@facebook.user')) {
      user = await User.findOne({ email: new RegExp(`^${cleanEmail}$`, 'i') });
      if (user) {
        if (provider === 'facebook' && providerId) user.facebookId = providerId.toString();
        if (provider === 'google' && providerId) user.googleId = providerId.toString();
        if (avatarUrl && !user.avatarUrl) user.avatarUrl = avatarUrl;
        await user.save();
      }
    }

    // 4. Check if user already exists by phone (secondary auto-link)
    if (!user && cleanPhone) {
      user = await User.findOne({ phone: cleanPhone });
      if (!user) {
        const existingStudentByPhone = await Student.findOne({ phone: cleanPhone });
        if (existingStudentByPhone && existingStudentByPhone.userId) {
          user = await User.findOne({ id: existingStudentByPhone.userId });
        }
      }
      if (user) {
        if (provider === 'facebook' && providerId) user.facebookId = providerId.toString();
        if (provider === 'google' && providerId) user.googleId = providerId.toString();
        if (avatarUrl && !user.avatarUrl) user.avatarUrl = avatarUrl;
        await user.save();
      }
    }

    // 5. If STILL not found, and it's Facebook without email/phone AND user hasn't explicitly selected createNew:
    // Prompt frontend to show Account Linking Modal so user doesn't get a dummy account!
    if (!user && provider === 'facebook' && !createNew && (!cleanEmail || cleanEmail.endsWith('@facebook.user'))) {
      return res.json({
        success: false,
        requireLink: true,
        message: 'Tài khoản Facebook này chưa được liên kết với hồ sơ Ký túc xá nào.',
        data: {
          provider,
          providerId,
          name: cleanName,
          avatarUrl,
        },
      });
    }

    let student = null;

    if (user) {
      student = await Student.findOne({ userId: user.id });
      if (!student && user.email) {
        student = await Student.findOne({ email: user.email });
      }
      if (avatarUrl && !user.avatarUrl) {
        user.avatarUrl = avatarUrl;
        await user.save();
      }
    } else {
      // Create new student account
      const userId = await getNextSequence('user_id');
      const studentId = await getNextSequence('student_id');
      const studentCode = customStudentCode?.trim() || `SV${new Date().getFullYear()}${String(studentId).padStart(3, '0')}`;
      const defaultPasswordHash = await bcrypt.hash('Ktx@123456', 10);

      const usernameBase = cleanEmail ? cleanEmail.split('@')[0] : (customStudentCode || `user_${studentId}`);
      let finalUsername = `${usernameBase}_${provider.toLowerCase().slice(0, 2)}`;
      const existingUsername = await User.findOne({ username: finalUsername });
      if (existingUsername) {
        finalUsername = `${usernameBase}_${studentId}`;
      }

      user = await User.create({
        id: userId,
        username: finalUsername,
        email: cleanEmail || `${providerId || studentId}@${provider}.user`,
        fullName: cleanName,
        passwordHash: defaultPasswordHash,
        phone: cleanPhone || ('090' + Math.floor(1000000 + Math.random() * 9000000)),
        avatarUrl: avatarUrl || null,
        facebookId: provider === 'facebook' && providerId ? providerId.toString() : null,
        googleId: provider === 'google' && providerId ? providerId.toString() : null,
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
        email: user.email,
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
          facebookId: user.facebookId || null,
          googleId: user.googleId || null,
          role: user.role,
          studentId: student?.id || null,
          studentCode: student?.studentCode || null,
          studentGender: student?.gender || null,
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
      citizenId,
    } = req.body;

    if (!username || !password || !email || !fullName || !studentCode) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ các trường bắt buộc.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu phải có tối thiểu 6 ký tự.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Định dạng email không hợp lệ.' });
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
      citizenId: citizenId?.trim() || null,
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
        facebookId: user.facebookId || null,
        googleId: user.googleId || null,
        role: user.role,
        studentId: student?.id || null,
        studentCode: student?.studentCode || null,
        studentGender: student?.gender || null,
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
    const { fullName, email, phone, avatarUrl, studentCode } = req.body;
    const user = await User.findOne({ id: req.user.id });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Người dùng không tồn tại.' });
    }

    if (fullName) user.fullName = fullName.trim();
    if (email) user.email = email.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    await user.save();

    const student = await Student.findOne({ userId: user.id });
    if (student) {
      if (fullName) student.fullName = fullName.trim();
      if (email) student.email = email.trim();
      if (phone !== undefined) student.phone = phone.trim();
      if (avatarUrl !== undefined) student.avatarUrl = avatarUrl;
      if (studentCode && studentCode.trim()) {
        const cleanCode = studentCode.trim();
        const existingStudentWithCode = await Student.findOne({
          studentCode: new RegExp(`^${cleanCode}$`, 'i'),
          id: { $ne: student.id },
        });
        if (!existingStudentWithCode) {
          student.studentCode = cleanCode;
        }
      }
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
        facebookId: user.facebookId || null,
        googleId: user.googleId || null,
        role: user.role,
        studentId: student?.id || null,
        studentCode: student?.studentCode || null,
        studentGender: student?.gender || null,
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

export const verifyPass = async (req, res, next) => {
  try {
    const { code } = req.params;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Thiếu mã sinh viên' });
    }

    const cleanCode = code.trim();
    let student = await Student.findOne({ studentCode: new RegExp(`^${cleanCode}$`, 'i') });
    if (!student && !isNaN(Number(cleanCode))) {
      student = await Student.findOne({ id: Number(cleanCode) });
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy hồ sơ sinh viên với mã '${cleanCode}'.`,
      });
    }

    const user = await User.findOne({ id: student.userId });

    // Find active contract (status 1: Pending/Draft, 2: Active)
    const contract = await Contract.findOne({
      studentId: student.id,
      status: { $in: [1, 2] },
    });

    let dormInfo = null;
    if (contract) {
      const room = await Room.findOne({ id: contract.roomId });
      const building = room ? await Building.findOne({ id: room.buildingId }) : null;
      const bed = await Bed.findOne({ id: contract.bedId });

      dormInfo = {
        contractNumber: contract.contractNumber,
        buildingName: building ? (building.name?.startsWith('Tòa') ? building.name : `Tòa ${building.name}`) : '—',
        roomNumber: room ? `Phòng ${room.roomNumber}` : '—',
        bedNumber: bed ? `Giường ${bed.bedNumber}` : contract.bedNumber ? `Giường ${contract.bedNumber}` : '—',
        startDate: contract.startDate,
        endDate: contract.endDate,
        status: 'Đang lưu trú',
      };
    }

    res.json({
      success: true,
      data: {
        student: {
          id: student.id,
          studentCode: student.studentCode,
          fullName: student.fullName,
          gender: student.gender,
          faculty: student.faculty || 'Đại học',
          className: student.className || '—',
          phone: student.phone,
          email: student.email,
          avatarUrl: student.avatarUrl || user?.avatarUrl || null,
        },
        dormInfo,
        isValid: !!contract,
        statusText: contract ? 'Đang lưu trú hợp lệ tại KTX' : 'Chưa có hợp đồng lưu trú hoặc đã hết hạn',
        verifiedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const linkSocial = async (req, res, next) => {
  try {
    const { provider, providerId } = req.body;
    if (!provider || !providerId) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin nhà cung cấp hoặc ID định danh.' });
    }

    const user = await User.findOne({ id: req.user.id });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Người dùng không tồn tại.' });
    }

    if (provider === 'facebook') {
      user.facebookId = providerId.toString();
    } else if (provider === 'google') {
      user.googleId = providerId.toString();
    }

    await user.save();
    const student = await Student.findOne({ userId: user.id });

    res.json({
      success: true,
      message: `Liên kết tài khoản ${provider === 'facebook' ? 'Facebook' : 'Google'} thành công!`,
      data: {
        facebookId: user.facebookId,
        googleId: user.googleId,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          avatarUrl: user.avatarUrl,
          facebookId: user.facebookId || null,
          googleId: user.googleId || null,
          role: user.role,
          studentId: student?.id || null,
          studentCode: student?.studentCode || null,
          studentGender: student?.gender || null,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

