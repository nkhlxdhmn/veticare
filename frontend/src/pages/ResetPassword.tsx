import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AuthCard } from "@/components/auth/AuthCard";
import { authService } from "@/services/auth";
import { Button } from "@/components/ui/button";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password"));
    if (password !== data.get("confirm")) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }
    if (!token) {
      setError("Missing reset token. Use the link from the email.");
      setLoading(false);
      return;
    }
    try {
      await authService.resetPassword(token, password);
      setDone(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-72px)] items-center justify-center px-4 md:px-6 animate-fade-in">
      <AuthCard
        title={done ? "Password updated" : "Reset password"}
        description={done ? "Your password has been updated." : "Choose a new secure password."}
      >
        {done ? (
          <Link className="underline transition-colors duration-200 hover:text-textPrimary" to="/login">Back to login</Link>
        ) : (
          <form className="space-y-5" onSubmit={submit}>
            <input
              name="password"
              required
              minLength={8}
              type="password"
              placeholder="New password"
              className="h-11 w-full rounded-md border border-borderLight bg-background px-3 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-textPrimary/30 focus:border-textPrimary"
            />
            <input
              name="confirm"
              required
              minLength={8}
              type="password"
              placeholder="Confirm password"
              className="h-11 w-full rounded-md border border-borderLight bg-background px-3 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-textPrimary/30 focus:border-textPrimary"
            />
            {error && (
              <p className="text-sm text-red-700 flex items-center gap-2 animate-card-entrance">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                {error}
              </p>
            )}
            <Button type="submit" loading={loading} className="w-full rounded-full h-12">
              Reset password
            </Button>
          </form>
        )}
      </AuthCard>
    </div>
  );
}
