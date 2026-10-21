import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, index: true },
    buildingId: { type: Number, required: true, index: true },
    roomNumber: { type: String, required: true, trim: true },
    floor: { type: Number, default: 1 },
    roomType: { type: String, default: '4 người' },
    capacity: { type: Number, default: 4 },
    basePrice: { type: Number, required: true },
    status: { type: Number, default: 1 }, // 1: Available, 2: Full, 3: UnderMaintenance
    description: { type: String, default: null },
    genderAllowed: { type: String, default: 'Tất cả' },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Room = mongoose.model('Room', roomSchema);

