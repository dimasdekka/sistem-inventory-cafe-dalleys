import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROLE_LABELS } from "@/types";
import type { User as UserType } from "@/types";

interface UserAvatarProps {
  user: UserType;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const sizeMap = {
  sm: "w-7 h-7 text-xs",
  md: "w-9 h-9 text-sm",
  lg: "w-12 h-12 text-base",
};

export function UserAvatar({
  user,
  size = "md",
  showLabel = false,
  className,
}: UserAvatarProps) {
  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "rounded-full bg-primary-600 text-white flex items-center justify-center font-semibold flex-shrink-0",
          sizeMap[size],
        )}
      >
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.name}
            className="w-full h-full rounded-full object-cover"
          />
        ) : initials ? (
          initials
        ) : (
          <User className="w-4 h-4" />
        )}
      </div>
      {showLabel && (
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {user.name}
          </p>
          <p className="text-xs text-gray-500">{ROLE_LABELS[user.role]}</p>
        </div>
      )}
    </div>
  );
}
