/**
 * permissions.store.ts
 *
 * Dynamic role permissions store — persisted to localStorage.
 * Default values are the ROLE_PERMISSIONS constants.
 * Owner role is always fully permissioned and cannot be changed.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ROLE_PERMISSIONS } from "@/constants";
import type { PermissionKey, Role } from "@/types";

interface PermissionsStore {
  /** Current effective permissions per role */
  rolePermissions: Record<Role, PermissionKey[]>;

  /** Update all permissions for a specific role */
  updateRolePermissions: (role: Role, permissions: PermissionKey[]) => void;

  /** Reset all roles back to the hardcoded defaults */
  resetToDefaults: () => void;

  /** Check if a role has a given permission */
  hasPermission: (role: Role, permission: PermissionKey) => boolean;
}

const DEFAULT_PERMISSIONS: Record<Role, PermissionKey[]> = {
  Owner: [...ROLE_PERMISSIONS.Owner],
  Manager: [...ROLE_PERMISSIONS.Manager],
  Admin: [...ROLE_PERMISSIONS.Admin],
  Staff: [...ROLE_PERMISSIONS.Staff],
};

export const usePermissionsStore = create<PermissionsStore>()(
  persist(
    (set, get) => ({
      rolePermissions: { ...DEFAULT_PERMISSIONS },

      updateRolePermissions: (role, permissions) => {
        // Owner permissions cannot be changed — always full access
        if (role === "Owner") return;
        set((state) => ({
          rolePermissions: {
            ...state.rolePermissions,
            [role]: permissions,
          },
        }));
      },

      resetToDefaults: () => {
        set({ rolePermissions: { ...DEFAULT_PERMISSIONS } });
      },

      hasPermission: (role, permission) => {
        const perms = get().rolePermissions[role] ?? [];
        return perms.includes(permission);
      },
    }),
    {
      name: "role-permissions-store",
      // Only persist the rolePermissions map
      partialize: (state) => ({ rolePermissions: state.rolePermissions }),
    },
  ),
);
