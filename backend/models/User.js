import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, index: true },
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, default: null },
    avatarUrl: { type: String, default: null },
    role: { type: Number, default: 3 }, // 1: Admin, 2: Staff, 3: Student
    isActive: { type: Boolean, default: true },
    refreshToken: { type: String, default: null },
    refreshTokenExpiryTime: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        return ret;
      },
    },
  }
);

export const User = mongoose.model('User', userSchema);

