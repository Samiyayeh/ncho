import { Home, Users, UploadCloud, FileText, LogOut, Heart, Activity, PieChart, X, AlertCircle, User } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { ReactNode } from "react";

interface ProviderLayoutProps {
  children: ReactNode;
}

export function ProviderLayout({ children }: ProviderLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Read logged-in provider info from localStorage
  const userRaw = localStorage.getItem('ncho_user');
  const user = userRaw ? JSON.parse(userRaw) : null;
  const providerName = user ? `Dr. ${user.last_name || user.first_name}` : 'Provider';

  const handleLogout = () => {
    localStorage.removeItem('ncho_token');
    localStorage.removeItem('ncho_user');
    navigate('/login');
  };

  const navItems = [
    { path: "/provider/dashboard", icon: Activity, label: "Dashboard" },
    { path: "/provider", icon: Users, label: "Patient Directory" },
    { 
      path: "/admin/audit-logs", 
      icon: FileText, 
      label: user?.role === 'ADMIN' ? "System Audit Logs" : "My Activity Log" 
    },
  ];

  const isActive = (path: string) => {
    if (path === "/provider") {
      return location.pathname === "/provider" || location.pathname.startsWith("/provider/clinical");
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

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
          <div className="flex flex-col gap-3">
            <Link to="/provider/profile" className="px-2 block hover:opacity-80 transition group">
              <p className="text-sm font-bold text-white group-hover:text-blue-400 transition">{providerName}</p>
              <p className="text-xs text-slate-400">Healthcare Provider</p>
            </Link>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition font-medium"
            >
              <LogOut className="w-5 h-5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        {children}
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowLogoutConfirm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Logout</h3>
              <p className="text-gray-600 text-sm mb-6">
                Are you sure you want to log out? Any unsaved changes in your current workspace may be lost.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-200"
                >
                  Yes, Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
