import { Link } from "react-router-dom";
import { MailCheck } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";

export default function VerifyEmail() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-72px)] items-center justify-center px-4 md:px-6 animate-fade-in">
      <AuthCard title="Email sent" description="Check your inbox for a verification link. This mock screen does not send email.">
        <div className="flex flex-col items-center gap-4 pt-2 animate-scale-in">
          <MailCheck className="h-12 w-12 text-textPrimary/60" />
          <div className="mt-4 flex justify-between gap-6 text-sm">
            <button className="underline transition-colors duration-200 hover:text-textPrimary">Resend email</button>
            <Link className="underline transition-colors duration-200 hover:text-textPrimary" to="/login">Back to login</Link>
          </div>
        </div>
      </AuthCard>
    </div>
  );
}
