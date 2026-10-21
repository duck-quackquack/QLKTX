import { Registration } from '../models/Registration.js';
import { Student } from '../models/Student.js';
import { Building } from '../models/Building.js';
import { Room } from '../models/Room.js';
import { Bed } from '../models/Bed.js';
import { Contract } from '../models/Contract.js';
import { Notification } from '../models/Notification.js';
import { getNextSequence } from '../models/Counter.js';

export const getRegistrations = async (req, res, next) => {
  try {
    const { status, buildingId, searchTerm, pageNumber = 1, pageSize = 10 } = req.query;
    const query = {};

    if (status) query.status = Number(status);
    if (buildingId) query.preferredBuildingId = Number(buildingId);

    const page = parseInt(pageNumber, 10) || 1;
    const limit = parseInt(pageSize, 10) || 10;
    const skip = (page - 1) * limit;

    const totalCount = await Registration.countDocuments(query);
    const registrations = await Registration.find(query).sort({ id: -1 }).skip(skip).limit(limit).lean();

    const students = await Student.find().lean();
    const studentMap = new Map(students.map((s) => [s.id, s]));

    const buildings = await Building.find().lean();
    const buildingMap = new Map(buildings.map((b) => [b.id, b]));

    const rooms = await Room.find().lean();
    const roomMap = new Map(rooms.map((r) => [r.id, r]));

    const beds = await Bed.find().lean();
    const bedMap = new Map(beds.map((b) => [b.id, b]));

    let items = registrations.map((r) => {
      const student = studentMap.get(r.studentId);
      const prefBuilding = buildingMap.get(r.preferredBuildingId);
      const appRoom = roomMap.get(r.approvedRoomId);
      const appBed = bedMap.get(r.approvedBedId);

      return {
        ...r,
        registrationCode: r.registrationCode || `#REG-${String(r.id).padStart(4, '0')}`,
        studentName: student?.fullName || '',
        studentCode: student?.studentCode || '',
        studentGender: student?.gender || '',
        studentFaculty: student?.faculty || '',
        studentPhone: student?.phone || '',
        preferredBuildingName: prefBuilding?.name || '',
        approvedRoomNumber: appRoom?.roomNumber || null,
        approvedBedNumber: appBed?.bedNumber || null,
      };
    });

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      items = items.filter(
        (r) =>
          r.studentName.toLowerCase().includes(term) ||
          r.studentCode.toLowerCase().includes(term) ||
          (r.reasonOrNote && r.reasonOrNote.toLowerCase().includes(term))
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

export const getMyRegistrations = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.json({ success: true, data: [] });
    }

    const registrations = await Registration.find({ studentId: student.id }).sort({ id: -1 }).lean();
    const buildings = await Building.find().lean();
    const buildingMap = new Map(buildings.map((b) => [b.id, b]));
    const rooms = await Room.find().lean();
    const roomMap = new Map(rooms.map((r) => [r.id, r]));
    const beds = await Bed.find().lean();
    const bedMap = new Map(beds.map((b) => [b.id, b]));

    const result = registrations.map((r) => {
      const prefBuilding = buildingMap.get(r.preferredBuildingId);
      const appRoom = roomMap.get(r.approvedRoomId);
      const appBed = bedMap.get(r.approvedBedId);

      return {
        ...r,
        studentName: student.fullName,
        studentCode: student.studentCode,
        preferredBuildingName: prefBuilding?.name || '',
        approvedRoomNumber: appRoom?.roomNumber || null,
        approvedBedNumber: appBed?.bedNumber || null,
      };
    });

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getRegistrationById = async (req, res, next) => {
  try {
    const r = await Registration.findOne({ id: Number(req.params.id) }).lean();
    if (!r) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn đăng ký.' });
    }

    const student = await Student.findOne({ id: r.studentId }).lean();
    const prefBuilding = await Building.findOne({ id: r.preferredBuildingId }).lean();
    const appRoom = await Room.findOne({ id: r.approvedRoomId }).lean();
    const appBed = await Bed.findOne({ id: r.approvedBedId }).lean();

    res.json({
      success: true,
      data: {
        ...r,
        studentName: student?.fullName || '',
        studentCode: student?.studentCode || '',
        studentGender: student?.gender || '',
        studentFaculty: student?.faculty || '',
        studentPhone: student?.phone || '',
        preferredBuildingName: prefBuilding?.name || '',
        approvedRoomNumber: appRoom?.roomNumber || null,
        approvedBedNumber: appBed?.bedNumber || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const submitRegistration = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(400).json({ success: false, message: 'Không tìm thấy thông tin hồ sơ sinh viên của bạn.' });
    }

    const { preferredBuildingId, preferredRoomType, desiredStartDate, durationMonths, reasonOrNote } = req.body;

    const id = await getNextSequence('registration_id');
    const registrationCode = `REG-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(id).padStart(4, '0')}`;

    const reg = await Registration.create({
      id,
      registrationCode,
      studentId: student.id,
      preferredBuildingId: preferredBuildingId ? Number(preferredBuildingId) : null,
      preferredRoomType: preferredRoomType || null,
      desiredStartDate: desiredStartDate ? new Date(desiredStartDate) : new Date(),
      durationMonths: Number(durationMonths) || 6,
      reasonOrNote: reasonOrNote?.trim() || null,
      status: 1, // Pending
    });

    res.status(201).json({ success: true, message: 'Nộp đơn đăng ký phòng thành công', data: reg });
  } catch (error) {
    next(error);
  }
};

export const reviewRegistration = async (req, res, next) => {
  try {
    const { status, adminNote, reviewNotes, approvedRoomId, roomId, approvedBedId, bedId } = req.body;
    const finalRoomId = approvedRoomId || roomId;
    const finalBedId = approvedBedId || bedId;
    const finalNote = adminNote || reviewNotes || null;

    const reg = await Registration.findOne({ id: Number(req.params.id) });
    if (!reg) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn đăng ký.' });
    }

    reg.status = Number(status);
    reg.adminNote = finalNote;
    reg.reviewedAt = new Date();

    if (Number(status) === 2) {
      // Approved
      if (!finalRoomId || !finalBedId) {
        return res.status(400).json({ success: false, message: 'Vui lòng chọn phòng và giường được duyệt.' });
      }
      reg.approvedRoomId = Number(finalRoomId);
      reg.approvedBedId = Number(finalBedId);

      const room = await Room.findOne({ id: Number(finalRoomId) });
      const bed = await Bed.findOne({ id: Number(finalBedId) });
      const student = await Student.findOne({ id: reg.studentId });

      if (bed) {
        bed.status = 2; // Occupied
        bed.isOccupied = true;
        await bed.save();
      }

      if (student) {
        student.isStaying = true;
        await student.save();
      }

      // Create contract
      const contractId = await getNextSequence('contract_id');
      const startDate = reg.desiredStartDate || new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + (reg.durationMonths || 6));

      await Contract.create({
        id: contractId,
        contractNumber: `HD-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(student.id).padStart(4, '0')}`,
        studentId: student.id,
        roomId: room ? room.id : finalRoomId,
        bedId: bed ? bed.id : finalBedId,
        startDate,
        endDate,
        monthlyRent: room ? room.basePrice : 650000,
        depositAmount: room ? room.basePrice : 650000,
        status: 2, // Active
        terms: 'Nội quy ký túc xá theo quy chế ban hành 2026.',
      });

      // Send notification to student
      if (student?.userId) {
        const notifId = await getNextSequence('notification_id');
        await Notification.create({
          id: notifId,
          userId: student.userId,
          title: 'Đơn đăng ký phòng đã được duyệt!',
          content: `Chúc mừng bạn! Đơn đăng ký phòng KTX của bạn đã được duyệt thành công vào phòng ${room?.roomNumber || ''}.`,
          type: 1, // General
        });
      }
    } else if (Number(status) === 3) {
      // Rejected
      const student = await Student.findOne({ id: reg.studentId });
      if (student?.userId) {
        const notifId = await getNextSequence('notification_id');
        await Notification.create({
          id: notifId,
          userId: student.userId,
          title: 'Đơn đăng ký phòng không được duyệt',
          content: `Rất tiếc, đơn đăng ký phòng KTX của bạn không được duyệt. Lý do: ${finalNote || 'Hết chỗ hoặc không đủ điều kiện'}.`,
          type: 1,
        });
      }
    }

    await reg.save();

    res.json({ success: true, message: 'Duyệt đơn đăng ký thành công', data: reg });
  } catch (error) {
    next(error);
  }
};

export const cancelRegistration = async (req, res, next) => {
  try {
    const reg = await Registration.findOne({ id: Number(req.params.id) });
    if (!reg) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn đăng ký.' });
    }
    if (reg.status !== 1) {
      return res.status(400).json({ success: false, message: 'Chỉ có thể hủy đơn đang ở trạng thái chờ duyệt.' });
    }

    reg.status = 4; // Cancelled
    await reg.save();
    res.json({ success: true, message: 'Đã hủy đơn đăng ký', data: true });
  } catch (error) {
    next(error);
  }
};
