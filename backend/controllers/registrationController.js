import { Registration } from '../models/Registration.js';
import { Student } from '../models/Student.js';
import { Building } from '../models/Building.js';
import { Room } from '../models/Room.js';
import { Bed } from '../models/Bed.js';
import { Contract } from '../models/Contract.js';
import { Invoice } from '../models/Invoice.js';
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

    const baseQuery = {};
    if (buildingId) baseQuery.preferredBuildingId = Number(buildingId);

    const [totalCount, allCount, pendingCount, approvedCount, rejectedCount, cancelledCount] = await Promise.all([
      Registration.countDocuments(query),
      Registration.countDocuments(baseQuery),
      Registration.countDocuments({ ...baseQuery, status: 1 }),
      Registration.countDocuments({ ...baseQuery, status: 2 }),
      Registration.countDocuments({ ...baseQuery, status: 3 }),
      Registration.countDocuments({ ...baseQuery, status: 4 }),
    ]);

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
      const prefRoom = roomMap.get(r.preferredRoomId);
      const appRoom = roomMap.get(r.approvedRoomId);
      const appBed = bedMap.get(r.approvedBedId);

      return {
        ...r,
        registrationCode: r.registrationCode || `#REG-${String(r.id).padStart(4, '0')}`,
        studentName: student?.fullName || '',
        studentCode: student?.studentCode || '',
        studentGender: student?.gender || '',
        studentFaculty: student?.faculty || '',
        studentClassName: student?.className || '',
        studentPhone: student?.phone || '',
        preferredBuildingName: prefBuilding?.name || '',
        preferredRoomNumber: prefRoom?.roomNumber || r.preferredRoomNumber || null,
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
          (r.studentFaculty && r.studentFaculty.toLowerCase().includes(term)) ||
          (r.studentClassName && r.studentClassName.toLowerCase().includes(term)) ||
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
        counts: {
          all: allCount,
          pending: pendingCount,
          approved: approvedCount,
          rejected: rejectedCount,
          cancelled: cancelledCount,
        },
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
      const prefRoom = roomMap.get(r.preferredRoomId);
      const appRoom = roomMap.get(r.approvedRoomId);
      const appBed = bedMap.get(r.approvedBedId);

      return {
        ...r,
        studentName: student.fullName,
        studentCode: student.studentCode,
        studentGender: student.gender,
        studentFaculty: student.faculty,
        studentClassName: student.className,
        preferredBuildingName: prefBuilding?.name || '',
        preferredRoomNumber: prefRoom?.roomNumber || r.preferredRoomNumber || null,
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

    // IDOR protection: Student can only view their own registration
    if (req.user.role === 'Student' && r.studentId !== req.user.studentId) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xem đơn đăng ký này.' });
    }

    const student = await Student.findOne({ id: r.studentId }).lean();
    const prefBuilding = await Building.findOne({ id: r.preferredBuildingId }).lean();
    const prefRoom = r.preferredRoomId ? await Room.findOne({ id: r.preferredRoomId }).lean() : null;
    const appRoom = r.approvedRoomId ? await Room.findOne({ id: r.approvedRoomId }).lean() : null;
    const appBed = r.approvedBedId ? await Bed.findOne({ id: r.approvedBedId }).lean() : null;

    res.json({
      success: true,
      data: {
        ...r,
        studentName: student?.fullName || '',
        studentCode: student?.studentCode || '',
        studentGender: student?.gender || '',
        studentFaculty: student?.faculty || '',
        studentClassName: student?.className || '',
        studentPhone: student?.phone || '',
        preferredBuildingName: prefBuilding?.name || '',
        preferredRoomNumber: prefRoom?.roomNumber || r.preferredRoomNumber || null,
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

    // Rule 3.4: Do not allow multiple pending registrations
    const pendingReg = await Registration.findOne({ studentId: student.id, status: 1 });
    if (pendingReg) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đang có một đơn đăng ký nội trú đang chờ xét duyệt. Không thể nộp thêm đơn mới.',
      });
    }

    // Rule 3.4: Do not allow registration when student has active contract or is staying
    const activeContract = await Contract.findOne({ studentId: student.id, status: 2 });
    if (activeContract || student.isStaying) {
      return res.status(400).json({
        success: false,
        message: 'Bạn hiện đang có hợp đồng lưu trú còn hiệu lực tại ký túc xá.',
      });
    }

    const {
      preferredBuildingId,
      preferredRoomType,
      preferredRoomId,
      preferredRoomNumber,
      desiredStartDate,
      durationMonths,
      reasonOrNote,
    } = req.body;

    // Validate desiredStartDate: Cannot be in the past
    if (desiredStartDate) {
      const selectedDate = new Date(desiredStartDate);
      selectedDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        return res.status(400).json({
          success: false,
          message: 'Ngày bắt đầu mong muốn không được là ngày trong quá khứ (phải từ ngày hôm nay trở đi).',
        });
      }
    }

    // Validate preferredRoomId: cannot be room under maintenance or full
    if (preferredRoomId) {
      const room = await Room.findOne({ id: Number(preferredRoomId) });
      if (!room) {
        return res.status(400).json({ success: false, message: 'Phòng nguyện vọng không tồn tại.' });
      }
      if (room.status === 3) {
        return res.status(400).json({
          success: false,
          message: `Phòng P.${room.roomNumber} đang trong tình trạng bảo trì, không thể tiếp nhận đăng ký. Vui lòng chọn phòng khác.`,
        });
      }
      if (room.status === 2) {
        return res.status(400).json({
          success: false,
          message: `Phòng P.${room.roomNumber} hiện đã đầy người, vui lòng chọn phòng khác.`,
        });
      }
    }

    // Rule 3.3 / 3.4: Validate gender rule for the chosen building
    if (preferredBuildingId) {
      const building = await Building.findOne({ id: Number(preferredBuildingId) });
      if (building && building.genderAllowed && building.genderAllowed !== 'Tất cả') {
        if (student.gender && student.gender !== building.genderAllowed) {
          return res.status(400).json({
            success: false,
            message: `Tòa nhà ${building.name} chỉ dành cho sinh viên ${building.genderAllowed}. Bạn không thể đăng ký tòa nhà này.`,
          });
        }
      }
    }

    const id = await getNextSequence('registration_id');
    const registrationCode = `REG-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(id).padStart(4, '0')}`;

    const reg = await Registration.create({
      id,
      registrationCode,
      studentId: student.id,
      preferredBuildingId: preferredBuildingId ? Number(preferredBuildingId) : null,
      preferredRoomType: preferredRoomType || null,
      preferredRoomId: preferredRoomId ? Number(preferredRoomId) : null,
      preferredRoomNumber: preferredRoomNumber || null,
      desiredStartDate: desiredStartDate ? new Date(desiredStartDate) : new Date(),
      durationMonths: Number(durationMonths) || 6,
      reasonOrNote: reasonOrNote?.trim() || null,
      status: 1, // Pending
    });

    const building = preferredBuildingId ? await Building.findOne({ id: Number(preferredBuildingId) }).lean() : null;

    res.status(201).json({
      success: true,
      message: 'Nộp đơn đăng ký phòng thành công',
      data: {
        ...reg.toObject(),
        preferredBuildingName: building?.name || '',
      },
    });
  } catch (error) {
    next(error);
  }
};

export const reviewRegistration = async (req, res, next) => {
  let bedReservedId = null;
  let createdContractId = null;
  try {
    const {
      status,
      adminNote,
      reviewNotes,
      approvedRoomId,
      roomId,
      assignedRoomId,
      approvedBedId,
      bedId,
      assignedBedId,
    } = req.body;

    const finalRoomId = approvedRoomId || roomId || assignedRoomId;
    const finalBedId = approvedBedId || bedId || assignedBedId;
    const finalNote = adminNote || reviewNotes || null;

    const reg = await Registration.findOne({ id: Number(req.params.id) });
    if (!reg) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn đăng ký.' });
    }

    if (Number(status) === 2) {
      // Approved
      if (!finalRoomId || !finalBedId) {
        return res.status(400).json({ success: false, message: 'Vui lòng chọn phòng và giường được duyệt.' });
      }

      const room = await Room.findOne({ id: Number(finalRoomId) });
      const bed = await Bed.findOne({ id: Number(finalBedId) });
      const student = await Student.findOne({ id: reg.studentId });

      if (!room) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy phòng được chọn.' });
      }

      if (!bed) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy giường được chọn.' });
      }

      if (bed.roomId !== room.id) {
        return res.status(400).json({ success: false, message: 'Giường đã chọn không thuộc phòng này.' });
      }

      if (room.status === 3) {
        return res.status(400).json({ success: false, message: `Phòng ${room.roomNumber} đang được bảo trì, không thể xếp sinh viên vào phòng này.` });
      }

      if (room.status === 2) {
        return res.status(400).json({ success: false, message: `Phòng ${room.roomNumber} đã đầy, không thể xếp thêm sinh viên.` });
      }

      const occupiedCount = await Bed.countDocuments({ roomId: room.id, status: 2 });
      if (occupiedCount >= room.capacity) {
        return res.status(400).json({ success: false, message: `Phòng ${room.roomNumber} đã đạt sức chứa tối đa (${room.capacity} người).` });
      }

      // Check room gender
      if (room.genderAllowed && room.genderAllowed !== 'Tất cả' && student.gender) {
        if (room.genderAllowed.toLowerCase() !== student.gender.toLowerCase()) {
          return res.status(400).json({
            success: false,
            message: `Phòng ${room.roomNumber} quy định dành riêng cho sinh viên ${room.genderAllowed}, không phù hợp với giới tính sinh viên (${student.gender}).`,
          });
        }
      }

      // Check bed availability
      if (bed.status !== 1) {
        return res.status(400).json({
          success: false,
          message: 'Giường đã chọn không còn trống hoặc đang bảo trì. Vui lòng chọn giường khác.',
        });
      }

      const existingBedContract = await Contract.findOne({ bedId: bed.id, status: 2 });
      if (existingBedContract) {
        return res.status(400).json({
          success: false,
          message: 'Giường này đang có hợp đồng hiệu lực khác.',
        });
      }

      // Check student existing active contract
      const existingStudentContract = await Contract.findOne({ studentId: student.id, status: 2 });
      if (existingStudentContract) {
        return res.status(400).json({
          success: false,
          message: `Sinh viên đã có hợp đồng hiệu lực (${existingStudentContract.contractNumber}).`,
        });
      }

      // Concurrency check: Atomically update bed status
      const updatedBed = await Bed.findOneAndUpdate(
        { id: bed.id, status: 1 },
        { status: 2 },
        { new: true }
      );
      if (!updatedBed) {
        return res.status(400).json({
          success: false,
          message: 'Giường đã được xếp cho sinh viên khác hoặc không còn trống.',
        });
      }
      bedReservedId = bed.id;

      reg.status = 2; // Approved
      reg.adminNote = finalNote;
      reg.reviewedAt = new Date();
      reg.approvedRoomId = Number(finalRoomId);
      reg.approvedBedId = Number(finalBedId);

      if (student) {
        student.isStaying = true;
        await student.save();
      }

      // Create contract with status: 2 (Active)
      const contractId = await getNextSequence('contract_id');
      createdContractId = contractId;
      const startDate = reg.desiredStartDate || new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + (reg.durationMonths || 6));
      const initialFee = Number(req.body.depositAmount) || room.basePrice || 650000;

      await Contract.create({
        id: contractId,
        contractNumber: `HD-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(contractId).padStart(4, '0')}`,
        studentId: student.id,
        roomId: room.id,
        bedId: bed.id,
        startDate,
        endDate,
        monthlyRent: room.basePrice || 650000,
        depositAmount: initialFee,
        status: 2, // 2: Active
        terms: 'Nội quy ký túc xá theo quy chế ban hành 2026.',
      });

      // Automatically issue initial invoice (deposit / room fee first period)
      const invMonth = startDate.getMonth() + 1;
      const invYear = startDate.getFullYear();
      const existingInv = await Invoice.findOne({ contractId, month: invMonth, year: invYear });
      if (!existingInv) {
        const invId = await getNextSequence('invoice_id');
        let invoiceCode = `INV-${invYear}${String(invMonth).padStart(2, '0')}-${String(student.id).padStart(4, '0')}`;
        const duplicateCode = await Invoice.findOne({ invoiceCode });
        if (duplicateCode) {
          invoiceCode = `INV-${invYear}${String(invMonth).padStart(2, '0')}-${String(student.id).padStart(4, '0')}-${String(invId).padStart(3, '0')}`;
        }
        await Invoice.create({
          id: invId,
          invoiceCode,
          studentId: student.id,
          contractId,
          month: invMonth,
          year: invYear,
          roomFee: initialFee,
          electricityFee: 0,
          waterFee: 0,
          serviceFee: 0,
          otherFee: 0,
          totalAmount: initialFee,
          paidAmount: 0,
          dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          status: 1, // 1: Unpaid
          notes: `Hóa đơn tiền phòng đợt 1 / tiền cọc nhận phòng ${room.roomNumber} - Giường ${bed.bedNumber}`,
        });
      }

      // Update room status if all beds are occupied
      const roomBeds = await Bed.find({ roomId: room.id });
      const availableBeds = roomBeds.filter((b) => b.status === 1);
      if (availableBeds.length === 0) {
        room.status = 2; // Full
        await room.save();
      }

      // Send notification to student
      if (student?.userId) {
        const notifId = await getNextSequence('notification_id');
        await Notification.create({
          id: notifId,
          userId: student.userId,
          title: 'Đơn đăng ký phòng đã được duyệt!',
          content: `Chúc mừng bạn! Đơn đăng ký phòng KTX của bạn đã được duyệt thành công vào phòng ${room.roomNumber}, giường ${bed.bedNumber}. Hóa đơn tiền phòng đợt 1 đã được phát hành, vui lòng kiểm tra và thanh toán.`,
          type: 1, // General
        });
      }
    } else if (Number(status) === 3) {
      // Rejected: Rule 3.4 requires saving reason
      if (!finalNote || !finalNote.trim()) {
        return res.status(400).json({ success: false, message: 'Khi từ chối đơn phải nhập lý do cụ thể.' });
      }

      reg.status = 3; // Rejected
      reg.adminNote = finalNote.trim();
      reg.reviewedAt = new Date();

      const student = await Student.findOne({ id: reg.studentId });
      if (student?.userId) {
        const notifId = await getNextSequence('notification_id');
        await Notification.create({
          id: notifId,
          userId: student.userId,
          title: 'Đơn đăng ký phòng không được duyệt',
          content: `Rất tiếc, đơn đăng ký phòng KTX của bạn không được duyệt. Lý do: ${finalNote.trim()}`,
          type: 1,
        });
      }
    } else {
      reg.status = Number(status);
      reg.adminNote = finalNote;
      reg.reviewedAt = new Date();
    }

    await reg.save();

    res.json({ success: true, message: 'Duyệt đơn đăng ký thành công', data: reg });
  } catch (error) {
    if (bedReservedId) {
      await Bed.updateOne({ id: bedReservedId }, { $set: { status: 1 } });
    }
    if (createdContractId) {
      await Contract.deleteOne({ id: createdContractId });
    }
    next(error);
  }
};

export const cancelRegistration = async (req, res, next) => {
  try {
    const reg = await Registration.findOne({ id: Number(req.params.id) });
    if (!reg) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn đăng ký.' });
    }

    // IDOR protection: Student can only cancel their own registration
    if (req.user.role === 'Student' && reg.studentId !== req.user.studentId) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền hủy đơn đăng ký của sinh viên khác.' });
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
