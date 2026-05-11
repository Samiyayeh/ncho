import { Upload, FileText, AlertCircle, Shield, Loader2, X, CheckCircle2 } from "lucide-react";
import { useParams, Link, useNavigate } from "react-router";
import { useState, useRef, useEffect } from "react";
import { ProviderLayout } from "../components/ProviderLayout";
import { api, apiClient } from "../api/client";

export function MedicalRecordUpload() {
  const { patientId } = useParams();
  const navigate = useNavigate();

  // Patient state
  const [isSearching, setIsSearching] = useState(true);
  const [foundPatient, setFoundPatient] = useState<any>(null);
  const [lookupError, setLookupError] = useState("");

  // Record details state
  const [recordType, setRecordType] = useState("");
  const [resultSummary, setResultSummary] = useState("");

  // File state
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!patientId) return;

    const fetchPatient = async () => {
      setIsSearching(true);
      try {
        const res = await api.get(`/provider/patient-lookup?query=${encodeURIComponent(patientId)}`);
        setFoundPatient(res);
      } catch (error: any) {
        setLookupError(error.message || "Failed to load patient data");
      } finally {
        setIsSearching(false);
      }
    };

    fetchPatient();
  }, [patientId]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) setSelectedFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!foundPatient || !recordType || !resultSummary || !selectedFile) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("patient_id", foundPatient.patient_id);
      formData.append("document_type", recordType);
      formData.append("description", resultSummary);
      formData.append("documentFile", selectedFile);

      await apiClient("/provider/medical-records/upload", {
        method: "POST",
        body: formData,
      });

      setShowSuccessModal(true);
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to upload medical record");
      setShowErrorModal(true);
    } finally {
      setIsUploading(false);
    }
  };

  const canSubmit = !!foundPatient && !!recordType && !!resultSummary && !!selectedFile;

  return (
    <ProviderLayout>
      <div className="min-h-screen p-8">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Upload Medical Record</h1>
            <p className="text-gray-600">
              Official diagnostic files for <span className="font-bold text-blue-600">{foundPatient ? `${foundPatient.first_name} ${foundPatient.last_name}` : patientId}</span>
            </p>
          </div>
          <Link 
            to={`/provider/clinical/${patientId}`}
            className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-800 transition"
          >
            <X className="w-4 h-4" /> Cancel & Return
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-md p-8">
          {/* Patient Context (Read Only) */}
          <div className="mb-8 pb-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-teal-600" />
              Patient Context
            </h2>
            
            {isSearching ? (
              <div className="flex items-center gap-3 text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <p className="text-sm">Fetching patient details...</p>
              </div>
            ) : lookupError ? (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                <p className="text-sm font-bold text-red-800">{lookupError}</p>
                <Link to="/provider" className="text-xs text-red-600 underline mt-1 block">Return to Directory</Link>
              </div>
            ) : foundPatient && (
              <div className="p-4 bg-blue-50 border-l-4 border-blue-600 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {foundPatient.first_name} {foundPatient.last_name}
                  </p>
                  <p className="text-sm text-blue-700 font-mono">
                    ID: {foundPatient.patient_id} • DOB: {foundPatient.date_of_birth ? new Date(foundPatient.date_of_birth).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-widest">
                    Target Patient
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Record Details */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Record Details</h2>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Record Type <span className="text-red-600">*</span>
              </label>
              <select
                value={recordType}
                onChange={(e) => setRecordType(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
              >
                <option value="">Select record type...</option>
                <option value="Complete Blood Count (CBC)">Complete Blood Count (CBC)</option>
                <option value="X-Ray">X-Ray</option>
                <option value="Urinalysis">Urinalysis</option>
                <option value="Lipid Profile">Lipid Profile</option>
                <option value="Fasting Blood Sugar">Fasting Blood Sugar</option>
                <option value="Electrocardiogram (ECG)">Electrocardiogram (ECG)</option>
                <option value="Ultrasound">Ultrasound</option>
                <option value="CT Scan">CT Scan</option>
                <option value="MRI">MRI</option>
                <option value="Prescription">Prescription</option>
                <option value="Discharge Summary">Discharge Summary</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Clinical Context */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Clinical Context</h2>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Result Summary <span className="text-red-600">*</span>
              </label>
              <textarea
                value={resultSummary}
                onChange={(e) => setResultSummary(e.target.value)}
                placeholder="Provide clinical context for this record. Include key findings, diagnosis, or relevant observations..."
                rows={5}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none resize-none"
                required
              />
              <p className="text-xs text-gray-500 mt-2">
                This summary helps healthcare providers quickly understand the record without opening the file.
              </p>
            </div>
          </div>

          {/* File Upload Zone */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">File Attachment</h2>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-12 text-center transition cursor-pointer ${
                isDragging
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
              />
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-bold text-gray-900 mb-2">
                Drag and drop PDF or Image files here
              </p>
              <p className="text-sm text-gray-600 mb-4">or click to browse</p>
              {selectedFile && (
                <div
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FileText className="w-5 h-5" />
                  <span className="font-bold">{selectedFile.name}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                    className="ml-1 hover:text-green-900"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-4">
                Accepted formats: PDF, JPG, PNG • Max file size: 10MB
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end border-t pt-6">
            <Link
              to={`/provider/clinical/${patientId}`}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </Link>
            <button
              onClick={handleUpload}
              disabled={!canSubmit || isUploading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-lg hover:opacity-90 transition flex items-center gap-2 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Upload className="w-5 h-5" />
              )}
              {isUploading ? "Uploading..." : "Secure Upload"}
            </button>
          </div>
        </div>

        {/* Privacy & Security Notice */}
        <div className="mt-6 bg-blue-50 border-l-4 border-blue-600 p-4 rounded-lg">
          <div className="flex gap-3">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-sm text-blue-900">
                <span className="font-bold">Data Privacy & Security:</span> All uploaded files are encrypted using
                AES-256 encryption. This upload action will be logged with your Provider ID and timestamp for
                audit compliance under the Data Privacy Act of 2012.
              </p>
            </div>
          </div>
        </div>

        {/* Upload Requirements */}
        <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-yellow-900 mb-2">Upload Requirements:</p>
              <ul className="text-xs text-yellow-800 space-y-1 list-disc list-inside">
                <li>Files must be clear and legible</li>
                <li>Patient information must be visible on the document</li>
                <li>Result summary is mandatory for all uploads</li>
                <li>Only official diagnostic files from authorized facilities</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── SUCCESS MODAL ─────────────────────────────────── */}
        {showSuccessModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mx-auto mb-5">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Successful!</h2>
              <p className="text-sm text-gray-500 mb-2">The medical record has been securely stored and linked to a new encounter.</p>
              <p className="text-xs text-gray-400 mb-8">This action has been logged in compliance with the Data Privacy Act.</p>
              <button
                onClick={() => navigate(`/provider/clinical/${patientId}`)}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-xl font-bold hover:opacity-90 transition"
              >
                Return to Patient Record
              </button>
            </div>
          </div>
        )}

        {/* ── ERROR MODAL ───────────────────────────────────── */}
        {showErrorModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowErrorModal(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-5">
                <X className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Upload Failed</h2>
              <p className="text-sm text-gray-500 mb-6">{errorMessage}</p>
              <button onClick={() => setShowErrorModal(false)} className="w-full px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition">
                OK, Got It
              </button>
            </div>
          </div>
        )}

      </div>
    </ProviderLayout>
  );
}
