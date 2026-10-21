import { Contract } from '../models/Contract.js';
import { Student } from '../models/Student.js';
import { Room } from '../models/Room.js';
import { Bed } from '../models/Bed.js';
import { Building } from '../models/Building.js';
import { getNextSequence } from '../models/Counter.js';

export const getContracts = async (req, res, next) => {
  try {
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
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.json({ success: true, data: null });
    }

    const c = await Contract.findOne({ studentId: student.id, status: 1 }).lean();
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

    const student = await Student.findOne({ id: Number(studentId) });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sinh viên.' });
    }

    const bed = await Bed.findOne({ id: Number(bedId) });
    if (!bed) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy giường.' });
    }

    const id = await getNextSequence('contract_id');
    const contractNumber = `HD-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(student.id).padStart(4, '0')}`;

    const contract = await Contract.create({
      id,
      contractNumber,
      studentId: Number(studentId),
      roomId: Number(roomId),
      bedId: Number(bedId),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      monthlyRent: Number(monthlyRent),
      depositAmount: Number(depositAmount) || 0,
      status: 1, // Active
      terms: terms || 'Nội quy ký túc xá theo quy chế ban hành 2026.',
    });

    bed.status = 2; // Occupied
    await bed.save();

    student.isStaying = true;
    await student.save();

    res.status(201).json({ success: true, message: 'Tạo hợp đồng thành công', data: contract });
  } catch (error) {
    next(error);
  }
};

export const terminateContract = async (req, res, next) => {
  try {
    const { terminationReason } = req.body;
    const contract = await Contract.findOne({ id: Number(req.params.id) });
    if (!contract) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hợp đồng.' });
    }

    contract.status = 2; // Terminated
    contract.terminatedDate = new Date();
    contract.terminationReason = terminationReason || 'Thanh lý hợp đồng theo yêu cầu';
    await contract.save();

    const bed = await Bed.findOne({ id: contract.bedId });
    if (bed) {
      bed.status = 1; // Available
      await bed.save();
    }

    const student = await Student.findOne({ id: contract.studentId });
    if (student) {
      const activeContracts = await Contract.find({ studentId: student.id, status: 1 });
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

    const contract = await Contract.findOne({ id: Number(req.params.id) });
    if (!contract) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hợp đồng.' });
    }

    contract.endDate = new Date(newEndDate);
    contract.status = 1; // Active
    await contract.save();

    res.json({ success: true, message: 'Gia hạn hợp đồng thành công', data: contract });
  } catch (error) {
    next(error);
  }
};

