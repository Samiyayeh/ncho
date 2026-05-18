import { ArrowLeft, FileText, Clock, Pill, X, Activity, Clipboard, Search, Filter } from "lucide-react";
import { Link } from "react-router";
import { useState, useEffect } from "react";
import { PatientBottomNav } from "../components/PatientBottomNav";
import { api } from "../api/client";

export function MedicalRecords() {
  const [activeTab, setActiveTab] = useState<"all" | "records" | "visits" | "medications">("all");
  const [records, setRecords] = useState<any[]>([]);
  const [encounters, setEncounters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVisit, setSelectedVisit] = useState<any>(null);
  const [selectedRx, setSelectedRx] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "visit" | "document" | "medication">("all");

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
      encounter: enc,
    }))
  );

  // Combine data for the "Overview" tab
  const allActivity = [
    ...encounters.map(e => ({
      id: `enc-${e.encounter_id}`,
      type: 'visit',
      date: e.encounter_date,
      title: e.chief_complaint || 'Consultation',
      subtitle: e.Provider ? `Dr. ${e.Provider.last_name}` : 'Unknown Provider',
      icon: Clock,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      data: e
    })),
    ...records.map(r => ({
      id: `rec-${r.record_id}`,
      type: 'document',
      date: r.created_at,
      title: r.document_type,
      subtitle: r.description || (r.Provider ? `Dr. ${r.Provider.last_name}` : 'Uploaded Document'),
      icon: FileText,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
      data: r
    })),
    ...allPrescriptions.map((rx: any, idx: number) => ({
      id: `rx-${rx.prescription_id || idx}`,
      type: 'medication',
      date: rx.encounter_date,
      title: rx.medication_name,
      subtitle: `${rx.dosage} - ${rx.frequency}`,
      icon: Pill,
      color: 'text-teal-600',
      bg: 'bg-teal-100',
      data: rx
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Apply filters
  const filteredActivity = allActivity.filter(item => {
    const search = searchQuery.toLowerCase();
    const formattedDate = formatDate(item.date).toLowerCase();
    const diagnosis = (item.data?.diagnosis || '').toLowerCase();

    const matchesSearch = item.title.toLowerCase().includes(search) || 
                          item.subtitle.toLowerCase().includes(search) ||
                          formattedDate.includes(search) ||
                          diagnosis.includes(search);
                          
    const matchesType = filterType === "all" || item.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleActivityClick = (item: any) => {
    if (item.type === 'visit') {
      setSelectedVisit(item.data);
    } else if (item.type === 'medication') {
      setSelectedRx(item.data);
    } else if (item.type === 'document' && item.data.file_url) {
      window.open(item.data.file_url, '_blank');
    }
  };

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
          <div className="flex border-b border-gray-200 justify-between items-end">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex-1 py-3 px-1 sm:py-4 sm:px-6 text-center transition flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${
                activeTab === "all" ? "border-b-2 border-blue-600 text-blue-600 font-bold" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-[10px] sm:text-sm font-medium">Overview</span>
            </button>
            <button
              onClick={() => setActiveTab("records")}
              className={`flex-1 py-3 px-1 sm:py-4 sm:px-6 text-center transition flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${
                activeTab === "records" ? "border-b-2 border-blue-600 text-blue-600 font-bold" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-[10px] sm:text-sm font-medium">Documents</span>
            </button>
            <button
              onClick={() => setActiveTab("visits")}
              className={`flex-1 py-3 px-1 sm:py-4 sm:px-6 text-center transition flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${
                activeTab === "visits" ? "border-b-2 border-blue-600 text-blue-600 font-bold" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-[10px] sm:text-sm font-medium">Visits</span>
            </button>
            <button
              onClick={() => setActiveTab("medications")}
              className={`flex-1 py-3 px-1 sm:py-4 sm:px-6 text-center transition flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${
                activeTab === "medications" ? "border-b-2 border-blue-600 text-blue-600 font-bold" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Pill className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-[10px] sm:text-sm font-medium">Meds</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">Loading your records...</div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === "all" && (
              <div className="space-y-4">
                {/* Search and Filter */}
                <div className="bg-white rounded-xl shadow-md p-4 flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search records, visits, medications..." 
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <select 
                      className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as any)}
                    >
                      <option value="all">All Types</option>
                      <option value="visit">Visits</option>
                      <option value="document">Documents</option>
                      <option value="medication">Medications</option>
                    </select>
                  </div>
                </div>

                {filteredActivity.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">
                    No records found matching your criteria.
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="divide-y divide-gray-50">
                      {filteredActivity.map((item) => {
                        const Icon = item.icon;

                        if (item.type === 'visit') {
                          const enc = item.data;
                          return (
                            <div key={item.id} className="p-5 flex flex-col gap-3">
                              <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-lg ${item.bg} ${item.color}`}>
                                    <Icon className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-gray-900">{formatDate(enc.encounter_date)}</p>
                                    <p className="text-xs text-gray-500 font-bold uppercase">{item.type}</p>
                                  </div>
                                </div>
                                <span className="text-sm font-medium text-gray-700">
                                  {enc.Provider ? `Dr. ${enc.Provider.last_name}` : 'Unknown'}
                                </span>
                              </div>
                              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Chief Complaint</p>
                                <p className="text-sm text-gray-900 mb-2">{enc.chief_complaint || 'N/A'}</p>
                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Diagnosis / Impression</p>
                                <p className="text-sm text-gray-900 font-bold mb-2">{enc.diagnosis || 'Pending results'}</p>
                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Treatment Plan</p>
                                <p className="text-sm text-gray-900">{enc.treatment_plan || 'No plan specified'}</p>
                              </div>
                              {enc.Prescriptions && enc.Prescriptions.length > 0 && (
                                <div className="flex gap-2 flex-wrap mt-1">
                                  {enc.Prescriptions.map((rx: any, i: number) => (
                                    <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-teal-50 text-teal-700 text-[10px] font-bold rounded-full">
                                      <Pill className="w-3 h-3" />
                                      {rx.medication_name}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        }

                        if (item.type === 'medication') {
                          const rx = item.data;
                          return (
                            <div key={item.id} className="p-5 flex flex-col gap-3">
                              <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-lg ${item.bg} ${item.color}`}>
                                    <Icon className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-gray-900">{rx.medication_name}</p>
                                    <p className="text-xs text-gray-500 font-bold uppercase">{item.type}</p>
                                  </div>
                                </div>
                                <span className="text-xs font-bold text-gray-400">
                                  {formatDate(rx.encounter_date)}
                                </span>
                              </div>
                              <div className="bg-teal-50/50 p-3 rounded-lg border border-teal-100 flex justify-between items-center">
                                <div>
                                  <p className="text-sm font-bold text-teal-900">{rx.dosage}</p>
                                  <p className="text-xs text-teal-700">{rx.frequency} for {rx.duration_days} days</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-[10px] font-bold text-teal-600 uppercase">Prescriber</p>
                                  <p className="text-xs text-teal-800 font-medium">{rx.provider ? `Dr. ${rx.provider.last_name}` : 'N/A'}</p>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        if (item.type === 'document') {
                          const rec = item.data;
                          return (
                            <div key={item.id} className="p-5 flex flex-col gap-3">
                              <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-lg ${item.bg} ${item.color}`}>
                                    <Icon className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-gray-900">{rec.document_type}</p>
                                    <p className="text-xs text-gray-500 font-bold uppercase">{item.type}</p>
                                  </div>
                                </div>
                                <span className="text-xs font-bold text-gray-400">
                                  {formatDate(rec.created_at)}
                                </span>
                              </div>
                              {rec.description && (
                                <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 border border-gray-100">{rec.description}</p>
                              )}
                              {rec.file_url && (
                                <div className="flex justify-end mt-1">
                                  <a href={rec.file_url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg hover:bg-blue-100 transition flex items-center gap-1">
                                    <FileText className="w-3 h-3" /> View File
                                  </a>
                                </div>
                              )}
                            </div>
                          );
                        }
                        
                        return null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Medical Records Tab */}
            {activeTab === "records" && (
              <div className="space-y-4">
                {records.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">No medical documents uploaded yet.</div>
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
                      className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 cursor-pointer hover:shadow-lg transition"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-lg font-bold text-gray-900">{formatDate(enc.encounter_date)}</p>
                          <p className="text-sm text-gray-600">
                            {enc.Provider ? `Dr. ${enc.Provider.last_name} — ${enc.Provider.specialty || 'General Practice'}` : 'Unknown Provider'}
                          </p>
                        </div>
                        <div className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">View Summary</div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase">Chief Complaint</p>
                          <p className="text-sm text-gray-900 truncate">{enc.chief_complaint || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase">Treatment Plan</p>
                          <p className="text-sm text-gray-900 truncate">{enc.treatment_plan || 'No plan specified'}</p>
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
                  const visitsWithRx = encounters
                    .filter((enc: any) => enc.Prescriptions && enc.Prescriptions.length > 0)
                    .sort((a, b) => new Date(b.encounter_date).getTime() - new Date(a.encounter_date).getTime());

                  if (visitsWithRx.length === 0) {
                    return <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">No prescriptions found.</div>;
                  }

                  return (
                    <div className="space-y-4">
                      {visitsWithRx.map((enc: any) => (
                        <div key={enc.encounter_id} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                          <div className="bg-blue-50/50 px-6 py-3 border-b border-blue-100 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-blue-400" />
                              <span className="text-xs font-bold text-gray-700">
                                {new Date(enc.encounter_date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                            <span className="text-xs font-black uppercase text-blue-600">
                              {enc.Provider ? `Dr. ${enc.Provider.last_name}` : 'NCHO'}
                            </span>
                          </div>
                          <div className="divide-y divide-gray-50">
                            {enc.Prescriptions.map((rx: any, idx: number) => (
                              <div 
                                key={idx} 
                                onClick={() => setSelectedRx({
                                  ...rx,
                                  encounter_date: enc.encounter_date,
                                  provider: enc.Provider
                                })}
                                className="p-5 flex items-center justify-between hover:bg-blue-50/30 cursor-pointer transition group"
                              >
                                <div>
                                  <p className="font-bold text-gray-900 group-hover:text-blue-600 transition">{rx.medication_name}</p>
                                  <p className="text-sm text-gray-500 mt-1">
                                    {rx.dosage} • {rx.frequency} • {rx.duration_days} days
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-gray-400 font-mono italic">PRC: {rx.prescriber_prc_number || 'N/A'}</p>
                                  <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-400 rounded text-[9px] font-bold uppercase tracking-tighter">
                                    Ref: {String(rx.prescription_id || '').slice(-8) || 'E-RX'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}
            
            {/* Prescription Detail Modal (Unified View) */}
            {selectedRx && (
              <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedRx(null)} />
                <div className="relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-300">
                  <div className="p-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative">
                    <Pill className="absolute -right-6 -top-6 w-32 h-32 text-white/10 rotate-12 pointer-events-none" />
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                        <Activity className="w-6 h-6 text-white" />
                      </div>
                      <button onClick={() => setSelectedRx(null)} className="p-2 hover:bg-white/20 rounded-full transition">
                        <X className="w-6 h-6 text-white" />
                      </button>
                    </div>
                    <p className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-1">Electronic Prescription</p>
                    <h3 className="text-3xl font-black">{selectedRx.medication_name}</h3>
                  </div>
                  
                  <div className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Dosage</p>
                        <p className="font-bold text-gray-900">{selectedRx.dosage}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Duration</p>
                        <p className="font-bold text-gray-900">{selectedRx.duration_days} Days</p>
                      </div>
                    </div>
                    
                    <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100">
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Frequency</p>
                      <p className="text-xl font-black text-blue-900">{selectedRx.frequency}</p>
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                      <p className="text-xs font-bold text-gray-400 uppercase mb-3">Prescribed By</p>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                          DR
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{selectedRx.provider ? `Dr. ${selectedRx.provider.first_name} ${selectedRx.provider.last_name}` : 'NCHO Provider'}</p>
                          <p className="text-[10px] text-blue-600 font-bold uppercase">PRC License: {selectedRx.prescriber_prc_number || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase">
                      <span>Ref: {selectedRx.prescription_id || 'Digital-ID'}</span>
                      <span>{new Date(selectedRx.encounter_date).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="p-6 bg-gray-50 border-t">
                    <button 
                      onClick={() => setSelectedRx(null)}
                      className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-200"
                    >
                      Close Card
                    </button>
                  </div>
                </div>
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
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Treatment Plan</p>
                      <p className="text-sm text-gray-900 font-bold">{selectedVisit.treatment_plan || 'No plan specified'}</p>
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
