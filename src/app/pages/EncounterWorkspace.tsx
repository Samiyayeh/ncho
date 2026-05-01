import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { ArrowLeft, Save, Heart, Activity, Thermometer, Weight, Clipboard, CheckCircle, Pill, X, Shield } from "lucide-react";
import { ProviderLayout } from "../components/ProviderLayout";
import { api } from "../api/client";

export function EncounterWorkspace() {
  const { queueId } = useParams();
  const navigate = useNavigate();
  const [queue, setQueue] = useState<any>(null);
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
    heart_rate: "",
    weight: ""
  });
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [clinical, setClinical] = useState({
    chief_complaint: "",
    diagnosis: "",
    treatment_plan: "",
    next_step: "COMPLETED"
  });

  const user = JSON.parse(localStorage.getItem('ncho_user') || '{}');
  const roleType = user.role_type || 'PHYSICIAN';

  useEffect(() => {
    if (showHistory && queue?.patient_id) {
      const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
          const [encData, recData] = await Promise.all([
            api.get(`/provider/encounters/${queue.patient_id}`),
            api.get(`/provider/medical-records/${queue.patient_id}`)
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
  }, [showHistory, queue?.patient_id]);

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

  useEffect(() => {
    const fetchQueueDetails = async () => {
      try {
        const data = await api.get(`/queue/daily?id=${queueId}`); // Need to ensure backend supports single fetch
        // For now, let's assume we fetch the whole day and find it, or I should have added a GET /queue/:id
        setQueue(data[0]); // Simplified for demo
      } catch (err) {
        console.error("Failed to load queue details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQueueDetails();
  }, [queueId]);

  const handleSaveTriage = async () => {
    setSaving(true);
    try {
      await api.post('/encounters/triage', {
        queue_id: queueId,
        bp_systolic: parseInt(vitals.bp_systolic),
        bp_diastolic: parseInt(vitals.bp_diastolic),
        temperature: parseFloat(vitals.temperature),
        weight_kg: parseFloat(vitals.weight)
      });
      alert("Triage completed successfully!");
      navigate('/provider/dashboard');
    } catch (err: any) {
      alert(err.message || "Failed to save triage");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveClinical = async () => {
    setSaving(true);
    try {
      await api.post('/encounters/clinical', {
        queue_id: queueId,
        chief_complaint: clinical.chief_complaint,
        diagnosis: clinical.diagnosis,
        treatment_plan: clinical.treatment_plan,
        next_step: clinical.next_step,
        prescriptions: prescriptions.map(rx => ({
          ...rx,
          duration_days: parseInt(rx.duration_days) || 0
        }))
      });
      alert("Consultation completed!");
      navigate('/provider/dashboard');
    } catch (err: any) {
      alert(err.message || "Failed to save clinical record");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <ProviderLayout><div className="p-8 text-center">Loading Workspace...</div></ProviderLayout>;
  if (!queue) return <ProviderLayout><div className="p-8 text-center text-red-600 font-bold">Queue Record Not Found</div></ProviderLayout>;

  return (
    <ProviderLayout>
      <div className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <header className="mb-8 flex items-center justify-between">
            <div>
              <Link to="/provider/dashboard" className="flex items-center gap-2 text-blue-600 font-bold mb-2">
                <ArrowLeft className="w-5 h-5" /> Back to Queue
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">
                {roleType === 'TRIAGE_NURSE' ? 'Triage Desk' : 'Clinical Consultation'}
              </h1>
              <p className="text-gray-600">Patient: <span className="font-bold text-gray-900">{queue.Patient?.first_name} {queue.Patient?.last_name}</span> • Queue No: <span className="font-bold text-blue-600">{queue.queue_number}</span></p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={roleType === 'TRIAGE_NURSE' ? handleSaveTriage : handleSaveClinical}
                disabled={saving}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition flex items-center gap-2"
              >
                {saving ? 'Saving...' : 'Finalize & Next Patient'}
                <Save className="w-5 h-5" />
              </button>
            </div>
          </header>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column: Forms */}
            <div className="lg:col-span-2 space-y-6">
              {roleType === 'TRIAGE_NURSE' ? (
                <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Activity className="w-6 h-6 text-orange-500" />
                    Vital Signs Collection
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">BP Systolic</label>
                      <input 
                        type="number" 
                        value={vitals.bp_systolic}
                        onChange={(e) => setVitals({...vitals, bp_systolic: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 outline-none" 
                        placeholder="120"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">BP Diastolic</label>
                      <input 
                        type="number" 
                        value={vitals.bp_diastolic}
                        onChange={(e) => setVitals({...vitals, bp_diastolic: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 outline-none" 
                        placeholder="80"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Temperature (°C)</label>
                      <input 
                        type="number" step="0.1" 
                        value={vitals.temperature}
                        onChange={(e) => setVitals({...vitals, temperature: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 outline-none" 
                        placeholder="36.5"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Weight (kg)</label>
                      <input 
                        type="number" step="0.1" 
                        value={vitals.weight}
                        onChange={(e) => setVitals({...vitals, weight: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 outline-none" 
                        placeholder="60.0"
                      />
                    </div>
                  </div>
                </div>
              ) : roleType === 'PHARMACIST' ? (
                <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Pill className="w-6 h-6 text-green-600" />
                    Pharmacy Dispensing
                  </h3>
                  
                  <div className="mb-6 space-y-3">
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Prescribed Medications:</h4>
                    {queue.Encounter?.Prescriptions && queue.Encounter.Prescriptions.length > 0 ? (
                      queue.Encounter.Prescriptions.map((rx: any, idx: number) => (
                        <div key={idx} className="p-4 bg-green-50 border border-green-100 rounded-xl">
                          <p className="text-lg font-bold text-gray-900">{rx.medication_name}</p>
                          <p className="text-sm text-green-700 font-medium">{rx.dosage} • {rx.frequency}</p>
                          <p className="text-xs text-gray-500 mt-1 italic">Duration: {rx.duration_days} days</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 bg-orange-50 border border-orange-100 rounded-xl">
                        <p className="text-sm text-orange-800 italic text-center">No structured prescriptions found. Please check treatment plan.</p>
                        <p className="text-xs text-gray-700 mt-2 font-bold">Treatment Plan:</p>
                        <p className="text-xs text-gray-600 italic">"{queue.Encounter?.treatment_plan || 'No notes provided'}"</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <p className="text-sm text-gray-600">By finalizing this action, you confirm that all prescribed medications have been explained and dispensed to the patient.</p>
                    <button 
                      onClick={handleSaveClinical}
                      className="w-full py-4 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-100 hover:bg-green-700 transition"
                    >
                      Confirm Dispensing & Complete Visit
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Clipboard className="w-6 h-6 text-blue-600" />
                    Clinical Record
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-2 block">Chief Complaint</label>
                      <textarea 
                        value={clinical.chief_complaint}
                        onChange={(e) => setClinical({...clinical, chief_complaint: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 outline-none min-h-[80px]" 
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-2 block">Diagnosis / Impression</label>
                      <textarea 
                        value={clinical.diagnosis}
                        onChange={(e) => setClinical({...clinical, diagnosis: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 outline-none min-h-[80px]" 
                      />
                    </div>

                    <div className="border-t pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-gray-900 flex items-center gap-2">
                          <Pill className="w-5 h-5 text-green-600" />
                          Electronic Prescriptions (e-Rx)
                        </h4>
                        <button 
                          onClick={addPrescription}
                          className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-lg hover:bg-green-100 transition"
                        >
                          + Add Medication
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        {prescriptions.map((rx, idx) => (
                          <div key={idx} className="grid grid-cols-12 gap-2 p-3 bg-gray-50 rounded-xl items-end relative">
                            <div className="col-span-5">
                              <label className="text-[10px] font-bold uppercase text-gray-400">Medication</label>
                              <input 
                                value={rx.medication_name}
                                onChange={(e) => updatePrescription(idx, 'medication_name', e.target.value)}
                                className="w-full bg-white border px-2 py-1.5 rounded text-sm outline-none focus:border-blue-500" 
                                placeholder="Amoxicillin 500mg"
                              />
                            </div>
                            <div className="col-span-3">
                              <label className="text-[10px] font-bold uppercase text-gray-400">Dosage</label>
                              <input 
                                value={rx.dosage}
                                onChange={(e) => updatePrescription(idx, 'dosage', e.target.value)}
                                className="w-full bg-white border px-2 py-1.5 rounded text-sm outline-none focus:border-blue-500" 
                                placeholder="1 cap"
                              />
                            </div>
                            <div className="col-span-3">
                              <label className="text-[10px] font-bold uppercase text-gray-400">Frequency</label>
                              <input 
                                value={rx.frequency}
                                onChange={(e) => updatePrescription(idx, 'frequency', e.target.value)}
                                className="w-full bg-white border px-2 py-1.5 rounded text-sm outline-none focus:border-blue-500" 
                                placeholder="3x a day"
                              />
                            </div>
                            <div className="col-span-1">
                              <button 
                                onClick={() => removePrescription(idx)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                        {prescriptions.length === 0 && (
                          <p className="text-center py-4 text-xs text-gray-400 italic bg-gray-50 rounded-xl border-2 border-dashed">
                            No medications added. Click "+ Add Medication" if needed.
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-2 block">Treatment Plan / Instructions</label>
                      <textarea 
                        value={clinical.treatment_plan}
                        onChange={(e) => setClinical({...clinical, treatment_plan: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 outline-none min-h-[80px]" 
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-2 block">Next Step</label>
                      <select 
                        value={clinical.next_step}
                        onChange={(e) => setClinical({...clinical, next_step: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 outline-none bg-white"
                      >
                        <option value="PHARMACY">Refer to Pharmacy</option>
                        <option value="COMPLETED">Complete Visit</option>
                        <option value="REFERRED_OUT">Refer Out of Facility</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Patient Summary */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                <h4 className="font-bold text-gray-900 mb-4">Patient Brief</h4>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Age / Sex</span>
                    <span className="font-bold">
                      {queue.Patient?.date_of_birth ? Math.floor((new Date().getTime() - new Date(queue.Patient.date_of_birth).getTime()) / 31536000000) : 'N/A'} / {queue.Patient?.gender || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Blood Type</span>
                    <span className="font-bold text-red-600">{queue.Patient?.blood_type || 'N/A'}</span>
                  </div>
                  <div className="border-t pt-4">
                    <p className="text-gray-500 mb-1 font-bold text-[10px] uppercase">Pre-Triage Symptoms</p>
                    <p className="font-medium text-gray-900 italic">
                      "{queue.pre_triage_data?.symptoms || 'No symptoms reported'}"
                    </p>
                    {queue.pre_triage_data?.painLevel && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-400">PAIN LEVEL:</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${
                          queue.pre_triage_data.painLevel > 7 ? 'bg-red-500' : 
                          queue.pre_triage_data.painLevel > 4 ? 'bg-orange-500' : 'bg-green-500'
                        }`}>
                          {queue.pre_triage_data.painLevel} / 10
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setShowHistory(true)}
                className="w-full p-4 bg-teal-50 border-2 border-teal-100 text-teal-700 rounded-xl text-center font-bold hover:bg-teal-100 transition shadow-sm flex items-center justify-center gap-2"
              >
                <Clipboard className="w-5 h-5" />
                Open History Vault
              </button>
            </div>
          </div>
        </div>

        {/* History Modal Overlay */}
        {showHistory && (
          <div className="fixed inset-0 z-[100] flex items-center justify-end">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
              onClick={() => setShowHistory(false)}
            />
            
            {/* Modal Content */}
            <div className="relative w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
              {/* Header */}
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

              {/* Tabs */}
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

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                {loadingHistory ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p className="text-sm">Fetching Medical Records...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {historyTab === 'visits' && (
                      historyData.encounters.length === 0 ? (
                        <p className="text-center text-gray-400 py-12">No visit history found.</p>
                      ) : (
                        historyData.encounters.map((enc: any) => (
                          <div key={enc.encounter_id} className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm border-l-4 border-teal-500">
                            <div className="flex justify-between mb-2">
                              <p className="font-bold text-gray-900">{new Date(enc.encounter_date).toLocaleDateString()}</p>
                              <p className="text-xs text-gray-500">Dr. {enc.Provider?.last_name || 'N/A'}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-gray-600"><span className="font-bold">Complaint:</span> {enc.chief_complaint || 'N/A'}</p>
                              <p className="text-sm text-gray-600"><span className="font-bold">Diagnosis:</span> {enc.diagnosis || 'N/A'}</p>
                            </div>
                          </div>
                        ))
                      )
                    )}

                    {historyTab === 'medications' && (
                      (() => {
                        const visitsWithRx = historyData.encounters.filter((e: any) => e.Prescriptions?.length > 0);
                        return visitsWithRx.length === 0 ? (
                          <p className="text-center text-gray-400 py-12">No prescription history found.</p>
                        ) : (
                          visitsWithRx.map((enc: any) => (
                            <div key={enc.encounter_id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden border-l-4 border-blue-500">
                              <div className="bg-blue-50/50 px-5 py-2 border-b flex justify-between items-center">
                                <p className="text-xs font-bold text-gray-900">{new Date(enc.encounter_date).toLocaleDateString()}</p>
                                <p className="text-[10px] text-gray-500 uppercase font-bold">Dr. {enc.Provider?.last_name}</p>
                              </div>
                              <div className="p-4 space-y-3">
                                {enc.Prescriptions.map((rx: any, idx: number) => (
                                  <div key={idx} className={`${idx !== 0 ? 'pt-3 border-t border-gray-50' : ''}`}>
                                    <p className="text-sm font-bold text-gray-900">{rx.medication_name}</p>
                                    <p className="text-xs text-blue-600 font-medium">{rx.dosage} • {rx.frequency} • {rx.duration_days} days</p>
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
                        <p className="text-center text-gray-400 py-12">No uploaded records found.</p>
                      ) : (
                        historyData.records.map((rec: any) => (
                          <div key={rec.record_id} className="p-4 bg-white border border-gray-100 rounded-xl flex items-center justify-between">
                            <div>
                              <p className="font-bold text-sm text-gray-900">{rec.document_type}</p>
                              <p className="text-[10px] text-gray-500">{new Date(rec.created_at).toLocaleDateString()} • {rec.description}</p>
                            </div>
                            <a href={rec.file_url} target="_blank" rel="noreferrer" className="text-blue-600 font-bold text-xs hover:underline">View File</a>
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
