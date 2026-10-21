import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const AdminLayout: React.FC = () => {
  const { user, loading, isAdminOrStaff } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Đang xác thực thông tin..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdminOrStaff) {
    return <Navigate to="/student/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role="admin" />
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

