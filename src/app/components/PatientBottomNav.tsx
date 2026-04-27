import { QrCode, FileText, ShieldCheck, User, Calendar } from "lucide-react";
import { Link, useLocation } from "react-router";

export function PatientBottomNav() {
  const location = useLocation();

  const navItems = [
    { path: "/patient", icon: QrCode, label: "Passport" },
    { path: "/appointments", icon: Calendar, label: "Visits" },
    { path: "/medical-records", icon: FileText, label: "Records" },
    { path: "/privacy-logs", icon: ShieldCheck, label: "Privacy" },
    { path: "/patient/profile", icon: User, label: "Profile" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center py-2 px-4 transition ${
                active ? "text-blue-600" : "text-gray-500"
              }`}
            >
              <Icon className={`w-6 h-6 mb-1 ${active ? "text-blue-600" : "text-gray-500"}`} />
              <span className="text-xs font-bold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
