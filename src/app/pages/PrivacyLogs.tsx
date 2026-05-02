import { ArrowLeft, Shield, Eye, User, Clock, FileText } from "lucide-react";
import { Link } from "react-router";
import { PatientBottomNav } from "../components/PatientBottomNav";
import { useState, useEffect } from "react";
import { api } from "../api/client";

export function PrivacyLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "patient" | "provider">("all");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await api.get('/patient/privacy-logs');
        setLogs(data);
      } catch (error) {
        console.error("Failed to fetch privacy logs", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const formatTimestamp = (ts: string) =>
    ts ? new Date(ts).toLocaleString('en-PH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';

  const filteredLogs = logs.filter(log => {
    // Date filter
    if (dateFilter) {
      const logDate = new Date(log.timestamp).toISOString().split('T')[0];
      if (logDate !== dateFilter) return false;
    }

    // Tab filter
    if (activeTab === "patient") return !log.Provider;
    if (activeTab === "provider") return !!log.Provider;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm mb-6">
        <div className="px-4 py-4">
          <Link to="/patient" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-bold">Back to Health Passport</span>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-900">Privacy & Access Logs</h1>
          </div>
          <p className="text-sm text-gray-600">Complete transparency of who accessed your health records</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4">
        {/* Info Card */}
        <div className="bg-purple-50 border-l-4 border-purple-600 p-6 rounded-lg mb-6">
          <div className="flex gap-3">
            <Eye className="w-6 h-6 text-purple-600 flex-shrink-0" />
            <div>
              <h2 className="font-bold text-purple-900 mb-2">Your Data, Your Control</h2>
              <p className="text-sm text-purple-800">
                Every access to your health records is automatically logged and cannot be deleted or modified.
              </p>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Filter by Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none"
                />
                {dateFilter && (
                  <button 
                    onClick={() => setDateFilter("")}
                    className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            <div className="flex flex-col justify-end">
              <label className="block text-sm font-bold text-gray-700 mb-2">Log Category</label>
              <div className="flex bg-gray-100 rounded-lg p-1">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'patient', label: 'Your Activity' },
                  { id: 'provider', label: 'Provider Access' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 py-1.5 rounded-md text-sm font-bold transition ${
                      activeTab === tab.id 
                        ? "bg-white text-blue-600 shadow-sm" 
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Access History Timeline */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Access History</h2>
            <span className="text-sm text-gray-500 font-medium">
              Showing {filteredLogs.length} events
            </span>
          </div>

          {loading ? (
            <p className="text-center text-gray-500 py-8">Loading access logs...</p>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No logs found matching your filters.</p>
              {(dateFilter || activeTab !== "all") && (
                <button 
                  onClick={() => { setDateFilter(""); setActiveTab("all"); }}
                  className="mt-4 text-blue-600 font-bold hover:underline"
                >
                  Reset all filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLogs.map((log: any, index: number) => (
                <div key={index} className="relative pl-8 pb-6 border-l-2 border-gray-200 last:border-l-0 last:pb-0">
                  {/* Timeline Dot */}
                  <div className={`absolute left-[-9px] top-0 w-4 h-4 rounded-full border-4 border-white ${log.Provider ? 'bg-blue-600' : 'bg-purple-600'}`}></div>

                  <div className="bg-gray-50 rounded-lg p-4 hover:shadow-sm transition border border-gray-100">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <User className={`w-4 h-4 ${log.Provider ? 'text-blue-600' : 'text-purple-600'}`} />
                          <p className="font-bold text-gray-900">
                            {log.Provider
                              ? `Dr. ${log.Provider.last_name}`
                              : 'You (Patient)'}
                          </p>
                        </div>
                        {log.Provider && (
                          <p className="text-xs text-gray-500 font-medium italic">Authorized Healthcare Provider</p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        log.Provider ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {log.action_taken || 'System Access'}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {log.endpoint_accessed && (
                        <div className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-700">
                            <span className="text-gray-500 italic">Accessed Page:</span>{" "}
                            <span className="font-medium">
                              {(() => {
                                const endpoint = log.endpoint_accessed;
                                if (endpoint.includes('/profile')) return "Personal Health Profile";
                                if (endpoint.includes('/records')) return "Medical Record Vault";
                                if (endpoint.includes('/encounters')) return "Clinical Visit History";
                                if (endpoint.includes('/privacy-logs')) return "Data Transparency Logs";
                                if (endpoint.includes('/scan-qr')) return "QR Verification Checkpoint";
                                if (endpoint.includes('/verify-patient')) return "Physical ID Verification";
                                if (endpoint.includes('/encounter')) return "Clinical Treatment Record (Digital ITR)";
                                if (endpoint.includes('/medical-records/upload')) return "Document Attachment Upload";
                                return "NCHO System Module";
                              })()}
                            </span>
                          </p>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-200">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatTimestamp(log.timestamp)}</span>
                        </div>
                        {log.ip_address && <span>IP: {log.ip_address}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Notice */}
        <div className="mt-6 bg-gray-50 border border-gray-200 p-4 rounded-lg">
          <p className="text-xs text-gray-600 text-center">
            <span className="font-bold">Data Privacy Act Compliance:</span> All access logs are retained for 5 years
            and are available for audit by the National Privacy Commission upon request.
          </p>
        </div>
      </div>

      <PatientBottomNav />
    </div>
  );
}
