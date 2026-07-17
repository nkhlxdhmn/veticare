import { lazy, Suspense } from "react";
import { createBrowserRouter, Outlet, RouterProvider, useLocation } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { AuthProvider } from "@/context/AuthContext";
import { GuestRoute, ProtectedRoute } from "@/components/auth/RouteGuards";
import { SkeletonCard } from "@/components/ui/skeleton";
const Home = lazy(() => import("@/pages/Home")); const Animals = lazy(() => import("@/pages/Animals")); const AnimalDetails = lazy(() => import("@/pages/AnimalDetails")); const DiseasePrediction = lazy(() => import("@/pages/DiseasePrediction")); const PetRecords = lazy(() => import("@/pages/PetRecords")); const PetDetails = lazy(() => import("@/pages/PetDetails")); const Vaccinations = lazy(() => import("@/pages/Vaccinations")); const CareGuide = lazy(() => import("@/pages/CareGuide")); const NearbyServices = lazy(() => import("@/pages/NearbyServices")); const About = lazy(() => import("@/pages/About")); const Login = lazy(() => import("@/pages/Login")); const Register = lazy(() => import("@/pages/Register")); const ForgotPassword = lazy(() => import("@/pages/ForgotPassword")); const ResetPassword = lazy(() => import("@/pages/ResetPassword")); const VerifyEmail = lazy(() => import("@/pages/VerifyEmail")); const VerifyOTP = lazy(() => import("@/pages/VerifyOTP")); const Profile = lazy(() => import("@/pages/Profile")); const Settings = lazy(() => import("@/pages/Settings")); const Dashboard = lazy(() => import("@/pages/Dashboard")); const Privacy = lazy(() => import("@/pages/Privacy")); const Terms = lazy(() => import("@/pages/Terms")); const Contact = lazy(() => import("@/pages/Contact")); const FAQ = lazy(() => import("@/pages/FAQ")); const NotFound = lazy(() => import("@/pages/NotFound"));

function PageFallback() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 md:px-6 lg:px-12 xl:px-24 py-10 md:py-16 animate-fade-in">
      <div className="space-y-4">
        <SkeletonCard className="max-w-sm" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="rounded-xl border border-borderLight p-5 space-y-4">
              <div className="skeleton-shimmer h-5 w-5 rounded" />
              <div className="skeleton-shimmer h-8 w-16 rounded" />
              <div className="skeleton-shimmer h-4 w-24 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AnimatedOutlet() {
  const location = useLocation();
  return (
    <div key={location.pathname} className="animate-fade-in">
      <Outlet />
    </div>
  );
}

function RootLayout() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-textPrimary">
      <ScrollToTop />
      <Navbar />
      <main className="mt-[72px] flex-1">
        <Suspense fallback={<PageFallback />}>
          <AnimatedOutlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

const router = createBrowserRouter([{ path: "/", element: <RootLayout />, children: [{ index: true, element: <Home /> }, { path: "about", element: <About /> }, { path: "privacy", element: <Privacy /> }, { path: "terms", element: <Terms /> }, { path: "contact", element: <Contact /> }, { path: "faq", element: <FAQ /> }, { element: <GuestRoute />, children: [{ path: "login", element: <Login /> }, { path: "register", element: <Register /> }, { path: "forgot-password", element: <ForgotPassword /> }, { path: "reset-password", element: <ResetPassword /> }, { path: "verify-email", element: <VerifyEmail /> }, { path: "verify-otp", element: <VerifyOTP /> }] }, { element: <ProtectedRoute />, children: [{ path: "dashboard", element: <Dashboard /> }, { path: "profile", element: <Profile /> }, { path: "settings", element: <Settings /> }, { path: "animals", element: <Animals /> }, { path: "animals/:id", element: <AnimalDetails /> }, { path: "predictions", element: <DiseasePrediction /> }, { path: "pets", element: <PetRecords /> }, { path: "pets/:id", element: <PetDetails /> }, { path: "vaccinations", element: <Vaccinations /> }, { path: "care-guide", element: <CareGuide /> }, { path: "nearby", element: <NearbyServices /> }] }, { path: "*", element: <NotFound /> }] }]);

export default function App() {
  return <AuthProvider><RouterProvider router={router} /></AuthProvider>;
}
