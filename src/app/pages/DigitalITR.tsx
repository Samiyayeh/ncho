import { Save, X, Plus, Trash2 } from "lucide-react";
import { Link, useParams } from "react-router";
import { useState, useEffect } from "react";
import { ProviderLayout } from "../components/ProviderLayout";
import { api } from "../api/client";

export function DigitalITR() {
  const { patientId } = useParams();
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const data = await api.get('/provider/directory');
        const found = data.find((p: any) => String(p.patient_id) === String(patientId));
        setPatient(found || data[0]); // fallback
      } catch (error) {
        console.error("Failed to fetch patient", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [patientId]);
  const [bloodPressure, setBloodPressure] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [temperature, setTemperature] = useState("");
  const [weight, setWeight] = useState("");
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");

  const [prescriptions, setPrescriptions] = useState([
    { medicationName: "", dosage: "", frequency: "OD", durationDays: "" },
  ]);

  const addPrescription = () => {
    setPrescriptions([
      ...prescriptions,
      { medicationName: "", dosage: "", frequency: "OD", durationDays: "" },
    ]);
  };

  const updatePrescription = (index: number, field: string, value: string) => {
    const updated = [...prescriptions];
    updated[index] = { ...updated[index], [field]: value };
    setPrescriptions(updated);
  };

  const removePrescription = (index: number) => {
    const updated = prescriptions.filter((_, i) => i !== index);
    setPrescriptions(updated);
  };

  const today = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <ProviderLayout>
      <div className="min-h-screen p-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Patient Encounter</h1>
          <p className="text-gray-600">Dr. R. Villanueva - {today}</p>
        </div>

        {/* Card 1: Read-Only Patient Summary */}
        <div className="bg-gradient-to-r from-blue-100 to-blue-50 border-l-4 border-blue-600 rounded-lg p-6 mb-6">
          {loading ? (
            <p className="text-gray-500">Loading patient data...</p>
          ) : !patient ? (
            <p className="text-red-500">Patient not found</p>
          ) : (
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <p className="text-xs text-blue-700 mb-1">Patient ID</p>
                <p className="font-bold text-gray-900">{patient.patient_id}</p>
              </div>
              <div className="h-8 w-px bg-blue-300"></div>
              <div>
                <p className="text-xs text-blue-700 mb-1">Name</p>
                <p className="font-bold text-gray-900">{patient.first_name} {patient.last_name}</p>
              </div>
              <div className="h-8 w-px bg-blue-300"></div>
              <div>
                <p className="text-xs text-blue-700 mb-1">Contact</p>
                <p className="font-bold text-gray-900">{patient.contact_number || 'N/A'}</p>
              </div>
              <div className="h-8 w-px bg-blue-300"></div>
              <div>
                <p className="text-xs text-blue-700 mb-1">Blood Type</p>
                <p className="font-bold text-red-600">{patient.blood_type || 'N/A'}</p>
              </div>
              <div className="h-8 w-px bg-blue-300"></div>
              <div>
                <p className="text-xs text-blue-700 mb-1">Allergies</p>
                {patient.allergies ? (
                  <span className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                    {patient.allergies}
                  </span>
                ) : (
                  <span className="text-xs text-gray-500 font-bold">None</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Card 2: Vitals & Assessment */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Vitals & Assessment</h2>

          {/* 4-Column Vitals Grid */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Blood Pressure
              </label>
              <input
                type="text"
                value={bloodPressure}
                onChange={(e) => setBloodPressure(e.target.value)}
                placeholder="120/80"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">mmHg</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Heart Rate
              </label>
              <input
                type="text"
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
                placeholder="72"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">bpm</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Temperature
              </label>
              <input
                type="text"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                placeholder="36.5"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">°C</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Weight
              </label>
              <input
                type="text"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="65.5"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">kg</p>
            </div>
          </div>

          {/* Chief Complaint */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Chief Complaint</label>
            <textarea
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              placeholder="Enter the patient's primary complaint or reason for visit..."
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Card 3: Diagnosis & Treatment */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Diagnosis & Treatment</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Clinical Diagnosis</label>
              <textarea
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Enter your clinical diagnosis based on examination and assessment..."
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none resize-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-gray-700">Prescriptions</label>
              </div>
              <div className="space-y-4">
                {prescriptions.map((prescription, index) => (
                  <div key={index} className="flex flex-wrap items-center gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex-1 min-w-[200px]">
                      <input
                        type="text"
                        placeholder="Medication Name"
                        value={prescription.medicationName}
                        onChange={(e) => updatePrescription(index, "medicationName", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-600 focus:outline-none text-sm"
                      />
                    </div>
                    <div className="w-32">
                      <input
                        type="text"
                        placeholder="Dosage"
                        value={prescription.dosage}
                        onChange={(e) => updatePrescription(index, "dosage", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-600 focus:outline-none text-sm"
                      />
                    </div>
                    <div className="w-32">
                      <select
                        value={prescription.frequency}
                        onChange={(e) => updatePrescription(index, "frequency", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-600 focus:outline-none text-sm bg-white"
                      >
                        <option value="OD">OD (1x)</option>
                        <option value="BID">BID (2x)</option>
                        <option value="TID">TID (3x)</option>
                        <option value="QID">QID (4x)</option>
                      </select>
                    </div>
                    <div className="w-32">
                      <input
                        type="number"
                        placeholder="Days"
                        value={prescription.durationDays}
                        onChange={(e) => updatePrescription(index, "durationDays", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-600 focus:outline-none text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removePrescription(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-md transition"
                      title="Remove"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addPrescription}
                className="mt-4 flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition text-sm font-semibold"
              >
                <Plus className="w-4 h-4" />
                Add Another Medication
              </button>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional observations, follow-up instructions, or relevant information..."
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-4 justify-end">
          <Link
            to="/clinical/NCH-2026-001234"
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
          >
            <X className="w-5 h-5" />
            Cancel
          </Link>
          <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-lg hover:opacity-90 transition flex items-center gap-2 font-bold">
            <Save className="w-5 h-5" />
            Save Encounter
          </button>
        </div>
      </div>
    </ProviderLayout>
  );
}
