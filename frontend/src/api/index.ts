import axiosClient from './axiosClient';
import {
  ApiResponse,
  PagedResult,
  AuthResponse,
  User,
  Student,
  Building,
  Room,
  Bed,
  Registration,
  Contract,
  MeterReading,
  Invoice,
  Payment,
  BankAccount,
  Violation,
  RepairRequest,
  NotificationItem,
  DashboardStatistics,
} from '../types';

export const authApi = {
  login: (data: any): Promise<ApiResponse<AuthResponse>> => axiosClient.post('/auth/login', data),
  socialLogin: (data: any): Promise<ApiResponse<AuthResponse>> => axiosClient.post('/auth/social-login', data),
  register: (data: any): Promise<ApiResponse<AuthResponse>> => axiosClient.post('/auth/register', data),
  resetPassword: (data: any): Promise<ApiResponse<boolean>> => axiosClient.post('/auth/reset-password', data),
  getMe: (): Promise<ApiResponse<User>> => axiosClient.get('/auth/me'),
  changePassword: (data: any): Promise<ApiResponse<boolean>> => axiosClient.post('/auth/change-password', data),
  updateProfile: (data: any): Promise<ApiResponse<User>> => axiosClient.put('/auth/profile', data),
  verifyPass: (code: string): Promise<ApiResponse<any>> => axiosClient.get(`/auth/verify-pass/${encodeURIComponent(code)}`),
  linkSocial: (data: any): Promise<ApiResponse<any>> => axiosClient.post('/auth/link-social', data),
};

export const studentApi = {
  getAll: (params?: any): Promise<ApiResponse<PagedResult<Student>>> => axiosClient.get('/students', { params }),
  getById: (id: number): Promise<ApiResponse<Student>> => axiosClient.get(`/students/${id}`),
  create: (data: any): Promise<ApiResponse<Student>> => axiosClient.post('/students', data),
  update: (id: number, data: any): Promise<ApiResponse<Student>> => axiosClient.put(`/students/${id}`, data),
  delete: (id: number): Promise<ApiResponse<any>> => axiosClient.delete(`/students/${id}`),
  getActiveStaying: (): Promise<ApiResponse<Student[]>> => axiosClient.get('/students/active-staying'),
  getFaculties: (): Promise<ApiResponse<{ name: string; count: number }[]>> => axiosClient.get('/students/faculties'),
  updateFaculty: (data: { oldName: string; newName: string }): Promise<ApiResponse<any>> => axiosClient.put('/students/faculties', data),
  deleteFaculty: (data: { facultyName: string; transferTo?: string }): Promise<ApiResponse<any>> => axiosClient.delete('/students/faculties', { data }),
};

export const buildingApi = {
  getAll: (): Promise<ApiResponse<Building[]>> => axiosClient.get('/buildings'),
  getById: (id: number): Promise<ApiResponse<Building>> => axiosClient.get(`/buildings/${id}`),
  create: (data: any): Promise<ApiResponse<Building>> => axiosClient.post('/buildings', data),
  update: (id: number, data: any): Promise<ApiResponse<Building>> => axiosClient.put(`/buildings/${id}`, data),
  delete: (id: number): Promise<ApiResponse<any>> => axiosClient.delete(`/buildings/${id}`),
};

export const roomApi = {
  getAll: (params?: any): Promise<ApiResponse<PagedResult<Room>>> => axiosClient.get('/rooms', { params }),
  getByBuilding: (buildingId: number): Promise<ApiResponse<Room[]>> => axiosClient.get(`/rooms/building/${buildingId}`),
  getById: (id: number): Promise<ApiResponse<Room>> => axiosClient.get(`/rooms/${id}`),
  create: (data: any): Promise<ApiResponse<Room>> => axiosClient.post('/rooms', data),
  update: (id: number, data: any): Promise<ApiResponse<Room>> => axiosClient.put(`/rooms/${id}`, data),
  delete: (id: number): Promise<ApiResponse<any>> => axiosClient.delete(`/rooms/${id}`),
  addBed: (roomId: number, bedNumber: string, notes?: string): Promise<ApiResponse<Bed>> =>
    axiosClient.post(`/rooms/${roomId}/beds?bedNumber=${bedNumber}&notes=${notes || ''}`),
  updateBedStatus: (bedId: number, status: number, notes?: string): Promise<ApiResponse<Bed>> =>
    axiosClient.put(`/rooms/beds/${bedId}/status?status=${status}&notes=${notes || ''}`),
  deleteBed: (bedId: number): Promise<ApiResponse<any>> => axiosClient.delete(`/rooms/beds/${bedId}`),
  getAvailableBeds: (buildingId?: number): Promise<ApiResponse<Bed[]>> =>
    axiosClient.get('/rooms/available-beds', { params: { buildingId } }),
};

export const registrationApi = {
  getAll: (params?: any): Promise<ApiResponse<PagedResult<Registration>>> => axiosClient.get('/registrations', { params }),
  getMy: (): Promise<ApiResponse<Registration[]>> => axiosClient.get('/registrations/my'),
  getById: (id: number): Promise<ApiResponse<Registration>> => axiosClient.get(`/registrations/${id}`),
  submit: (data: any): Promise<ApiResponse<Registration>> => axiosClient.post('/registrations', data),
  review: (id: number, data: any): Promise<ApiResponse<Registration>> => axiosClient.put(`/registrations/${id}/review`, data),
  cancel: (id: number): Promise<ApiResponse<boolean>> => axiosClient.put(`/registrations/${id}/cancel`),
};

export const contractApi = {
  getAll: (params?: any): Promise<ApiResponse<PagedResult<Contract>>> => axiosClient.get('/contracts', { params }),
  getById: (id: number): Promise<ApiResponse<Contract>> => axiosClient.get(`/contracts/${id}`),
  getMyActive: (): Promise<ApiResponse<Contract | null>> => axiosClient.get('/contracts/my-active'),
  getMy: (): Promise<ApiResponse<Contract[]>> => axiosClient.get('/contracts/my'),
  create: (data: any): Promise<ApiResponse<Contract>> => axiosClient.post('/contracts', data),
  terminate: (id: number, data: any): Promise<ApiResponse<Contract>> => axiosClient.put(`/contracts/${id}/terminate`, data),
  renew: (id: number, newEndDate: string): Promise<ApiResponse<Contract>> => axiosClient.put(`/contracts/${id}/renew?newEndDate=${newEndDate}`),
};

export const meterReadingApi = {
  getAll: (params?: any): Promise<ApiResponse<PagedResult<MeterReading>>> => axiosClient.get('/meterreadings', { params }),
  getById: (id: number): Promise<ApiResponse<MeterReading>> => axiosClient.get(`/meterreadings/${id}`),
  getPrevious: (roomId: number, currentMonth: number, currentYear: number): Promise<ApiResponse<MeterReading | null>> =>
    axiosClient.get('/meterreadings/previous', { params: { roomId, currentMonth, currentYear } }),
  record: (data: any): Promise<ApiResponse<MeterReading>> => axiosClient.post('/meterreadings', data),
};

export const invoiceApi = {
  getAll: (params?: any): Promise<ApiResponse<PagedResult<Invoice>>> => axiosClient.get('/invoices', { params }),
  getMy: (): Promise<ApiResponse<Invoice[]>> => axiosClient.get('/invoices/my'),
  getById: (id: number): Promise<ApiResponse<Invoice>> => axiosClient.get(`/invoices/${id}`),
  create: (data: any): Promise<ApiResponse<Invoice>> => axiosClient.post('/invoices', data),
  generateMonthly: (data: any): Promise<ApiResponse<number>> => axiosClient.post('/invoices/generate-monthly', data),
  cancel: (id: number, reason?: string): Promise<ApiResponse<boolean>> => axiosClient.put(`/invoices/${id}/cancel`, null, { params: { reason } }),
};

export const paymentApi = {
  getAll: (params?: any): Promise<ApiResponse<PagedResult<Payment>>> => axiosClient.get('/payments', { params }),
  getMy: (): Promise<ApiResponse<Payment[]>> => axiosClient.get('/payments/my'),
  getById: (id: number): Promise<ApiResponse<Payment>> => axiosClient.get(`/payments/${id}`),
  record: (data: any): Promise<ApiResponse<Payment>> => axiosClient.post('/payments', data),
};

export const violationApi = {
  getAll: (params?: any): Promise<ApiResponse<PagedResult<Violation>>> => axiosClient.get('/violations', { params }),
  getMy: (): Promise<ApiResponse<Violation[]>> => axiosClient.get('/violations/my'),
  getById: (id: number): Promise<ApiResponse<Violation>> => axiosClient.get(`/violations/${id}`),
  create: (data: any): Promise<ApiResponse<Violation>> => axiosClient.post('/violations', data),
  updateStatus: (id: number, data: any): Promise<ApiResponse<Violation>> => axiosClient.put(`/violations/${id}/status`, data),
  pay: (id: number, data?: any): Promise<ApiResponse<Violation>> => axiosClient.post(`/violations/${id}/pay`, data),
  delete: (id: number): Promise<ApiResponse<any>> => axiosClient.delete(`/violations/${id}`),
};

export const repairApi = {
  getAll: (params?: any): Promise<ApiResponse<PagedResult<RepairRequest>>> => axiosClient.get('/repairs', { params }),
  getMy: (): Promise<ApiResponse<RepairRequest[]>> => axiosClient.get('/repairs/my'),
  getById: (id: number): Promise<ApiResponse<RepairRequest>> => axiosClient.get(`/repairs/${id}`),
  create: (data: any): Promise<ApiResponse<RepairRequest>> => axiosClient.post('/repairs', data),
  updateStatus: (id: number, data: any): Promise<ApiResponse<RepairRequest>> => axiosClient.put(`/repairs/${id}/status`, data),
  pay: (id: number, data?: any): Promise<ApiResponse<RepairRequest>> => axiosClient.post(`/repairs/${id}/pay`, data),
};

export const notificationApi = {
  getMy: (): Promise<ApiResponse<NotificationItem[]>> => axiosClient.get('/notifications/my'),
  getUnreadCount: (): Promise<ApiResponse<number>> => axiosClient.get('/notifications/unread-count'),
  markRead: (id: number): Promise<ApiResponse<boolean>> => axiosClient.put(`/notifications/${id}/mark-read`),
  markAllRead: (): Promise<ApiResponse<boolean>> => axiosClient.put('/notifications/mark-all-read'),
  create: (data: any): Promise<ApiResponse<NotificationItem>> => axiosClient.post('/notifications', data),
};

export const dashboardApi = {
  getStatistics: (): Promise<ApiResponse<DashboardStatistics>> => axiosClient.get('/dashboard/statistics'),
};

export const bankAccountApi = {
  getAll: (): Promise<ApiResponse<BankAccount[]>> => axiosClient.get('/bank-accounts'),
  getById: (id: number): Promise<ApiResponse<BankAccount>> => axiosClient.get(`/bank-accounts/${id}`),
  create: (data: any): Promise<ApiResponse<BankAccount>> => axiosClient.post('/bank-accounts', data),
  update: (id: number, data: any): Promise<ApiResponse<BankAccount>> => axiosClient.put(`/bank-accounts/${id}`, data),
  setDefault: (id: number): Promise<ApiResponse<BankAccount>> => axiosClient.patch(`/bank-accounts/${id}/default`),
  delete: (id: number): Promise<ApiResponse<any>> => axiosClient.delete(`/bank-accounts/${id}`),
};


