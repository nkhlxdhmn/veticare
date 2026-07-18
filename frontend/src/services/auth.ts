import { api, ApiError } from "@/lib/api";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  memberSince: string;
};

export type LoginInput = { email: string; password: string };
export type RegisterInput = LoginInput & { name: string; phone: string };
export type ProfileResponse = {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
};
export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
};

function mapProfile(user: ProfileResponse): AuthUser {
  return {
    id: user.id,
    name: user.full_name,
    email: user.email,
    phone: user.phone ?? "",
    memberSince: user.created_at.slice(0, 7),
  };
}

function storeToken(res: TokenResponse): void {
  try {
    localStorage.setItem("veticare_token", JSON.stringify({ access_token: res.access_token, refresh_token: res.refresh_token }));
  } catch {
    console.warn("Failed to store auth token");
  }
}

export const authService = {
  getStoredToken(): string | null {
    try {
      const raw = localStorage.getItem("veticare_token");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.access_token ?? null;
    } catch {
      return null;
    }
  },

  getCurrentUser(): AuthUser | null {
    try {
      const stored = localStorage.getItem("veticare_user");
      return stored ? (JSON.parse(stored) as AuthUser) : null;
    } catch {
      return null;
    }
  },

  async validateSession(): Promise<AuthUser> {
    const profile = await api.get<ProfileResponse>("/auth/me");
    const mapped = mapProfile(profile);
    try { localStorage.setItem("veticare_user", JSON.stringify(mapped)); } catch { console.warn("Failed to store user data"); }
    return mapped;
  },

  clearSession(): void {
    try { localStorage.removeItem("veticare_token"); } catch {}
    try { localStorage.removeItem("veticare_user"); } catch {}
  },

  async login(input: LoginInput): Promise<AuthUser> {
    const token = await api.post<TokenResponse>("/auth/login", {
      email: input.email,
      password: input.password,
    });
    storeToken(token);
    const user = await api.get<ProfileResponse>("/auth/me");
    const mapped = mapProfile(user);
    try { localStorage.setItem("veticare_user", JSON.stringify(mapped)); } catch { console.warn("Failed to store user data"); }
    return mapped;
  },

  async register(input: RegisterInput): Promise<AuthUser> {
    const token = await api.post<TokenResponse>("/auth/register", {
      email: input.email,
      password: input.password,
      full_name: input.name,
      phone: input.phone || null,
    });
    storeToken(token);
    const user = await api.get<ProfileResponse>("/auth/me");
    const mapped = mapProfile(user);
    try { localStorage.setItem("veticare_user", JSON.stringify(mapped)); } catch { console.warn("Failed to store user data"); }
    return mapped;
  },

  async logout(): Promise<void> {
    try {
      await api.post("/auth/logout");
    } catch {
    }
    this.clearSession();
  },

  async refreshUser(): Promise<AuthUser> {
    const profile = await api.get<ProfileResponse>("/auth/me");
    const mapped = mapProfile(profile);
    try { localStorage.setItem("veticare_user", JSON.stringify(mapped)); } catch { console.warn("Failed to store user data"); }
    return mapped;
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post("/auth/forgot-password", { email });
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await api.post("/auth/reset-password", { token, new_password: newPassword });
  },

  async verifyOTP(email: string, otp: string): Promise<void> {
    await api.post("/auth/verify-otp", { email, otp });
  },
};
