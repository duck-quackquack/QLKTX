import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Student } from '../models/Student.js';

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Không có quyền truy cập. Vui lòng đăng nhập.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'DormitoryManagementSecretSuperKey2026!@#$%^&*()_+');
    const user = await User.findOne({ id: decoded.id || decoded.nameid || decoded.sub });
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản không tồn tại hoặc đã bị khóa.',
      });
    }

    const student = await Student.findOne({ userId: user.id });
    const roleString = user.role === 1 ? 'Admin' : user.role === 2 ? 'Staff' : 'Student';

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: roleString,
      roleNumber: user.role,
      studentId: student?.id || null,
      studentCode: student?.studentCode || null,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Phiên làm việc hết hạn hoặc token không hợp lệ.',
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Chưa đăng nhập.' });
    }
    const hasRole = roles.some((r) => r === req.user.role || r === req.user.roleNumber);
    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền thực hiện thao tác này.',
      });
    }
    next();
  };
};

