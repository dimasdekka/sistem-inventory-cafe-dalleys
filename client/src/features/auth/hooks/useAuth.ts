import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store";
import { authService } from "../auth.service";
import { ROUTES } from "@/constants";
import type { LoginPayload } from "../auth.service";

export function useAuth() {
  const {
    user,
    isAuthenticated,
    initialize,
    logout: storeLogout,
  } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (payload: LoginPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const { session, user: loggedUser } = await authService.login(payload);
      initialize(loggedUser, session.token);
      const from =
        (location.state as { from?: Location })?.from?.pathname ??
        ROUTES.DASHBOARD;
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    storeLogout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return { user, isAuthenticated, isLoading, error, login, logout };
}
