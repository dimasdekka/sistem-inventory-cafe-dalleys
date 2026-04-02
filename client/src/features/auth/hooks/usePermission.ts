import { useAuthStore } from "@/store";
import { usePermissionsStore } from "@/store/permissions.store";
import type { PermissionKey } from "@/types";

export function usePermission() {
  const user = useAuthStore((s) => s.user);
  const rolePermissions = usePermissionsStore((s) => s.rolePermissions);

  const can = (permission: PermissionKey): boolean => {
    if (!user) return false;
    const perms = rolePermissions[user.role] ?? [];
    return perms.includes(permission);
  };

  const canAny = (...permissions: PermissionKey[]): boolean =>
    permissions.some((p) => can(p));

  const canAll = (...permissions: PermissionKey[]): boolean =>
    permissions.every((p) => can(p));

  return { can, canAny, canAll };
}
