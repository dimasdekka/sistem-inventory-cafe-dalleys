import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  iconColor = "text-primary-600",
  iconBg = "bg-primary-50",
  trend,
  className,
}: StatsCardProps) {
  return (
    <div className={cn("card p-4 flex items-start gap-3", className)}>
      <div className={cn("p-2.5 rounded-xl flex-shrink-0", iconBg)}>
        <Icon className={cn("w-5 h-5", iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
          {title}
        </p>
        <p className="mt-0.5 text-lg font-bold text-gray-900 leading-tight truncate" title={String(value)}>
          {value}
        </p>
        {trend && (
          <p
            className={cn(
              "mt-1 text-xs",
              trend.positive ? "text-success" : "text-danger",
            )}
          >
            {trend.positive ? "↑" : "↓"} {Math.abs(trend.value)}% {trend.label}
          </p>
        )}
      </div>
    </div>
  );
}
