import { ArrowLeft, FileText, Clock, Pill } from "lucide-react";
import { Link } from "react-router";
import { useState, useEffect } from "react";
import { PatientBottomNav } from "../components/PatientBottomNav";
import { api } from "../api/client";

export function MedicalRecords() {
  const [activeTab, setActiveTab] = useState<"records" | "visits" | "medications">("records");
  const [records, setRecords] = useState<any[]>([]);
  const [encounters, setEncounters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [recordData, encounterData] = await Promise.all([
          api.get('/patient/records'),
          api.get('/patient/encounters'),
        ]);
        setRecords(recordData);
        setEncounters(encounterData);
      } catch (error) {
        console.error("Failed to fetch medical data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const formatDate = (dateStr: string) =>
    dateStr ? new Date(dateStr).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';

  // Flatten all prescriptions from encounters
  const allPrescriptions = encounters.flatMap((enc: any) =>
    (enc.Prescriptions || []).map((rx: any) => ({
      ...rx,
      encounter_date: enc.encounter_date,
      provider: enc.Provider,
    }))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm mb-6">
        <div className="px-4 py-4">
          <Link to="/patient" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-bold">Back to Health Passport</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Medical Records & History</h1>
          <p className="text-sm text-gray-600">Complete history of documents, visits, and medications</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4">
        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-md mb-4">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("records")}
              className={`flex-1 py-4 px-6 text-center transition ${
                activeTab === "records" ? "border-b-2 border-blue-600 text-blue-600 font-bold" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <FileText className="w-5 h-5 inline-block mr-2" />
              Records
            </button>
            <button
              onClick={() => setActiveTab("visits")}
              className={`flex-1 py-4 px-6 text-center transition ${
                activeTab === "visits" ? "border-b-2 border-blue-600 text-blue-600 font-bold" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Clock className="w-5 h-5 inline-block mr-2" />
              Visit History
            </button>
            <button
              onClick={() => setActiveTab("medications")}
              className={`flex-1 py-4 px-6 text-center transition ${
                activeTab === "medications" ? "border-b-2 border-blue-600 text-blue-600 font-bold" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Pill className="w-5 h-5 inline-block mr-2" />
              Medications
            </button>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">Loading your records...</div>
        ) : (
          <>
            {/* Medical Records Tab */}
            {activeTab === "records" && (
              <div className="space-y-4">
                {records.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">No medical records uploaded yet.</div>
                ) : (
                  records.map((rec: any) => (
                    <div key={rec.record_id} className="bg-white rounded-xl shadow-md p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{rec.document_type}</h3>
                          <p className="text-sm text-gray-600">
                            {formatDate(rec.created_at)}
                            {rec.Provider ? ` • Dr. ${rec.Provider.last_name}` : ''}
                          </p>
                        </div>
                        {rec.file_url && (
                          <a
                            href={rec.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold hover:bg-blue-200 transition"
                          >
                            View File
                          </a>
                        )}
                      </div>
                      {rec.description && <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{rec.description}</p>}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Visit History Tab */}
            {activeTab === "visits" && (
              <div className="space-y-4">
                {encounters.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">No visit history found.</div>
                ) : (
                  encounters.map((enc: any) => (
                    <div key={enc.encounter_id} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-teal-500">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-lg font-bold text-gray-900">{formatDate(enc.encounter_date)}</p>
                          <p className="text-sm text-gray-600">
                            {enc.Provider ? `Dr. ${enc.Provider.last_name} — ${enc.Provider.specialty || 'General Practice'}` : 'Unknown Provider'}
                          </p>
                        </div>
                        <Clock className="w-5 h-5 text-teal-500" />
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-bold text-gray-700">Chief Complaint:</p>
                          <p className="text-sm text-gray-900">{enc.chief_complaint || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-700">Diagnosis:</p>
                          <p className="text-sm text-gray-900">{enc.diagnosis || 'N/A'}</p>
                        </div>
                        {(enc.blood_pressure || enc.heart_rate || enc.temperature) && (
                          <div>
                            <p className="text-sm font-bold text-gray-700">Vital Signs:</p>
                            <p className="text-sm text-gray-900">
                              {[
                                enc.blood_pressure && `BP: ${enc.blood_pressure}`,
                                enc.heart_rate && `HR: ${enc.heart_rate} bpm`,
                                enc.temperature && `Temp: ${enc.temperature}°C`,
                                enc.weight && `Weight: ${enc.weight} kg`,
                              ].filter(Boolean).join(' • ')}
                            </p>
                          </div>
                        )}
                        {enc.treatment_notes && (
                          <div>
                            <p className="text-sm font-bold text-gray-700">Treatment Notes:</p>
                            <p className="text-sm text-gray-900">{enc.treatment_notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Medications Tab */}
            {activeTab === "medications" && (
              <div className="space-y-4">
                {allPrescriptions.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">No prescriptions found.</div>
                ) : (
                  allPrescriptions.map((rx: any, index: number) => (
                    <div key={index} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{rx.medication_name}</h3>
                          <p className="text-blue-600 font-bold">{rx.dosage}</p>
                        </div>
                        <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">Active</span>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <p className="text-sm font-bold text-gray-700">Instructions:</p>
                        <p className="text-sm text-gray-900">{rx.frequency} for {rx.duration_days} days</p>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Prescribed: {formatDate(rx.encounter_date)}</span>
                        {rx.provider && <span>Dr. {rx.provider.last_name}</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>

      <PatientBottomNav />
    </div>
  );
}
