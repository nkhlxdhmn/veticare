import { useState } from "react";
import { Link } from "react-router-dom";
import { MailCheck, Loader2 } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";

export default function VerifyEmail() {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleResend = async () => {
    setResending(true);
    try {
      const { api } = await import("@/lib/api");
      await api.post("/auth/resend-verification");
      setResent(true);
    } catch {
      setResent(false);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-72px)] items-center justify-center px-4 md:px-6 animate-fade-in">
      <AuthCard title="Email sent" description="Check your inbox for a verification link.">
        <div className="flex flex-col items-center gap-4 pt-2 animate-scale-in">
          <MailCheck className="h-12 w-12 text-textPrimary/60" />
          {resent && (
            <p className="text-sm text-green-600">Verification email resent.</p>
          )}
          <div className="mt-4 flex justify-between gap-6 text-sm">
            {resending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <button
                onClick={handleResend}
                className="underline transition-colors duration-200 hover:text-textPrimary"
              >
                Resend email
              </button>
            )}
            <Link className="underline transition-colors duration-200 hover:text-textPrimary" to="/login">Back to login</Link>
          </div>
        </div>
      </AuthCard>
    </div>
  );
}
