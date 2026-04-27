import { UserPlus, Users, Activity, FileText, Clock, Shield, Calendar } from "lucide-react";
import { Link } from "react-router";
import { ProviderLayout } from "../components/ProviderLayout";

export function ProviderDashboard() {
  const activeQRSessions = [
    { patient: "Maria Santos", tokenId: "QR-2026-7891", expiresIn: "42m" },
    { patient: "Juan Dela Cruz", tokenId: "QR-2026-7892", expiresIn: "38m" },
    { patient: "Ana Reyes", tokenId: "QR-2026-7893", expiresIn: "15m" },
  ];

  const todaysAppointments = [
    { id: "APT-2026-042", patient: "Carlos Mendoza", time: "09:00 AM", type: "Follow-up", status: "Waiting", color: "orange" },
    { id: "APT-2026-043", patient: "Maria Santos", time: "10:30 AM", type: "New Consultation", status: "Confirmed", color: "blue" },
    { id: "APT-2026-044", patient: "Elena Cruz", time: "01:00 PM", type: "Check-up", status: "Confirmed", color: "blue" },
  ];

  return (
    <ProviderLayout>
      <div className="min-h-screen p-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome, Dr. Villanueva</h1>
            <p className="text-gray-600">NCHO Clinical Dashboard</p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/triage/verification"
              className="px-6 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition flex items-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Verify Patient
            </Link>
            <Link
              to="/triage/register"
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-lg hover:opacity-90 transition flex items-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Register New Patient
            </Link>
          </div>
        </div>
        {/* Stats Row */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">1,247</p>
            </div>
            <p className="text-gray-600">Total Patients Registered</p>
            <p className="text-sm text-green-600 mt-2">+23 this week</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-teal-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">42</p>
            </div>
            <p className="text-gray-600">Consultations Today</p>
            <p className="text-sm text-gray-500 mt-2">As of {new Date().toLocaleTimeString()}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">8</p>
            </div>
            <p className="text-gray-600">Pending Uploads</p>
            <p className="text-sm text-orange-600 mt-2">Requires attention</p>
          </div>
        </div>

        {/* Analytics Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Weekly Patient Visits</h3>
            <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-lg h-64 flex items-center justify-center">
              <div className="text-center">
                <Activity className="w-16 h-16 text-blue-400 mx-auto mb-2" />
                <p className="text-gray-500">[Line Chart Placeholder - Weekly Patient Visits]</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Common Diagnoses</h3>
            <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-lg h-64 flex items-center justify-center">
              <div className="text-center">
                <FileText className="w-16 h-16 text-teal-400 mx-auto mb-2" />
                <p className="text-gray-500">[Bar Chart Placeholder - Common Diagnoses]</p>
              </div>
            </div>
          </div>
        </div>

        {/* Appointments & QR Sessions Row */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          
          {/* Today's Appointments */}
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-6 h-6 text-teal-600" />
                <h3 className="text-xl font-bold text-gray-900">Today's Bookings</h3>
              </div>
              <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-bold">
                {todaysAppointments.length} Total
              </span>
            </div>

            <div className="space-y-3 flex-1">
              {todaysAppointments.map((apt, index) => (
                <div key={index} className={`flex items-center justify-between p-4 bg-gray-50 rounded-lg border-l-4 border-${apt.color}-500`}>
                  <div>
                    <p className="font-bold text-gray-900">{apt.patient}</p>
                    <p className="text-sm text-gray-600">{apt.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{apt.time}</p>
                    <span className={`text-xs font-bold text-${apt.color}-600`}>{apt.status}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-100">
              <Link to="/provider/schedule" className="w-full block text-center py-2 border-2 border-teal-600 text-teal-600 rounded-lg font-bold hover:bg-teal-50 transition">
                View Full Schedule
              </Link>
            </div>
          </div>

          {/* Active QR Sessions */}
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Active QR Access</h3>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                {activeQRSessions.length} Active
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Temporary access tokens granted via QR code scan. All sessions automatically expire for DPA compliance.
            </p>

            <div className="space-y-3 flex-1">
              {activeQRSessions.map((session, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-l-4 border-blue-600">
                  <div>
                    <p className="font-bold text-gray-900">{session.patient}</p>
                    <p className="text-sm text-gray-600">Token ID: {session.tokenId}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1 mb-1">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <span className="text-xs font-bold text-orange-600">
                        {session.expiresIn}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-100">
              <button className="w-full py-2 border-2 border-blue-600 text-blue-600 rounded-lg font-bold hover:bg-blue-50 transition">
                View All Sessions
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </ProviderLayout>
  );
}
