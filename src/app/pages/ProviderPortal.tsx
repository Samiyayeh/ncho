import { QrCode, Search, AlertCircle, X } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { ProviderLayout } from "../components/ProviderLayout";
import { QrScanner } from "../components/QrScanner";
import { api } from "../api/client";

export function ProviderPortal() {
  const navigate = useNavigate();
  const [patientId, setPatientId] = useState("");
  const [recentPatients, setRecentPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [scanError, setScanError] = useState("");
  const [lookupError, setLookupError] = useState("");

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const data = await api.get('/provider/directory');
        // Just take the first 5 for "Recent" quick access
        setRecentPatients(data.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch directory", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
  }, []);

  const handleManualLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId.trim()) {
      setLookupError("Please enter a valid Patient ID");
      return;
    }
    // Simple verification - navigate to clinical view. 
    // If it doesn't exist, the clinical view will show a 404.
    navigate(`/provider/clinical/${patientId.trim()}`);
  };

  const handleScanSuccess = async (decodedText: string) => {
    try {
      setShowScanner(false);
      const res = await api.post("/provider/scan-qr", { body: JSON.stringify({ token_string: decodedText }) });
      if (res && res.patient_id) {
        navigate(`/provider/clinical/${res.patient_id}`);
      }
    } catch (error: any) {
      console.error(error);
      setScanError(error.message || "Invalid or expired QR Code");
    }
  };

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
            
            {scanError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm font-bold">
                {scanError}
              </div>
            )}

            {!showScanner ? (
              <>
                <div className="bg-gray-100 rounded-lg p-12 mb-4 flex flex-col items-center justify-center min-h-[300px]">
                  <QrCode className="w-24 h-24 text-gray-400 mb-4" />
                  <p className="text-gray-500 text-center">Position patient's QR code in front of camera</p>
                </div>
                <button 
                  onClick={() => setShowScanner(true)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:opacity-90 transition font-bold"
                >
                  Activate Camera
                </button>
              </>
            ) : (
              <div className="relative">
                <button 
                  onClick={() => setShowScanner(false)} 
                  className="absolute -top-10 right-0 text-gray-500 hover:text-gray-800"
                >
                  <X className="w-6 h-6" />
                </button>
                <QrScanner onScanSuccess={handleScanSuccess} onScanError={() => {}} />
                <p className="text-xs text-center text-gray-500 mt-2">
                  (Note: Camera requires HTTPS or localhost)
                </p>
              </div>
            )}
          </div>

          {/* Manual Entry */}
          <div className="bg-white rounded-xl shadow-md p-8 border-2 border-teal-500">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Manual Entry</h3>
            <form onSubmit={handleManualLookup} className="space-y-4 mb-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2 font-bold">Enter Patient ID</label>
                <div className="relative">
                  <input
                    type="text"
                    value={patientId}
                    onChange={(e) => {
                      setPatientId(e.target.value);
                      setLookupError("");
                    }}
                    placeholder="e.g. NCH-2026-XXXXXX"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none uppercase"
                  />
                  <button type="submit" className="absolute right-2 top-2 p-2 text-gray-400 hover:text-teal-600 transition">
                    <Search className="w-5 h-5" />
                  </button>
                </div>
                {lookupError && <p className="text-red-500 text-sm mt-2">{lookupError}</p>}
              </div>
              <button
                type="submit"
                className="block w-full px-6 py-3 bg-teal-500 text-white rounded-lg text-center hover:bg-teal-600 transition font-bold"
              >
                Access Patient Record
              </button>
            </form>
          </div>
        </div>

        {/* Quick Access List */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Access - Recent Patients</h3>
          <div className="space-y-4">
            {loading ? (
              <p className="text-gray-500 text-center py-4">Loading directory...</p>
            ) : recentPatients.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No patients registered yet.</p>
            ) : (
              recentPatients.map((patient) => (
                <Link
                  key={patient.patient_id}
                  to={`/provider/clinical/${patient.patient_id}`}
                  className="block p-4 border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{patient.first_name} {patient.last_name}</p>
                      <p className="text-sm text-gray-600">Patient ID: {patient.patient_id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Contact: {patient.contact_number || 'N/A'}</p>
                      <p className="text-sm font-bold text-blue-600">{patient.email}</p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="mt-8 bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg">
          <div className="flex gap-3">
            <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-blue-900 mb-1">Privacy Notice</h4>
              <p className="text-sm text-blue-800">
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
