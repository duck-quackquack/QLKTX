type BadgeVariant = "success" | "warning" | "danger" | "info" | "default" | "primary" | "purple";

const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-green-50 text-green-700 border border-green-200",
  warning: "bg-amber-50 text-amber-700 border border-amber-200",
  danger: "bg-red-50 text-red-700 border border-red-200",
  info: "bg-sky-50 text-sky-700 border border-sky-200",
  primary: "bg-blue-50 text-blue-700 border border-blue-200",
  default: "bg-slate-100 text-slate-600 border border-slate-200",
  purple: "bg-purple-50 text-purple-700 border border-purple-200",
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}

export function statusBadge(status: string) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    active: { label: "Hoạt động", variant: "success" },
    inactive: { label: "Không hoạt động", variant: "default" },
    pending: { label: "Chờ duyệt", variant: "warning" },
    approved: { label: "Đã duyệt", variant: "success" },
    rejected: { label: "Từ chối", variant: "danger" },
    cancelled: { label: "Đã hủy", variant: "default" },
    paid: { label: "Đã thanh toán", variant: "success" },
    unpaid: { label: "Chưa thanh toán", variant: "danger" },
    partial: { label: "Một phần", variant: "warning" },
    overdue: { label: "Quá hạn", variant: "purple" },
    available: { label: "Còn chỗ", variant: "success" },
    full: { label: "Đầy", variant: "info" },
    maintenance: { label: "Bảo trì", variant: "warning" },
    processing: { label: "Đang xử lý", variant: "info" },
    received: { label: "Đã tiếp nhận", variant: "primary" },
    completed: { label: "Hoàn thành", variant: "success" },
    resolved: { label: "Đã xử lý", variant: "success" },
    expired: { label: "Hết hạn", variant: "default" },
    terminated: { label: "Đã chấm dứt", variant: "danger" },
    low: { label: "Thấp", variant: "default" },
    normal: { label: "Bình thường", variant: "info" },
    high: { label: "Cao", variant: "warning" },
    urgent: { label: "Khẩn cấp", variant: "danger" },
  };
  const item = map[status] || { label: status, variant: "default" as BadgeVariant };
  return <Badge variant={item.variant}>{item.label}</Badge>;
}
