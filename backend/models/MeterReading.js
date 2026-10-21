import mongoose from 'mongoose';

const meterReadingSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, index: true },
    roomId: { type: Number, required: true, index: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    electricityOld: { type: Number, required: true },
    electricityNew: { type: Number, required: true },
    waterOld: { type: Number, required: true },
    waterNew: { type: Number, required: true },
    electricityUnitPrice: { type: Number, default: 3500 },
    waterUnitPrice: { type: Number, default: 15000 },
    recordedDate: { type: Date, default: Date.now },
    recordedBy: { type: String, default: null },
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

export const MeterReading = mongoose.model('MeterReading', meterReadingSchema);

