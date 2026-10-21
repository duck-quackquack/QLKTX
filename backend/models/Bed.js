import mongoose from 'mongoose';

const bedSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, index: true },
    roomId: { type: Number, required: true, index: true },
    bedNumber: { type: String, required: true, trim: true },
    status: { type: Number, default: 1 }, // 1: Available, 2: Occupied, 3: Broken
    notes: { type: String, default: null },
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

export const Bed = mongoose.model('Bed', bedSchema);

