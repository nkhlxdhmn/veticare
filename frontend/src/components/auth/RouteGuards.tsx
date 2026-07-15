import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
export function ProtectedRoute() { return useAuth().user ? <Outlet /> : <Navigate to="/login" replace />; }
export function GuestRoute() { return useAuth().user ? <Navigate to="/dashboard" replace /> : <Outlet />; }
