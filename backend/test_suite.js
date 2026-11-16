import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import buildingRoutes from './routes/buildingRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import registrationRoutes from './routes/registrationRoutes.js';
import contractRoutes from './routes/contractRoutes.js';
import meterReadingRoutes from './routes/meterReadingRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import violationRoutes from './routes/violationRoutes.js';
import repairRoutes from './routes/repairRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import bankAccountRoutes from './routes/bankAccountRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const TEST_PORT = 5055;
const BASE_URL = `http://localhost:${TEST_PORT}/api`;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/buildings', buildingRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/meterreadings', meterReadingRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/violations', violationRoutes);
app.use('/api/repairs', repairRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/bank-accounts', bankAccountRoutes);
app.get('/api/health', (req, res) => res.json({ success: true, message: 'API running' }));
app.use(errorHandler);

async function runTests() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/DormitoryDb');
  console.log('MongoDB connected for testing.');

  const server = app.listen(TEST_PORT);
  console.log(`Test server listening on port ${TEST_PORT}\n`);

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} - ${details}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const r1 = await fetch(`${BASE_URL}/health`).then(r => r.json());
    assert(r1.success === true, 'Test 1: Health check');

    // 2. Admin login
    const r2 = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'Admin@123' })
    }).then(r => r.json());
    assert(r2.success === true && r2.data?.token && r2.data.user.role === 1, 'Test 2: Admin Login');
    const adminToken = r2.data?.token;

    // 3. Staff login
    const r3 = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'staff', password: 'Staff@123' })
    }).then(r => r.json());
    assert(r3.success === true && r3.data.user.role === 2, 'Test 3: Staff Login');

    // 4. Student login
    const r4 = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'sv2026001', password: 'Ktx@123456' })
    }).then(r => r.json());
    assert(r4.success === true && r4.data.user.role === 3, 'Test 4: Student Login');
    const studentToken = r4.data?.token;

    // 5. Invalid credentials login
    const r5 = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'WrongPassword' })
    });
    assert(r5.status === 401, 'Test 5: Reject invalid login credentials (401)');

    // 6. RBAC: Student accessing /students list (forbidden)
    const r6 = await fetch(`${BASE_URL}/students`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    assert(r6.status === 403, 'Test 6: RBAC: Student cannot access Admin student list (403)');

    // 6b. Admin accessing /students list: Verify room and bed are populated for staying students
    const r6b = await fetch(`${BASE_URL}/students`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    }).then(r => r.json());
    const student1 = r6b.data?.items?.find((s) => s.id === 1);
    assert(
      r6b.success === true && student1?.currentRoomNumber === 'A101' && student1?.currentBedNumber === 'G01',
      'Test 6b: Admin getStudents populates currentRoomNumber and currentBedNumber'
    );

    // 7. IDOR: Student 1 accessing Student 2's profile (forbidden)
    const r7 = await fetch(`${BASE_URL}/students/2`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    assert(r7.status === 403, 'Test 7: IDOR: Student cannot view another student profile (403)');

    // 8. Student accessing own active contract (status: 2)
    const r8 = await fetch(`${BASE_URL}/contracts/my-active`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    }).then(r => r.json());
    assert(r8.success === true && r8.data && r8.data.contractNumber === 'HD-202609-0001', 'Test 8: Student retrieves own active contract');

    // 9. Bed capacity limit: Adding beds exceeding capacity
    const r9 = await fetch(`${BASE_URL}/rooms/1/beds?bedNumber=G99`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(r9.status === 400, 'Test 9: Room capacity limit enforced when adding beds (400)');

    // 10. Registration duplicate: Student with active contract cannot submit pending registration
    const r10 = await fetch(`${BASE_URL}/registrations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        preferredBuildingId: 1,
        preferredRoomType: '4 người',
        desiredStartDate: new Date().toISOString()
      })
    });
    assert(r10.status === 400, 'Test 10: Prevent registration when student has active contract (400)');

    // 11. Meter reading: Invalid readings (new < old)
    const r11 = await fetch(`${BASE_URL}/meterreadings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        roomId: 1,
        month: 10,
        year: 2026,
        electricityOld: 500,
        electricityNew: 400, // Invalid!
        waterOld: 100,
        waterNew: 110
      })
    });
    assert(r11.status === 400, 'Test 11: Reject meter reading if new index < old index (400)');

    // 12. Meter reading: Valid readings
    const r12 = await fetch(`${BASE_URL}/meterreadings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        roomId: 1,
        month: 10,
        year: 2026,
        electricityOld: 500,
        electricityNew: 580,
        waterOld: 100,
        waterNew: 115
      })
    }).then(r => r.json());
    assert(r12.success === true, 'Test 12: Record valid meter reading');

    // 13. Payment: Overpayment rejection
    const r13 = await fetch(`${BASE_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        invoiceId: 2, // Unpaid invoice (total 910000)
        amount: 50000000, // Excessive overpayment!
        paymentMethod: 1
      })
    });
    assert(r13.status === 400, 'Test 13: Reject payment exceeding remaining debt (400)');

    // 14. Safe deletion: Cannot delete student with active contract
    const r14 = await fetch(`${BASE_URL}/students/1`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(r14.status === 400, 'Test 14: Safe deletion: Reject deleting student with active contract (400)');

    // 15. Safe deletion: Cannot delete building with occupied rooms
    const r15 = await fetch(`${BASE_URL}/buildings/1`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(r15.status === 400, 'Test 15: Safe deletion: Reject deleting building with active occupants (400)');

    // 16. Dashboard statistics
    const r16 = await fetch(`${BASE_URL}/dashboard/statistics`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    }).then(r => r.json());
    assert(r16.success === true && r16.data?.totalStudents > 0, 'Test 16: Dashboard statistics retrieval');

    // 17. Registration Review: Admin approving pending registration with assignedRoomId and assignedBedId
    const { Registration } = await import('./models/Registration.js');
    const { Bed } = await import('./models/Bed.js');
    const { Contract } = await import('./models/Contract.js');
    const { Student } = await import('./models/Student.js');
    const { Invoice } = await import('./models/Invoice.js');
    const { Payment } = await import('./models/Payment.js');
    const { Room } = await import('./models/Room.js');

    await Room.updateOne({ id: 2 }, { $set: { genderAllowed: 'Nam', status: 1 } });
    await Registration.updateOne({ id: 1 }, { $set: { status: 1, approvedRoomId: null, approvedBedId: null } });
    await Bed.updateOne({ id: 5 }, { $set: { status: 1 } });
    await Contract.deleteMany({ studentId: 3, bedId: 5 });
    await Invoice.deleteMany({ studentId: 3 });
    await Student.updateOne({ id: 3 }, { $set: { isStaying: false } });

    const r17 = await fetch(`${BASE_URL}/registrations/1/review`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        status: 2,
        assignedRoomId: 2,
        assignedBedId: 5,
        adminNote: 'Đủ điều kiện xếp phòng.'
      })
    }).then(r => r.json());
    assert(r17.success === true && r17.data?.status === 2, 'Test 17: Admin review & approve registration (assignedRoomId/assignedBedId)', JSON.stringify(r17));
    const student3Invoice = await Invoice.findOne({ studentId: 3, status: 1 });
    assert(
      student3Invoice && student3Invoice.totalAmount > 0 && student3Invoice.status === 1,
      'Test 17b: Admin registration approval automatically issues initial room fee invoice (status 1)'
    );

    // 18. Registration Review: Rejection requires a reason
    const r18 = await fetch(`${BASE_URL}/registrations/2/review`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        status: 3,
        adminNote: '' // Empty reason!
      })
    });
    assert(r18.status === 400, 'Test 18: Rejecting registration requires a specific reason (400)');

    // 19. Expired contract auto-sync: Contract with endDate in past is automatically set to status: 3 and bed freed
    const testContractId = 99999;
    const testBedId = 29;
    await Contract.deleteOne({ id: testContractId });
    await Bed.updateOne({ id: testBedId }, { $set: { status: 2 } });
    await Contract.create({
      id: testContractId,
      contractNumber: 'HD-TEST-EXPIRED',
      studentId: 99999,
      roomId: 8,
      bedId: testBedId,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-06-01'), // Expired!
      monthlyRent: 500000,
      depositAmount: 500000,
      status: 2, // Marked active prior to sync
    });

    await fetch(`${BASE_URL}/contracts/sync-expired`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });

    const syncedContract = await Contract.findOne({ id: testContractId });
    const syncedBed = await Bed.findOne({ id: testBedId });
    assert(syncedContract?.status === 3 && syncedBed?.status === 1, 'Test 19: Expired contracts auto-synced (status 3) and bed released (status 1)');
    await Contract.deleteOne({ id: testContractId });

    // 20. Prevent duplicate payment with same transaction code
    const uniqueTxCode = `TX-TEST-${Date.now()}`;
    const r20a = await fetch(`${BASE_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        invoiceId: 2,
        amount: 10000,
        paymentMethod: 2,
        transactionCode: uniqueTxCode
      })
    });
    const r20aJson = await r20a.json();

    const r20b = await fetch(`${BASE_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        invoiceId: 2,
        amount: 10000,
        paymentMethod: 2,
        transactionCode: uniqueTxCode // Duplicate transaction code!
      })
    });
    assert(r20b.status === 400, 'Test 20: Prevent duplicate payment with same transaction code (400)');

    // Clean up Test 20: delete test payment and revert 10,000 from Invoice 2
    if (r20aJson.data?.id) {
      await Payment.deleteOne({ id: r20aJson.data.id });
      await Invoice.updateOne(
        { id: 2 },
        { $inc: { paidAmount: -10000, remainingAmount: 10000 } }
      );
    }

    // 21. Meter reading: Reject negative readings
    const r21 = await fetch(`${BASE_URL}/meterreadings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        roomId: 1,
        month: 11,
        year: 2026,
        electricityOld: -50,
        electricityNew: 100,
        waterOld: 0,
        waterNew: 10
      })
    });
    assert(r21.status === 400, 'Test 21: Reject negative meter readings (400)');

    // 22. Reject assigning bed that does not belong to the selected room
    const r22 = await fetch(`${BASE_URL}/registrations/2/review`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        status: 2,
        assignedRoomId: 1,
        assignedBedId: 10, // Bed 10 belongs to room 3, not room 1!
        adminNote: 'Xếp phòng nhầm giường.'
      })
    });
    assert(r22.status === 400, 'Test 22: Reject assigning bed that does not belong to selected room (400)');

    // 23. IDOR: Student cannot cancel another student\'s registration
    const r23 = await fetch(`${BASE_URL}/registrations/1/cancel`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${studentToken}` } // Student 1 token, but registration 1 belongs to student 3
    });
    const r23Json = await r23.json();
    assert(r23.status === 403, 'Test 23: IDOR: Student cannot cancel another student registration (403)', `${r23.status} ${JSON.stringify(r23Json)}`);

    // 24. Reject contract creation for room that is full or at capacity
    const r24 = await fetch(`${BASE_URL}/contracts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        studentId: 3,
        roomId: 1, // Room 1 has capacity 4, already 4 beds
        bedId: 1,  // Bed 1 already occupied
        startDate: '2026-11-01',
        endDate: '2027-05-01',
        monthlyRent: 650000
      })
    });
    assert(r24.status === 400, 'Test 24: Reject contract creation for room/bed not available (400)');

    // 25. Gender check when assigning room
    await Room.updateOne({ id: 2 }, { $set: { genderAllowed: 'Nữ' } }); // Room 2 is Female only
    // Student 3 is Male (Lê Văn Cường)
    await Registration.updateOne({ id: 1 }, { $set: { status: 1 } });
    await Bed.updateOne({ id: 5 }, { $set: { status: 1 } });
    const r25 = await fetch(`${BASE_URL}/registrations/1/review`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        status: 2,
        assignedRoomId: 2, // Female room
        assignedBedId: 5,
        adminNote: 'Duyệt thử nghiệm giới tính.'
      })
    });
    const r25Json = await r25.json();
    assert(r25.status === 400, 'Test 25: Reject room assignment violating gender rules (400)', `${r25.status} ${JSON.stringify(r25Json)}`);
    // Restore Room 2 gender and clean up test records for Student 3 & Registration 1
    await Room.updateOne({ id: 2 }, { $set: { genderAllowed: 'Nam', status: 1 } });
    await Contract.deleteMany({ studentId: 3, bedId: 5 });
    await Invoice.deleteMany({ studentId: 3 });
    await Student.updateOne({ id: 3 }, { $set: { isStaying: false } });
    await Registration.updateOne(
      { id: 1 },
      { $set: { status: 1, approvedRoomId: null, approvedBedId: null, adminNote: null, reviewedAt: null } }
    );
    await Bed.updateOne({ id: 5 }, { $set: { status: 1 } });

    // 26. Reject registration if building gender mismatches student gender (400)
    // Login as baseline male student 'sv2026003' (studentId: 3, gender: 'Nam')
    const loginDuc = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'sv2026003', password: 'Ktx@123456' })
    }).then(r => r.json());

    if (loginDuc.success && loginDuc.data?.token) {
      const ducToken = loginDuc.data.token;
      const testStudentId = loginDuc.data.student?.id || 3;
      // Backup any existing contract, registrations & staying status for test student so we don't break live data
      const backupContracts = await Contract.find({ studentId: testStudentId }).lean();
      const backupRegistrations = await Registration.find({ studentId: testStudentId }).lean();
      const backupStudent = await Student.findOne({ id: testStudentId }).lean();
      await Registration.deleteMany({ studentId: testStudentId });
      await Contract.deleteMany({ studentId: testStudentId });
      await Student.updateOne({ id: testStudentId }, { $set: { isStaying: false } });

      // Attempt registering to Building 2 (Tòa B - Nữ)
      const r26 = await fetch(`${BASE_URL}/registrations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ducToken}`
        },
        body: JSON.stringify({
          preferredBuildingId: 2, // Female building
          preferredRoomType: '4 người',
          desiredStartDate: '2026-11-15',
          durationMonths: 6
        })
      });
      assert(r26.status === 400, 'Test 26: Reject registration when building gender mismatches student gender (400)');

      // 36. Reject registration when desiredStartDate is in the past (400)
      const r36 = await fetch(`${BASE_URL}/registrations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ducToken}`
        },
        body: JSON.stringify({
          preferredBuildingId: 1,
          preferredRoomType: '4 người',
          desiredStartDate: '2026-11-01', // past date
          durationMonths: 6
        })
      });
      assert(r36.status === 400, 'Test 36: Reject registration when desiredStartDate is in the past (400)');

      // 37. Reject registration when preferredRoomId is under maintenance (status 3) (400)
      const r37 = await fetch(`${BASE_URL}/registrations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ducToken}`
        },
        body: JSON.stringify({
          preferredBuildingId: 3,
          preferredRoomType: '2 người',
          preferredRoomId: 8, // Room C101 is maintenance (status 3)
          preferredRoomNumber: 'C101',
          desiredStartDate: '2026-11-20',
          durationMonths: 6
        })
      });
      assert(r37.status === 400, 'Test 37: Reject registration when preferredRoomId is under maintenance (status 3) (400)');

      // 27. Allow registration to gender-compliant building with preferredRoomId
      const r27 = await fetch(`${BASE_URL}/registrations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ducToken}`
        },
        body: JSON.stringify({
          preferredBuildingId: 1, // Male building
          preferredRoomType: '4 người',
          preferredRoomId: 1,
          preferredRoomNumber: 'A101',
          desiredStartDate: '2026-11-25',
          durationMonths: 6,
          reasonOrNote: 'Muốn ở tầng 1 phòng P.A101'
        })
      });
      const data27 = await r27.json();
      assert(
        r27.status === 201 &&
        data27.data?.preferredRoomId === 1 &&
        data27.data?.preferredRoomNumber === 'A101',
        'Test 27: Save preferredRoomId & preferredRoomNumber when registering for compliant building (201)'
      );

      // 28. Cancel own registration sets status to 4 and updates counts.cancelled
      const newRegId = data27.data.id;
      const r28 = await fetch(`${BASE_URL}/registrations/${newRegId}/cancel`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${ducToken}` }
      });
      const data28 = await r28.json();
      const adminList = await fetch(`${BASE_URL}/registrations`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      }).then(r => r.json());

      assert(
        r28.status === 200 &&
        data28.success === true &&
        adminList.data?.counts?.cancelled >= 1,
        'Test 28: Student cancels own registration (status 4) and counts.cancelled is tracked (200)'
      );

      // Clean up test registration for student and restore registrations & contract
      await Registration.deleteMany({ studentId: testStudentId });
      if (backupRegistrations.length > 0) {
        for (const r of backupRegistrations) {
          delete r._id;
          await Registration.create(r);
        }
      }
      if (backupContracts.length > 0) {
        for (const c of backupContracts) {
          delete c._id;
          await Contract.create(c);
        }
      }
      if (backupStudent) {
        await Student.updateOne({ id: testStudentId }, { $set: { isStaying: backupStudent.isStaying } });
      }

      // 29. Admin getRegistrations populates studentClassName
      const regList = await fetch(`${BASE_URL}/registrations`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      }).then(r => r.json());
      const firstWithClass = regList.data?.items?.find(i => i.studentClassName);
      assert(
        firstWithClass && firstWithClass.studentClassName.length > 0,
        'Test 29: Admin getRegistrations populates studentClassName'
      );

      // 30. Overdue invoice filtering and synchronization
      const overdueList = await fetch(`${BASE_URL}/invoices?status=4`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      }).then(r => r.json());
      assert(
        overdueList.success === true && overdueList.data?.items?.some(i => i.invoiceCode === 'INV-202609-0002'),
        'Test 30: syncOverdueInvoices automatically flags and filters overdue invoices (status 4)'
      );

      // 31. Room floor capping validation (Floor > Building numberOfFloors returns 400)
      const r31 = await fetch(`${BASE_URL}/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          roomNumber: 'D901',
          buildingId: 4, // Tòa D has 8 floors
          floor: 9,
          roomType: '4 người',
          monthlyPrice: 650000
        })
      });
      assert(
        r31.status === 400,
        'Test 31: Reject room creation when floor exceeds building max floors (400)'
      );

      // 32. Bank Accounts API (Admin and Student can read active bank accounts)
      const adminBankRes = await fetch(`${BASE_URL}/bank-accounts`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      }).then(r => r.json());

      const studentBankRes = await fetch(`${BASE_URL}/bank-accounts`, {
        headers: { 'Authorization': `Bearer ${ducToken}` }
      }).then(r => r.json());

      assert(
        adminBankRes.success === true &&
        Array.isArray(adminBankRes.data) &&
        adminBankRes.data.length >= 1 &&
        studentBankRes.success === true &&
        Array.isArray(studentBankRes.data),
        'Test 32: Bank Accounts API provides accounts to admin and students with default account'
      );

      // 33. Bank Accounts Security (Student cannot create/modify bank accounts -> 403)
      const r33 = await fetch(`${BASE_URL}/bank-accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ducToken}`
        },
        body: JSON.stringify({
          bankCode: 'TCB',
          bankName: 'Techcombank',
          accountNumber: '19033333333333',
          accountName: 'HACKER'
        })
      });
      assert(
        r33.status === 403,
        'Test 33: Unauthorized role (Student) cannot create or update bank accounts (403)'
      );

      // 34. IDOR on violation payment: Student cannot pay another student's violation (403)
      // Violation 1 belongs to student 4
      const r34 = await fetch(`${BASE_URL}/violations/1/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ducToken}`
        },
        body: JSON.stringify({ transactionCode: 'HACK001' })
      });
      assert(
        r34.status === 403,
        "Test 34: IDOR protection: Student cannot pay another student's violation (403)"
      );

      // 35. Student can pay own violation online (POST /api/violations/:id/pay -> 200, status 3)
      const { Violation } = await import('./models/Violation.js');
      await Violation.deleteOne({ id: 9999 });
      await Payment.deleteMany({ transactionCode: 'TESTPAY999' });
      await Violation.create({
        id: 9999,
        studentId: testStudentId,
        title: 'Test violation pay',
        description: 'Testing violation payment',
        penaltyAmount: 50000,
        status: 1
      });

      const r35 = await fetch(`${BASE_URL}/violations/9999/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ducToken}`
        },
        body: JSON.stringify({ transactionCode: 'TESTPAY999' })
      });
      const data35 = await r35.json();

      assert(
        r35.status === 200 &&
        data35.success === true &&
        data35.data?.status === 3,
        'Test 35: Student successfully pays violation fine online via VietQR (status 3)'
      );

      await Violation.deleteOne({ id: 9999 });
      await Payment.deleteMany({ transactionCode: 'TESTPAY999' });

      // 38. Reject contract creation for room under maintenance (status 3) (400)
      const r38 = await fetch(`${BASE_URL}/contracts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          studentId: testStudentId,
          roomId: 8, // Room C101 (status 3: maintenance)
          bedId: 1,
          startDate: '2026-11-15',
          endDate: '2027-05-15',
          monthlyRent: 1200000
        })
      });
      assert(r38.status === 400, 'Test 38: Reject contract creation for room under maintenance (status 3) (400)');
    } else {
      assert(false, 'Test 26 & 27: Student login for duc failed');
    }

    console.log(`\n========================================`);
    console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================`);
  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    server.close();
    await mongoose.disconnect();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
