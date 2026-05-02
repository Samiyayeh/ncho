import { UserPlus, Users, Activity, FileText, Search, Clock } from "lucide-react";
import { Link } from "react-router";
import { ProviderLayout } from "../components/ProviderLayout";
import { useEffect, useState } from "react";
import { api } from "../api/client";

export function ProviderDashboard() {
  const [queues, setQueues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Read provider from localStorage
  const userRaw = localStorage.getItem('ncho_user');
  const user = userRaw ? JSON.parse(userRaw) : null;
  const roleType = user?.role_type || 'PHYSICIAN';
  const providerName = user ? `Dr. ${user.last_name || user.first_name}` : 'Provider';

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        // Build query based on role and workflow status
        let query = `/queue/daily?date=${new Date().toISOString().split('T')[0]}`;
        
        if (roleType === 'TRIAGE_NURSE') {
          query += '&status=PENDING_TRIAGE';
        } else if (roleType === 'PHYSICIAN') {
          // Physicians see general medical services
          query += '&status=WAITING_FOR_PROVIDER&serviceType=OUTPATIENT';
        } else if (roleType === 'DENTIST') {
          // Dentists strictly see Dental clinic patients
          query += '&serviceType=DENTAL&status=WAITING_FOR_PROVIDER';
        } else if (roleType === 'PHARMACIST') {
          query += '&status=PHARMACY';
        }
        
        const data = await api.get(query);
        setQueues(data);
      } catch (error) {
        console.error("Failed to fetch queue", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQueue();
    // Poll every 30 seconds for live updates
    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);
  }, [roleType]);

  const filtered = queues.filter((q: any) =>
    `${q.Patient?.first_name} ${q.Patient?.last_name} ${q.queue_number}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PENDING_TRIAGE': return 'bg-orange-100 text-orange-700';
      case 'WAITING_FOR_PROVIDER': return 'bg-blue-100 text-blue-700';
      case 'IN_CONSULTATION': return 'bg-purple-100 text-purple-700';
      case 'PHARMACY': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <ProviderLayout>
      <div className="min-h-screen p-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome, {providerName}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded uppercase">{roleType.replace('_', ' ')}</span>
              <p className="text-gray-600 text-sm">NCHO Clinical Queue Management</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              to="/provider/upload"
              className="px-6 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center gap-2 font-bold"
            >
              <FileText className="w-5 h-5" />
              Upload Lab Results
            </Link>
            <Link
              to="/triage/verification"
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-lg hover:opacity-90 transition flex items-center gap-2 font-bold"
            >
              <UserPlus className="w-5 h-5" />
              Verify New Patient
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-b-4 border-blue-500">
            <p className="text-sm text-gray-600 mb-1">Total in Queue</p>
            <p className="text-3xl font-bold text-gray-900">{loading ? '...' : queues.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-b-4 border-orange-500">
            <p className="text-sm text-gray-600 mb-1">Pending Triage</p>
            <p className="text-3xl font-bold text-orange-600">
              {queues.filter(q => q.status === 'PENDING_TRIAGE').length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-b-4 border-green-500">
            <p className="text-sm text-gray-600 mb-1">Waiting for Consult</p>
            <p className="text-3xl font-bold text-green-600">
              {queues.filter(q => q.status === 'WAITING_FOR_PROVIDER').length}
            </p>
          </div>
        </div>

        {/* Live Queue Table */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900">Live Clinical Queue</h3>
            </div>
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search queue..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-100">
                  <th className="pb-3 text-sm font-bold text-gray-500 uppercase">No.</th>
                  <th className="pb-3 text-sm font-bold text-gray-500 uppercase">Patient Name</th>
                  <th className="pb-3 text-sm font-bold text-gray-500 uppercase">Service</th>
                  <th className="pb-3 text-sm font-bold text-gray-500 uppercase">Status</th>
                  <th className="pb-3 text-sm font-bold text-gray-500 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-500 animate-pulse">Fetching live queue data...</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-500 font-medium">
                      {search ? `No matches found for "${search}".` : 'No patients in the queue for today.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((q: any) => (
                    <tr key={q.queue_id} className="border-b border-gray-50 hover:bg-gray-50 transition group">
                      <td className="py-4 font-black text-blue-600">{q.queue_number}</td>
                      <td className="py-4">
                        <div className="font-bold text-gray-900">{q.Patient?.first_name} {q.Patient?.last_name}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-tighter">{q.patient_id}</div>
                      </td>
                      <td className="py-4">
                        <span className="text-sm font-medium text-gray-700">{q.service_type.replace('_', ' ')}</span>
                      </td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${getStatusColor(q.status)}`}>
                          {q.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <Link
                          to={`/provider/clinical/${q.patient_id}`}
                          className="px-4 py-2 text-blue-600 font-bold hover:underline transition text-sm mr-4"
                        >
                          View Records
                        </Link>
                        <Link
                          to={`/provider/encounter/${q.queue_id}`}
                          className="px-6 py-2 bg-gray-900 text-white font-bold rounded-lg hover:bg-blue-600 transition text-sm shadow-md shadow-gray-200"
                        >
                          {roleType === 'TRIAGE_NURSE' ? 'Start Triage' : 'Consult Patient'}
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
