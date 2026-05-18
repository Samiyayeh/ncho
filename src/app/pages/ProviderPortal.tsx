import { QrCode, Search, AlertCircle, X, ChevronLeft, ChevronRight } from "lucide-react";
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
  
  // Pagination & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Debounced directory fetch
  useEffect(() => {
    const fetchDirectory = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/provider/directory?page=${currentPage}&limit=5&search=${encodeURIComponent(searchQuery)}`);
        setRecentPatients(res.data);
        setTotalPages(res.totalPages);
      } catch (error) {
        console.error("Failed to fetch directory", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchDirectory();
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [currentPage, searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

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
      const res = await api.post("/provider/scan-qr", { token_string: decodedText });
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
                className="block w-full px-6 py-3 bg-teal-500 text-white rounded-xl text-center hover:bg-teal-600 transition font-bold shadow-lg shadow-teal-100"
              >
                View Medical History
              </button>
            </form>
          </div>
        </div>

        {/* Quick Access List */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h3 className="text-xl font-bold text-gray-900">Quick Access Directory</h3>
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition text-sm font-medium"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>
          
          <div className="space-y-4">
            {loading && recentPatients.length === 0 ? (
              <p className="text-gray-500 text-center py-8 font-medium">Loading directory...</p>
            ) : recentPatients.length === 0 ? (
              <div className="text-center py-8">
                <Search className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No patients found matching your search.</p>
              </div>
            ) : (
              recentPatients.map((patient) => (
                <Link
                  key={patient.patient_id}
                  to={`/provider/clinical/${patient.patient_id}`}
                  className="block p-4 border-2 border-gray-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-lg">{patient.first_name} {patient.last_name}</p>
                      <p className="text-xs font-mono text-gray-500 mt-1">{patient.patient_id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{patient.contact_number || 'No contact'}</p>
                      <p className="text-sm font-bold text-blue-600 truncate max-w-[120px] sm:max-w-none">{patient.email}</p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 bg-gray-50 rounded-lg hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50 disabled:hover:bg-gray-50 disabled:hover:text-gray-600 transition"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <span className="text-sm font-bold text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 bg-gray-50 rounded-lg hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50 disabled:hover:bg-gray-50 disabled:hover:text-gray-600 transition"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
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
