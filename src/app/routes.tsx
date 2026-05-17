import { createBrowserRouter } from "react-router";
import { LandingPage } from "./pages/LandingPage";
import { Login } from "./pages/Login";
import { PatientRegistration } from "./pages/PatientRegistration";
import { PatientPassport } from "./pages/PatientPassport";
import { PatientProfile } from "./pages/PatientProfile";
import { ProviderPortal } from "./pages/ProviderPortal";
import { ProviderDashboard } from "./pages/ProviderDashboard";
import { ClinicalView } from "./pages/ClinicalView";
import { DigitalITR } from "./pages/DigitalITR";
import { MedicalRecords } from "./pages/MedicalRecords";
import { PrivacyLogs } from "./pages/PrivacyLogs";
import { MedicalRecordUpload } from "./pages/MedicalRecordUpload";
import { AdminAuditLogs } from "./pages/AdminAuditLogs";
import { EncounterWorkspace } from "./pages/EncounterWorkspace";
import { ProviderProfile } from "./pages/ProviderProfile";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicRoute } from "./components/PublicRoute";

export const router = createBrowserRouter([
  // Public routes
  { path: "/", Component: LandingPage },
  {
    element: <PublicRoute />,
    children: [
      { path: "/login", Component: Login },
      { path: "/register", Component: PatientRegistration },
    ]
  },

  // Patient portal (Protected)
  {
    element: <ProtectedRoute allowedRole="patient" />,
    children: [
      { path: "/patient", Component: PatientPassport },
      { path: "/patient/profile", Component: PatientProfile },
      { path: "/medical-records", Component: MedicalRecords },
      { path: "/privacy-logs", Component: PrivacyLogs },
    ]
  },

  // Provider portal (Protected)
  {
    element: <ProtectedRoute allowedRole="provider" />,
    children: [
      { path: "/provider", Component: ProviderPortal },
      { path: "/provider/dashboard", Component: ProviderDashboard },
      { path: "/provider/encounter/:encounterId", Component: EncounterWorkspace },
      { path: "/provider/clinical/:patientId", Component: ClinicalView },
      { path: "/provider/itr", Component: DigitalITR },
      { path: "/provider/upload/:patientId", Component: MedicalRecordUpload },
      { path: "/admin/audit-logs", Component: AdminAuditLogs },
      { path: "/provider/profile", Component: ProviderProfile },
    ]
  }
]);
