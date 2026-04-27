import { UserPlus, Users, Activity, FileText, Clock, Shield, Calendar, Search } from "lucide-react";
import { Link } from "react-router";
import { ProviderLayout } from "../components/ProviderLayout";
import { useEffect, useState } from "react";
import { api } from "../api/client";

export function ProviderDashboard() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await api.get('/provider/directory');
        setPatients(data);
      } catch (error) {
        console.error("Failed to fetch directory", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

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
              <p className="text-3xl font-bold text-gray-900">{loading ? '...' : patients.length}</p>
            </div>
            <p className="text-gray-600">Total Patients Registered</p>
            <p className="text-sm text-green-600 mt-2">Active in directory</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-teal-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">Live</p>
            </div>
            <p className="text-gray-600">System Status</p>
            <p className="text-sm text-gray-500 mt-2">Backend API Connected</p>
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

        {/* Patient Directory Table */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Patient Directory</h3>
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search patients..." 
                className="pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-100">
                  <th className="pb-3 text-sm font-bold text-gray-500">Patient ID</th>
                  <th className="pb-3 text-sm font-bold text-gray-500">Name</th>
                  <th className="pb-3 text-sm font-bold text-gray-500">Email</th>
                  <th className="pb-3 text-sm font-bold text-gray-500">Contact</th>
                  <th className="pb-3 text-sm font-bold text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">Loading patients from database...</td>
                  </tr>
                ) : patients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">No patients registered yet.</td>
                  </tr>
                ) : (
                  patients.map((patient: any) => (
                    <tr key={patient.patient_id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                      <td className="py-4 text-sm font-bold text-blue-600">{patient.patient_id}</td>
                      <td className="py-4 font-medium text-gray-900">{patient.first_name} {patient.last_name}</td>
                      <td className="py-4 text-sm text-gray-600">{patient.email}</td>
                      <td className="py-4 text-sm text-gray-600">{patient.contact_number || '-'}</td>
                      <td className="py-4 text-right">
                        <Link 
                          to={`/provider/clinical/${patient.patient_id}`}
                          className="px-4 py-2 bg-teal-50 text-teal-700 font-bold rounded-lg hover:bg-teal-100 transition text-sm"
                        >
                          Open File
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ProviderLayout>
  );
}
