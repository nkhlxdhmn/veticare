import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { authService, type AuthUser, type LoginInput, type RegisterInput } from "@/services/auth";
type AuthContextValue = { user: AuthUser | null; login: (input: LoginInput) => Promise<void>; register: (input: RegisterInput) => Promise<void>; logout: () => void };
const AuthContext = createContext<AuthContextValue | undefined>(undefined);
export function AuthProvider({ children }: { children: ReactNode }) { const [user, setUser] = useState<AuthUser | null>(() => authService.getCurrentUser()); const value = useMemo<AuthContextValue>(() => ({ user, login: async (input) => setUser(await authService.login(input)), register: async (input) => setUser(await authService.register(input)), logout: () => { authService.logout(); setUser(null); } }), [user]); return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>; }
export function useAuth() { const context = useContext(AuthContext); if (!context) throw new Error("useAuth must be used within AuthProvider"); return context; }
