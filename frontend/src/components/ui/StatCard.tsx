import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconBg: string;
  trend?: { value: number; label: string };
  onClick?: () => void;
}

export function StatCard({ title, value, subtitle, icon, iconBg, trend, onClick }: StatCardProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-3 ${onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{title}</p>
          <p className="text-2xl font-bold text-slate-800 leading-none">{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>{icon}</div>
      </div>
      {trend && (
        <div className="flex items-center gap-1 pt-2 border-t border-slate-100">
          {trend.value >= 0 ? <TrendingUp size={14} className="text-green-500" /> : <TrendingDown size={14} className="text-red-500" />}
          <span className={`text-xs font-medium ${trend.value >= 0 ? "text-green-600" : "text-red-600"}`}>{Math.abs(trend.value)}%</span>
          <span className="text-xs text-slate-400">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
