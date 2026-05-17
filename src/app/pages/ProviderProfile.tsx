import { Mail, Phone, Shield, KeyRound, Stethoscope, CreditCard, Award, User, LogOut, ChevronRight, X, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router";
import { ProviderLayout } from "../components/ProviderLayout";
import { useEffect, useState } from "react";
import { api } from "../api/client";

export function ProviderProfile() {
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.get('/provider/profile');
        setProvider(data);
      } catch (error) {
        console.error("Failed to fetch profile", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('ncho_token');
    localStorage.removeItem('ncho_user');
    navigate('/login');
  };

  if (loading) {
    return (
      <ProviderLayout>
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
            <p className="font-bold text-slate-500">Loading your profile...</p>
          </div>
        </div>
      </ProviderLayout>
    );
  }

  if (!provider) {
    return (
      <ProviderLayout>
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-red-600 font-bold">
          Failed to load profile.
        </div>
      </ProviderLayout>
    );
  }

  const initials = `${provider.first_name?.[0] || ''}${provider.last_name?.[0] || ''}`.toUpperCase();
  const formatRole = (role: string) => {
    if (!role) return 'Healthcare Provider';
    return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };

  return (
    <ProviderLayout>
      <div className="min-h-screen p-8 bg-slate-50/50">
        
        {/* ── Page Header ─────────────────────────────────────────────── */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Profile</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your provider credentials, contact details, and security settings.</p>
        </div>

        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* ── Breathtaking Banner Profile Card ────────────────────────── */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 relative overflow-hidden transition-all duration-300 hover:shadow-md">
            {/* Header backdrop gradient */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-500/5 via-indigo-500/5 to-transparent pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                {/* Large glowing initials badge */}
                <div className="w-28 h-28 bg-gradient-to-tr from-blue-600 via-indigo-600 to-indigo-700 rounded-3xl flex items-center justify-center text-white text-4xl font-black shadow-lg shadow-blue-500/20 transform hover:rotate-2 transition duration-300">
                  {initials}
                </div>
                
                <div className="flex-1 mt-2">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                      {provider.first_name} {provider.last_name}
                    </h2>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active Provider
                    </span>
                  </div>
                  
                  <p className="text-base font-bold text-slate-500 mt-1">
                    {provider.specialty || 'General Practitioner'}
                  </p>
                  
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-4">
                    <span className="px-3.5 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-xl border border-blue-100 shadow-sm">
                      Role: {formatRole(provider.role_type)}
                    </span>
                    <span className="px-3.5 py-1.5 bg-slate-100 text-slate-600 text-xs font-mono font-bold rounded-xl border border-slate-200 shadow-sm">
                      ID: {provider.provider_id}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Main Details Grid ───────────────────────────────────────── */}
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Professional Credentials Card (occupies 2 columns on desktop) */}
            <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 p-8 transition-all duration-300 hover:shadow-md">
              <div className="flex items-center gap-2.5 mb-8 pb-4 border-b border-slate-50">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Professional Credentials</h3>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-8">
                
                <div className="flex gap-4 p-4 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition duration-300">
                  <div className="p-3 bg-white text-blue-600 rounded-xl shadow-sm h-fit">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">PRC License Number</p>
                    <p className="font-extrabold text-slate-900 text-base mt-1 font-mono tracking-wider">
                      {provider.prc_license_number || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition duration-300">
                  <div className="p-3 bg-white text-teal-600 rounded-xl shadow-sm h-fit">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Clinical Specialty</p>
                    <p className="font-extrabold text-slate-900 text-base mt-1">
                      {provider.specialty || 'General Practitioner'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition duration-300">
                  <div className="p-3 bg-white text-indigo-600 rounded-xl shadow-sm h-fit">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Scope of Practice</p>
                    <p className="font-extrabold text-slate-900 text-base mt-1">
                      {formatRole(provider.role_type)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition duration-300">
                  <div className="p-3 bg-white text-amber-600 rounded-xl shadow-sm h-fit">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Issuing Authority</p>
                    <p className="font-extrabold text-slate-900 text-base mt-1">
                      Professional Regulation Commission
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Sidebar Column: Account Details & Security */}
            <div className="lg:col-span-1 space-y-8">
              
              {/* Contact & Account Details Card */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 transition-all duration-300 hover:shadow-md">
                <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-50">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <Mail className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Contact Information</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-slate-50 text-slate-500 rounded-lg">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Email Address</p>
                      <p className="font-bold text-slate-900 mt-0.5 truncate text-sm">
                        {provider.email || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-slate-50 text-slate-500 rounded-lg">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Contact Number</p>
                      <p className="font-bold text-slate-900 mt-0.5 text-sm">
                        {provider.contact_number || 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Actions */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 transition-all duration-300 hover:shadow-md">
                <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-50">
                  <div className="p-2 bg-red-50 text-red-600 rounded-xl">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Account Actions</h3>
                </div>
                
                <button 
                  onClick={() => setShowLogoutModal(true)}
                  className="w-full flex items-center justify-center gap-3 p-4 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 rounded-2xl font-bold transition duration-300 shadow-sm group"
                >
                  <LogOut className="w-5 h-5 text-red-600 group-hover:text-white transition" />
                  <span>Sign Out</span>
                </button>
              </div>

            </div>

          </div>

        </div>

        {/* Logout Modal */}
        {showLogoutModal && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowLogoutModal(false)} />
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <LogOut className="w-10 h-10 text-red-600" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-3">Signing Out?</h3>
                <p className="text-gray-600 mb-8 font-medium text-sm">
                  Are you sure you want to sign out of the NCHO Clinical Portal?
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleLogout}
                    className="w-full py-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition shadow-lg shadow-red-200"
                  >
                    Yes, Log Out
                  </button>
                  <button
                    onClick={() => setShowLogoutModal(false)}
                    className="w-full py-4 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition"
                  >
                    Stay Logged In
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </ProviderLayout>
  );
}
