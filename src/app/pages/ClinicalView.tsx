import { Phone, MapPin, Calendar, Activity, FileText, Clock, Shield, Pill, ArrowLeft, UploadCloud } from "lucide-react";
import { Link, useParams, useSearchParams, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { ProviderLayout } from "../components/ProviderLayout";
import { api } from "../api/client";

export function ClinicalView() {
  const { patientId } = useParams();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const [activeTab, setActiveTab] = useState("summary");
  const [patient, setPatient] = useState<any>(null);
  const [encounters, setEncounters] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [startingEncounter, setStartingEncounter] = useState(false);
  const [summarySearch, setSummarySearch] = useState("");
  const [viewingFileUrl, setViewingFileUrl] = useState<string | null>(null);

  const handleStartEncounter = async () => {
    try {
      setStartingEncounter(true);
      const res = await api.post('/encounters/start', { patient_id: patientId });
      if (res.resumed) {
        // Navigate directly - the workspace will show a "resumed" banner
        navigate(`/provider/encounter/${res.encounter_id}?resumed=true`);
      } else {
        navigate(`/provider/encounter/${res.encounter_id}`);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to start encounter');
      setStartingEncounter(false);
    }
  };

  useEffect(() => {
    if (!patientId) return;

    const fetchAll = async () => {
      try {
        const [patientData, encounterData, recordData] = await Promise.all([
          api.get(`/provider/patient-lookup?query=${patientId}`),
          api.get(`/provider/encounters/${patientId}`),
          api.get(`/provider/medical-records/${patientId}`),
        ]);

        setPatient(patientData || null);
        setEncounters(encounterData);
        setRecords(recordData);
      } catch (error) {
        console.error("Failed to fetch patient data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [patientId]);

  const formatDate = (dateStr: string) =>
    dateStr ? new Date(dateStr).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';

  return (
    <ProviderLayout>
      <div className="min-h-screen p-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Patient Record View</h1>
            <p className="text-gray-600">Reviewing historical medical data</p>
          </div>
          <div className="flex items-center gap-4">
            {returnTo && (
              <Link
                to={`/provider/encounter/${returnTo}`}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-bold shadow-lg shadow-blue-200"
              >
                <ArrowLeft className="w-5 h-5" />
                Return to Active Consultation
              </Link>
            )}
            <Link
              to={`/provider/upload/${patientId}`}
              className="px-6 py-2 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition flex items-center gap-2 font-bold shadow-sm"
            >
              <UploadCloud className="w-5 h-5" />
              Upload Record
            </Link>
            <button
              onClick={handleStartEncounter}
              disabled={startingEncounter}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-lg hover:opacity-90 transition flex items-center gap-2 font-bold shadow-lg"
            >
              <Activity className="w-5 h-5" />
              {startingEncounter ? 'Starting...' : 'Start New Encounter'}
            </button>
          </div>
        </div>

        {/* Patient Header Profile */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-600 mb-6 text-center text-gray-500">
            Loading patient data...
          </div>
        ) : !patient ? (
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-600 mb-6 text-center text-red-500">
            Patient not found
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-600 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">{patient.first_name} {patient.last_name}</h2>
                </div>
                <p className="text-gray-600">Patient ID: {patient.patient_id}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-600">Date of Birth</p>
                  <p className="font-bold text-gray-900">
                    {patient.date_of_birth ? formatDate(patient.date_of_birth) : 'Not provided'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-600">Contact</p>
                  <p className="font-bold text-gray-900">{patient.contact_number || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-600">Address</p>
                  <p className="font-bold text-gray-900">{patient.address || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vitals Cards */}
        {patient && (
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <p className="text-sm text-gray-600 mb-2">Blood Type</p>
              <p className="text-5xl font-bold text-red-600">{patient.blood_type || 'N/A'}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <p className="text-sm text-gray-600 mb-3">Known Allergies</p>
              <div className="flex flex-wrap gap-2">
                {patient.allergies ? (
                  <span className="px-4 py-2 bg-red-100 text-red-700 rounded-full font-bold">
                    {patient.allergies}
                  </span>
                ) : (
                  <span className="text-gray-500">None reported</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-md mb-6">
          <div className="border-b border-gray-200">
            <div className="flex gap-8 px-6">
              {[
                { key: "summary", label: "Summary", icon: Activity },
                { key: "visits", label: "Visit History", icon: Clock },
                { key: "medications", label: "Medications", icon: Pill },
                { key: "records", label: "Medical Records", icon: FileText },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`py-4 border-b-2 transition flex items-center gap-2 ${
                    activeTab === key
                      ? "border-blue-600 text-blue-600 font-bold"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Summary Tab */}
            {activeTab === "summary" && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-6 h-6 text-blue-600" />
                    <h3 className="text-xl font-bold text-gray-900">Comprehensive Medical Summary</h3>
                  </div>
                  <div className="relative w-full md:w-72">
                      <input
                        type="text"
                        placeholder="Search date (e.g. May), diagnosis..."
                        value={summarySearch}
                        onChange={(e) => setSummarySearch(e.target.value)}
                        className="w-full pl-4 pr-10 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none text-sm"
                      />
                      {summarySearch && (
                        <button 
                          onClick={() => setSummarySearch("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 font-bold text-xs"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                
                {(() => {
                  const filteredEncounters = encounters.filter(enc => {
                    if (!summarySearch) return true;
                    const search = summarySearch.toLowerCase();
                    const encDateStr = formatDate(enc.encounter_date).toLowerCase();
                    const providerName = enc.Provider ? `dr. ${enc.Provider.last_name.toLowerCase()}` : '';
                    const complaint = (enc.chief_complaint || '').toLowerCase();
                    const diagnosis = (enc.diagnosis || '').toLowerCase();
                    const meds = (enc.Prescriptions || []).map((rx: any) => rx.medication_name.toLowerCase()).join(' ');
                    
                    return encDateStr.includes(search) ||
                           providerName.includes(search) || 
                           complaint.includes(search) || 
                           diagnosis.includes(search) || 
                           meds.includes(search);
                  });

                  if (encounters.length === 0) {
                    return (
                      <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500 border-2 border-dashed border-gray-200">
                        No medical encounters found for this patient.
                      </div>
                    );
                  }

                  if (filteredEncounters.length === 0) {
                    return (
                      <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500 border-2 border-dashed border-gray-200">
                        No encounters match your search query.
                      </div>
                    );
                  }

                  return (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-blue-50 border-b-2 border-blue-100">
                              <th className="p-4 text-xs font-bold text-blue-800 uppercase tracking-widest w-48">Date & Provider</th>
                              <th className="p-4 text-xs font-bold text-blue-800 uppercase tracking-widest w-1/4">Clinical Assessment</th>
                              <th className="p-4 text-xs font-bold text-blue-800 uppercase tracking-widest w-1/4">Key Vitals</th>
                              <th className="p-4 text-xs font-bold text-blue-800 uppercase tracking-widest">Prescribed Medications</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {filteredEncounters.map((enc: any) => (
                            <tr key={enc.encounter_id} className="hover:bg-gray-50/50 transition align-top">
                              <td className="p-4 border-r border-gray-50">
                                <p className="font-bold text-gray-900 mb-1">{formatDate(enc.encounter_date)}</p>
                                <p className="text-xs font-bold text-gray-500">
                                  {enc.Provider ? `Dr. ${enc.Provider.last_name}` : 'Unknown Provider'}
                                </p>
                                <span className={`inline-block mt-2 px-2 py-0.5 text-[10px] font-bold rounded uppercase ${enc.encounter_type === 'FILE_UPLOAD' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                  {enc.encounter_type === 'FILE_UPLOAD' ? 'File Upload' : 'Consultation'}
                                </span>
                              </td>
                              <td className="p-4 border-r border-gray-50">
                                <div className="mb-3">
                                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Chief Complaint</p>
                                  <p className="text-sm text-gray-900 font-medium">"{enc.chief_complaint || 'N/A'}"</p>
                                </div>
                                <div className="bg-yellow-50 p-2 rounded border border-yellow-100">
                                  <p className="text-[10px] font-bold text-yellow-600 uppercase tracking-widest mb-0.5">Diagnosis / Impression</p>
                                  <p className="text-sm font-bold text-gray-900">{enc.diagnosis || 'Pending Results'}</p>
                                </div>
                                {enc.encounter_type === 'FILE_UPLOAD' && (() => {
                                  const linkedRecord = records.find(r => r.encounter_id === enc.encounter_id);
                                  return linkedRecord?.file_url ? (
                                    <div className="mt-3">
                                      <button
                                        onClick={(e) => {
                                          e.preventDefault();
                                          setViewingFileUrl(linkedRecord.file_url);
                                        }}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 font-bold rounded-lg hover:bg-blue-100 transition text-xs"
                                      >
                                        <FileText className="w-3 h-3" />
                                        View Uploaded Record
                                      </button>
                                    </div>
                                  ) : null;
                                })()}
                              </td>
                              <td className="p-4 border-r border-gray-50">
                                <div className="space-y-1.5">
                                  {enc.blood_pressure ? (
                                    <p className="text-xs text-gray-700"><span className="font-bold text-gray-400 w-8 inline-block">BP:</span> <span className="font-mono">{enc.blood_pressure}</span></p>
                                  ) : null}
                                  {enc.heart_rate ? (
                                    <p className="text-xs text-gray-700"><span className="font-bold text-gray-400 w-8 inline-block">HR:</span> <span className="font-mono">{enc.heart_rate} bpm</span></p>
                                  ) : null}
                                  {enc.temperature ? (
                                    <p className="text-xs text-gray-700"><span className="font-bold text-gray-400 w-8 inline-block">Temp:</span> <span className="font-mono">{enc.temperature} °C</span></p>
                                  ) : null}
                                  {!enc.blood_pressure && !enc.heart_rate && !enc.temperature && (
                                    <p className="text-xs text-gray-400 italic">No vitals recorded</p>
                                  )}
                                </div>
                              </td>
                              <td className="p-4">
                                {enc.Prescriptions && enc.Prescriptions.length > 0 ? (
                                  <div className="flex flex-wrap gap-2">
                                    {enc.Prescriptions.map((rx: any, i: number) => (
                                      <div key={i} className="flex flex-col bg-teal-50 p-2 rounded border border-teal-100 min-w-[120px] max-w-[200px]">
                                        <p className="text-xs font-bold text-teal-900 truncate" title={rx.medication_name}>
                                          <Pill className="w-3 h-3 inline-block mr-1 text-teal-500" />
                                          {rx.medication_name}
                                        </p>
                                        <p className="text-[10px] text-teal-700 mt-0.5">{rx.dosage} • {rx.frequency}</p>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-xs text-gray-400 italic">No medications prescribed</p>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  );
                })()}
              </div>
            )}

            {/* Visit History Tab */}
            {activeTab === "visits" && (
              <div className="space-y-4">
                {encounters.length === 0 ? (
                  <p className="text-gray-500">No visit history found for this patient.</p>
                ) : (
                  encounters.map((enc: any) => (
                    <div key={enc.encounter_id} className="p-4 bg-gray-50 rounded-lg border-l-4 border-teal-500">
                      <div className="flex items-start justify-between mb-3">
                        <p className="font-bold text-gray-900">{formatDate(enc.encounter_date)}</p>
                        <p className="text-sm text-gray-600">
                          {enc.Provider ? `Dr. ${enc.Provider.last_name} — ${enc.Provider.specialty || 'General'}` : 'Unknown Provider'}
                        </p>
                      </div>
                      <div className="grid md:grid-cols-2 gap-2 text-sm">
                        <p className="text-gray-600"><span className="font-bold">Chief Complaint:</span> {enc.chief_complaint || 'N/A'}</p>
                        <p className="text-gray-600"><span className="font-bold">Diagnosis:</span> {enc.diagnosis || 'N/A'}</p>
                        {enc.blood_pressure && <p className="text-gray-600"><span className="font-bold">BP:</span> {enc.blood_pressure}</p>}
                        {enc.heart_rate && <p className="text-gray-600"><span className="font-bold">Heart Rate:</span> {enc.heart_rate} bpm</p>}
                        {enc.temperature && <p className="text-gray-600"><span className="font-bold">Temp:</span> {enc.temperature}°C</p>}
                        {enc.weight && <p className="text-gray-600"><span className="font-bold">Weight:</span> {enc.weight} kg</p>}
                        {enc.treatment_notes && <p className="text-gray-600 md:col-span-2"><span className="font-bold">Notes:</span> {enc.treatment_notes}</p>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Medications Tab */}
            {activeTab === "medications" && (
              <div className="space-y-4">
                {(() => {
                  const allPrescriptions = encounters
                    .flatMap(enc => (enc.Prescriptions || []).map((rx: any) => ({
                      ...rx,
                      encounter_date: enc.encounter_date,
                      provider_name: enc.Provider ? `Dr. ${enc.Provider.last_name}` : 'N/A'
                    })))
                    .sort((a, b) => new Date(b.encounter_date).getTime() - new Date(a.encounter_date).getTime());

                  if (allPrescriptions.length === 0) {
                    return <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 font-medium">No electronic prescriptions found.</div>;
                  }

                  return (
                    <div className="space-y-3">
                      <div className="grid grid-cols-12 px-6 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                        <div className="col-span-6">Medication & Dosage</div>
                        <div className="col-span-4">Prescriber</div>
                        <div className="col-span-2 text-right">Date</div>
                      </div>
                      {allPrescriptions.map((rx: any, idx: number) => (
                        <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:grid sm:grid-cols-12 gap-4 items-center hover:border-blue-200 transition group">
                          <div className="col-span-6 w-full">
                            <p className="font-bold text-gray-900 group-hover:text-blue-600 transition">{rx.medication_name}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              {rx.dosage} • {rx.frequency} • {rx.duration_days} days
                            </p>
                          </div>
                          <div className="col-span-4 w-full">
                            <p className="text-sm font-bold text-gray-700">{rx.provider_name}</p>
                            <p className="text-xs text-gray-400 font-mono mt-0.5">PRC: {rx.prescriber_prc_number || 'N/A'}</p>
                          </div>
                          <div className="col-span-2 w-full text-right">
                            <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-black">
                              {formatDate(rx.encounter_date)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Medical Records Tab */}
            {activeTab === "records" && (
              <div className="space-y-3">
                {records.length === 0 ? (
                  <p className="text-gray-500">No medical records uploaded for this patient.</p>
                ) : (
                  records.map((rec: any) => (
                    <div key={rec.record_id} className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-bold text-gray-900">{rec.document_type}</p>
                        <p className="text-sm text-gray-600">{formatDate(rec.created_at)} • {rec.description || 'No description'}</p>
                      </div>
                      {rec.file_url && (
                        <button
                          onClick={() => setViewingFileUrl(rec.file_url)}
                          className="px-4 py-2 bg-blue-50 text-blue-700 font-bold rounded-lg hover:bg-blue-100 transition text-sm"
                        >
                          View File
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Access Logged Footer */}
        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-blue-600" />
            <p className="text-sm text-blue-900">
              <span className="font-bold">Access Logged:</span> Your access to this patient record has been logged
              in compliance with the Data Privacy Act of 2012. Access time: {new Date().toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* File Viewer Modal */}
      {viewingFileUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2 text-blue-900 font-bold">
                <FileText className="w-5 h-5" />
                <h2>Document Viewer</h2>
              </div>
              <button 
                onClick={() => setViewingFileUrl(null)}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition font-bold text-sm"
              >
                Close
              </button>
            </div>
            <div className="flex-1 bg-gray-100 flex items-center justify-center p-4">
              {viewingFileUrl.match(/\.(jpeg|jpg|gif|png|webp|bmp)$/i) ? (
                <img 
                  src={viewingFileUrl} 
                  alt="Document Viewer" 
                  className="max-w-full max-h-full object-contain rounded shadow-sm"
                />
              ) : (
                <iframe 
                  src={viewingFileUrl} 
                  className="w-full h-full border-none rounded shadow-sm bg-white"
                  title="Document Viewer"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </ProviderLayout>
  );
}
