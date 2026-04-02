// Roles & Permission Types
// Diselaraskan dengan backend & Casbin: Owner, Manager, Admin, Staff

export type Role = "Owner" | "Manager" | "Admin" | "Staff";

export type PermissionKey =
  | "products:read"
  | "products:write"
  | "products:delete"
  | "inventory:read"
  | "inventory:write"
  | "inventory:approve"
  | "barcode:scan"
  | "barcode:print"
  | "barcode:generate"
  | "suppliers:read"
  | "suppliers:write"
  | "po:read"
  | "po:create"
  | "po:approve"
  | "po:receive"
  | "reports:basic"
  | "reports:full"
  | "users:read"
  | "users:write"
  | "settings:read"
  | "settings:write"
  | "notifications:all"
  | "notifications:own";

export interface RolePermissions {
  role: Role;
  permissions: PermissionKey[];
}

export const ROLE_LABELS: Record<Role, string> = {
  Owner: "Owner",
  Manager: "Manajer",
  Admin: "Admin",
  Staff: "Staff",
};
