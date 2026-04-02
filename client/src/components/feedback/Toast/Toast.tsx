import {
  X,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store";
import type { Toast as ToastType, ToastVariant } from "@/store/ui.store";

const iconMap: Record<ToastVariant, React.ElementType> = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const colorMap: Record<ToastVariant, string> = {
  success: "border-l-success text-emerald-700 bg-emerald-50",
  error: "border-l-danger text-red-700 bg-red-50",
  warning: "border-l-warning text-amber-700 bg-amber-50",
  info: "border-l-info text-blue-700 bg-blue-50",
};

const iconColorMap: Record<ToastVariant, string> = {
  success: "text-success",
  error: "text-danger",
  warning: "text-warning",
  info: "text-info",
};

function Toast({ toast }: { toast: ToastType }) {
  const removeToast = useUiStore((s) => s.removeToast);
  const Icon = iconMap[toast.variant];

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl border border-l-4 shadow-md bg-white max-w-sm w-full animate-fade-in",
        colorMap[toast.variant],
      )}
      role="alert"
    >
      <Icon
        className={cn(
          "w-5 h-5 flex-shrink-0 mt-0.5",
          iconColorMap[toast.variant],
        )}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{toast.title}</p>
        {toast.message && (
          <p className="text-xs mt-0.5 opacity-80">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useUiStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 print:hidden toast-container">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

import { useMemo } from "react";

// Hook for easy toast usage
export function useToast() {
  const addToast = useUiStore((s) => s.addToast);

  return useMemo(
    () => ({
      success: (title: string, message?: string) =>
        addToast({ title, message, variant: "success" }),
      error: (title: string, message?: string) =>
        addToast({ title, message, variant: "error" }),
      warning: (title: string, message?: string) =>
        addToast({ title, message, variant: "warning" }),
      info: (title: string, message?: string) =>
        addToast({ title, message, variant: "info" }),
    }),
    [addToast],
  );
}
