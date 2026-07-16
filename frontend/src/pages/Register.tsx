import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthCard } from "@/components/auth/AuthCard";
import { useAuth } from "@/context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const password = String(values.get("password"));
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/.test(password))
      return setError("Use 8+ characters with upper/lowercase letters, a number, and a special character.");
    if (password !== values.get("confirmPassword"))
      return setError("Passwords do not match.");
    try {
      await register({ name: String(values.get("name")), email: String(values.get("email")), phone: String(values.get("phone")), password });
      navigate("/dashboard");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to create account.");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-72px)] items-center justify-center px-4 md:px-6 py-10 md:py-14">
      <AuthCard title="Create account" description="Start managing your pet's health with VetiCare.">
        <form onSubmit={submit} className="space-y-4">
          {[["Full name", "name", "text"], ["Email", "email", "email"], ["Phone number", "phone", "tel"], ["Password", "password", "password"], ["Confirm password", "confirmPassword", "password"]].map(([label, name, type]) => (
            <label className="block text-sm font-medium" key={name}>
              {label}
              <input name={name} type={type} required pattern={name === "phone" ? "[6-9][0-9]{9}" : undefined} className="mt-2 h-11 w-full rounded-md border border-borderLight bg-background px-3 outline-none focus:ring-1 focus:ring-textPrimary" />
            </label>
          ))}
          <label className="flex gap-2 text-sm text-textSecondary">
            <input type="checkbox" required />I accept the terms and privacy policy.
          </label>
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <button className="h-12 w-full rounded-full bg-textPrimary text-white">Create account</button>
        </form>
        <p className="mt-7 text-center text-sm text-textSecondary">
          Already have an account? <Link className="font-semibold text-textPrimary underline" to="/login">Sign in</Link>
        </p>
      </AuthCard>
    </div>
  );
}