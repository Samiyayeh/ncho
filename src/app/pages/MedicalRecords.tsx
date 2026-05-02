import { ArrowLeft, FileText, Clock, Pill, X, Activity, Clipboard } from "lucide-react";
import { Link } from "react-router";
import { useState, useEffect } from "react";
import { PatientBottomNav } from "../components/PatientBottomNav";
import { api } from "../api/client";

export function MedicalRecords() {
  const [activeTab, setActiveTab] = useState<"records" | "visits" | "medications">("records");
  const [records, setRecords] = useState<any[]>([]);
  const [encounters, setEncounters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVisit, setSelectedVisit] = useState<any>(null);

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
                    <div 
                      key={enc.encounter_id} 
                      onClick={() => setSelectedVisit(enc)}
                      className="bg-white rounded-xl shadow-md p-6 border-l-4 border-teal-500 cursor-pointer hover:shadow-lg transition"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-lg font-bold text-gray-900">{formatDate(enc.encounter_date)}</p>
                          <p className="text-sm text-gray-600">
                            {enc.Provider ? `Dr. ${enc.Provider.last_name} — ${enc.Provider.specialty || 'General Practice'}` : 'Unknown Provider'}
                          </p>
                        </div>
                        <div className="px-3 py-1 bg-teal-50 text-teal-700 text-xs font-bold rounded-full">Click to Expand</div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase">Chief Complaint</p>
                          <p className="text-sm text-gray-900 truncate">{enc.chief_complaint || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Medications Tab */}
            {activeTab === "medications" && (
              <div className="space-y-6">
                {(() => {
                  const visitsWithRx = encounters.filter(enc => enc.Prescriptions && enc.Prescriptions.length > 0);
                  
                  if (visitsWithRx.length === 0) {
                    return <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">No prescriptions found.</div>;
                  }

                  return visitsWithRx.map((enc: any) => (
                    <div 
                      key={enc.encounter_id} 
                      onClick={() => setSelectedVisit(enc)}
                      className="bg-white rounded-2xl shadow-md overflow-hidden border-l-4 border-blue-500 cursor-pointer hover:shadow-lg transition"
                    >
                      <div className="bg-blue-50/50 px-6 py-3 border-b flex justify-between items-center">
                        <div>
                          <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">Visit Date</p>
                          <p className="font-bold text-gray-900">{formatDate(enc.encounter_date)}</p>
                        </div>
                        <div className="text-right text-xs text-blue-500 font-bold">
                           {enc.Provider ? `Dr. ${enc.Provider.last_name}` : ''}
                        </div>
                      </div>
                      <div className="p-6">
                        <p className="text-sm text-gray-600 mb-2">Contains {enc.Prescriptions.length} medications</p>
                        <div className="flex gap-2">
                          {enc.Prescriptions.slice(0, 2).map((rx: any, i: number) => (
                            <span key={i} className="px-2 py-1 bg-gray-100 rounded text-[10px] font-bold text-gray-600">
                              {rx.medication_name}
                            </span>
                          ))}
                          {enc.Prescriptions.length > 2 && <span className="text-[10px] text-gray-400">+{enc.Prescriptions.length - 2} more</span>}
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            )}
          </>
        )}
      </div>

      {/* Visit Detail Modal */}
      {selectedVisit && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedVisit(null)} />
          
          <div className="relative w-full max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
            {/* Modal Header */}
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-xl text-white">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">Visit Summary</h3>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">{formatDate(selectedVisit.encounter_date)}</p>
                </div>
              </div>
              <button onClick={() => setSelectedVisit(null)} className="p-2 hover:bg-gray-200 rounded-full transition">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
              {/* Doctor Info */}
              <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Attending Provider</p>
                <p className="font-bold text-blue-900">
                  {selectedVisit.Provider ? `Dr. ${selectedVisit.Provider.first_name} ${selectedVisit.Provider.last_name}` : 'Unknown Provider'}
                </p>
                <p className="text-xs text-blue-700">{selectedVisit.Provider?.specialty || 'General Practice'}</p>
              </div>

              {/* Vitals */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 text-center">
                  <p className="text-[10px] font-bold text-orange-400 uppercase mb-1">Blood Pressure</p>
                  <p className="text-xl font-black text-orange-700">
                    {selectedVisit.bp_systolic ? `${selectedVisit.bp_systolic}/${selectedVisit.bp_diastolic}` : '--/--'}
                  </p>
                </div>
                <div className="p-4 bg-teal-50 rounded-2xl border border-teal-100 text-center">
                  <p className="text-[10px] font-bold text-teal-400 uppercase mb-1">Temperature</p>
                  <p className="text-xl font-black text-teal-700">{selectedVisit.temperature || '--'} °C</p>
                </div>
              </div>

              {/* Clinical Notes */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-2">
                    <Clipboard className="w-4 h-4 text-blue-600" />
                    Medical Assessment
                  </h4>
                  <div className="p-4 bg-gray-50 rounded-2xl space-y-3">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Chief Complaint</p>
                      <p className="text-sm text-gray-900 font-medium italic">"{selectedVisit.chief_complaint || 'No complaint noted'}"</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Diagnosis / Impression</p>
                      <p className="text-sm text-gray-900 font-bold">{selectedVisit.diagnosis || 'Pending results'}</p>
                    </div>
                  </div>
                </div>

                {/* Prescriptions */}
                {selectedVisit.Prescriptions?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-2">
                      <Pill className="w-4 h-4 text-green-600" />
                      Prescribed Medications
                    </h4>
                    <div className="space-y-2">
                      {selectedVisit.Prescriptions.map((rx: any, idx: number) => (
                        <div key={idx} className="p-4 bg-green-50 border border-green-100 rounded-2xl">
                          <div className="flex justify-between items-start">
                            <p className="font-bold text-green-900">{rx.medication_name}</p>
                            <span className="text-[10px] font-bold text-green-600 uppercase">e-Rx</span>
                          </div>
                          <p className="text-xs text-green-700 font-bold">{rx.dosage}</p>
                          <p className="text-[10px] text-green-600 mt-1">{rx.frequency} for {rx.duration_days} days</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50 border-t">
              <button 
                onClick={() => setSelectedVisit(null)}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      <PatientBottomNav />
    </div>
  );
}
