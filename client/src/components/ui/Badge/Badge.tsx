import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "primary";

export interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  size?: "sm" | "md";
  dot?: boolean;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: "bg-success/10 text-emerald-700 border-success/20",
  warning: "bg-warning/10 text-amber-700 border-warning/20",
  danger: "bg-danger/10 text-red-700 border-danger/20",
  info: "bg-info/10 text-blue-700 border-info/20",
  neutral: "bg-gray-100 text-gray-600 border-gray-200",
  primary: "bg-primary-50 text-primary-700 border-primary-100",
};

const dotColors: Record<BadgeVariant, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
  neutral: "bg-gray-400",
  primary: "bg-primary-600",
};

export function Badge({
  variant = "neutral",
  children,
  size = "sm",
  dot = false,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-full border",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        variantClasses[variant],
        className,
      )}
    >
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full flex-shrink-0",
            dotColors[variant],
          )}
        />
      )}
      {children}
    </span>
  );
}

// Stock-specific badge
export type StockStatus = "ok" | "low" | "critical" | "out";

const stockConfig: Record<
  StockStatus,
  { label: string; variant: BadgeVariant }
> = {
  ok: { label: "Cukup", variant: "success" },
  low: { label: "Rendah", variant: "warning" },
  critical: { label: "Kritis", variant: "danger" },
  out: { label: "Habis", variant: "neutral" },
};

export function StatusBadge({ status }: { status: StockStatus }) {
  const config = stockConfig[status];
  return (
    <Badge variant={config.variant} dot>
      {config.label}
    </Badge>
  );
}
