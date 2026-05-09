import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { ArrowLeft, Save, Activity, Clipboard, Pill, X, Shield, Clock } from "lucide-react";
import { ProviderLayout } from "../components/ProviderLayout";
import { api } from "../api/client";

export function EncounterWorkspace() {
  const { encounterId } = useParams();
  const navigate = useNavigate();
  
  const [encounter, setEncounter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // History Modal State
  const [showHistory, setShowHistory] = useState(false);
  const [historyTab, setHistoryTab] = useState('visits');
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyData, setHistoryData] = useState({ encounters: [], records: [] });

  // Form State
  const [vitals, setVitals] = useState({
    bp_systolic: "",
    bp_diastolic: "",
    temperature: "",
    weight: "",
  });
  
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  
  const [clinical, setClinical] = useState({
    chief_complaint: "",
    diagnosis: "",
    treatment_plan: "",
  });

  const user = JSON.parse(localStorage.getItem('ncho_user') || '{}');
  const roleType = user.role_type || 'PHYSICIAN';

  useEffect(() => {
    const fetchEncounter = async () => {
      try {
        const data = await api.get(`/encounters/${encounterId}`);
        setEncounter(data);
      } catch (err) {
        console.error("Failed to load encounter details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEncounter();
  }, [encounterId]);

  useEffect(() => {
    if (showHistory && encounter?.patient_id) {
      const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
          const [encData, recData] = await Promise.all([
            api.get(`/provider/encounters/${encounter.patient_id}`),
            api.get(`/provider/medical-records/${encounter.patient_id}`)
          ]);
          setHistoryData({ encounters: encData, records: recData });
        } catch (err) {
          console.error("Failed to load history", err);
        } finally {
          setLoadingHistory(false);
        }
      };
      fetchHistory();
    }
  }, [showHistory, encounter?.patient_id]);

  const addPrescription = () => {
    setPrescriptions([...prescriptions, { medication_name: "", dosage: "", frequency: "", duration_days: "" }]);
  };

  const removePrescription = (index: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  const updatePrescription = (index: number, field: string, value: string) => {
    const newRx = [...prescriptions];
    newRx[index][field] = value;
    setPrescriptions(newRx);
  };

  const handleSaveClinical = async () => {
    setSaving(true);
    try {
      await api.post('/encounters/clinical', {
        encounter_id: encounterId,
        bp_systolic: vitals.bp_systolic,
        bp_diastolic: vitals.bp_diastolic,
        temperature: vitals.temperature,
        weight_kg: vitals.weight,
        chief_complaint: clinical.chief_complaint,
        diagnosis: clinical.diagnosis,
        treatment_plan: clinical.treatment_plan,
        prescriptions: prescriptions.map(rx => ({
          ...rx,
          duration_days: parseInt(rx.duration_days) || 0
        }))
      });
      alert("Encounter completed successfully!");
      navigate('/provider/dashboard');
    } catch (err: any) {
      alert(err.message || "Failed to save clinical record");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <ProviderLayout><div className="p-8 text-center text-gray-500">Loading Encounter...</div></ProviderLayout>;
  if (!encounter) return <ProviderLayout><div className="p-8 text-center text-red-600 font-bold">Encounter Not Found</div></ProviderLayout>;

  return (
    <ProviderLayout>
      <div className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <header className="mb-8 flex items-center justify-between">
            <div>
              <Link to="/provider/dashboard" className="flex items-center gap-2 text-blue-600 font-bold mb-2 hover:underline">
                <ArrowLeft className="w-5 h-5" /> End Encounter (Exit)
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">
                Clinical Consultation Workspace
              </h1>
              <p className="text-gray-600 mt-2">
                Patient: <span className="font-bold text-gray-900 uppercase">{encounter.Patient?.first_name} {encounter.Patient?.last_name}</span>
                <span className="mx-2 text-gray-300">|</span>
                Patient ID: <span className="font-bold text-blue-600">{encounter.Patient?.patient_id}</span>
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleSaveClinical}
                disabled={saving}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-xl font-bold shadow-lg hover:opacity-90 transition flex items-center gap-2"
              >
                {saving ? 'Saving...' : 'Finalize & Complete Visit'}
                <Save className="w-5 h-5" />
              </button>
            </div>
          </header>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column: Forms */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Vital Signs Collection */}
              <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900">
                  <Activity className="w-6 h-6 text-orange-500" />
                  Vital Signs
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Sys (mmHg)</label>
                    <input 
                      type="number" 
                      value={vitals.bp_systolic}
                      onChange={(e) => setVitals({...vitals, bp_systolic: e.target.value})}
                      className="w-full px-3 py-2 border-2 border-gray-100 rounded-lg focus:border-blue-500 outline-none font-bold" 
                      placeholder="120"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Dia (mmHg)</label>
                    <input 
                      type="number" 
                      value={vitals.bp_diastolic}
                      onChange={(e) => setVitals({...vitals, bp_diastolic: e.target.value})}
                      className="w-full px-3 py-2 border-2 border-gray-100 rounded-lg focus:border-blue-500 outline-none font-bold" 
                      placeholder="80"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Temp (°C)</label>
                    <input 
                      type="number" step="0.1" 
                      value={vitals.temperature}
                      onChange={(e) => setVitals({...vitals, temperature: e.target.value})}
                      className="w-full px-3 py-2 border-2 border-gray-100 rounded-lg focus:border-blue-500 outline-none font-bold" 
                      placeholder="36.5"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Weight (kg)</label>
                    <input 
                      type="number" step="0.1" 
                      value={vitals.weight}
                      onChange={(e) => setVitals({...vitals, weight: e.target.value})}
                      className="w-full px-3 py-2 border-2 border-gray-100 rounded-lg focus:border-blue-500 outline-none font-bold" 
                      placeholder="60.0"
                    />
                  </div>
                </div>
              </div>

              {/* Clinical Record */}
              <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900">
                  <Clipboard className="w-6 h-6 text-blue-600" />
                  Clinical Notes
                </h3>
                
                <div className="space-y-5">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Chief Complaint</label>
                    <textarea 
                      value={clinical.chief_complaint}
                      onChange={(e) => setClinical({...clinical, chief_complaint: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 outline-none min-h-[80px]" 
                      placeholder="Brief description of the patient's issue..."
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Diagnosis / Impression</label>
                    <textarea 
                      value={clinical.diagnosis}
                      onChange={(e) => setClinical({...clinical, diagnosis: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 outline-none min-h-[80px]" 
                      placeholder="Medical diagnosis..."
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Treatment Plan / Instructions</label>
                    <textarea 
                      value={clinical.treatment_plan}
                      onChange={(e) => setClinical({...clinical, treatment_plan: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 outline-none min-h-[80px]" 
                      placeholder="Instructions for the patient..."
                    />
                  </div>
                </div>
              </div>

              {/* Electronic Prescriptions */}
              <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                    <Pill className="w-6 h-6 text-green-600" />
                    Electronic Prescriptions (e-Rx)
                  </h3>
                  <button 
                    onClick={addPrescription}
                    className="px-4 py-2 bg-green-50 text-green-700 text-sm font-bold rounded-lg hover:bg-green-100 transition shadow-sm border border-green-200"
                  >
                    + Add Medication
                  </button>
                </div>
                
                <div className="space-y-3">
                  {prescriptions.map((rx, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-3 p-4 bg-gray-50 rounded-xl items-end border border-gray-200 shadow-sm relative">
                      <div className="col-span-12 sm:col-span-5">
                        <label className="text-[10px] font-bold uppercase text-gray-400">Medication Name</label>
                        <input 
                          value={rx.medication_name}
                          onChange={(e) => updatePrescription(idx, 'medication_name', e.target.value)}
                          className="w-full bg-white border-2 border-gray-100 px-3 py-2 rounded-lg text-sm outline-none focus:border-green-500 font-bold text-gray-900" 
                          placeholder="e.g., Amoxicillin 500mg"
                        />
                      </div>
                      <div className="col-span-6 sm:col-span-2">
                        <label className="text-[10px] font-bold uppercase text-gray-400">Dosage</label>
                        <input 
                          value={rx.dosage}
                          onChange={(e) => updatePrescription(idx, 'dosage', e.target.value)}
                          className="w-full bg-white border-2 border-gray-100 px-3 py-2 rounded-lg text-sm outline-none focus:border-green-500" 
                          placeholder="1 cap"
                        />
                      </div>
                      <div className="col-span-6 sm:col-span-3">
                        <label className="text-[10px] font-bold uppercase text-gray-400">Frequency</label>
                        <input 
                          value={rx.frequency}
                          onChange={(e) => updatePrescription(idx, 'frequency', e.target.value)}
                          className="w-full bg-white border-2 border-gray-100 px-3 py-2 rounded-lg text-sm outline-none focus:border-green-500" 
                          placeholder="3x a day"
                        />
                      </div>
                      <div className="col-span-10 sm:col-span-1">
                        <label className="text-[10px] font-bold uppercase text-gray-400">Days</label>
                        <input 
                          type="number"
                          value={rx.duration_days}
                          onChange={(e) => updatePrescription(idx, 'duration_days', e.target.value)}
                          className="w-full bg-white border-2 border-gray-100 px-2 py-2 rounded-lg text-sm outline-none focus:border-green-500 text-center font-bold" 
                          placeholder="7"
                        />
                      </div>
                      <div className="col-span-2 sm:col-span-1 flex justify-end">
                        <button 
                          onClick={() => removePrescription(idx)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {prescriptions.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-gray-400">
                      <Pill className="w-8 h-8 mb-2 opacity-50" />
                      <p className="text-sm font-medium">No medications prescribed.</p>
                      <p className="text-xs mt-1">Click "+ Add Medication" to prescribe.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Right Column: Patient Summary */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-teal-600" />
                  Patient Overview
                </h4>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">Date of Birth</span>
                    <span className="font-bold text-gray-900">
                      {encounter.Patient?.date_of_birth ? new Date(encounter.Patient.date_of_birth).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">Gender</span>
                    <span className="font-bold text-gray-900">{encounter.Patient?.gender || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">Blood Type</span>
                    <span className="font-bold text-red-600 text-lg">{encounter.Patient?.blood_type || 'N/A'}</span>
                  </div>
                  <div className="pt-2">
                    <span className="text-gray-500 font-medium block mb-2">Allergies</span>
                    <div className="bg-red-50 text-red-700 p-3 rounded-lg font-medium">
                      {encounter.Patient?.allergies || 'None reported'}
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setShowHistory(true)}
                className="w-full p-4 bg-teal-50 border-2 border-teal-100 text-teal-700 rounded-xl text-center font-bold hover:bg-teal-100 transition shadow-sm flex items-center justify-center gap-2"
              >
                <Clock className="w-5 h-5" />
                View Patient History
              </button>
            </div>
          </div>
        </div>

        {/* History Modal Overlay */}
        {showHistory && (
          <div className="fixed inset-0 z-[100] flex items-center justify-end">
            <div 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
              onClick={() => setShowHistory(false)}
            />
            
            <div className="relative w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
              <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-teal-400" />
                  <div>
                    <h3 className="font-bold text-lg">Patient Medical History</h3>
                    <p className="text-xs text-slate-400">Vault Access Logged for DPA Compliance</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowHistory(false)}
                  className="p-2 hover:bg-slate-800 rounded-full transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex border-b">
                {['visits', 'medications', 'records'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setHistoryTab(tab)}
                    className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition ${
                      historyTab === tab ? 'text-blue-600 border-b-4 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                {loadingHistory ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p className="text-sm font-medium">Fetching Medical Records...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {historyTab === 'visits' && (
                      historyData.encounters.length === 0 ? (
                        <p className="text-center text-gray-400 py-12 font-medium">No visit history found.</p>
                      ) : (
                        historyData.encounters.map((enc: any) => (
                          <div key={enc.encounter_id} className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm border-l-4 border-teal-500">
                            <div className="flex justify-between mb-3">
                              <p className="font-black text-gray-900 text-lg">{new Date(enc.encounter_date).toLocaleDateString()}</p>
                              <p className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">Dr. {enc.Provider?.last_name || 'N/A'}</p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm text-gray-800"><span className="text-xs font-bold text-gray-400 uppercase mr-2">Complaint:</span> {enc.chief_complaint || 'N/A'}</p>
                              <p className="text-sm text-gray-800"><span className="text-xs font-bold text-gray-400 uppercase mr-2">Diagnosis:</span> {enc.diagnosis || 'N/A'}</p>
                            </div>
                          </div>
                        ))
                      )
                    )}

                    {historyTab === 'medications' && (
                      (() => {
                        const visitsWithRx = historyData.encounters.filter((e: any) => e.Prescriptions?.length > 0);
                        return visitsWithRx.length === 0 ? (
                          <p className="text-center text-gray-400 py-12 font-medium">No prescription history found.</p>
                        ) : (
                          visitsWithRx.map((enc: any) => (
                            <div key={enc.encounter_id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden border-l-4 border-green-500 mb-4">
                              <div className="bg-green-50/50 px-5 py-3 border-b border-green-100 flex justify-between items-center">
                                <p className="text-sm font-black text-gray-900">{new Date(enc.encounter_date).toLocaleDateString()}</p>
                                <p className="text-[10px] text-green-700 uppercase font-bold">Dr. {enc.Provider?.last_name}</p>
                              </div>
                              <div className="p-5 space-y-4">
                                {enc.Prescriptions.map((rx: any, idx: number) => (
                                  <div key={idx} className={`${idx !== 0 ? 'pt-4 border-t border-gray-100' : ''}`}>
                                    <p className="text-base font-bold text-gray-900">{rx.medication_name}</p>
                                    <div className="flex justify-between items-center mt-1">
                                      <p className="text-sm text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded">{rx.dosage} • {rx.frequency} • {rx.duration_days} days</p>
                                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">PRC: {rx.prescriber_prc_number || 'N/A'}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))
                        );
                      })()
                    )}

                    {historyTab === 'records' && (
                      historyData.records.length === 0 ? (
                        <p className="text-center text-gray-400 py-12 font-medium">No uploaded records found.</p>
                      ) : (
                        historyData.records.map((rec: any) => (
                          <div key={rec.record_id} className="p-5 bg-white border border-gray-100 rounded-xl flex items-center justify-between shadow-sm">
                            <div>
                              <p className="font-bold text-gray-900">{rec.document_type}</p>
                              <p className="text-xs text-gray-500 mt-1">{new Date(rec.created_at).toLocaleDateString()} • {rec.description}</p>
                            </div>
                            <a href={rec.file_url} target="_blank" rel="noreferrer" className="px-4 py-2 bg-blue-50 text-blue-600 font-bold text-xs rounded-lg hover:bg-blue-100 transition">View File</a>
                          </div>
                        ))
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ProviderLayout>
  );
}
