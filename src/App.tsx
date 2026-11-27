import { AuthBoundary } from "./components/layout/AuthBoundary";
import { LoginPage } from "./pages/LoginPage";
import { Navigate, Route, Routes } from "react-router";
import { AtsLayout } from "./components/layout/AtsLayout";
import Layout from "./components/layout/Layout";
import { Analytics } from "./pages/ats/Analytics";
import { Candidates } from "./pages/ats/Candidates";
import { Home } from "./pages/ats/Home";
import { JobCreate } from "./pages/ats/JobCreate";
import { Jobs } from "./pages/ats/Jobs";
import { Offers } from "./pages/ats/Offers";
import { Progress } from "./pages/ats/Progress";
import { Talent } from "./pages/ats/Talent";
import {
  AttendancePayrollViewRoute,
  CertificatesModuleViewRoute,
  ContractsModuleViewRoute,
  DashboardOverviewRoute,
  EmployeesDirectoryViewRoute,
  LifecycleModuleViewRoute,
  OnboardingModuleViewRoute,
  PerformanceModuleViewRoute,
  SelfServiceModuleViewRoute,
} from "./pages/routes";
export default function App() {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route element={<AuthBoundary />}>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/employees" replace />} />
          <Route path="dashboard" element={<DashboardOverviewRoute />} />
          <Route path="employees" element={<EmployeesDirectoryViewRoute />} />
          <Route path="onboarding" element={<OnboardingModuleViewRoute />} />
          <Route path="contracts" element={<ContractsModuleViewRoute />} />
          <Route path="lifecycle" element={<LifecycleModuleViewRoute />} />
          <Route path="attendance" element={<AttendancePayrollViewRoute />} />
          <Route path="self-service" element={<SelfServiceModuleViewRoute />} />
          <Route path="performance" element={<PerformanceModuleViewRoute />} />
          <Route
            path="certificates"
            element={<CertificatesModuleViewRoute />}
          />
          <Route path="ats" element={<AtsLayout />}>
            <Route path="home" element={<Home />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="progress" element={<Progress />} />
            <Route path="candidates" element={<Candidates />} />
            <Route path="talent" element={<Talent />} />
            <Route path="offers" element={<Offers />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="jobs/new" element={<JobCreate />} />
            <Route index element={<Navigate to="/ats/home" replace />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/employees" replace />} />
    </Routes>
  );
}
