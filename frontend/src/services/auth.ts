export type AuthUser = { id: string; name: string; email: string; phone: string; memberSince: string };
export type LoginInput = { email: string; password: string };
export type RegisterInput = LoginInput & { name: string; phone: string };
const storageKey = "veticare_mock_user";
const fallbackUser: AuthUser = { id: "user-1", name: "John", email: "john@example.com", phone: "+91 98765 43210", memberSince: "July 2026" };
const pause = () => new Promise<void>((resolve) => window.setTimeout(resolve, 350));
export const authService = {
  getCurrentUser: (): AuthUser | null => { const stored = localStorage.getItem(storageKey); return stored ? JSON.parse(stored) as AuthUser : null; },
  async login(input: LoginInput): Promise<AuthUser> { await pause(); if (!input.email || input.password.length < 8) throw new Error("Enter a valid email and password of at least 8 characters."); const user = { ...fallbackUser, email: input.email }; localStorage.setItem(storageKey, JSON.stringify(user)); return user; },
  async register(input: RegisterInput): Promise<AuthUser> { await pause(); const user = { ...fallbackUser, name: input.name, email: input.email, phone: input.phone }; localStorage.setItem(storageKey, JSON.stringify(user)); return user; },
  logout: () => localStorage.removeItem(storageKey),
  async forgotPassword(email: string): Promise<void> { await pause(); if (!email.includes("@")) throw new Error("Enter a valid email address."); },
  async resetPassword(password: string): Promise<void> { await pause(); if (password.length < 8) throw new Error("Password must be at least 8 characters."); },
  async verifyOTP(otp: string): Promise<void> { await pause(); if (!/^\d{6}$/.test(otp)) throw new Error("Enter the six-digit code."); },
};
