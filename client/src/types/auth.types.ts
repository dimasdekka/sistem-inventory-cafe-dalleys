import type { Role } from "./roles.types";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar_url?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface Session {
  user: User;
  token: string;
  expiresAt: string;
}

export interface Permission {
  key: string;
  label: string;
  description?: string;
}
