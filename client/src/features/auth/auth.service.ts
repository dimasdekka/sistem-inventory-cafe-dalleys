// Real authentication using Axios client
import type { User, Session } from "@/types";
import { apiClient } from "@/lib/api-client";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  session: Session;
  user: User;
}

export interface BackendAuthResponse {
  success: boolean;
  message: string;
  data: {
    access_token: string;
    refresh_token: string;
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      avatar_url?: string;
      created_at: string;
    };
  };
}

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    try {
      const { data: res } = await apiClient.post<BackendAuthResponse>(
        "/auth/login",
        payload,
      );

      const { access_token, user } = res.data;

      const mappedUser: User = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as any,
        avatar_url: user.avatar_url,
        isActive: true,
        createdAt: user.created_at,
        updatedAt: user.created_at,
      };

      const session: Session = {
        user: mappedUser,
        token: access_token,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      };

      return { session, user: mappedUser };
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error("Email atau password salah");
    }
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post("/auth/logout", { refresh_token: "" });
    } catch (e) {
      console.error("Logout error", e);
    }
  },

  getProfile: async (): Promise<User> => {
    try {
      const { data: res } = await apiClient.get<{ data: any }>("/auth/me");
      const user = res.data;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as any,
        avatar_url: user.avatar_url,
        isActive: true,
        createdAt: user.created_at,
        updatedAt: user.created_at,
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Get profile failed");
    }
  },

  changePassword: async (payload: {
    old_password: string;
    new_password: string;
  }) => {
    await apiClient.post("/auth/change-password", payload);
  },

  uploadAvatar: async (file: File): Promise<void> => {
    const formData = new FormData();
    formData.append("avatar", file);
    await apiClient.post("/auth/me/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
