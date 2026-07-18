import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><div className="spinner h-8 w-8 text-textPrimary" /></div>;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

export function GuestRoute() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><div className="spinner h-8 w-8 text-textPrimary" /></div>;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
}
