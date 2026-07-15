import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import AdminLayout from '../layouts/AdminLayout';
import { useAuth } from '../store/AuthContext';

import Landing from '../pages/Landing';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Dashboard from '../pages/Dashboard';
import Pets from '../pages/pets/Pets';
import PredictionFlow from '../pages/predictions/PredictionFlow';

// Stub pages
const Placeholder = ({ title }: { title: string }) => (
  <div className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed shadow-sm p-12">
    <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
    <p className="text-muted-foreground mt-2">This page is under construction.</p>
  </div>
);

const ProtectedRoute = ({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<Placeholder title="About Us" />} />
        <Route path="/contact" element={<Placeholder title="Contact" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Authenticated Routes */}
      <Route element={<ProtectedRoute><AuthenticatedLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pets" element={<Pets />} />
        <Route path="/pets/new" element={<Placeholder title="Add Pet" />} />
        <Route path="/pets/:id" element={<Placeholder title="Pet Details" />} />
        <Route path="/predictions" element={<PredictionFlow />} />
        <Route path="/vaccinations" element={<Placeholder title="Vaccinations" />} />
        <Route path="/medical-records" element={<Placeholder title="Medical Records" />} />
        <Route path="/profile" element={<Placeholder title="Profile" />} />
        <Route path="/settings" element={<Placeholder title="Settings" />} />
      </Route>

      {/* Admin Routes */}
      <Route element={<ProtectedRoute requireAdmin={true}><AdminLayout /></ProtectedRoute>}>
        <Route path="/admin" element={<Placeholder title="Admin Dashboard" />} />
        <Route path="/admin/users" element={<Placeholder title="Manage Users" />} />
        <Route path="/admin/roles" element={<Placeholder title="Manage Roles" />} />
        <Route path="/admin/predictions" element={<Placeholder title="Admin Predictions" />} />
        <Route path="/admin/audit" element={<Placeholder title="Audit Logs" />} />
        <Route path="/admin/metrics" element={<Placeholder title="System Metrics" />} />
        <Route path="/admin/notifications" element={<Placeholder title="System Notifications" />} />
      </Route>
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
