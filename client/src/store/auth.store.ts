import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";
import { setAuthHeader } from "@/lib/api-client";

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  initialize: (user: User, token: string) => void;
  fetchProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setUser: (user) => set({ user }),

      setToken: (token) => {
        setAuthHeader(token);
        set({
          token,
          isAuthenticated: !!token && !!get().user,
        });
      },

      initialize: (user, token) => {
        setAuthHeader(token);
        set({ user, token, isAuthenticated: true });
      },

      logout: () => {
        setAuthHeader(null);
        set({ user: null, token: null, isAuthenticated: false });
      },

      fetchProfile: async () => {
        try {
          // avoid circular dependency by lazy/dynamic import if needed,
          // or assume it's imported at the top
          const { authService } = await import("@/features/auth/auth.service");
          const user = await authService.getProfile();
          set({ user });
        } catch (error) {
          console.error("Failed to fetch profile", error);
        }
      },
    }),
    {
      name: "auth-store",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          setAuthHeader(state.token);
        }
      },
    },
  ),
);
