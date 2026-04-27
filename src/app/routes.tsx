import { createBrowserRouter } from "react-router";
import { LandingPage } from "./pages/LandingPage";
import { Login } from "./pages/Login";
import { PatientRegistration } from "./pages/PatientRegistration";
import { PatientPassport } from "./pages/PatientPassport";
import { PatientProfile } from "./pages/PatientProfile";
import { ProviderPortal } from "./pages/ProviderPortal";
import { ProviderDashboard } from "./pages/ProviderDashboard";
import { ProviderSchedule } from "./pages/ProviderSchedule";
import { ClinicalView } from "./pages/ClinicalView";
import { DigitalITR } from "./pages/DigitalITR";
import { MedicalRecords } from "./pages/MedicalRecords";
import { PrivacyLogs } from "./pages/PrivacyLogs";
import { MedicalRecordUpload } from "./pages/MedicalRecordUpload";
import { AdminAuditLogs } from "./pages/AdminAuditLogs";
import { TriageVerification } from "./pages/TriageVerification";
import { RegisterNewPatient } from "./pages/RegisterNewPatient";
import { Appointments } from "./pages/Appointments";
import { BookAppointment } from "./pages/BookAppointment";
import { Billing } from "./pages/Billing";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/register",
    Component: PatientRegistration,
  },
  {
    path: "/patient",
    Component: PatientPassport,
  },
  {
    path: "/patient/profile",
    Component: PatientProfile,
  },
  {
    path: "/provider",
    Component: ProviderPortal,
  },
  {
    path: "/dashboard",
    Component: ProviderDashboard,
  },
  {
    path: "/clinical/:patientId",
    Component: ClinicalView,
  },
  {
    path: "/itr",
    Component: DigitalITR,
  },
  {
    path: "/medical-records",
    Component: MedicalRecords,
  },
  {
    path: "/privacy-logs",
    Component: PrivacyLogs,
  },
  {
    path: "/upload",
    Component: MedicalRecordUpload,
  },
  {
    path: "/admin/audit-logs",
    Component: AdminAuditLogs,
  },
  {
    path: "/triage/verification",
    Component: TriageVerification,
  },
  {
    path: "/triage/register",
    Component: RegisterNewPatient,
  },
  {
    path: "/appointments",
    Component: Appointments,
  },
  {
    path: "/appointments/book",
    Component: BookAppointment,
  },
  {
    path: "/billing",
    Component: Billing,
  },
  {
    path: "/provider/schedule",
    Component: ProviderSchedule,
  },
]);
