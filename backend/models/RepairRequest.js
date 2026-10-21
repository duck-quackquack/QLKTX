import mongoose from 'mongoose';

const repairRequestSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, index: true },
    studentId: { type: Number, required: true, index: true },
    roomId: { type: Number, required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    imageUrl: { type: String, default: null },
    priority: { type: Number, default: 2 }, // 1: Low, 2: Medium, 3: High, 4: Urgent
    status: { type: Number, default: 1 }, // 1: Pending, 2: Processing, 3: Completed, 4: Cancelled
    repairCost: { type: Number, default: 0 },
    staffNotes: { type: String, default: null },
    completedAt: { type: Date, default: null },
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

export const RepairRequest = mongoose.model('RepairRequest', repairRequestSchema);

