import mongoose from 'mongoose';
import { seedDatabase } from '../seed/seedData.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/DormitoryDb');
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Automatically seed data if needed
    await seedDatabase();
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

