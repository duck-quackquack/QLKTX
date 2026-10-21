import mongoose from 'mongoose';

const buildingSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, index: true },
    code: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    address: { type: String, default: '' },
    numberOfFloors: { type: Number, default: 4 },
    description: { type: String, default: null },
    genderAllowed: { type: String, default: 'Tất cả' },
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

export const Building = mongoose.model('Building', buildingSchema);

