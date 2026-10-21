import { Building } from '../models/Building.js';
import { Room } from '../models/Room.js';
import { Bed } from '../models/Bed.js';
import { getNextSequence } from '../models/Counter.js';

export const getBuildings = async (req, res, next) => {
  try {
    const buildings = await Building.find().sort({ code: 1 }).lean();
    const rooms = await Room.find().lean();
    const beds = await Bed.find().lean();

    const result = buildings.map((b) => {
      const bRooms = rooms.filter((r) => r.buildingId === b.id);
      const bRoomIds = bRooms.map((r) => r.id);
      const bBeds = beds.filter((bd) => bRoomIds.includes(bd.roomId));

      return {
        ...b,
        roomCount: bRooms.length,
        totalBeds: bBeds.length,
        occupiedBeds: bBeds.filter((bd) => bd.status === 2).length,
        availableBeds: bBeds.filter((bd) => bd.status === 1).length,
      };
    });

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getBuildingById = async (req, res, next) => {
  try {
    const building = await Building.findOne({ id: Number(req.params.id) }).lean();
    if (!building) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tòa nhà.' });
    }

    const rooms = await Room.find({ buildingId: building.id }).lean();
    const roomIds = rooms.map((r) => r.id);
    const beds = await Bed.find({ roomId: { $in: roomIds } }).lean();

    res.json({
      success: true,
      data: {
        ...building,
        roomCount: rooms.length,
        totalBeds: beds.length,
        occupiedBeds: beds.filter((bd) => bd.status === 2).length,
        availableBeds: beds.filter((bd) => bd.status === 1).length,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createBuilding = async (req, res, next) => {
  try {
    const { code, name, address, numberOfFloors, description, genderAllowed } = req.body;

    const existing = await Building.findOne({ code: new RegExp(`^${code.trim()}$`, 'i') });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Mã tòa nhà đã tồn tại.' });
    }

    const id = await getNextSequence('building_id');
    const building = await Building.create({
      id,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      address: address?.trim() || '',
      numberOfFloors: Number(numberOfFloors) || 4,
      description: description?.trim() || null,
      genderAllowed: genderAllowed || 'Tất cả',
    });

    res.status(201).json({ success: true, message: 'Tạo tòa nhà thành công', data: building });
  } catch (error) {
    next(error);
  }
};

export const updateBuilding = async (req, res, next) => {
  try {
    const building = await Building.findOne({ id: Number(req.params.id) });
    if (!building) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tòa nhà.' });
    }

    const fields = ['code', 'name', 'address', 'numberOfFloors', 'description', 'genderAllowed'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) {
        building[f] = req.body[f];
      }
    });

    await building.save();
    res.json({ success: true, message: 'Cập nhật tòa nhà thành công', data: building });
  } catch (error) {
    next(error);
  }
};

export const deleteBuilding = async (req, res, next) => {
  try {
    const building = await Building.findOneAndDelete({ id: Number(req.params.id) });
    if (!building) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tòa nhà.' });
    }
    const rooms = await Room.find({ buildingId: building.id });
    const roomIds = rooms.map((r) => r.id);
    await Bed.deleteMany({ roomId: { $in: roomIds } });
    await Room.deleteMany({ buildingId: building.id });

    res.json({ success: true, message: 'Xóa tòa nhà thành công' });
  } catch (error) {
    next(error);
  }
};

