import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, index: true },
    registrationCode: { type: String, default: null },
    studentId: { type: Number, required: true, index: true },
    preferredBuildingId: { type: Number, default: null },
    preferredRoomType: { type: String, default: null },
    desiredStartDate: { type: Date, required: true },
    durationMonths: { type: Number, default: 6 },
    reasonOrNote: { type: String, default: null },
    status: { type: Number, default: 1 }, // 1: Pending, 2: Approved, 3: Rejected, 4: Cancelled
    adminNote: { type: String, default: null },
    approvedRoomId: { type: Number, default: null },
    approvedBedId: { type: Number, default: null },
    reviewedAt: { type: Date, default: null },
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

export const Registration = mongoose.model('Registration', registrationSchema);

