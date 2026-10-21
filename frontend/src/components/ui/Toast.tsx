import { useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  type: ToastType;
  message: string;
  onClose: () => void;
}

const config = {
  success: { icon: CheckCircle, bg: "bg-green-50 border-green-200", text: "text-green-800", icon_color: "text-green-500" },
  error: { icon: XCircle, bg: "bg-red-50 border-red-200", text: "text-red-800", icon_color: "text-red-500" },
  warning: { icon: AlertCircle, bg: "bg-amber-50 border-amber-200", text: "text-amber-800", icon_color: "text-amber-500" },
  info: { icon: Info, bg: "bg-sky-50 border-sky-200", text: "text-sky-800", icon_color: "text-sky-500" },
};

export function Toast({ type, message, onClose }: ToastProps) {
  const { icon: Icon, bg, text, icon_color } = config[type];

  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`flex items-start gap-3 px-4 py-3 border rounded-xl shadow-lg max-w-sm ${bg}`}>
      <Icon size={18} className={`shrink-0 mt-0.5 ${icon_color}`} />
      <p className={`text-sm font-medium flex-1 ${text}`}>{message}</p>
      <button onClick={onClose} className="shrink-0 text-slate-400 hover:text-slate-600">
        <X size={16} />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: { id: string; type: ToastType; message: string }[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2">
      {toasts.map((t) => (
        <Toast key={t.id} type={t.type} message={t.message} onClose={() => onClose(t.id)} />
      ))}
    </div>
  );
}
