import { ArrowLeft, Shield, Eye, User, Clock, FileText } from "lucide-react";
import { Link } from "react-router";
import { PatientBottomNav } from "../components/PatientBottomNav";
import { useState, useEffect } from "react";
import { api } from "../api/client";

export function PrivacyLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
                This transparency protects your privacy and ensures compliance with the Data Privacy Act of 2012.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-4">
            <p className="text-sm text-gray-600 mb-1">Total Access Events</p>
            <p className="text-3xl font-bold text-gray-900">{loading ? '...' : logs.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <p className="text-sm text-gray-600 mb-1">Unique Providers</p>
            <p className="text-3xl font-bold text-gray-900">
              {loading ? '...' : new Set(logs.map((l: any) => l.provider_id).filter(Boolean)).size}
            </p>
          </div>
        </div>

        {/* Access History Timeline */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Access History</h2>

          {loading ? (
            <p className="text-center text-gray-500 py-8">Loading access logs...</p>
          ) : logs.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No access events recorded yet.</p>
          ) : (
            <div className="space-y-4">
              {logs.map((log: any, index: number) => (
                <div key={index} className="relative pl-8 pb-6 border-l-2 border-gray-200 last:border-l-0 last:pb-0">
                  {/* Timeline Dot */}
                  <div className="absolute left-[-9px] top-0 w-4 h-4 bg-blue-600 rounded-full border-4 border-white"></div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-gray-600" />
                          <p className="font-bold text-gray-900">
                            {log.Provider
                              ? `Dr. ${log.Provider.last_name}`
                              : log.provider_id || 'Unknown Provider'}
                          </p>
                        </div>
                        {log.provider_id && (
                          <p className="text-sm text-gray-600">ID: {log.provider_id}</p>
                        )}
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                        {log.action_taken || 'Access'}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {log.endpoint_accessed && (
                        <div className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-700">{log.endpoint_accessed}</p>
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
