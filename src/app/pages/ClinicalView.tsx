import { Phone, MapPin, Calendar, Activity, FileText, Clock, Shield } from "lucide-react";
import { Link, useParams } from "react-router";
import { useState, useEffect } from "react";
import { ProviderLayout } from "../components/ProviderLayout";
import { api } from "../api/client";

export function ClinicalView() {
  const { patientId } = useParams();
  const [activeTab, setActiveTab] = useState("summary");
  const [patient, setPatient] = useState<any>(null);
  const [encounters, setEncounters] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId) return;

    const fetchAll = async () => {
      try {
        const [directory, encounterData, recordData] = await Promise.all([
          api.get('/provider/directory'),
          api.get(`/provider/encounters/${patientId}`),
          api.get(`/provider/medical-records/${patientId}`),
        ]);

        const found = directory.find((p: any) => String(p.patient_id) === String(patientId));
        setPatient(found || null);
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
            <p className="text-gray-600">Complete medical history and records</p>
          </div>
          <Link
            to={`/provider/itr?patient=${patientId}`}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-lg hover:opacity-90 transition"
          >
            New Encounter
          </Link>
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
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">Verified Patient</span>
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
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-teal-500" />
                    <h3 className="text-xl font-bold text-gray-900">Recent Visits</h3>
                  </div>
                  {encounters.length === 0 ? (
                    <p className="text-gray-500">No encounters recorded yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {encounters.slice(0, 3).map((enc: any) => (
                        <div key={enc.encounter_id} className="p-4 bg-gray-50 rounded-lg border-l-4 border-teal-500">
                          <div className="flex items-start justify-between mb-2">
                            <p className="font-bold text-gray-900">{formatDate(enc.encounter_date)}</p>
                            <p className="text-sm text-gray-600">
                              {enc.Provider ? `Dr. ${enc.Provider.last_name}` : 'Unknown Provider'}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-600">
                              <span className="font-bold">Chief Complaint:</span> {enc.chief_complaint || 'N/A'}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-bold">Diagnosis:</span> {enc.diagnosis || 'N/A'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
                        <a
                          href={rec.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-50 text-blue-700 font-bold rounded-lg hover:bg-blue-100 transition text-sm"
                        >
                          View File
                        </a>
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
    </ProviderLayout>
  );
}
