import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      await login({ email: String(data.get("email")), password: String(data.get("password")) });
      navigate("/dashboard");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to sign in.");
    }
  };

  return (
    <div className="grid min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-72px)] lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gray-100 lg:block">
        <img className="h-full w-full object-cover" src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=85&w=1400" alt="A dog and cat resting together" />
        <div className="absolute inset-x-8 md:inset-x-12 bottom-12 max-w-md text-white">
          <p className="text-3xl md:text-5xl leading-none">Thoughtful care, in one place.</p>
        </div>
      </div>
      <div className="flex items-center justify-center px-4 md:px-6 py-10 md:py-14">
        <AuthCard title="Welcome back" description="Sign in to continue managing your pets.">
          <form onSubmit={submit} className="space-y-5">
            <label className="block text-sm font-medium">
              Email
              <input name="email" type="email" required className="mt-2 h-11 w-full rounded-md border border-borderLight bg-background px-3 outline-none focus:ring-1 focus:ring-textPrimary" />
            </label>
            <label className="block text-sm font-medium">
              Password
              <div className="relative mt-2">
                <input name="password" type={showPassword ? "text" : "password"} required minLength={8} className="h-11 w-full rounded-md border border-borderLight bg-background px-3 pr-10 outline-none focus:ring-1 focus:ring-textPrimary" />
                <button aria-label={showPassword ? "Hide password" : "Show password"} type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-3">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" />Remember me</label>
              <Link className="underline" to="/forgot-password">Forgot password?</Link>
            </div>
            {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
            <button className="h-12 w-full rounded-full bg-textPrimary text-white hover:opacity-90">Sign in</button>
          </form>
          <p className="mt-7 text-center text-sm text-textSecondary">
            New to VetiCare? <Link className="font-semibold text-textPrimary underline" to="/register">Create an account</Link>
          </p>
        </AuthCard>
      </div>
    </div>
  );
}
