import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { User } from '@/types';
import { authService } from '@/services/auth.service';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  /** Fetch user profile from /auth/me and hydrate state. */
  const hydrateUser = useCallback(async () => {
    try {
      const profile = await authService.getProfile();
      setUser(profile);
      setIsAuthenticated(true);
    } catch {
      // Token invalid or expired — clear everything
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  /** On mount, check for existing token and validate it. */
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      hydrateUser().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [hydrateUser]);

  /** Login: store both tokens, fetch fresh user profile from API. */
  const login = useCallback(
    async (accessToken: string, refreshToken: string) => {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      await hydrateUser();
    },
    [hydrateUser]
  );

  /** Logout: clear all stored data and reset state. */
  const logout = useCallback(() => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      // Fire-and-forget server-side logout
      authService.logout(refreshToken).catch(() => {});
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  /** Update the local user state (e.g. after profile edit). */
  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, user, login, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
