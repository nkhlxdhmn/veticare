import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from '@/layouts/PublicLayout';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import AdminLayout from '@/layouts/AdminLayout';
import { useAuth } from '@/store/AuthContext';
import { Loader2 } from 'lucide-react';

// Lazy imports would be better for code-splitting, but keeping
// static imports to match the existing pattern.
import Landing from '@/pages/Landing';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import Dashboard from '@/pages/Dashboard';
import Pets from '@/pages/pets/Pets';
import PetDetail from '@/pages/pets/PetDetail';
import PredictionFlow from '@/pages/predictions/PredictionFlow';
import MedicalRecords from '@/pages/medical-records/MedicalRecords';
import Vaccinations from '@/pages/vaccinations/Vaccinations';
import Appointments from '@/pages/appointments/Appointments';
import Profile from '@/pages/profile/Profile';
import SettingsPage from '@/pages/settings/Settings';
import Notifications from '@/pages/notifications/Notifications';
import NotFound from '@/pages/errors/NotFound';

import NGODirectory from '@/pages/ngos/NGODirectory';
import NGODetails from '@/pages/ngos/NGODetails';
import RescueRequestForm from '@/pages/ngos/RescueRequestForm';
import ClinicDirectory from '@/pages/clinics/ClinicDirectory';
import ClinicDetails from '@/pages/clinics/ClinicDetails';

/** Redirect to login if not authenticated, show loading while checking. */
function ProtectedRoute({
  children,
  requireAdmin = false,
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
}) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user?.role !== 'super_admin' && user?.role !== 'clinic_admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

/** Redirect to dashboard if already authenticated. */
function GuestOnly({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route
          path="/login"
          element={
            <GuestOnly>
              <Login />
            </GuestOnly>
          }
        />
        <Route
          path="/register"
          element={
            <GuestOnly>
              <Register />
            </GuestOnly>
          }
        />
      </Route>

      {/* Authenticated Routes */}
      <Route
        element={
          <ProtectedRoute>
            <AuthenticatedLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pets" element={<Pets />} />
        <Route path="/pets/:id" element={<PetDetail />} />
        <Route path="/predictions" element={<PredictionFlow />} />
        <Route path="/vaccinations" element={<Vaccinations />} />
        <Route path="/medical-records" element={<MedicalRecords />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/ngos" element={<NGODirectory />} />
        <Route path="/ngos/:id" element={<NGODetails />} />
        <Route path="/rescue-request" element={<RescueRequestForm />} />
        <Route path="/clinics" element={<ClinicDirectory />} />
        <Route path="/clinics/:id" element={<ClinicDetails />} />
      </Route>

      {/* Admin Routes */}
      <Route
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<Dashboard />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
