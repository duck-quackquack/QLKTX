import 'dotenv/config';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Student } from '../models/Student.js';
import { Contract } from '../models/Contract.js';
import { Invoice } from '../models/Invoice.js';
import { Payment } from '../models/Payment.js';
import { Registration } from '../models/Registration.js';
import { Notification } from '../models/Notification.js';
import { RepairRequest } from '../models/RepairRequest.js';
import { Violation } from '../models/Violation.js';

async function main() {
  await connectDB();

  const uIds = [16, 17];
  const sIds = [14, 15];

  console.log('Deleting social test users 16, 17 and students 14, 15...');
  const resU = await User.deleteMany({ id: { $in: uIds } });
  const resS = await Student.deleteMany({ id: { $in: sIds } });
  const resC = await Contract.deleteMany({ studentId: { $in: sIds } });
  const resI = await Invoice.deleteMany({ studentId: { $in: sIds } });
  const resP = await Payment.deleteMany({ studentId: { $in: sIds } });
  const resR = await Registration.deleteMany({ studentId: { $in: sIds } });
  const resN = await Notification.deleteMany({ userId: { $in: uIds } });
  const resRep = await RepairRequest.deleteMany({ studentId: { $in: sIds } });
  const resV = await Violation.deleteMany({ studentId: { $in: sIds } });

  console.log('Result:', {
    usersDeleted: resU.deletedCount,
    studentsDeleted: resS.deletedCount,
    contractsDeleted: resC.deletedCount,
    invoicesDeleted: resI.deletedCount,
    paymentsDeleted: resP.deletedCount,
    registrationsDeleted: resR.deletedCount,
    notificationsDeleted: resN.deletedCount,
    repairsDeleted: resRep.deletedCount,
    violationsDeleted: resV.deletedCount,
  });

  const remainingUsers = await User.find({}, 'id username email fullName');
  console.log('REMAINING USERS:', remainingUsers);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
