import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store";
import { usePermissionsStore } from "@/store/permissions.store";
import { ROUTES } from "@/constants";
import type { PermissionKey } from "@/types";

interface RoleGuardProps {
  children: React.ReactNode;
  requiredPermission: PermissionKey;
  fallback?: React.ReactNode;
}

/**
 * Renders children only if the current user has the required permission.
 * Reads from the dynamic permissions store (persisted localStorage).
 * Shows fallback (dashboard redirect by default) otherwise.
 */
export function RoleGuard({
  children,
  requiredPermission,
  fallback,
}: RoleGuardProps) {
  const user = useAuthStore((s) => s.user);
  const rolePermissions = usePermissionsStore((s) => s.rolePermissions);

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  const permissions = rolePermissions[user.role] ?? [];
  if (!permissions.includes(requiredPermission)) {
    if (fallback) return <>{fallback}</>;
    return <Navigate to={ROUTES.DASHBOARD} state={{ error: "403" }} replace />;
  }

  return <>{children}</>;
}
