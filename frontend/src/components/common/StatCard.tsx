import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconBg?: string;
  trend?: {
    value: number | string;
    label?: string;
    isPositive?: boolean;
  };
  color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconBg = 'bg-blue-50',
  trend,
  onClick,
}) => {
  const isPos = trend
    ? typeof trend.value === 'number'
      ? trend.value >= 0
      : trend.isPositive !== undefined
      ? trend.isPositive
      : true
    : true;

  const trendValStr = trend ? (typeof trend.value === 'number' ? `${Math.abs(trend.value)}%` : trend.value) : '';
  const trendLabel = trend?.label || 'so với tháng trước';

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between transition-all ${
        onClick ? 'cursor-pointer hover:shadow-md' : 'hover:shadow-sm'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 truncate">{title}</p>
          <p className="text-2xl font-bold text-slate-800 leading-none">{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-1.5 truncate">{subtitle}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>{icon}</div>
      </div>
      {trend && (
        <div className="flex items-center gap-1 pt-3 mt-1 border-t border-slate-100">
          {isPos ? (
            <TrendingUp size={14} className="text-green-500 shrink-0" />
          ) : (
            <TrendingDown size={14} className="text-red-500 shrink-0" />
          )}
          <span className={`text-xs font-semibold ${isPos ? 'text-green-600' : 'text-red-600'}`}>
            {trendValStr}
          </span>
          <span className="text-xs text-slate-400 truncate">{trendLabel}</span>
        </div>
      )}
    </div>
  );
};
