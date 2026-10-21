import { Room } from '../models/Room.js';
import { Bed } from '../models/Bed.js';
import { Building } from '../models/Building.js';
import { Student } from '../models/Student.js';
import { Contract } from '../models/Contract.js';
import { getNextSequence } from '../models/Counter.js';

export const getRooms = async (req, res, next) => {
  try {
    const { buildingId, floor, roomType, status, searchTerm, pageNumber = 1, pageSize = 12 } = req.query;
    const query = {};

    if (buildingId) query.buildingId = Number(buildingId);
    if (floor) query.floor = Number(floor);
    if (roomType) query.roomType = roomType;
    if (status) query.status = Number(status);
    if (searchTerm) {
      query.roomNumber = new RegExp(searchTerm.trim(), 'i');
    }

    const page = parseInt(pageNumber, 10) || 1;
    const limit = parseInt(pageSize, 10) || 12;
    const skip = (page - 1) * limit;

    const totalCount = await Room.countDocuments(query);
    const rooms = await Room.find(query).sort({ roomNumber: 1 }).skip(skip).limit(limit).lean();

    const buildings = await Building.find().lean();
    const buildingMap = new Map(buildings.map((b) => [b.id, b]));

    const roomIds = rooms.map((r) => r.id);
    const beds = await Bed.find({ roomId: { $in: roomIds } }).lean();

    const contracts = await Contract.find({ status: 2 }).lean();
    const students = await Student.find().lean();
    const studentMap = new Map(students.map((s) => [s.id, s]));

    const items = rooms.map((r) => {
      const b = buildingMap.get(r.buildingId);
      const rBeds = beds
        .filter((bd) => bd.roomId === r.id)
        .map((bd) => {
          const activeContract = contracts.find((c) => c.bedId === bd.id);
          const student = activeContract ? studentMap.get(activeContract.studentId) : null;
          return {
            ...bd,
            studentName: student?.fullName || null,
            studentCode: student?.studentCode || null,
          };
        });

      return {
        ...r,
        buildingName: b?.name || '',
        buildingCode: b?.code || '',
        occupiedCount: rBeds.filter((bd) => bd.status === 2).length,
        availableCount: rBeds.filter((bd) => bd.status === 1).length,
        beds: rBeds,
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

export const getRoomsByBuilding = async (req, res, next) => {
  try {
    const buildingId = Number(req.params.buildingId);
    const rooms = await Room.find({ buildingId }).sort({ roomNumber: 1 }).lean();
    const building = await Building.findOne({ id: buildingId }).lean();

    const roomIds = rooms.map((r) => r.id);
    const beds = await Bed.find({ roomId: { $in: roomIds } }).lean();
    const contracts = await Contract.find({ status: 1 }).lean();
    const students = await Student.find().lean();
    const studentMap = new Map(students.map((s) => [s.id, s]));

    const result = rooms.map((r) => {
      const rBeds = beds
        .filter((bd) => bd.roomId === r.id)
        .map((bd) => {
          const activeContract = contracts.find((c) => c.bedId === bd.id);
          const student = activeContract ? studentMap.get(activeContract.studentId) : null;
          return {
            ...bd,
            studentName: student?.fullName || null,
            studentCode: student?.studentCode || null,
          };
        });

      return {
        ...r,
        buildingName: building?.name || '',
        buildingCode: building?.code || '',
        occupiedCount: rBeds.filter((bd) => bd.status === 2).length,
        availableCount: rBeds.filter((bd) => bd.status === 1).length,
        beds: rBeds,
      };
    });

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getRoomById = async (req, res, next) => {
  try {
    const room = await Room.findOne({ id: Number(req.params.id) }).lean();
    if (!room) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy phòng.' });
    }

    const building = await Building.findOne({ id: room.buildingId }).lean();
    const beds = await Bed.find({ roomId: room.id }).lean();
    const contracts = await Contract.find({ status: 1 }).lean();
    const students = await Student.find().lean();
    const studentMap = new Map(students.map((s) => [s.id, s]));

    const rBeds = beds.map((bd) => {
      const activeContract = contracts.find((c) => c.bedId === bd.id);
      const student = activeContract ? studentMap.get(activeContract.studentId) : null;
      return {
        ...bd,
        studentName: student?.fullName || null,
        studentCode: student?.studentCode || null,
      };
    });

    res.json({
      success: true,
      data: {
        ...room,
        buildingName: building?.name || '',
        buildingCode: building?.code || '',
        occupiedCount: rBeds.filter((bd) => bd.status === 2).length,
        availableCount: rBeds.filter((bd) => bd.status === 1).length,
        beds: rBeds,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createRoom = async (req, res, next) => {
  try {
    const { buildingId, roomNumber, floor, roomType, capacity, basePrice, description, genderAllowed } = req.body;

    const existing = await Room.findOne({
      buildingId: Number(buildingId),
      roomNumber: new RegExp(`^${roomNumber.trim()}$`, 'i'),
    });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Phòng này đã tồn tại trong tòa nhà.' });
    }

    const id = await getNextSequence('room_id');
    const cap = Number(capacity) || 4;

    const room = await Room.create({
      id,
      buildingId: Number(buildingId),
      roomNumber: roomNumber.trim().toUpperCase(),
      floor: Number(floor) || 1,
      roomType: roomType || `${cap} người`,
      capacity: cap,
      basePrice: Number(basePrice),
      status: 1,
      description: description?.trim() || null,
      genderAllowed: genderAllowed || 'Tất cả',
    });

    // Auto-create beds
    const createdBeds = [];
    for (let i = 1; i <= cap; i++) {
      const bedId = await getNextSequence('bed_id');
      const bed = await Bed.create({
        id: bedId,
        roomId: room.id,
        bedNumber: `G${String(i).padStart(2, '0')}`,
        status: 1,
      });
      createdBeds.push(bed);
    }

    const building = await Building.findOne({ id: room.buildingId });

    res.status(201).json({
      success: true,
      message: 'Tạo phòng thành công',
      data: {
        ...room.toJSON(),
        buildingName: building?.name || '',
        buildingCode: building?.code || '',
        beds: createdBeds,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findOne({ id: Number(req.params.id) });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy phòng.' });
    }

    const fields = ['roomNumber', 'floor', 'roomType', 'capacity', 'basePrice', 'status', 'description', 'genderAllowed'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) {
        room[f] = req.body[f];
      }
    });

    await room.save();
    res.json({ success: true, message: 'Cập nhật phòng thành công', data: room });
  } catch (error) {
    next(error);
  }
};

export const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findOneAndDelete({ id: Number(req.params.id) });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy phòng.' });
    }
    await Bed.deleteMany({ roomId: room.id });
    res.json({ success: true, message: 'Xóa phòng thành công' });
  } catch (error) {
    next(error);
  }
};

export const addBed = async (req, res, next) => {
  try {
    const roomId = Number(req.params.roomId);
    const { bedNumber, notes } = req.query;

    const room = await Room.findOne({ id: roomId });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy phòng.' });
    }

    const bedId = await getNextSequence('bed_id');
    const bed = await Bed.create({
      id: bedId,
      roomId,
      bedNumber: (bedNumber || `G${bedId}`).toString().trim(),
      status: 1,
      notes: notes || null,
    });

    res.status(201).json({ success: true, message: 'Thêm giường thành công', data: bed });
  } catch (error) {
    next(error);
  }
};

export const updateBedStatus = async (req, res, next) => {
  try {
    const bedId = Number(req.params.bedId);
    const { status, notes } = req.query;

    const bed = await Bed.findOne({ id: bedId });
    if (!bed) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy giường.' });
    }

    if (status !== undefined) bed.status = Number(status);
    if (notes !== undefined) bed.notes = notes;
    await bed.save();

    res.json({ success: true, message: 'Cập nhật trạng thái giường thành công', data: bed });
  } catch (error) {
    next(error);
  }
};

export const deleteBed = async (req, res, next) => {
  try {
    const bed = await Bed.findOneAndDelete({ id: Number(req.params.bedId) });
    if (!bed) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy giường.' });
    }
    res.json({ success: true, message: 'Xóa giường thành công' });
  } catch (error) {
    next(error);
  }
};

export const getAvailableBeds = async (req, res, next) => {
  try {
    const { buildingId } = req.query;
    let roomQuery = {};
    if (buildingId) {
      roomQuery.buildingId = Number(buildingId);
    }
    const rooms = await Room.find(roomQuery).lean();
    const roomIds = rooms.map((r) => r.id);
    const beds = await Bed.find({ roomId: { $in: roomIds }, status: 1 }).lean();

    const buildings = await Building.find().lean();
    const buildingMap = new Map(buildings.map((b) => [b.id, b]));
    const roomMap = new Map(rooms.map((r) => [r.id, r]));

    const result = beds.map((b) => {
      const room = roomMap.get(b.roomId);
      const building = room ? buildingMap.get(room.buildingId) : null;
      return {
        ...b,
        roomNumber: room?.roomNumber || '',
        roomType: room?.roomType || '',
        basePrice: room?.basePrice || 0,
        buildingName: building?.name || '',
        buildingCode: building?.code || '',
      };
    });

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
