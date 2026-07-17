import { useState } from "react";
import { Link } from "react-router-dom";
import { AuthCard } from "@/components/auth/AuthCard";
import { authService } from "@/services/auth";
import { Button } from "@/components/ui/button";

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await authService.forgotPassword(String(new FormData(event.currentTarget).get("email")));
      setSent(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-72px)] items-center justify-center px-4 md:px-6 animate-fade-in">
      <AuthCard
        title={sent ? "Check your inbox" : "Forgot password?"}
        description={sent ? "If an account exists, a reset link has been sent." : "Enter your email and we'll send a reset link."}
      >
        {sent ? (
          <Link className="underline transition-colors duration-200 hover:text-textPrimary" to="/login">Back to login</Link>
        ) : (
          <form className="space-y-5" onSubmit={submit}>
            <input
              name="email"
              type="email"
              required
              placeholder="name@example.com"
              className="h-11 w-full rounded-md border border-borderLight bg-background px-3 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-textPrimary/30 focus:border-textPrimary"
            />
            {error && (
              <p className="text-sm text-red-700 flex items-center gap-2 animate-card-entrance">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                {error}
              </p>
            )}
            <Button type="submit" loading={loading} className="w-full rounded-full h-12">
              Send reset link
            </Button>
          </form>
        )}
      </AuthCard>
    </div>
  );
}
