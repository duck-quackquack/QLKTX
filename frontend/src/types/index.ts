export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[];
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export type UserRole = 1 | 2 | 3; // 1: Admin, 2: Staff, 3: Student

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  role: UserRole;
  studentId?: number;
  studentCode?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  expiry: string;
  user: User;
}

export interface Student {
  id: number;
  userId?: number;
  studentCode: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  faculty: string;
  className: string;
  citizenId?: string;
  avatarUrl?: string;
  isStaying: boolean;
  createdAt: string;
  currentBuildingName?: string;
  currentRoomNumber?: string;
  currentBedNumber?: string;
  currentContractId?: number;
}

export interface Building {
  id: number;
  code: string;
  name: string;
  address: string;
  numberOfFloors: number;
  description?: string;
  genderAllowed?: string;
  totalRooms: number;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
}

export interface Bed {
  id: number;
  roomId: number;
  bedNumber: string;
  status: 1 | 2 | 3; // 1: Available, 2: Occupied, 3: Maintenance
  notes?: string;
  studentId?: number;
  studentName?: string;
  studentCode?: string;
  contractId?: number;
}

export interface Room {
  id: number;
  buildingId: number;
  buildingName: string;
  buildingCode: string;
  roomNumber: string;
  floor: number;
  roomType: string;
  capacity: number;
  basePrice: number;
  status: 1 | 2 | 3; // 1: Available, 2: Full, 3: Maintenance
  description?: string;
  genderAllowed?: string;
  occupiedCount: number;
  availableCount: number;
  beds: Bed[];
}

export interface Registration {
  id: number;
  studentId: number;
  studentName: string;
  studentCode: string;
  studentPhone: string;
  studentGender: string;
  studentFaculty: string;
  studentClassName: string;
  preferredBuildingId?: number;
  preferredBuildingName?: string;
  preferredRoomType?: string;
  desiredStartDate: string;
  durationMonths: number;
  reasonOrNote?: string;
  status: 1 | 2 | 3 | 4; // 1: Pending, 2: Approved, 3: Rejected, 4: Cancelled
  adminNote?: string;
  approvedRoomId?: number;
  approvedRoomNumber?: string;
  approvedBedId?: number;
  approvedBedNumber?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface Contract {
  id: number;
  contractNumber: string;
  studentId: number;
  studentName: string;
  studentCode: string;
  studentPhone: string;
  roomId: number;
  roomNumber: string;
  buildingName: string;
  bedId: number;
  bedNumber: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  depositAmount: number;
  status: 1 | 2 | 3 | 4; // 1: Pending, 2: Active, 3: Expired, 4: Terminated
  terms?: string;
  terminatedDate?: string;
  terminationReason?: string;
  createdAt: string;
}

export interface MeterReading {
  id: number;
  roomId: number;
  roomNumber: string;
  buildingName: string;
  month: number;
  year: number;
  electricityOld: number;
  electricityNew: number;
  waterOld: number;
  waterNew: number;
  electricityUnitPrice: number;
  waterUnitPrice: number;
  electricityUsage: number;
  waterUsage: number;
  totalElectricityCost: number;
  totalWaterCost: number;
  recordedDate: string;
  recordedBy?: string;
}

export interface Invoice {
  id: number;
  invoiceCode: string;
  studentId: number;
  studentName: string;
  studentCode: string;
  studentPhone: string;
  contractId: number;
  roomNumber: string;
  buildingName: string;
  month: number;
  year: number;
  roomFee: number;
  electricityFee: number;
  waterFee: number;
  serviceFee: number;
  otherFee: number;
  otherFeeDescription?: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate: string;
  status: 1 | 2 | 3 | 4 | 5; // 1: Unpaid, 2: PartiallyPaid, 3: Paid, 4: Overdue, 5: Cancelled
  notes?: string;
  createdAt: string;
  payments: Payment[];
}

export interface Payment {
  id: number;
  invoiceId: number;
  invoiceCode: string;
  paymentCode: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 1 | 2 | 3 | 4; // 1: Cash, 2: BankTransfer, 3: VNPay, 4: MoMo
  transactionCode?: string;
  status: 1 | 2 | 3; // 1: Pending, 2: Completed, 3: Failed
  notes?: string;
  receivedBy?: string;
}

export interface Violation {
  id: number;
  studentId: number;
  studentName: string;
  studentCode: string;
  studentPhone: string;
  title: string;
  description: string;
  violationType: string;
  penaltyAmount: number;
  violationDate: string;
  status: 1 | 2 | 3 | 4; // 1: Pending, 2: Processed, 3: Paid, 4: Cancelled
  resolutionNotes?: string;
  createdBy?: string;
  createdAt: string;
}

export interface RepairRequest {
  id: number;
  studentId: number;
  studentName: string;
  studentCode: string;
  studentPhone: string;
  roomId: number;
  roomNumber: string;
  buildingName: string;
  title: string;
  description: string;
  imageUrl?: string;
  priority: 1 | 2 | 3 | 4; // 1: Low, 2: Medium, 3: High, 4: Urgent
  status: 1 | 2 | 3 | 4; // 1: Pending, 2: Processing, 3: Completed, 4: Cancelled
  repairCost: number;
  staffNotes?: string;
  completedAt?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: number;
  userId?: number;
  title: string;
  content: string;
  type: 1 | 2 | 3 | 4 | 5 | 6;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface DashboardStatistics {
  totalStudents: number;
  activeStayingStudents: number;
  totalBuildings: number;
  totalRooms: number;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  occupancyRate: number;
  monthlyRevenue: number;
  totalUnpaidAmount: number;
  pendingRegistrations: number;
  pendingRepairs: number;
  pendingViolations: number;
  monthlyRevenues: {
    monthYear: string;
    totalBilled: number;
    totalCollected: number;
  }[];
  buildingOccupancies: {
    buildingCode: string;
    buildingName: string;
    totalBeds: number;
    occupiedBeds: number;
    availableBeds: number;
    rate: number;
  }[];
  recentActivities: {
    title: string;
    description: string;
    type: string;
    time: string;
  }[];
}

