import { Shield, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { ProviderLayout } from "../components/ProviderLayout";
import { api } from "../api/client";

export function AdminAuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('ncho_user') || '{}');
        const data = await api.get('/provider/audit-logs');
        
        // If not an admin, only show logs where provider_id matches current user's ID
        if (user.role !== 'ADMIN') {
          const personalLogs = data.filter((l: any) => String(l.provider_id) === String(user.user_id));
          setLogs(personalLogs);
        } else {
          setLogs(data);
        }
      } catch (error) {
        console.error("Failed to fetch audit logs", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const formatTimestamp = (ts: string) =>
    ts ? new Date(ts).toLocaleString('en-PH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';

  const filtered = logs.filter((log: any) => {
    const providerName = log.Provider ? `${log.Provider.first_name} ${log.Provider.last_name}` : '';
    const patientName = log.Patient ? `${log.Patient.first_name} ${log.Patient.last_name}` : '';
    const search = searchQuery.toLowerCase();
    return (
      providerName.toLowerCase().includes(search) ||
      patientName.toLowerCase().includes(search) ||
      (log.provider_id || '').toLowerCase().includes(search) ||
      (log.patient_id || '').toLowerCase().includes(search) ||
      (log.action_taken || '').toLowerCase().includes(search)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentLogs = filtered.slice(startIndex, startIndex + itemsPerPage);

  return (
    <ProviderLayout>
      <div className="min-h-screen p-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {JSON.parse(localStorage.getItem('ncho_user') || '{}').role === 'ADMIN' ? 'System Audit Logs' : 'My Activity Log'}
            </h1>
            <p className="text-gray-600">Your personalized Data Privacy Act compliance trail</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search by provider, patient, or action..."
              className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
            />
            <Search className="absolute right-4 top-3.5 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600 mb-1">Total Events</p>
            <p className="text-2xl font-bold text-gray-900">{loading ? '...' : logs.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600 mb-1">Active Providers</p>
            <p className="text-2xl font-bold text-teal-500">
              {loading ? '...' : new Set(logs.map((l: any) => l.provider_id).filter(Boolean)).size}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600 mb-1">Patients Accessed</p>
            <p className="text-2xl font-bold text-blue-600">
              {loading ? '...' : new Set(logs.map((l: any) => l.patient_id).filter(Boolean)).size}
            </p>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Timestamp</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Provider</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Patient</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Action Taken</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading audit logs from database...</td></tr>
                ) : currentLogs.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No audit logs found.</td></tr>
                ) : (
                  currentLogs.map((log: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{formatTimestamp(log.timestamp)}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-gray-900">
                          {log.Provider ? `Dr. ${log.Provider.last_name}` : log.provider_id || '—'}
                        </p>
                        {log.provider_id && <p className="text-xs text-gray-500">{log.provider_id}</p>}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-gray-900">
                          {log.Patient ? `${log.Patient.first_name} ${log.Patient.last_name}` : '—'}
                        </p>
                        {log.patient_id && <p className="text-xs text-gray-500">{log.patient_id}</p>}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                          {log.action_taken || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{log.ip_address || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {filtered.length === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + itemsPerPage, filtered.length)} of {filtered.length} entries
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}
                  className="px-3 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                  <button key={page} onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg transition ${currentPage === page ? "bg-blue-600 text-white font-bold" : "border-2 border-gray-300 text-gray-700 hover:bg-gray-100"}`}>
                    {page}
                  </button>
                ))}
                <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}
                  className="px-3 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Compliance Notice */}
        <div className="mt-6 bg-blue-50 border-l-4 border-blue-600 p-4 rounded-lg">
          <div className="flex gap-3">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <p className="text-sm text-blue-900">
              <span className="font-bold">Data Privacy Act Compliance:</span> All system access events are permanently logged
              and cannot be modified or deleted. These logs are available for audit by the National Privacy Commission.
            </p>
          </div>
        </div>
      </div>
    </ProviderLayout>
  );
}
