import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { AppProvider } from "./context/AppContext";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPatientDetailPage from "./pages/AdminPatientDetailPage";
import AdminPatientMonitoringPage from "./pages/AdminPatientMonitoringPage";
import AlertsPage from "./pages/AlertsPage";
import CaregiverDashboard from "./pages/CaregiverDashboard";
import FamilyDashboard from "./pages/FamilyDashboard";
import FamilyPatientMonitoringPage from "./pages/FamilyPatientMonitoringPage";
import GetStartedPage from "./pages/GetStartedPage";
import LoginPage from "./pages/LoginPage";
import NurseDashboard from "./pages/NurseDashboard";
import OnboardingScreen from "./pages/OnboardingScreen";
import PatientDashboard from "./pages/PatientDashboard";
import PatientMonitoringPage from "./pages/PatientMonitoringPage";
import PatientSelfMonitoringPage from "./pages/PatientSelfMonitoringPage";
import ProfilePage from "./pages/ProfilePage";
import RegisterPage from "./pages/RegisterPage";
import SplashScreen from "./pages/SplashScreen";

// ─── Routes ─────────────────────────────────────────────────────────────────

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const splashRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: SplashScreen,
});

const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/onboarding",
  component: OnboardingScreen,
});

const getStartedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/get-started",
  component: GetStartedPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  validateSearch: (search: Record<string, string>) => ({
    role: (search.role as string) || undefined,
  }),
  component: function LoginRouteComponent() {
    const search = loginRoute.useSearch();
    return <LoginPage initialRole={search.role} />;
  },
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  validateSearch: (search: Record<string, string>) => ({
    role: (search.role as string) || undefined,
  }),
  component: function RegisterRouteComponent() {
    const search = registerRoute.useSearch();
    return <RegisterPage initialRole={search.role} />;
  },
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminDashboard,
});

const nurseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/nurse",
  component: NurseDashboard,
});

const patientMonitoringRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/nurse/patient/$id",
  component: PatientMonitoringPage,
});

const adminPatientDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/patient/$id",
  component: AdminPatientDetailPage,
});

const adminPatientMonitoringRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/patient/$id/monitor",
  component: AdminPatientMonitoringPage,
});

const patientRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/patient",
  component: PatientDashboard,
});

const patientSelfMonitoringRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/patient/monitor",
  component: PatientSelfMonitoringPage,
});

const caregiverRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/caregiver",
  component: CaregiverDashboard,
});

const familyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/family",
  component: FamilyDashboard,
});

const familyPatientMonitoringRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/family/patient/$id",
  component: FamilyPatientMonitoringPage,
});

const alertsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/alerts",
  component: AlertsPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: ProfilePage,
});

// ─── Router ──────────────────────────────────────────────────────────────────

const routeTree = rootRoute.addChildren([
  splashRoute,
  onboardingRoute,
  getStartedRoute,
  loginRoute,
  registerRoute,
  adminRoute,
  nurseRoute,
  patientMonitoringRoute,
  adminPatientDetailRoute,
  adminPatientMonitoringRoute,
  patientRoute,
  patientSelfMonitoringRoute,
  caregiverRoute,
  familyRoute,
  familyPatientMonitoringRoute,
  alertsRoute,
  profileRoute,
]);

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </AppProvider>
  );
}
