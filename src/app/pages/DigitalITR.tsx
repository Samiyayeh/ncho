import { Save, X } from "lucide-react";
import { Link } from "react-router";
import { useState } from "react";
import { ProviderLayout } from "../components/ProviderLayout";

export function DigitalITR() {
  const [bloodPressure, setBloodPressure] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [temperature, setTemperature] = useState("");
  const [weight, setWeight] = useState("");
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatmentPlan, setTreatmentPlan] = useState("");
  const [notes, setNotes] = useState("");

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
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <p className="text-xs text-blue-700 mb-1">Patient ID</p>
              <p className="font-bold text-gray-900">NCH-2026-001234</p>
            </div>
            <div className="h-8 w-px bg-blue-300"></div>
            <div>
              <p className="text-xs text-blue-700 mb-1">Name</p>
              <p className="font-bold text-gray-900">Maria Santos</p>
            </div>
            <div className="h-8 w-px bg-blue-300"></div>
            <div>
              <p className="text-xs text-blue-700 mb-1">Age / Gender</p>
              <p className="font-bold text-gray-900">40, Female</p>
            </div>
            <div className="h-8 w-px bg-blue-300"></div>
            <div>
              <p className="text-xs text-blue-700 mb-1">Blood Type</p>
              <p className="font-bold text-red-600">O+</p>
            </div>
            <div className="h-8 w-px bg-blue-300"></div>
            <div>
              <p className="text-xs text-blue-700 mb-1">Allergies</p>
              <span className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                Penicillin
              </span>
            </div>
          </div>
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
              <label className="block text-sm font-bold text-gray-700 mb-2">Treatment Plan</label>
              <textarea
                value={treatmentPlan}
                onChange={(e) => setTreatmentPlan(e.target.value)}
                placeholder="List medications, dosages, and treatment instructions..."
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none resize-none"
              />
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
