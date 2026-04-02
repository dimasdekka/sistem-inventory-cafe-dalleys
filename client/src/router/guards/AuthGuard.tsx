import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store";
import { ROUTES } from "@/constants";

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Redirects to /login if not authenticated.
 * Saves the intended path in location state for post-login redirect.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
