import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, Save, Activity, Clipboard, Pill, X, Shield, Clock, CheckCircle2, AlertTriangle, FileText } from "lucide-react";
import { ProviderLayout } from "../components/ProviderLayout";
import { api } from "../api/client";

export function EncounterWorkspace() {
  const { encounterId } = useParams();
  const navigate = useNavigate();
  
  const [encounter, setEncounter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchParams] = useSearchParams();
  const isResumed = searchParams.get('resumed') === 'true';

  // Modal states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [cancelling, setCancelling] = useState(false);

  // History Modal State
  const [showHistory, setShowHistory] = useState(false);
  const [historyTab, setHistoryTab] = useState('visits');
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyData, setHistoryData] = useState({ encounters: [], records: [] });

  // ── Backend Draft Logic ──────────────────────────────────────────────
  const clearDraft = () => {}; // No-op now that we use backend

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

  // First-encounter patient fields
  const [isFirstEncounter, setIsFirstEncounter] = useState(false);
  const [patientBloodType, setPatientBloodType] = useState("");
  const [patientAllergies, setPatientAllergies] = useState("");

  const user = JSON.parse(localStorage.getItem('ncho_user') || '{}');
  const roleType = user.role_type || 'PHYSICIAN';

  // Backend Auto-Save indicator
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const draftTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save draft whenever form changes
  useEffect(() => {
    if (loading) return; // Don't auto-save while initially loading
    
    setIsSavingDraft(true);
    
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    
    draftTimerRef.current = setTimeout(async () => {
      try {
        const payload = {
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
        };
        await api.put(`/encounters/${encounterId}/draft`, payload);
      } catch (err) {
        console.error("Failed to save draft to backend:", err);
      } finally {
        setIsSavingDraft(false);
      }
    }, 1500);

    return () => {
      if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    };
  }, [vitals, clinical, prescriptions, encounterId, loading]);

  useEffect(() => {
    const fetchEncounter = async () => {
      try {
        const data = await api.get(`/encounters/${encounterId}`);
        setEncounter(data);
        
        // Hydrate state from backend
        if (data.bp_systolic) setVitals(v => ({ ...v, bp_systolic: data.bp_systolic.toString() }));
        if (data.bp_diastolic) setVitals(v => ({ ...v, bp_diastolic: data.bp_diastolic.toString() }));
        if (data.temperature) setVitals(v => ({ ...v, temperature: data.temperature.toString() }));
        if (data.weight) setVitals(v => ({ ...v, weight: data.weight.toString() }));
        
        if (data.chief_complaint) setClinical(c => ({ ...c, chief_complaint: data.chief_complaint }));
        if (data.diagnosis) setClinical(c => ({ ...c, diagnosis: data.diagnosis }));
        if (data.treatment_plan) setClinical(c => ({ ...c, treatment_plan: data.treatment_plan }));
        
        if (data.Prescriptions && data.Prescriptions.length > 0) {
          setPrescriptions(data.Prescriptions.map((rx: any) => ({
            medication_name: rx.medication_name,
            dosage: rx.dosage,
            frequency: rx.frequency,
            duration_days: rx.duration_days.toString()
          })));
        }

        // Detect first encounter: check if patient has any prior COMPLETED encounters
        const priorEncounters = await api.get(`/provider/encounters/${data.patient_id}`);
        if (priorEncounters.length === 0) {
          setIsFirstEncounter(true);
          // Pre-fill with existing values so provider can review/correct
          setPatientBloodType(data.Patient?.blood_type || "");
          setPatientAllergies(data.Patient?.allergies || "");
        }
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

  // Open summary review modal (validation first)
  const handleRequestFinalize = () => {
    if (!clinical.chief_complaint.trim() || !clinical.diagnosis.trim()) {
      setErrorMessage("Chief Complaint and Diagnosis are required to complete the encounter.");
      setShowErrorModal(true);
      return;
    }
    setShowSummaryModal(true);
  };

  // Actually submit after provider confirms summary
  const handleConfirmFinalize = async () => {
    setShowSummaryModal(false);
    setSaving(true);
    try {
      const payload: any = {
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
      };
      if (isFirstEncounter) {
        payload.blood_type = patientBloodType;
        payload.allergies = patientAllergies;
      }
      await api.post('/encounters/clinical', payload);
      clearDraft();
      setShowSuccessModal(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save clinical record");
      setShowErrorModal(true);
    } finally {
      setSaving(false);
    }
  };

  // Cancel encounter with DB cleanup
  const handleConfirmCancel = async () => {
    setCancelling(true);
    try {
      await api.delete(`/encounters/${encounterId}`);
    } catch (_) {
      // ignore – may already be gone
    } finally {
      clearDraft();
      setCancelling(false);
      navigate('/provider');
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
              <button
                onClick={() => setShowCancelModal(true)}
                className="flex items-center gap-2 text-red-500 font-bold mb-2 hover:text-red-700 transition"
              >
                <ArrowLeft className="w-5 h-5" /> Cancel & Exit Encounter
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                Clinical Consultation Workspace
              </h1>
              <p className="text-gray-600 mt-2">
                Patient: <span className="font-bold text-gray-900 uppercase">{encounter.Patient?.first_name} {encounter.Patient?.last_name}</span>
                <span className="mx-2 text-gray-300">|</span>
                Patient ID: <span className="font-bold text-blue-600">{encounter.Patient?.patient_id}</span>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm font-medium text-gray-400">
                {isSavingDraft ? (
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4 animate-spin" /> Saving draft...</span>
                ) : (
                  <span className="flex items-center gap-1 text-green-500"><CheckCircle2 className="w-4 h-4" /> Draft saved</span>
                )}
              </div>
              <button
                onClick={handleRequestFinalize}
                disabled={saving}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-xl font-bold shadow-lg hover:opacity-90 transition flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Finalize & Complete Visit'}
                <Save className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* Resumed Encounter Banner */}
          {isResumed && (
            <div className="mb-4 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <p className="font-bold text-amber-900">Resuming Previous Encounter</p>
                <p className="text-sm text-amber-700">An unfinished encounter was found. You can continue where you left off or cancel it using the button above.</p>
              </div>
            </div>
          )}

          {/* First Encounter Banner */}
          {isFirstEncounter && (
            <div className="mb-6 bg-orange-50 border-l-4 border-orange-500 p-4 rounded-xl flex items-start gap-3">
              <Activity className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-orange-900">First Encounter — Patient Intake Required</p>
                <p className="text-sm text-orange-700 mt-1">
                  This is the patient's first visit. Please fill in their <strong>Blood Type</strong> and <strong>Allergies</strong> in the Patient Overview panel on the right. These will be saved permanently to the patient's record.
                </p>
              </div>
            </div>
          )}

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
                    {isFirstEncounter ? (
                      <select
                        value={patientBloodType}
                        onChange={(e) => setPatientBloodType(e.target.value)}
                        className="border-2 border-orange-300 rounded-lg px-2 py-1 text-sm font-bold text-red-600 bg-orange-50 outline-none focus:border-orange-500"
                      >
                        <option value="">Select...</option>
                        {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bt => (
                          <option key={bt} value={bt}>{bt}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="font-bold text-red-600 text-lg">{encounter.Patient?.blood_type || 'N/A'}</span>
                    )}
                  </div>
                  <div className="pt-2">
                    <span className="text-gray-500 font-medium block mb-2">Allergies
                      {isFirstEncounter && <span className="ml-1 text-xs text-orange-600 font-normal">(editable — first visit)</span>}
                    </span>
                    {isFirstEncounter ? (
                      <input
                        type="text"
                        value={patientAllergies}
                        onChange={(e) => setPatientAllergies(e.target.value)}
                        placeholder="e.g. Penicillin, Aspirin or None"
                        className="w-full border-2 border-orange-300 rounded-lg px-3 py-2 text-sm text-red-700 bg-orange-50 outline-none focus:border-orange-500"
                      />
                    ) : (
                      <div className="bg-red-50 text-red-700 p-3 rounded-lg font-medium">
                        {encounter.Patient?.allergies || 'None reported'}
                      </div>
                    )}
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

        {/* ── CANCEL CONFIRMATION MODAL ─────────────────────── */}
        {showCancelModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowCancelModal(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-5">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Cancel This Encounter?</h2>
              <p className="text-sm text-gray-500 text-center mb-8">
                This will permanently delete the encounter and all unsaved clinical notes. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition"
                >
                  Keep Working
                </button>
                <button
                  onClick={handleConfirmCancel}
                  disabled={cancelling}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition disabled:opacity-60"
                >
                  {cancelling ? 'Cancelling...' : 'Yes, Cancel Encounter'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── ENCOUNTER SUMMARY MODAL ───────────────────────── */}
        {showSummaryModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowSummaryModal(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Review Before Submitting</h2>
                  <p className="text-xs text-gray-400">Confirm all details are correct</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Patient</p>
                  <p className="font-bold text-gray-900">{encounter.Patient?.first_name} {encounter.Patient?.last_name}</p>
                  <p className="text-sm text-blue-600">{encounter.Patient?.patient_id}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-3 text-sm">
                  {vitals.bp_systolic && <div><p className="text-gray-400 text-xs">BP</p><p className="font-bold">{vitals.bp_systolic}/{vitals.bp_diastolic} mmHg</p></div>}
                  {vitals.temperature && <div><p className="text-gray-400 text-xs">Temp</p><p className="font-bold">{vitals.temperature}°C</p></div>}
                  {vitals.weight && <div><p className="text-gray-400 text-xs">Weight</p><p className="font-bold">{vitals.weight} kg</p></div>}
                </div>
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Chief Complaint</p>
                  <p className="text-sm text-gray-800">{clinical.chief_complaint}</p>
                </div>
                <div className="bg-teal-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-teal-500 uppercase tracking-widest mb-1">Diagnosis</p>
                  <p className="text-sm font-bold text-gray-900">{clinical.diagnosis}</p>
                </div>
                {clinical.treatment_plan && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Treatment Plan</p>
                    <p className="text-sm text-gray-700">{clinical.treatment_plan}</p>
                  </div>
                )}
                {prescriptions.length > 0 && (
                  <div className="bg-green-50 rounded-xl p-4">
                    <p className="text-xs font-bold text-green-500 uppercase tracking-widest mb-3">Prescriptions ({prescriptions.length})</p>
                    <div className="space-y-2">
                      {prescriptions.map((rx, i) => (
                        <div key={i} className="flex justify-between items-center bg-white rounded-lg px-3 py-2">
                          <p className="text-sm font-bold text-gray-900">{rx.medication_name || '—'}</p>
                          <p className="text-xs text-green-600">{rx.dosage} • {rx.frequency} • {rx.duration_days}d</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowSummaryModal(false)} className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition">
                  Go Back & Edit
                </button>
                <button onClick={handleConfirmFinalize} className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-xl font-bold hover:opacity-90 transition flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" /> Confirm & Submit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── SUCCESS MODAL ─────────────────────────────────── */}
        {showSuccessModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mx-auto mb-5">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Encounter Completed!</h2>
              <p className="text-sm text-gray-500 mb-2">The clinical record has been saved and the patient's history has been updated.</p>
              <p className="text-xs text-gray-400 mb-8">All entries are logged in compliance with the Data Privacy Act of 2012.</p>
              <button
                onClick={() => navigate('/provider')}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-xl font-bold hover:opacity-90 transition"
              >
                Return to Patient Directory
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
              <h2 className="text-xl font-bold text-gray-900 mb-2">Cannot Complete</h2>
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
