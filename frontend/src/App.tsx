import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Layouts
import { AdminLayout } from './components/layout/AdminLayout';
import { StudentLayout } from './components/layout/StudentLayout';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ProfilePage } from './pages/auth/ProfilePage';

// Admin Pages
import { DashboardPage } from './pages/admin/DashboardPage';
import { StudentsPage } from './pages/admin/StudentsPage';
import { BuildingsPage } from './pages/admin/BuildingsPage';
import { RoomsPage } from './pages/admin/RoomsPage';
import { RegistrationsPage } from './pages/admin/RegistrationsPage';
import { ContractsPage } from './pages/admin/ContractsPage';
import { MeterReadingsPage } from './pages/admin/MeterReadingsPage';
import { InvoicesPage } from './pages/admin/InvoicesPage';
import { PaymentsPage } from './pages/admin/PaymentsPage';
import { ViolationsPage } from './pages/admin/ViolationsPage';
import { RepairsPage } from './pages/admin/RepairsPage';
import { NotificationsPage } from './pages/admin/NotificationsPage';

// Student Pages
import { StudentDashboardPage } from './pages/student/StudentDashboardPage';
import { StudentRoomPage } from './pages/student/StudentRoomPage';
import { StudentRegisterPage } from './pages/student/StudentRegisterPage';
import { StudentContractsPage } from './pages/student/StudentContractsPage';
import { StudentInvoicesPage } from './pages/student/StudentInvoicesPage';
import { StudentRepairsPage } from './pages/student/StudentRepairsPage';
import { StudentViolationsPage } from './pages/student/StudentViolationsPage';
import { StudentNotificationsPage } from './pages/student/StudentNotificationsPage';

const RootRedirect: React.FC = () => {
  const { user, loading, isAdminOrStaff } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (isAdminOrStaff) return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          {/* Admin Protected Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="buildings" element={<BuildingsPage />} />
            <Route path="rooms" element={<RoomsPage />} />
            <Route path="registrations" element={<RegistrationsPage />} />
            <Route path="contracts" element={<ContractsPage />} />
            <Route path="meter-readings" element={<MeterReadingsPage />} />
            <Route path="invoices" element={<InvoicesPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="violations" element={<ViolationsPage />} />
            <Route path="repairs" element={<RepairsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Student Protected Routes */}
          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<Navigate to="/student/dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboardPage />} />
            <Route path="room" element={<StudentRoomPage />} />
            <Route path="register-room" element={<StudentRegisterPage />} />
            <Route path="contracts" element={<StudentContractsPage />} />
            <Route path="invoices" element={<StudentInvoicesPage />} />
            <Route path="repairs" element={<StudentRepairsPage />} />
            <Route path="violations" element={<StudentViolationsPage />} />
            <Route path="notifications" element={<StudentNotificationsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Fallback & Direct Profile Link */}
          <Route path="/profile" element={<RootRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;

