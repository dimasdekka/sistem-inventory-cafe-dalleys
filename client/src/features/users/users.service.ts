import { apiClient } from "@/lib/api-client";
import { User } from "@/types";

export interface CreateUserRequest {
  email: string;
  password?: string;
  name: string;
  role: string;
}

export interface UpdateUserRequest {
  email?: string;
  password?: string;
  name?: string;
  role?: string;
  is_active?: boolean;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  detail: string;
  created_at: string;
}

export const usersService = {
  getUsers: async (): Promise<User[]> => {
    const response = await apiClient.get<{ message: string; data: any[] }>(
      "/users",
    );
    // map the backend is_active to frontend isActive
    return response.data.data.map((u) => ({
      ...u,
      isActive: u.is_active,
    }));
  },

  getUserById: async (id: string): Promise<User> => {
    const response = await apiClient.get<{ message: string; data: any }>(
      `/users/${id}`,
    );
    const u = response.data.data;
    return { ...u, isActive: u.is_active };
  },

  createUser: async (data: CreateUserRequest): Promise<void> => {
    await apiClient.post("/users", data);
  },

  updateUser: async (id: string, data: UpdateUserRequest): Promise<void> => {
    await apiClient.put(`/users/${id}`, data);
  },

  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  getActivityLogs: async (limit: number = 50): Promise<ActivityLog[]> => {
    const response = await apiClient.get<{
      message: string;
      data: ActivityLog[];
    }>(`/activity-logs?limit=${limit}`);
    return response.data.data || [];
  },
};
