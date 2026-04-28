import { Activity, Heart, FileText, Clock, ShieldAlert } from "lucide-react";
import QRCode from "react-qr-code";
import { PatientBottomNav } from "../components/PatientBottomNav";
import { useEffect, useState } from "react";
import { api } from "../api/client";

export function PatientPassport() {
  const [patient, setPatient] = useState<any>(null);
  const [encounters, setEncounters] = useState<any[]>([]);
  const [qrToken, setQrToken] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, encounterData, qrData] = await Promise.all([
          api.get('/patient/profile'),
          api.get('/patient/encounters'),
          api.get('/patient/qr-token')
        ]);
        setPatient(profileData);
        setEncounters(encounterData);
        setQrToken(qrData.token_string);
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

  // Derive most recent diagnosis from encounters
  const latestEncounter = encounters[0] || null;

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
        {/* QR Code Card or Verification Warning */}
        {patient.account_status === 'UNVERIFIED' ? (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl shadow-md p-6">
            <div className="flex flex-col items-center text-center">
              <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
              <h3 className="text-xl font-bold text-red-900 mb-2">Verification Required</h3>
              <p className="text-sm text-red-800">
                Your account is currently inactive. To protect your medical data, please present your valid Government ID to the NCHO Triage Desk to activate your Health Passport and generate your secure QR access token.
              </p>
            </div>
          </div>
        ) : (
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
        )}

        {/* Vitals Grid */}
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

        {/* Last Diagnosis */}
        {latestEncounter && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-5 h-5 text-orange-500" />
              <p className="text-sm font-bold text-gray-700">Last Visit Diagnosis</p>
            </div>
            <p className="font-bold text-gray-900">{latestEncounter.diagnosis || 'No diagnosis recorded'}</p>
            <p className="text-xs text-gray-500 mt-1">
              {latestEncounter.encounter_date
                ? new Date(latestEncounter.encounter_date).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
                : ''}
              {latestEncounter.Provider ? ` — Dr. ${latestEncounter.Provider.last_name}` : ''}
            </p>
          </div>
        )}

        {/* Recent Encounters */}
        {encounters.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Recent Visits</h3>
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {encounters.slice(0, 3).map((enc: any) => (
                <div key={enc.encounter_id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{enc.chief_complaint || 'Consultation'}</p>
                    <p className="text-xs text-gray-500">
                      {enc.encounter_date ? new Date(enc.encounter_date).toLocaleDateString() : ''}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Completed</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Medical Records Link */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Medical Records</h3>
            <FileText className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-sm text-gray-600">View your uploaded lab results, prescriptions, and documents in the Records tab below.</p>
        </div>

        {/* Personal Information */}
        <div className="bg-gray-50 rounded-xl shadow-sm p-6">
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
            <div>
              <p className="text-gray-600">Address</p>
              <p className="font-bold text-gray-900">{patient.address || 'Not provided'}</p>
            </div>
          </div>
        </div>
      </div>

      <PatientBottomNav />
    </div>
  );
}
