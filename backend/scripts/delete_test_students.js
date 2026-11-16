import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cleanData = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB Atlas: ' + mongoose.connection.db.databaseName);

  // 1. Create a safety backup first
  console.log('Creating safety backup...');
  const collections = await mongoose.connection.db.listCollections().toArray();
  const backupData = {};
  for (const col of collections) {
    backupData[col.name] = await mongoose.connection.db.collection(col.name).find({}).toArray();
  }
  const backupFile = path.join(__dirname, '..', 'database_backup_pre_delete.json');
  fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2), 'utf8');
  console.log(`Safety backup saved to ${backupFile}`);

  // 2. Identify target students and users
  const targetStudentQuery = {
    $or: [
      { fullName: { $regex: /Đỗ Thành Đức|Do Thanh Duc/i } },
      { fullName: { $regex: /Dương Minh Hùng|Duong Minh Hung/i } },
      { studentCode: { $in: ['1822041524', '1822040311'] } }
    ]
  };

  const students = await mongoose.connection.db.collection('students').find(targetStudentQuery).toArray();
  const studentIds = students.map(s => s.id);
  const studentUserIds = students.map(s => s.userId).filter(Boolean);

  const targetUserQuery = {
    $or: [
      { id: { $in: studentUserIds } },
      { username: { $in: ['duc', 'hung', '1822041524', '1822040311'] } },
      { fullName: { $regex: /Đỗ Thành Đức|Do Thanh Duc|Dương Minh Hùng|Duong Minh Hung/i } }
    ]
  };
  const users = await mongoose.connection.db.collection('users').find(targetUserQuery).toArray();
  const userIds = users.map(u => u.id);

  console.log('\n--- IDENTIFIED TARGETS ---');
  console.log(`Students (${students.length}):`, students.map(s => `[ID:${s.id}] ${s.fullName} (${s.studentCode})`));
  console.log(`Users (${users.length}):`, users.map(u => `[ID:${u.id}] ${u.fullName} (username: ${u.username})`));

  // 3. Find associated contracts and release beds
  const contracts = await mongoose.connection.db.collection('contracts').find({
    $or: [
      { studentId: { $in: studentIds } }
    ]
  }).toArray();
  const contractIds = contracts.map(c => c.id);
  const bedIdsToRelease = contracts.map(c => c.bedId).filter(Boolean);

  console.log(`Contracts to delete (${contracts.length}):`, contracts.map(c => `[ID:${c.id}] HĐ ${c.contractNumber} (Bed: ${c.bedId})`));

  // Release beds to status 1 (Available)
  if (bedIdsToRelease.length > 0) {
    const bedRes = await mongoose.connection.db.collection('beds').updateMany(
      { id: { $in: bedIdsToRelease } },
      { $set: { status: 1 } }
    );
    console.log(`Released ${bedRes.modifiedCount} bed(s) back to Status 1 (Trống / Available):`, bedIdsToRelease);
  }

  // 4. Find and delete invoices & payments
  const invoices = await mongoose.connection.db.collection('invoices').find({
    $or: [
      { studentId: { $in: studentIds } },
      { contractId: { $in: contractIds } }
    ]
  }).toArray();
  const invoiceIds = invoices.map(i => i.id);

  const payments = await mongoose.connection.db.collection('payments').find({
    $or: [
      { studentId: { $in: studentIds } },
      { invoiceId: { $in: invoiceIds } }
    ]
  }).toArray();

  // 5. Registrations
  const registrations = await mongoose.connection.db.collection('registrations').find({
    $or: [
      { studentId: { $in: studentIds } },
      { fullName: { $regex: /Đỗ Thành Đức|Do Thanh Duc|Dương Minh Hùng|Duong Minh Hung/i } },
      { studentCode: { $in: ['1822041524', '1822040311'] } }
    ]
  }).toArray();

  // 6. Violations & Repairs
  const violations = await mongoose.connection.db.collection('violations').find({
    studentId: { $in: studentIds }
  }).toArray();

  const repairs = await mongoose.connection.db.collection('repairrequests').find({
    studentId: { $in: studentIds }
  }).toArray();

  // 7. Notifications
  const notifs = await mongoose.connection.db.collection('notifications').find({
    userId: { $in: userIds }
  }).toArray();

  console.log('\n--- DELETING RECORDS ---');
  if (payments.length > 0) {
    const r = await mongoose.connection.db.collection('payments').deleteMany({
      id: { $in: payments.map(p => p.id) }
    });
    console.log(`- Deleted payments: ${r.deletedCount}`);
  }

  if (invoices.length > 0) {
    const r = await mongoose.connection.db.collection('invoices').deleteMany({
      id: { $in: invoiceIds }
    });
    console.log(`- Deleted invoices: ${r.deletedCount}`);
  }

  if (contracts.length > 0) {
    const r = await mongoose.connection.db.collection('contracts').deleteMany({
      id: { $in: contractIds }
    });
    console.log(`- Deleted contracts: ${r.deletedCount}`);
  }

  if (registrations.length > 0) {
    const r = await mongoose.connection.db.collection('registrations').deleteMany({
      id: { $in: registrations.map(reg => reg.id) }
    });
    console.log(`- Deleted registrations: ${r.deletedCount}`);
  }

  if (violations.length > 0) {
    const r = await mongoose.connection.db.collection('violations').deleteMany({
      id: { $in: violations.map(v => v.id) }
    });
    console.log(`- Deleted violations: ${r.deletedCount}`);
  }

  if (repairs.length > 0) {
    const r = await mongoose.connection.db.collection('repairrequests').deleteMany({
      id: { $in: repairs.map(rp => rp.id) }
    });
    console.log(`- Deleted repair requests: ${r.deletedCount}`);
  }

  if (notifs.length > 0) {
    const r = await mongoose.connection.db.collection('notifications').deleteMany({
      id: { $in: notifs.map(n => n.id) }
    });
    console.log(`- Deleted notifications: ${r.deletedCount}`);
  }

  if (students.length > 0) {
    const r = await mongoose.connection.db.collection('students').deleteMany({
      id: { $in: studentIds }
    });
    console.log(`- Deleted students: ${r.deletedCount}`);
  }

  if (users.length > 0) {
    const r = await mongoose.connection.db.collection('users').deleteMany({
      id: { $in: userIds }
    });
    console.log(`- Deleted users: ${r.deletedCount}`);
  }

  // Also check Room 9 (D101) to ensure its status is 1 (Available)
  const room9Beds = await mongoose.connection.db.collection('beds').find({ roomId: 9 }).toArray();
  const anyOccupied = room9Beds.some(b => b.status === 2);
  await mongoose.connection.db.collection('rooms').updateOne(
    { id: 9 },
    { $set: { status: anyOccupied ? 2 : 1 } }
  );
  console.log(`Room 9 (D101) status verified: ${anyOccupied ? 2 : 1} (Available)`);

  console.log('\n========================================');
  console.log('CLEANUP COMPLETED SUCCESSFULLY 100%!');
  console.log('========================================');

  await mongoose.disconnect();
};

cleanData().catch(console.error);
