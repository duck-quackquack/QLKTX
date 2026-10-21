import mongoose from 'mongoose';

const violationSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, index: true },
    studentId: { type: Number, required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    violationType: { type: String, default: 'Nội quy phòng' },
    penaltyAmount: { type: Number, default: 0 },
    violationDate: { type: Date, default: Date.now },
    status: { type: Number, default: 1 }, // 1: Pending, 2: Processed, 3: Cancelled
    resolutionNotes: { type: String, default: null },
    createdBy: { type: String, default: null },
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

export const Violation = mongoose.model('Violation', violationSchema);

