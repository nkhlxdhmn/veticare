import { useState } from "react";
import { Link } from "react-router-dom";
import { AuthCard } from "@/components/auth/AuthCard";
import { authService } from "@/services/auth";

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await authService.forgotPassword(String(new FormData(event.currentTarget).get("email")));
      setSent(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to send reset link.");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-72px)] items-center justify-center px-4 md:px-6">
      <AuthCard
        title={sent ? "Check your inbox" : "Forgot password?"}
        description={sent ? "If an account exists, a reset link has been sent." : "Enter your email and we'll send a reset link."}
      >
        {sent ? (
          <Link className="underline" to="/login">Back to login</Link>
        ) : (
          <form className="space-y-5" onSubmit={submit}>
            <input name="email" type="email" required placeholder="name@example.com" className="h-11 w-full rounded-md border border-borderLight px-3" />
            {error && <p className="text-sm text-red-700">{error}</p>}
            <button className="h-12 w-full rounded-full bg-textPrimary text-white">Send reset link</button>
          </form>
        )}
      </AuthCard>
    </div>
  );
}