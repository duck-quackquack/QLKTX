import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { StudentHeader } from './StudentHeader';
import { StudentFooter } from './StudentFooter';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const StudentLayout: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Đang xác thực thông tin..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <StudentHeader />
      <main className="flex-1 flex flex-col min-w-0 w-full pb-20 sm:pb-0">
        <Outlet />
      </main>
      <StudentFooter />
    </div>
  );
};
