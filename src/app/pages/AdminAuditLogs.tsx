import { Shield, Search, Filter, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router";
import { useState } from "react";
import { ProviderLayout } from "../components/ProviderLayout";

export function AdminAuditLogs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const auditLogs = [
    {
      timestamp: "Apr 19, 2026, 2:45 PM",
      providerId: "PROV-089",
      providerName: "Dr. Maria Cruz",
      patientId: "NCH-2026-001234",
      patientName: "Maria Santos",
      action: "Viewed Medical Record",
      details: "Accessed patient health passport via QR code scan",
    },
    {
      timestamp: "Apr 19, 2026, 2:30 PM",
      providerId: "PROV-089",
      providerName: "Dr. Maria Cruz",
      patientId: "NCH-2026-001235",
      patientName: "Juan Dela Cruz",
      action: "Uploaded Lab Result",
      details: "Complete Blood Count (CBC) uploaded and verified",
    },
    {
      timestamp: "Apr 19, 2026, 1:15 PM",
      providerId: "PROV-045",
      providerName: "Dr. Juan Santos",
      patientId: "NCH-2026-001234",
      patientName: "Maria Santos",
      action: "Encoded Clinical Encounter",
      details: "ITR form completed - Routine hypertension check-up",
    },
    {
      timestamp: "Apr 19, 2026, 11:30 AM",
      providerId: "NURSE-123",
      providerName: "Nurse Rodriguez",
      patientId: "NCH-2026-001236",
      patientName: "Ana Reyes",
      action: "Recorded Vital Signs",
      details: "Blood pressure, heart rate, temperature, and weight",
    },
    {
      timestamp: "Apr 19, 2026, 10:20 AM",
      providerId: "PROV-012",
      providerName: "Dr. Ana Reyes",
      patientId: "NCH-2026-001237",
      patientName: "Pedro Garcia",
      action: "Viewed Medical Record",
      details: "Accessed visit history and lab results",
    },
    {
      timestamp: "Apr 19, 2026, 9:45 AM",
      providerId: "LAB-067",
      providerName: "Lab Tech Mendoza",
      patientId: "NCH-2026-001234",
      patientName: "Maria Santos",
      action: "Uploaded Lab Result",
      details: "Lipid Profile test results uploaded",
    },
    {
      timestamp: "Apr 18, 2026, 4:30 PM",
      providerId: "PROV-089",
      providerName: "Dr. Maria Cruz",
      patientId: "NCH-2026-001238",
      patientName: "Carlos Martinez",
      action: "Encoded Clinical Encounter",
      details: "ITR form completed - Acute upper respiratory infection",
    },
    {
      timestamp: "Apr 18, 2026, 3:15 PM",
      providerId: "ADMIN-001",
      providerName: "System Admin",
      patientId: "NCH-2026-001239",
      patientName: "Lisa Fernandez",
      action: "Account Verified",
      details: "Patient account activated after ID verification",
    },
    {
      timestamp: "Apr 18, 2026, 2:00 PM",
      providerId: "PROV-045",
      providerName: "Dr. Juan Santos",
      patientId: "NCH-2026-001235",
      patientName: "Juan Dela Cruz",
      action: "Viewed Medical Record",
      details: "Accessed patient health passport for follow-up consultation",
    },
    {
      timestamp: "Apr 18, 2026, 11:45 AM",
      providerId: "PROV-012",
      providerName: "Dr. Ana Reyes",
      patientId: "NCH-2026-001240",
      patientName: "Rosa Diaz",
      action: "Uploaded Lab Result",
      details: "Fasting Blood Sugar test results uploaded",
    },
  ];

  const totalPages = Math.ceil(auditLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLogs = auditLogs.slice(startIndex, endIndex);

  return (
    <ProviderLayout>
      <div className="min-h-screen p-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Audit Logs</h1>
            <p className="text-gray-600">Data Privacy Act Compliance Monitor</p>
          </div>
          <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-lg hover:opacity-90 transition flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Logs
          </button>
        </div>
        {/* Controls */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Search Bar */}
            <div className="md:col-span-1">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search logs..."
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                />
                <Search className="absolute right-4 top-3.5 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Date Filter */}
            <div className="md:col-span-1">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {/* Action Filter */}
            <div className="md:col-span-1">
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
              >
                <option value="all">All Actions</option>
                <option value="viewed">Viewed Medical Record</option>
                <option value="uploaded">Uploaded Lab Result</option>
                <option value="encoded">Encoded Clinical Encounter</option>
                <option value="vitals">Recorded Vital Signs</option>
                <option value="verified">Account Verified</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600 mb-1">Total Events</p>
            <p className="text-2xl font-bold text-gray-900">{auditLogs.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600 mb-1">Today</p>
            <p className="text-2xl font-bold text-blue-600">7</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600 mb-1">Active Providers</p>
            <p className="text-2xl font-bold text-teal-500">6</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600 mb-1">Patients Accessed</p>
            <p className="text-2xl font-bold text-gray-900">8</p>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Timestamp</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Provider ID</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Patient ID</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Action Taken</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentLogs.map((log, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-900">{log.timestamp}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{log.providerId}</p>
                        <p className="text-xs text-gray-600">{log.providerName}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{log.patientId}</p>
                        <p className="text-xs text-gray-600">{log.patientName}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, auditLogs.length)} of {auditLogs.length} entries
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg transition ${
                        currentPage === page
                          ? "bg-blue-600 text-white font-bold"
                          : "border-2 border-gray-300 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
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
            <div>
              <p className="text-sm text-blue-900">
                <span className="font-bold">Data Privacy Act Compliance:</span> All system access events are
                permanently logged and cannot be modified or deleted. These logs are available for audit by the
                National Privacy Commission and may be used for investigation of potential privacy violations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ProviderLayout>
  );
}
