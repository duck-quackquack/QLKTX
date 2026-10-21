import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, index: true },
    userId: { type: Number, default: null, index: true },
    studentCode: { type: String, required: true, unique: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, default: 'Nam' },
    phone: { type: String, default: '' },
    email: { type: String, required: true, trim: true },
    address: { type: String, default: '' },
    faculty: { type: String, default: '' },
    className: { type: String, default: '' },
    citizenId: { type: String, default: null },
    avatarUrl: { type: String, default: null },
    isStaying: { type: Boolean, default: false },
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

export const Student = mongoose.model('Student', studentSchema);

