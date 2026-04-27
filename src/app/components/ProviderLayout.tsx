import { Home, Users, UploadCloud, FileText, LogOut, Heart, Calendar } from "lucide-react";
import { Link, useLocation } from "react-router";
import { ReactNode } from "react";

interface ProviderLayoutProps {
  children: ReactNode;
}

export function ProviderLayout({ children }: ProviderLayoutProps) {
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", icon: Home, label: "Dashboard" },
    { path: "/provider/schedule", icon: Calendar, label: "Schedule" },
    { path: "/provider", icon: Users, label: "Patient Directory" },
    { path: "/upload", icon: UploadCloud, label: "Upload Records" },
    { path: "/admin/audit-logs", icon: FileText, label: "System Logs", adminOnly: true },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-screen">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-teal-400" />
            <div>
              <h1 className="font-bold text-lg">NCHO</h1>
              <p className="text-xs text-slate-400">Clinical Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                      isActive(item.path)
                        ? "bg-blue-600 text-white"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-slate-700">
          <div className="mb-3 px-4 py-2">
            <p className="text-sm font-bold text-white">Dr. R. Villanueva</p>
            <p className="text-xs text-slate-400">Healthcare Provider</p>
          </div>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-red-900 hover:text-white transition">
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        {children}
      </main>
    </div>
  );
}
