import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, index: true },
    invoiceId: { type: Number, required: true, index: true },
    paymentCode: { type: String, required: true, unique: true, trim: true },
    amount: { type: Number, required: true },
    paymentDate: { type: Date, default: Date.now },
    paymentMethod: { type: Number, default: 2 }, // 1: Cash, 2: BankTransfer, 3: OnlineGateway
    transactionCode: { type: String, default: null },
    status: { type: Number, default: 2 }, // 1: Pending, 2: Completed, 3: Failed
    notes: { type: String, default: null },
    receivedBy: { type: String, default: null },
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

export const Payment = mongoose.model('Payment', paymentSchema);

