import { Upload, FileText, Search, AlertCircle, Check, Shield } from "lucide-react";
import { Link } from "react-router";
import { useState } from "react";
import { ProviderLayout } from "../components/ProviderLayout";

export function MedicalRecordUpload() {
  const [patientId, setPatientId] = useState("");
  const [recordType, setRecordType] = useState("");
  const [resultSummary, setResultSummary] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setUploadedFile(file.name);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file.name);
    }
  };

  return (
    <ProviderLayout>
      <div className="min-h-screen p-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Upload Medical Record</h1>
          <p className="text-gray-600">
            For official diagnostic files only. All uploads are encrypted and logged for Data Privacy Act compliance.
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-8">
          {/* Patient Context */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Patient Context</h2>
            <div className="relative">
              <label className="block text-sm font-bold text-gray-700 mb-2">Patient ID</label>
              <div className="relative">
                <input
                  type="text"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  placeholder="Enter or scan Patient ID (e.g., NCH-2026-001234)"
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                />
                <Search className="absolute right-4 top-3.5 w-5 h-5 text-gray-400" />
              </div>
              {patientId && (
                <div className="mt-3 p-3 bg-green-50 border-l-4 border-green-600 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm font-bold text-green-900">Patient Found: Maria Santos</p>
                      <p className="text-xs text-green-700">Blood Type: O+ | DOB: March 15, 1985</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Record Details */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Record Details</h2>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Record Type</label>
              <select
                value={recordType}
                onChange={(e) => setRecordType(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
              >
                <option value="">Select record type...</option>
                <option value="cbc">Complete Blood Count (CBC)</option>
                <option value="xray">X-Ray</option>
                <option value="urinalysis">Urinalysis</option>
                <option value="lipid">Lipid Profile</option>
                <option value="fbs">Fasting Blood Sugar</option>
                <option value="ecg">Electrocardiogram (ECG)</option>
                <option value="ultrasound">Ultrasound</option>
                <option value="ct">CT Scan</option>
                <option value="mri">MRI</option>
                <option value="prescription">Prescription</option>
                <option value="discharge">Discharge Summary</option>
                <option value="other">Other</option>
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
              className={`border-2 border-dashed rounded-xl p-12 text-center transition ${
                isDragging
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"
              }`}
            >
              <input
                type="file"
                id="file-upload"
                onChange={handleFileSelect}
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-bold text-gray-900 mb-2">
                  Drag and drop PDF or Image files here
                </p>
                <p className="text-sm text-gray-600 mb-4">or click to browse</p>
                {uploadedFile && (
                  <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                    <FileText className="w-5 h-5" />
                    <span className="font-bold">{uploadedFile}</span>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-4">
                  Accepted formats: PDF, JPG, PNG • Max file size: 10MB
                </p>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end border-t pt-6">
            <Link
              to="/dashboard"
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </Link>
            <button
              disabled={!patientId || !recordType || !resultSummary || !uploadedFile}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-lg hover:opacity-90 transition flex items-center gap-2 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-5 h-5" />
              Secure Upload
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
      </div>
    </ProviderLayout>
  );
}
