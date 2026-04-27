import { ArrowLeft, Shield, Eye, User, Clock, FileText } from "lucide-react";
import { Link } from "react-router";
import { PatientBottomNav } from "../components/PatientBottomNav";

export function PrivacyLogs() {
  const accessLogs = [
    {
      provider: "Dr. Maria Cruz",
      providerId: "NCHO-PROV-2024-089",
      reason: "Patient Consultation",
      action: "Viewed medical records and added new clinical encounter",
      timestamp: "April 10, 2026 at 2:45 PM",
      duration: "12 minutes",
    },
    {
      provider: "Dr. Maria Cruz",
      providerId: "NCHO-PROV-2024-089",
      reason: "Lab Results Upload",
      action: "Uploaded Complete Blood Count (CBC) and Lipid Profile results",
      timestamp: "April 10, 2026 at 3:02 PM",
      duration: "5 minutes",
    },
    {
      provider: "Dr. Juan Santos",
      providerId: "NCHO-PROV-2023-045",
      reason: "Patient Consultation",
      action: "Viewed medical history, updated vital signs, modified prescription",
      timestamp: "March 28, 2026 at 10:15 AM",
      duration: "18 minutes",
    },
    {
      provider: "Nurse Rodriguez",
      providerId: "NCHO-NURSE-2025-123",
      reason: "Vital Signs Recording",
      action: "Recorded blood pressure and weight measurements",
      timestamp: "March 28, 2026 at 10:00 AM",
      duration: "3 minutes",
    },
    {
      provider: "Dr. Ana Reyes",
      providerId: "NCHO-PROV-2022-012",
      reason: "Annual Physical Examination",
      action: "Conducted full physical exam, reviewed all medical history",
      timestamp: "February 15, 2026 at 9:30 AM",
      duration: "45 minutes",
    },
    {
      provider: "Lab Technician Mendoza",
      providerId: "NCHO-LAB-2024-067",
      reason: "Lab Results Upload",
      action: "Uploaded Fasting Blood Sugar test results",
      timestamp: "February 14, 2026 at 4:20 PM",
      duration: "2 minutes",
    },
  ];

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
                You have the right to review these logs anytime and report any unauthorized access.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-4">
            <p className="text-sm text-gray-600 mb-1">Total Access Events</p>
            <p className="text-3xl font-bold text-gray-900">{accessLogs.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <p className="text-sm text-gray-600 mb-1">Last 30 Days</p>
            <p className="text-3xl font-bold text-gray-900">{accessLogs.length}</p>
          </div>
        </div>

        {/* Access History Timeline */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Access History</h2>

          <div className="space-y-4">
            {accessLogs.map((log, index) => (
              <div key={index} className="relative pl-8 pb-6 border-l-2 border-gray-200 last:border-l-0 last:pb-0">
                {/* Timeline Dot */}
                <div className="absolute left-[-9px] top-0 w-4 h-4 bg-blue-600 rounded-full border-4 border-white"></div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-gray-600" />
                        <p className="font-bold text-gray-900">{log.provider}</p>
                      </div>
                      <p className="text-sm text-gray-600">ID: {log.providerId}</p>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                      {log.reason}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">{log.action}</p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-200">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{log.timestamp}</span>
                      </div>
                      <span>Duration: {log.duration}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Notice */}
        <div className="mt-6 bg-gray-50 border border-gray-200 p-4 rounded-lg">
          <p className="text-xs text-gray-600 text-center">
            <span className="font-bold">Data Privacy Act Compliance:</span> All access logs are retained for 5 years
            and are available for audit by the National Privacy Commission upon request.
          </p>
        </div>
      </div>

      {/* Bottom Navigation */}
      <PatientBottomNav />
    </div>
  );
}
