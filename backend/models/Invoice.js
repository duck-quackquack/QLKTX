import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, index: true },
    invoiceCode: { type: String, required: true, unique: true, trim: true },
    studentId: { type: Number, required: true, index: true },
    contractId: { type: Number, required: true, index: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    roomFee: { type: Number, required: true },
    electricityFee: { type: Number, default: 0 },
    waterFee: { type: Number, default: 0 },
    serviceFee: { type: Number, default: 0 },
    otherFee: { type: Number, default: 0 },
    otherFeeDescription: { type: String, default: null },
    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    dueDate: { type: Date, required: true },
    status: { type: Number, default: 1 }, // 1: Unpaid, 2: PartiallyPaid, 3: Paid, 4: Cancelled, 5: Overdue
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

export const Invoice = mongoose.model('Invoice', invoiceSchema);

