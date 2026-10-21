import React from 'react';

export const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Đang tải...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] w-full">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
      </div>
      <p className="mt-3 text-sm font-medium text-slate-500 animate-pulse">{message}</p>
    </div>
  );
};
