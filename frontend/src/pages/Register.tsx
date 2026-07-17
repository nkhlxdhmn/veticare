import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthCard } from "@/components/auth/AuthCard";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    const values = new FormData(event.currentTarget);
    const password = String(values.get("password"));
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/.test(password)) {
      setError("Use 8+ characters with upper/lowercase letters, a number, and a special character.");
      setLoading(false);
      return;
    }
    if (password !== values.get("confirmPassword")) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }
    try {
      await register({ name: String(values.get("name")), email: String(values.get("email")), phone: String(values.get("phone")), password });
      navigate("/dashboard");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-72px)] items-center justify-center px-4 md:px-6 py-10 md:py-14 animate-fade-in">
      <AuthCard title="Create account" description="Start managing your pet's health with VetiCare.">
        <form onSubmit={submit} className="space-y-4">
          {[
            ["Full name", "name", "text"],
            ["Email", "email", "email"],
            ["Phone number", "phone", "tel"],
            ["Password", "password", "password"],
            ["Confirm password", "confirmPassword", "password"],
          ].map(([label, name, type]) => (
            <label className="block text-sm font-medium" key={name}>
              {label}
              <input
                name={name}
                type={type}
                required
                pattern={name === "phone" ? "[6-9][0-9]{9}" : undefined}
                className="mt-2 h-11 w-full rounded-md border border-borderLight bg-background px-3 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-textPrimary/30 focus:border-textPrimary"
              />
            </label>
          ))}
          <label className="flex gap-2 text-sm text-textSecondary">
            <input type="checkbox" required className="transition-all duration-200" />
            I accept the terms and privacy policy.
          </label>
          {error && (
            <p role="alert" className="text-sm text-red-700 flex items-center gap-2 animate-card-entrance">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
              {error}
            </p>
          )}
          <Button type="submit" loading={loading} className="w-full rounded-full h-12">
            Create account
          </Button>
        </form>
        <p className="mt-7 text-center text-sm text-textSecondary">
          Already have an account?{" "}
          <Link className="font-semibold text-textPrimary underline transition-colors duration-200 hover:opacity-70" to="/login">Sign in</Link>
        </p>
      </AuthCard>
    </div>
  );
}
