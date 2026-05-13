import { Mail, Phone, MapPin, Calendar, ChevronRight, LogOut, Shield, KeyRound, Smartphone, X } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { PatientBottomNav } from "../components/PatientBottomNav";
import { useEffect, useState } from "react";
import { api } from "../api/client";

export function PatientProfile() {
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Password Change State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setChangingPassword(true);
    try {
      await api.post('/patient/password', { currentPassword, newPassword });
      setPasswordSuccess("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess("");
      }, 2000);
    } catch (err: any) {
      setPasswordError(err.message || "Failed to update password.");
    } finally {
      setChangingPassword(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.get('/patient/profile');
        setPatient(data);
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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Loading profile...</div>;
  if (!patient) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Failed to load profile.</div>;

  const initials = `${patient.first_name?.[0] || ''}${patient.last_name?.[0] || ''}`.toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm mb-6 pt-6 pb-4 px-4 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-gray-900 text-center">My Profile</h1>
      </header>

      <div className="max-w-4xl mx-auto px-4">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 flex items-center gap-4 border border-gray-100">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-teal-500 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-inner">
            {initials}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{patient.first_name} {patient.last_name}</h2>
            <p className="text-sm text-blue-600 font-semibold mt-0.5">{patient.patient_id}</p>
          </div>
        </div>

        {/* Details Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Personal Details</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Email Address</p>
                <p className="font-medium text-gray-900">{patient.email}</p>
              </div>
            </div>
            <div className="h-px bg-gray-100" />
            <div className="flex items-center gap-4">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Date of Birth</p>
                <p className="font-medium text-gray-900">
                  {patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : 'Not provided'}
                </p>
              </div>
            </div>
            <div className="h-px bg-gray-100" />
            <div className="flex items-center gap-4">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Contact Number</p>
                <p className="font-medium text-gray-900">{patient.contact_number || 'Not provided'}</p>
              </div>
            </div>
            <div className="h-px bg-gray-100" />
            <div className="flex items-center gap-4">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Address</p>
                <p className="font-medium text-gray-900">{patient.address || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-gray-900" />
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Security</h3>
          </div>
          <div className="space-y-2">
            <button 
              onClick={() => setShowPasswordModal(true)}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <KeyRound className="w-4 h-4" />
                </div>
                <span className="font-medium text-gray-900">Change Password</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Logout Action */}
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 border-2 border-red-500 text-red-600 font-bold rounded-xl hover:bg-red-50 transition shadow-sm"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </button>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900">Change Password</h3>
              </div>
              <button 
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handlePasswordChange} className="p-6">
              {passwordError && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded-lg border border-green-100">
                  {passwordSuccess}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none transition"
                  />
                  <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters long.</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={changingPassword || passwordSuccess !== ""}
                  className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {changingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <PatientBottomNav />
    </div>
  );
}
