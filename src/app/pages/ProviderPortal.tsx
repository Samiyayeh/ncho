import { QrCode, Search, AlertCircle } from "lucide-react";
import { Link } from "react-router";
import { useState } from "react";
import { ProviderLayout } from "../components/ProviderLayout";

export function ProviderPortal() {
  const [patientId, setPatientId] = useState("");

  const mockPatients = [
    { id: "NCH-2026-001234", name: "Maria Santos", dob: "March 15, 1985", bloodType: "O+" },
    { id: "NCH-2026-001235", name: "Juan Dela Cruz", dob: "June 22, 1978", bloodType: "A+" },
    { id: "NCH-2026-001236", name: "Ana Reyes", dob: "December 8, 1992", bloodType: "B+" },
  ];

  return (
    <ProviderLayout>
      <div className="min-h-screen p-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Patient Directory</h1>
          <p className="text-gray-600">Scan patient's QR code or enter Patient ID</p>
        </div>

        {/* Main Access Methods */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* QR Scanner */}
          <div className="bg-white rounded-xl shadow-md p-8 border-2 border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Scan QR Code</h3>
            <div className="bg-gray-100 rounded-lg p-12 mb-4 flex flex-col items-center justify-center min-h-[300px]">
              <QrCode className="w-24 h-24 text-gray-400 mb-4" />
              <p className="text-gray-500 text-center">Position patient's QR code in front of camera</p>
            </div>
            <button className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:opacity-90 transition">
              Activate Camera
            </button>
          </div>

          {/* Manual Entry */}
          <div className="bg-white rounded-xl shadow-md p-8 border-2 border-teal-500">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Manual Entry</h3>
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Enter Patient ID</label>
                <div className="relative">
                  <input
                    type="text"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    placeholder="NCH-2026-XXXXXX"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none"
                  />
                  <Search className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
            <Link
              to="/clinical/NCH-2026-001234"
              className="block w-full px-6 py-3 bg-teal-500 text-white rounded-lg text-center hover:bg-teal-600 transition"
            >
              Access Patient Record
            </Link>
          </div>
        </div>

        {/* Quick Access List */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Access - Recent Patients</h3>
          <div className="space-y-4">
            {mockPatients.map((patient) => (
              <Link
                key={patient.id}
                to={`/clinical/${patient.id}`}
                className="block p-4 border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{patient.name}</p>
                    <p className="text-sm text-gray-600">Patient ID: {patient.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">DOB: {patient.dob}</p>
                    <p className="text-sm font-bold text-red-600">Blood Type: {patient.bloodType}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
          <div className="flex gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-yellow-900 mb-1">Privacy Notice</h4>
              <p className="text-sm text-yellow-800">
                All patient record access is automatically logged and audited in compliance with the Data Privacy Act of 2012.
                Unauthorized access or disclosure of patient information may result in legal penalties.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ProviderLayout>
  );
}
