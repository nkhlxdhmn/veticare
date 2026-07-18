import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ApiError, setOnUnauthorized } from "@/lib/api";
import { authService, type AuthUser, type LoginInput, type RegisterInput } from "@/services/auth";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function useAuthState() {
  const navigate = useNavigate();
  const hasToken = !!authService.getStoredToken();
  const [user, setUser] = useState<AuthUser | null>(() => authService.getCurrentUser());
  const [loading, setLoading] = useState(hasToken);
  const unauthRef = useRef<(() => void) | null>(null);

  const clearAuth = useCallback(() => {
    authService.clearSession();
    setUser(null);
    setLoading(false);
  }, []);

  const handleUnauthorized = useCallback(() => {
    clearAuth();
    toast.error("Your session has expired. Please sign in again.");
    if (!window.location.pathname.startsWith("/login")) {
      navigate("/login", { replace: true });
    }
  }, [clearAuth, navigate]);

  useEffect(() => {
    unauthRef.current = handleUnauthorized;
  }, [handleUnauthorized]);

  useEffect(() => {
    setOnUnauthorized(() => unauthRef.current?.());
    return () => setOnUnauthorized(null);
  }, []);

  const restoreSession = useCallback(async () => {
    const token = authService.getStoredToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const validUser = await authService.validateSession();
      setUser(validUser);
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        clearAuth();
        toast.error("Your session has expired. Please sign in again.");
        if (!window.location.pathname.startsWith("/login")) {
          navigate("/login", { replace: true });
        }
      }
    } finally {
      setLoading(false);
    }
  }, [clearAuth, navigate]);

  useEffect(() => {
    // Intentional: validates the stored token against the API on mount.
    // This is a genuine external-system sync (auth state), not a local
    // state-mirroring effect — the lint rule's target case doesn't apply here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    restoreSession();
  }, [restoreSession]);

  const login = useCallback(async (input: LoginInput) => {
    setLoading(true);
    try {
      const loggedInUser = await authService.login(input);
      setUser(loggedInUser);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    setLoading(true);
    try {
      const registeredUser = await authService.register(input);
      setUser(registeredUser);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    navigate("/login", { replace: true });
  }, [navigate]);

  const refreshUser = useCallback(async () => {
    try {
      const fresh = await authService.refreshUser();
      setUser(fresh);
    } catch {
      clearAuth();
    }
  }, [clearAuth]);

  return { user, loading, login, register, logout, restoreSession, refreshUser };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, loading, login, register, logout, restoreSession, refreshUser } = useAuthState();

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: !!user && !loading,
      login,
      register,
      logout,
      restoreSession,
      refreshUser,
    }),
    [user, loading, login, register, logout, restoreSession, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
