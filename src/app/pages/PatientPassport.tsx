import { Activity, Heart, FileText, Clock, Pill, ChevronRight } from "lucide-react";
import QRCode from "react-qr-code";
import { Link, useNavigate } from "react-router";
import { PatientBottomNav } from "../components/PatientBottomNav";
import { useEffect, useState } from "react";
import { api } from "../api/client";

export function PatientPassport() {
  const [patient, setPatient] = useState<any>(null);
  const [encounters, setEncounters] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [qrToken, setQrToken] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, encounterData, qrData, recordsData] = await Promise.all([
          api.get('/patient/profile'),
          api.get('/patient/encounters'),
          api.get('/patient/qr-token'),
          api.get('/patient/records')
        ]);
        setPatient(profileData);
        setEncounters(encounterData);
        setQrToken(qrData.token_string);
        setRecords(recordsData);
      } catch (error) {
        console.error("Failed to fetch passport data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Loading passport...</div>;
  if (!patient) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Failed to load passport. Please log in again.</div>;

  const formatDate = (dateStr: string) =>
    dateStr ? new Date(dateStr).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';

  // Combine latest data for Recent Records overview
  const allActivity = [
    ...encounters.map(e => ({
      id: `enc-${e.encounter_id}`,
      type: 'visit',
      date: e.encounter_date,
      title: e.chief_complaint || 'Consultation',
      subtitle: e.Provider ? `Dr. ${e.Provider.last_name}` : 'Unknown',
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
    ...encounters.flatMap(e => (e.Prescriptions || []).map((rx: any, idx: number) => ({
      id: `rx-${e.encounter_id}-${idx}`,
      type: 'medication',
      date: e.encounter_date,
      title: rx.medication_name,
      subtitle: rx.dosage,
      icon: Pill,
      color: 'text-teal-600',
      bg: 'bg-teal-100',
      data: { ...rx, encounter_date: e.encounter_date, provider: e.Provider }
    })))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm mb-6">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-6 h-6 text-blue-600" />
            <h1 className="text-lg font-bold text-gray-900">NCHO Patient-Link</h1>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome, {patient.first_name} {patient.last_name}</h2>
          <p className="text-sm text-gray-600">Your digital health passport is ready to use</p>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 space-y-4">
        {/* QR Code Highlight */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Your Health Passport QR CODE</h3>
          <div className="bg-gray-50 rounded-lg p-6 mb-4 flex justify-center">
            <div className="w-48 h-48 bg-white border-4 border-gray-300 rounded-lg flex items-center justify-center p-2">
              {qrToken ? (
                <QRCode value={qrToken} size={160} style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
              ) : (
                <div className="animate-pulse bg-gray-200 w-full h-full rounded"></div>
              )}
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Patient ID</p>
            <p className="text-xl font-bold text-blue-600 mb-4">{patient.patient_id}</p>
            <p className="text-xs text-gray-500">
              Show this QR code to any NCHO healthcare provider to grant access to your health records
            </p>
          </div>
        </div>

        {/* Unified Recent Records */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Recent Health Records
            </h3>
            <button 
              onClick={() => navigate('/medical-records')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 transition"
            >
              View All
            </button>
          </div>
          
          {allActivity.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {allActivity.map(item => {
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
                        <p className="text-sm text-gray-900 font-bold">{enc.diagnosis || 'Pending results'}</p>
                      </div>
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
                    </div>
                  );
                }
                
                return null;
              })}
            </div>
          ) : (
            <div className="p-6 text-center text-sm text-gray-500">
              No recent records found.
            </div>
          )}
          
          <div className="p-3 bg-gray-50 text-center">
             <button 
               onClick={() => navigate('/medical-records')}
               className="text-sm font-bold text-slate-700 hover:text-slate-900 w-full"
             >
               Go to Complete Records
             </button>
          </div>
        </div>

        {/* Vitals & Allergies Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <p className="text-sm text-gray-600 mb-2">Blood Type</p>
            <p className="text-4xl font-bold text-red-600">{patient.blood_type || 'N/A'}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600 mb-3">Allergies</p>
            <div className="space-y-2">
              {patient.allergies ? (
                <span className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                  {patient.allergies}
                </span>
              ) : (
                <span className="text-xs text-gray-500">None reported</span>
              )}
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-gray-50 rounded-xl shadow-sm p-6 mb-8">
          <h3 className="font-bold text-gray-900 mb-4">Personal Information</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-gray-600">Full Name</p>
              <p className="font-bold text-gray-900">{patient.first_name} {patient.last_name}</p>
            </div>
            <div>
              <p className="text-gray-600">Date of Birth</p>
              <p className="font-bold text-gray-900">
                {patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : 'Not provided'}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Contact Number</p>
              <p className="font-bold text-gray-900">{patient.contact_number || 'Not provided'}</p>
            </div>
          </div>
        </div>
      </div>

      <PatientBottomNav />
    </div>
  );
}
