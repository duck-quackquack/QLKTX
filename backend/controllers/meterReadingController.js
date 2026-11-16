import { MeterReading } from '../models/MeterReading.js';
import { Room } from '../models/Room.js';
import { Building } from '../models/Building.js';
import { Contract } from '../models/Contract.js';
import { Invoice } from '../models/Invoice.js';
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
      const electricityUnitPrice = m.electricityUnitPrice || 3500;
      const waterUnitPrice = m.waterUnitPrice || 15000;
      const electricityAmount = electricityUsage * electricityUnitPrice;
      const waterAmount = waterUsage * waterUnitPrice;
      const totalAmount = electricityAmount + waterAmount;

      return {
        ...m,
        roomNumber: room?.roomNumber || '',
        buildingName: building?.name || '',
        electricityUnitPrice,
        waterUnitPrice,
        electricityUsage,
        waterUsage,
        electricityAmount,
        waterAmount,
        totalElectricityCost: electricityAmount,
        totalWaterCost: waterAmount,
        totalAmount,
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
    const electricityUnitPrice = m.electricityUnitPrice || 3500;
    const waterUnitPrice = m.waterUnitPrice || 15000;
    const electricityAmount = electricityUsage * electricityUnitPrice;
    const waterAmount = waterUsage * waterUnitPrice;
    const totalAmount = electricityAmount + waterAmount;

    res.json({
      success: true,
      data: {
        ...m,
        roomNumber: room?.roomNumber || '',
        buildingName: building?.name || '',
        electricityUnitPrice,
        waterUnitPrice,
        electricityUsage,
        waterUsage,
        electricityAmount,
        waterAmount,
        totalElectricityCost: electricityAmount,
        totalWaterCost: waterAmount,
        totalAmount,
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
      autoGenerateInvoicesForRoom,
    } = req.body;

    const rId = Number(roomId);
    const m = Number(month);
    const y = Number(year);

    if (!rId || !m || !y) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp phòng, tháng và năm ghi chỉ số.' });
    }

    const room = await Room.findOne({ id: rId });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy phòng tương ứng.' });
    }

    const eOld = Number(electricityOld);
    const eNew = Number(electricityNew);
    const wOld = Number(waterOld);
    const wNew = Number(waterNew);

    if (eOld < 0 || eNew < 0 || wOld < 0 || wNew < 0) {
      return res.status(400).json({
        success: false,
        message: 'Chỉ số điện nước không được là số âm.',
      });
    }

    if (isNaN(eOld) || isNaN(eNew) || eNew < eOld) {
      return res.status(400).json({
        success: false,
        message: 'Chỉ số điện mới không được nhỏ hơn chỉ số điện cũ.',
      });
    }

    if (isNaN(wOld) || isNaN(wNew) || wNew < wOld) {
      return res.status(400).json({
        success: false,
        message: 'Chỉ số nước mới không được nhỏ hơn chỉ số nước cũ.',
      });
    }

    let reading = await MeterReading.findOne({ roomId: rId, month: m, year: y });

    if (reading) {
      reading.electricityOld = eOld;
      reading.electricityNew = eNew;
      reading.waterOld = wOld;
      reading.waterNew = wNew;
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
        electricityOld: eOld,
        electricityNew: eNew,
        waterOld: wOld,
        waterNew: wNew,
        electricityUnitPrice: Number(electricityUnitPrice) || 3500,
        waterUnitPrice: Number(waterUnitPrice) || 15000,
        recordedBy: req.user?.username || 'staff',
        recordedDate: new Date(),
      });
    }

    if (autoGenerateInvoicesForRoom) {
      const activeContracts = await Contract.find({ roomId: rId, status: 2 });
      if (activeContracts.length > 0) {
        const studentCount = activeContracts.length;
        const elecUsage = Math.max(0, eNew - eOld);
        const waterUsage = Math.max(0, wNew - wOld);
        const elecUnitPrice = Number(electricityUnitPrice) || reading.electricityUnitPrice || 3500;
        const watUnitPrice = Number(waterUnitPrice) || reading.waterUnitPrice || 15000;
        const elecPerStudent = Math.round((elecUsage * elecUnitPrice) / studentCount);
        const waterPerStudent = Math.round((waterUsage * watUnitPrice) / studentCount);

        for (const contract of activeContracts) {
          const inv = await Invoice.findOne({ contractId: contract.id, month: m, year: y });
          if (inv && (inv.status === 1 || inv.status === 2)) {
            // Update existing unpaid or partially paid invoice with split electricity and water
            inv.electricityFee = elecPerStudent;
            inv.waterFee = waterPerStudent;
            inv.totalAmount =
              (inv.roomFee || contract.monthlyRent || 0) + elecPerStudent + waterPerStudent + (inv.serviceFee || 0) + (inv.otherFee || 0);
            await inv.save();
          } else if (!inv) {
            const id = await getNextSequence('invoice_id');
            let invoiceCode = `INV-${y}${String(m).padStart(2, '0')}-${String(contract.studentId).padStart(4, '0')}`;
            const duplicateCode = await Invoice.findOne({ invoiceCode });
            if (duplicateCode) {
              invoiceCode = `INV-${y}${String(m).padStart(2, '0')}-${String(contract.studentId).padStart(4, '0')}-${String(id).padStart(3, '0')}`;
            }
            const total = (contract.monthlyRent || 0) + elecPerStudent + waterPerStudent + 30000;
            await Invoice.create({
              id,
              invoiceCode,
              studentId: contract.studentId,
              contractId: contract.id,
              month: m,
              year: y,
              roomFee: contract.monthlyRent || 0,
              electricityFee: elecPerStudent,
              waterFee: waterPerStudent,
              serviceFee: 30000,
              otherFee: 0,
              totalAmount: total,
              paidAmount: 0,
              dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
              status: 1,
              notes: `Hóa đơn phòng P.${room.roomNumber} kỳ ${String(m).padStart(2, '0')}/${y}`,
            });
          }
        }
      }
    }

    res.status(201).json({ success: true, message: 'Ghi chỉ số điện nước thành công', data: reading });
  } catch (error) {
    next(error);
  }
};

