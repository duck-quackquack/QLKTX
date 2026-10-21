import { MeterReading } from '../models/MeterReading.js';
import { Room } from '../models/Room.js';
import { Building } from '../models/Building.js';
import { getNextSequence } from '../models/Counter.js';

export const getMeterReadings = async (req, res, next) => {
  try {
    const { roomId, buildingId, month, year, pageNumber = 1, pageSize = 10 } = req.query;
    const query = {};

    if (roomId) query.roomId = Number(roomId);
    if (month) query.month = Number(month);
    if (year) query.year = Number(year);

    const page = parseInt(pageNumber, 10) || 1;
    const limit = parseInt(pageSize, 10) || 10;
    const skip = (page - 1) * limit;

    const totalCount = await MeterReading.countDocuments(query);
    const readings = await MeterReading.find(query).sort({ year: -1, month: -1, id: -1 }).skip(skip).limit(limit).lean();

    const rooms = await Room.find().lean();
    const roomMap = new Map(rooms.map((r) => [r.id, r]));

    const buildings = await Building.find().lean();
    const buildingMap = new Map(buildings.map((b) => [b.id, b]));

    let items = readings.map((m) => {
      const room = roomMap.get(m.roomId);
      const building = room ? buildingMap.get(room.buildingId) : null;
      const electricityUsage = Math.max(0, m.electricityNew - m.electricityOld);
      const waterUsage = Math.max(0, m.waterNew - m.waterOld);
      const electricityAmount = electricityUsage * (m.electricityUnitPrice || 3500);
      const waterAmount = waterUsage * (m.waterUnitPrice || 15000);

      return {
        ...m,
        roomNumber: room?.roomNumber || '',
        buildingName: building?.name || '',
        electricityUsage,
        waterUsage,
        electricityAmount,
        waterAmount,
        totalAmount: electricityAmount + waterAmount,
      };
    });

    if (buildingId) {
      const bId = Number(buildingId);
      items = items.filter((m) => {
        const room = roomMap.get(m.roomId);
        return room && room.buildingId === bId;
      });
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

export const getMeterReadingById = async (req, res, next) => {
  try {
    const m = await MeterReading.findOne({ id: Number(req.params.id) }).lean();
    if (!m) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bản ghi chỉ số điện nước.' });
    }

    const room = await Room.findOne({ id: m.roomId }).lean();
    const building = room ? await Building.findOne({ id: room.buildingId }).lean() : null;

    const electricityUsage = Math.max(0, m.electricityNew - m.electricityOld);
    const waterUsage = Math.max(0, m.waterNew - m.waterOld);
    const electricityAmount = electricityUsage * (m.electricityUnitPrice || 3500);
    const waterAmount = waterUsage * (m.waterUnitPrice || 15000);

    res.json({
      success: true,
      data: {
        ...m,
        roomNumber: room?.roomNumber || '',
        buildingName: building?.name || '',
        electricityUsage,
        waterUsage,
        electricityAmount,
        waterAmount,
        totalAmount: electricityAmount + waterAmount,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPreviousReading = async (req, res, next) => {
  try {
    const { roomId, currentMonth, currentYear } = req.query;
    if (!roomId) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp roomId.' });
    }

    const rId = Number(roomId);
    const cMonth = Number(currentMonth) || new Date().getMonth() + 1;
    const cYear = Number(currentYear) || new Date().getFullYear();

    let prevMonth = cMonth - 1;
    let prevYear = cYear;
    if (prevMonth < 1) {
      prevMonth = 12;
      prevYear -= 1;
    }

    const previous = await MeterReading.findOne({
      roomId: rId,
      month: prevMonth,
      year: prevYear,
    }).lean();

    res.json({ success: true, data: previous || null });
  } catch (error) {
    next(error);
  }
};

export const recordMeterReading = async (req, res, next) => {
  try {
    const {
      roomId,
      month,
      year,
      electricityOld,
      electricityNew,
      waterOld,
      waterNew,
      electricityUnitPrice,
      waterUnitPrice,
    } = req.body;

    const rId = Number(roomId);
    const m = Number(month);
    const y = Number(year);

    let reading = await MeterReading.findOne({ roomId: rId, month: m, year: y });

    if (reading) {
      reading.electricityOld = Number(electricityOld);
      reading.electricityNew = Number(electricityNew);
      reading.waterOld = Number(waterOld);
      reading.waterNew = Number(waterNew);
      if (electricityUnitPrice) reading.electricityUnitPrice = Number(electricityUnitPrice);
      if (waterUnitPrice) reading.waterUnitPrice = Number(waterUnitPrice);
      reading.recordedBy = req.user?.username || 'staff';
      reading.recordedDate = new Date();
      await reading.save();
    } else {
      const id = await getNextSequence('meter_reading_id');
      reading = await MeterReading.create({
        id,
        roomId: rId,
        month: m,
        year: y,
        electricityOld: Number(electricityOld),
        electricityNew: Number(electricityNew),
        waterOld: Number(waterOld),
        waterNew: Number(waterNew),
        electricityUnitPrice: Number(electricityUnitPrice) || 3500,
        waterUnitPrice: Number(waterUnitPrice) || 15000,
        recordedBy: req.user?.username || 'staff',
        recordedDate: new Date(),
      });
    }

    res.status(201).json({ success: true, message: 'Ghi chỉ số điện nước thành công', data: reading });
  } catch (error) {
    next(error);
  }
};

