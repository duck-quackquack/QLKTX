import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, index: true },
    userId: { type: Number, default: null, index: true }, // null = all users
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    type: { type: Number, default: 1 }, // 1: General, 2: Invoice, 3: Violation, 4: Repair, 5: Contract
    isRead: { type: Boolean, default: false },
    actionUrl: { type: String, default: null },
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

export const Notification = mongoose.model('Notification', notificationSchema);

