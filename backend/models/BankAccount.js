import mongoose from 'mongoose';

const bankAccountSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, index: true },
    bankCode: { type: String, required: true, trim: true }, // e.g. 'MB', 'VCB', 'TCB'
    bankName: { type: String, required: true, trim: true }, // e.g. 'MB Bank (Quân Đội)'
    accountNumber: { type: String, required: true, trim: true },
    accountName: { type: String, required: true, trim: true, uppercase: true }, // e.g. 'DO THANH DUC'
    branch: { type: String, default: null },
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
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

export const BankAccount = mongoose.model('BankAccount', bankAccountSchema);
