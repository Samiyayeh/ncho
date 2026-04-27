import { ArrowLeft, FileText, Clock, CheckCircle, Pill, RefreshCw, AlertCircle } from "lucide-react";
import { Link } from "react-router";
import { useState } from "react";
import { PatientBottomNav } from "../components/PatientBottomNav";

export function MedicalRecords() {
  const [activeTab, setActiveTab] = useState<"records" | "visits" | "medications">("records");

  const labResults = [
    {
      test: "Complete Blood Count (CBC)",
      date: "April 10, 2026",
      results: [
        { name: "White Blood Cells", value: "7.2", unit: "10³/µL", range: "4.5-11.0", status: "normal" },
        { name: "Red Blood Cells", value: "4.8", unit: "10⁶/µL", range: "4.5-5.5", status: "normal" },
        { name: "Hemoglobin", value: "14.2", unit: "g/dL", range: "13.5-17.5", status: "normal" },
        { name: "Platelets", value: "245", unit: "10³/µL", range: "150-400", status: "normal" },
      ],
      doctor: "Dr. Maria Cruz",
    },
    {
      test: "Lipid Profile",
      date: "April 10, 2026",
      results: [
        { name: "Total Cholesterol", value: "195", unit: "mg/dL", range: "<200", status: "normal" },
        { name: "LDL Cholesterol", value: "115", unit: "mg/dL", range: "<130", status: "normal" },
        { name: "HDL Cholesterol", value: "52", unit: "mg/dL", range: ">40", status: "normal" },
        { name: "Triglycerides", value: "140", unit: "mg/dL", range: "<150", status: "normal" },
      ],
      doctor: "Dr. Maria Cruz",
    },
    {
      test: "Fasting Blood Sugar",
      date: "March 28, 2026",
      results: [
        { name: "Glucose Level", value: "98", unit: "mg/dL", range: "70-100", status: "normal" },
      ],
      doctor: "Dr. Juan Santos",
    },
  ];

  const visitHistory = [
    {
      date: "April 10, 2026",
      doctor: "Dr. Maria Cruz",
      complaint: "Routine check-up and follow-up for hypertension",
      diagnosis: "Essential Hypertension - stable, continue current medication",
      vitals: "BP: 128/82 mmHg, HR: 74 bpm, Temp: 36.7°C",
    },
    {
      date: "March 28, 2026",
      doctor: "Dr. Juan Santos",
      complaint: "Headache and dizziness for 2 days",
      diagnosis: "Hypertension - medication adjusted to Amlodipine 10mg",
      vitals: "BP: 145/92 mmHg, HR: 78 bpm, Temp: 36.5°C",
    },
    {
      date: "February 15, 2026",
      doctor: "Dr. Ana Reyes",
      complaint: "Annual physical examination",
      diagnosis: "Generally healthy, monitor blood pressure regularly",
      vitals: "BP: 132/84 mmHg, HR: 72 bpm, Temp: 36.6°C",
    },
    {
      date: "November 20, 2025",
      doctor: "Dr. Roberto Villanueva",
      complaint: "Persistent cough and sore throat",
      diagnosis: "Acute upper respiratory tract infection, prescribed antibiotics",
      vitals: "BP: 125/80 mmHg, HR: 76 bpm, Temp: 37.2°C",
    },
  ];

  const activeMedications = [
    {
      id: "MED-001",
      name: "Amlodipine",
      dosage: "10mg",
      frequency: "Once daily in the morning",
      prescribedBy: "Dr. Juan Santos",
      datePrescribed: "March 28, 2026",
      refillsLeft: 2,
      status: "Active",
    },
    {
      id: "MED-002",
      name: "Atorvastatin",
      dosage: "20mg",
      frequency: "Once daily at bedtime",
      prescribedBy: "Dr. Maria Cruz",
      datePrescribed: "January 15, 2026",
      refillsLeft: 0,
      status: "Refill Needed",
    }
  ];

  const prescriptionHistory = [
    {
      id: "RX-2025-089",
      medication: "Amoxicillin",
      dosage: "500mg",
      frequency: "Every 8 hours for 7 days",
      prescribedBy: "Dr. Roberto Villanueva",
      date: "November 20, 2025",
      status: "Completed",
    }
  ];

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
          <p className="text-sm text-gray-600">Complete history of lab results and clinical visits</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4">
        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-md mb-4">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("records")}
              className={`flex-1 py-4 px-6 text-center transition ${
                activeTab === "records"
                  ? "border-b-2 border-blue-600 text-blue-600 font-bold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <FileText className="w-5 h-5 inline-block mr-2" />
              Medical Records
            </button>
            <button
              onClick={() => setActiveTab("visits")}
              className={`flex-1 py-4 px-6 text-center transition ${
                activeTab === "visits"
                  ? "border-b-2 border-blue-600 text-blue-600 font-bold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Clock className="w-5 h-5 inline-block mr-2" />
              Visit History
            </button>
            <button
              onClick={() => setActiveTab("medications")}
              className={`flex-1 py-4 px-6 text-center transition ${
                activeTab === "medications"
                  ? "border-b-2 border-blue-600 text-blue-600 font-bold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Pill className="w-5 h-5 inline-block mr-2" />
              Medications
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "records" && (
          <div className="space-y-4">
            {labResults.map((lab, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{lab.test}</h3>
                    <p className="text-sm text-gray-600">{lab.date} • {lab.doctor}</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Verified
                  </span>
                </div>

                <div className="space-y-3">
                  {lab.results.map((result, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">{result.name}</p>
                        <p className="text-sm text-gray-600">Normal Range: {result.range} {result.unit}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">
                          {result.value} <span className="text-sm text-gray-600">{result.unit}</span>
                        </p>
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Normal</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "visits" && (
          <div className="space-y-4">
            {visitHistory.map((visit, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-teal-500">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-lg font-bold text-gray-900">{visit.date}</p>
                    <p className="text-sm text-gray-600">{visit.doctor}</p>
                  </div>
                  <Clock className="w-5 h-5 text-teal-500" />
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-bold text-gray-700">Chief Complaint:</p>
                    <p className="text-sm text-gray-900">{visit.complaint}</p>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-gray-700">Diagnosis:</p>
                    <p className="text-sm text-gray-900">{visit.diagnosis}</p>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-gray-700">Vital Signs:</p>
                    <p className="text-sm text-gray-900">{visit.vitals}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "medications" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Active Medications</h2>
              <div className="space-y-4">
                {activeMedications.map((med, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{med.name}</h3>
                        <p className="text-blue-600 font-bold">{med.dosage}</p>
                      </div>
                      {med.status === "Refill Needed" ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                          <AlertCircle className="w-3 h-3" /> Refill Needed
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">Active</span>
                      )}
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <p className="text-sm font-bold text-gray-700">Instructions:</p>
                      <p className="text-sm text-gray-900">{med.frequency}</p>
                    </div>

                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-xs text-gray-500">Prescribed by: <span className="font-semibold text-gray-700">{med.prescribedBy}</span></p>
                        <p className="text-xs text-gray-500">Refills left: <span className="font-semibold text-gray-700">{med.refillsLeft}</span></p>
                      </div>
                      <button className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-bold transition ${
                        med.status === "Refill Needed" 
                          ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md" 
                          : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}>
                        <RefreshCw className="w-4 h-4" />
                        Request Refill
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4 mt-8">Prescription History</h2>
              <div className="space-y-3">
                {prescriptionHistory.map((rx, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 opacity-75 hover:opacity-100 transition">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-gray-800">{rx.medication} - {rx.dosage}</h4>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{rx.status}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">{rx.frequency}</p>
                    <p className="text-xs text-gray-400">Prescribed {rx.date} by {rx.prescribedBy}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <PatientBottomNav />
    </div>
  );
}
