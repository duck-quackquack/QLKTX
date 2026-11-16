import { Contract } from '../models/Contract.js';
import { Student } from '../models/Student.js';
import { Room } from '../models/Room.js';
import { Bed } from '../models/Bed.js';
import { Building } from '../models/Building.js';
import { getNextSequence } from '../models/Counter.js';

/**
 * Synchronize expired contracts:
 * Checks active contracts whose endDate < now, sets them to status: 3 (Expired),
 * frees up the assigned bed if no other active contract exists, and marks student isStaying = false.
 */
export const syncExpiredContracts = async () => {
  try {
    const now = new Date();
    const expiredContracts = await Contract.find({
      status: 2, // Active
      endDate: { $lt: now },
    });

    for (const contract of expiredContracts) {
      contract.status = 3; // 3: Expired
      await contract.save();

      // Check if this bed still has another active contract
      const otherActive = await Contract.findOne({
        bedId: contract.bedId,
        status: 2,
        id: { $ne: contract.id },
      });

      if (!otherActive) {
        const bed = await Bed.findOne({ id: contract.bedId });
        if (bed && bed.status === 2) {
          bed.status = 1; // Available
          await bed.save();

          // If room was full, reset room status to available
          const room = await Room.findOne({ id: contract.roomId });
          if (room && room.status === 2) {
            room.status = 1; // Available
            await room.save();
          }
        }
      }

      // Check if student has another active contract
      const studentOtherActive = await Contract.findOne({
        studentId: contract.studentId,
        status: 2,
        id: { $ne: contract.id },
      });

      if (!studentOtherActive) {
        const student = await Student.findOne({ id: contract.studentId });
        if (student && student.isStaying) {
          student.isStaying = false;
          await student.save();
        }
      }
    }
  } catch (err) {
    console.error('Error in syncExpiredContracts:', err);
  }
};

export const getContracts = async (req, res, next) => {
  try {
    await syncExpiredContracts();

    const { status, buildingId, searchTerm, pageNumber = 1, pageSize = 10 } = req.query;
    const query = {};

    if (status) query.status = Number(status);

    const page = parseInt(pageNumber, 10) || 1;
    const limit = parseInt(pageSize, 10) || 10;
    const skip = (page - 1) * limit;

    const totalCount = await Contract.countDocuments(query);
    const contracts = await Contract.find(query).sort({ id: -1 }).skip(skip).limit(limit).lean();

    const students = await Student.find().lean();
    const studentMap = new Map(students.map((s) => [s.id, s]));

    const rooms = await Room.find().lean();
    const roomMap = new Map(rooms.map((r) => [r.id, r]));

    const buildings = await Building.find().lean();
    const buildingMap = new Map(buildings.map((b) => [b.id, b]));

    const beds = await Bed.find().lean();
    const bedMap = new Map(beds.map((b) => [b.id, b]));

    let items = contracts.map((c) => {
      const student = studentMap.get(c.studentId);
      const room = roomMap.get(c.roomId);
      const building = room ? buildingMap.get(room.buildingId) : null;
      const bed = bedMap.get(c.bedId);

      return {
        ...c,
        studentName: student?.fullName || '',
        studentCode: student?.studentCode || '',
        studentPhone: student?.phone || '',
        roomNumber: room?.roomNumber || '',
        buildingName: building?.name || '',
        bedNumber: bed?.bedNumber || '',
      };
    });

    if (buildingId) {
      const bId = Number(buildingId);
      items = items.filter((c) => {
        const room = roomMap.get(c.roomId);
        return room && room.buildingId === bId;
      });
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      items = items.filter(
        (c) =>
          c.contractNumber.toLowerCase().includes(term) ||
          c.studentName.toLowerCase().includes(term) ||
          c.studentCode.toLowerCase().includes(term) ||
          c.roomNumber.toLowerCase().includes(term)
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

export const getContractById = async (req, res, next) => {
  try {
    const c = await Contract.findOne({ id: Number(req.params.id) }).lean();
    if (!c) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hợp đồng.' });
    }

    // IDOR protection: Student can only view their own contract
    if (req.user.role === 'Student' && c.studentId !== req.user.studentId) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xem hợp đồng này.' });
    }

    const student = await Student.findOne({ id: c.studentId }).lean();
    const room = await Room.findOne({ id: c.roomId }).lean();
    const building = room ? await Building.findOne({ id: room.buildingId }).lean() : null;
    const bed = await Bed.findOne({ id: c.bedId }).lean();

    res.json({
      success: true,
      data: {
        ...c,
        studentName: student?.fullName || '',
        studentCode: student?.studentCode || '',
        studentPhone: student?.phone || '',
        roomNumber: room?.roomNumber || '',
        buildingName: building?.name || '',
        bedNumber: bed?.bedNumber || '',
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMyActiveContract = async (req, res, next) => {
  try {
    await syncExpiredContracts();

    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.json({ success: true, data: null });
    }

    // 2: Active contract
    const c = await Contract.findOne({ studentId: student.id, status: 2 }).lean();
    if (!c) {
      return res.json({ success: true, data: null });
    }

    const room = await Room.findOne({ id: c.roomId }).lean();
    const building = room ? await Building.findOne({ id: room.buildingId }).lean() : null;
    const bed = await Bed.findOne({ id: c.bedId }).lean();

    res.json({
      success: true,
      data: {
        ...c,
        studentName: student.fullName,
        studentCode: student.studentCode,
        studentPhone: student.phone,
        roomNumber: room?.roomNumber || '',
        buildingName: building?.name || '',
        bedNumber: bed?.bedNumber || '',
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMyContracts = async (req, res, next) => {
  try {
    await syncExpiredContracts();

    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.json({ success: true, data: [] });
    }

    const contracts = await Contract.find({ studentId: student.id }).sort({ id: -1 }).lean();
    const rooms = await Room.find().lean();
    const roomMap = new Map(rooms.map((r) => [r.id, r]));
    const buildings = await Building.find().lean();
    const buildingMap = new Map(buildings.map((b) => [b.id, b]));
    const beds = await Bed.find().lean();
    const bedMap = new Map(beds.map((b) => [b.id, b]));

    const result = contracts.map((c) => {
      const room = roomMap.get(c.roomId);
      const building = room ? buildingMap.get(room.buildingId) : null;
      const bed = bedMap.get(c.bedId);

      return {
        ...c,
        studentName: student.fullName,
        studentCode: student.studentCode,
        studentPhone: student.phone,
        roomNumber: room?.roomNumber || '',
        buildingName: building?.name || '',
        bedNumber: bed?.bedNumber || '',
      };
    });

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const createContract = async (req, res, next) => {
  try {
    const { studentId, roomId, bedId, startDate, endDate, monthlyRent, depositAmount, terms } = req.body;

    if (!studentId || !roomId || !bedId || !startDate || !endDate || monthlyRent === undefined) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ thông tin hợp đồng.' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
      return res.status(400).json({ success: false, message: 'Ngày bắt đầu hợp đồng phải nhỏ hơn ngày kết thúc.' });
    }

    const student = await Student.findOne({ id: Number(studentId) });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sinh viên.' });
    }

    // Check if student already has an active contract
    const existingActive = await Contract.findOne({ studentId: Number(studentId), status: 2 });
    if (existingActive) {
      return res.status(400).json({
        success: false,
        message: `Sinh viên ${student.fullName} (${student.studentCode}) đang có hợp đồng hiệu lực (${existingActive.contractNumber}). Không thể tạo thêm hợp đồng mới.`,
      });
    }

    const bed = await Bed.findOne({ id: Number(bedId) });
    if (!bed) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy giường.' });
    }

    const room = await Room.findOne({ id: Number(roomId) });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy phòng.' });
    }

    if (bed.roomId !== room.id) {
      return res.status(400).json({ success: false, message: 'Giường đã chọn không thuộc phòng này.' });
    }

    if (room.status === 3) {
      return res.status(400).json({ success: false, message: `Phòng ${room.roomNumber} đang được bảo trì, không thể ký hợp đồng vào phòng này.` });
    }

    if (room.status === 2) {
      return res.status(400).json({ success: false, message: `Phòng ${room.roomNumber} đã đầy, không thể xếp thêm sinh viên.` });
    }

    const occupiedCount = await Bed.countDocuments({ roomId: room.id, status: 2 });
    if (occupiedCount >= room.capacity) {
      return res.status(400).json({ success: false, message: `Phòng ${room.roomNumber} đã đạt sức chứa tối đa (${room.capacity} người).` });
    }

    // Gender check
    if (room.genderAllowed && room.genderAllowed !== 'Tất cả' && student.gender) {
      if (room.genderAllowed.toLowerCase() !== student.gender.toLowerCase()) {
        return res.status(400).json({
          success: false,
          message: `Phòng ${room.roomNumber} quy định dành riêng cho sinh viên ${room.genderAllowed}, không phù hợp với giới tính sinh viên (${student.gender}).`,
        });
      }
    }

    if (bed.status !== 1) {
      return res.status(400).json({ success: false, message: 'Giường đã chọn hiện không còn trống hoặc đang bảo trì.' });
    }

    const existingBedContract = await Contract.findOne({ bedId: Number(bedId), status: 2 });
    if (existingBedContract) {
      return res.status(400).json({ success: false, message: 'Giường này đang có hợp đồng hiệu lực khác.' });
    }

    // Atomically claim bed to prevent race conditions
    const updatedBed = await Bed.findOneAndUpdate(
      { id: bed.id, status: 1 },
      { status: 2 },
      { new: true }
    );
    if (!updatedBed) {
      return res.status(400).json({ success: false, message: 'Giường đã được người khác sử dụng hoặc không còn trống.' });
    }

    const id = await getNextSequence('contract_id');
    const contractNumber = `HD-${start.getFullYear()}${String(start.getMonth() + 1).padStart(2, '0')}-${String(id).padStart(4, '0')}`;

    const contract = await Contract.create({
      id,
      contractNumber,
      studentId: Number(studentId),
      roomId: Number(roomId),
      bedId: Number(bedId),
      startDate: start,
      endDate: end,
      monthlyRent: Number(monthlyRent),
      depositAmount: Number(depositAmount) || 0,
      status: 2, // 2: Active
      terms: terms || 'Nội quy ký túc xá theo quy chế ban hành 2026.',
    });

    student.isStaying = true;
    await student.save();

    // Auto update room status if full
    const roomBeds = await Bed.find({ roomId: room.id });
    const availableBeds = roomBeds.filter((b) => b.status === 1);
    if (availableBeds.length === 0) {
      room.status = 2; // Full
      await room.save();
    }

    res.status(201).json({ success: true, message: 'Tạo hợp đồng thành công', data: contract });
  } catch (error) {
    next(error);
  }
};

export const terminateContract = async (req, res, next) => {
  try {
    const { terminationReason, reason } = req.body;
    const finalReason = terminationReason || reason || 'Thanh lý hợp đồng theo yêu cầu';

    const contract = await Contract.findOne({ id: Number(req.params.id) });
    if (!contract) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hợp đồng.' });
    }

    contract.status = 4; // 4: Terminated
    contract.terminatedDate = new Date();
    contract.terminationReason = finalReason;
    await contract.save();

    const bed = await Bed.findOne({ id: contract.bedId });
    if (bed) {
      bed.status = 1; // Available
      await bed.save();
    }

    const room = await Room.findOne({ id: contract.roomId });
    if (room && room.status === 2) {
      room.status = 1; // Available
      await room.save();
    }

    const student = await Student.findOne({ id: contract.studentId });
    if (student) {
      const activeContracts = await Contract.find({ studentId: student.id, status: 2 });
      if (activeContracts.length === 0) {
        student.isStaying = false;
        await student.save();
      }
    }

    res.json({ success: true, message: 'Thanh lý hợp đồng thành công', data: contract });
  } catch (error) {
    next(error);
  }
};

export const renewContract = async (req, res, next) => {
  try {
    const { newEndDate } = req.query;
    if (!newEndDate) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp ngày kết thúc mới.' });
    }

    const targetDate = new Date(newEndDate);
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Ngày kết thúc mới không hợp lệ.' });
    }

    const contract = await Contract.findOne({ id: Number(req.params.id) });
    if (!contract) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hợp đồng.' });
    }

    if (targetDate <= new Date(contract.endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Ngày gia hạn mới phải lớn hơn ngày kết thúc hiện tại của hợp đồng.',
      });
    }

    contract.endDate = targetDate;
    contract.status = 2; // Active
    await contract.save();

    res.json({ success: true, message: 'Gia hạn hợp đồng thành công', data: contract });
  } catch (error) {
    next(error);
  }
};

export const syncContracts = async (req, res, next) => {
  try {
    await syncExpiredContracts();
    res.json({ success: true, message: 'Đồng bộ trạng thái hợp đồng hết hạn thành công.' });
  } catch (error) {
    next(error);
  }
};

