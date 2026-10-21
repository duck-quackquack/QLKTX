import mongoose from 'mongoose';

const contractSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, index: true },
    contractNumber: { type: String, required: true, unique: true, trim: true },
    studentId: { type: Number, required: true, index: true },
    roomId: { type: Number, required: true, index: true },
    bedId: { type: Number, required: true, index: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    monthlyRent: { type: Number, required: true },
    depositAmount: { type: Number, default: 0 },
    status: { type: Number, default: 1 }, // 1: Active, 2: Terminated, 3: Expired
    terms: { type: String, default: null },
    terminatedDate: { type: Date, default: null },
    terminationReason: { type: String, default: null },
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

export const Contract = mongoose.model('Contract', contractSchema);

