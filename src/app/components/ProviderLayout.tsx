import { Home, Users, UploadCloud, FileText, LogOut, Heart } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router";
import { ReactNode } from "react";

interface ProviderLayoutProps {
  children: ReactNode;
}

export function ProviderLayout({ children }: ProviderLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

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
    { path: "/provider/dashboard", icon: Home, label: "Dashboard" },
    { path: "/provider", icon: Users, label: "Patient Directory" },
    { path: "/provider/upload", icon: UploadCloud, label: "Upload Records" },
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
            <div className="px-2">
              <p className="text-sm font-bold text-white">{providerName}</p>
              <p className="text-xs text-slate-400">Healthcare Provider</p>
            </div>
            <button
              onClick={handleLogout}
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
    </div>
  );
}
