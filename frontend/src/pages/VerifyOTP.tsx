import { useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthCard } from "@/components/auth/AuthCard";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function VerifyOTP() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

  const update = (index: number, value: string) => {
    const digit = value.slice(-1).replace(/\D/g, "");
    setDigits((current) => current.map((item, itemIndex) => itemIndex === index ? digit : item));
    if (digit && index < 5) refs.current[index + 1]?.focus();
  };

  const verify = async () => {
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/verify-otp", { email, otp: digits.join("") });
      navigate("/login");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not verify code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-72px)] items-center justify-center px-4 md:px-6 animate-fade-in">
      <AuthCard title="Verify code" description="Enter the six-digit code sent to your email.">
        <div className="flex justify-between gap-2">
          {digits.map((digit, index) => (
            <input
              aria-label={`OTP digit ${index + 1}`}
              ref={(element) => { refs.current[index] = element; }}
              value={digit}
              onChange={(event) => update(index, event.target.value)}
              inputMode="numeric"
              maxLength={1}
              className="h-11 w-10 rounded-md border border-borderLight text-center text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-textPrimary/30 focus:border-textPrimary"
              key={index}
            />
          ))}
        </div>
        <p className="mt-4 text-sm text-textSecondary">Enter the code from your email to activate your account.</p>
        {error && (
          <p className="mt-3 text-sm text-red-700 flex items-center gap-2 animate-card-entrance">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
            {error}
          </p>
        )}
        <Button onClick={verify} loading={loading} className="mt-6 w-full rounded-full h-12">
          Verify
        </Button>
      </AuthCard>
    </div>
  );
}
