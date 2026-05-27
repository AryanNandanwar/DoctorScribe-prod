import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  clearAuth,
  ensureValidAccessToken,
  getStoredUser,
  hasValidSession,
  type StoredUser,
} from "../lib/auth";

type AuthRole = "doctor" | "receptionist";

type UseRequireAuthOptions = {
  requiredRole?: AuthRole;
  wrongRoleRedirect?: string;
  checkIntervalMs?: number;
};

export function useRequireAuth(options: UseRequireAuthOptions = {}) {
  const {
    requiredRole,
    wrongRoleRedirect = "/",
    checkIntervalMs = 30_000,
  } = options;

  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    let cancelled = false;

    const enforceSession = async () => {
      const currentUser = getStoredUser();
      if (!currentUser) {
        clearAuth();
        navigate("/login", { replace: true });
        return false;
      }

      if (requiredRole && currentUser.role !== requiredRole) {
        navigate(wrongRoleRedirect, { replace: true });
        return false;
      }

      if (!hasValidSession(requiredRole)) {
        clearAuth();
        navigate("/login", { replace: true });
        return false;
      }

      const token = await ensureValidAccessToken();
      if (!token) {
        clearAuth();
        navigate("/login", { replace: true });
        return false;
      }

      if (!cancelled) {
        setUser(currentUser);
        setAuthorized(true);
      }
      return true;
    };

    void enforceSession();

    const intervalId = window.setInterval(() => {
      void enforceSession();
    }, checkIntervalMs);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [navigate, requiredRole, wrongRoleRedirect, checkIntervalMs]);

  return { authorized, user };
}
