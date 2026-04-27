import { Phone, MapPin, Calendar, Activity, FileText, Clock, CheckCircle, Shield } from "lucide-react";
import { Link, useParams } from "react-router";
import { useState } from "react";
import { ProviderLayout } from "../components/ProviderLayout";

export function ClinicalView() {
  const { patientId } = useParams();
  const [activeTab, setActiveTab] = useState("summary");

  const labResults = [
    { test: "Complete Blood Count (CBC)", date: "April 10, 2026", status: "Verified", doctor: "Dr. Cruz" },
    { test: "Lipid Profile", date: "April 10, 2026", status: "Verified", doctor: "Dr. Cruz" },
    { test: "Fasting Blood Sugar", date: "March 28, 2026", status: "Verified", doctor: "Dr. Santos" },
  ];

  const visitHistory = [
    {
      date: "April 10, 2026",
      doctor: "Dr. Maria Cruz",
      complaint: "Routine check-up",
      diagnosis: "Essential Hypertension - stable, continue current medication"
    },
    {
      date: "March 28, 2026",
      doctor: "Dr. Juan Santos",
      complaint: "Headache and dizziness",
      diagnosis: "Hypertension - medication adjusted"
    },
    {
      date: "February 15, 2026",
      doctor: "Dr. Ana Reyes",
      complaint: "Annual physical examination",
      diagnosis: "Generally healthy, monitor blood pressure"
    },
  ];

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
            to="/itr"
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-lg hover:opacity-90 transition"
          >
            New Encounter
          </Link>
        </div>
        {/* Patient Header Profile */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-600 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">Maria Santos</h2>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">Verified Patient</span>
              </div>
              <p className="text-gray-600">Patient ID: {patientId || "NCH-2026-001234"}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-gray-600">Date of Birth</p>
                <p className="font-bold text-gray-900">March 15, 1985 (41 years)</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-gray-600">Contact</p>
                <p className="font-bold text-gray-900">+63 917 123 4567</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-gray-600">Address</p>
                <p className="font-bold text-gray-900">123 Rizal St, Naga City</p>
              </div>
            </div>
          </div>
        </div>

        {/* Vitals Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600 mb-2">Blood Type</p>
            <p className="text-5xl font-bold text-red-600">O+</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600 mb-3">Known Allergies</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-4 py-2 bg-red-100 text-red-700 rounded-full font-bold">
                Allergy: Penicillin
              </span>
              <span className="px-4 py-2 bg-red-100 text-red-700 rounded-full font-bold">
                Allergy: Shellfish
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-md mb-6">
          <div className="border-b border-gray-200">
            <div className="flex gap-8 px-6">
              <button
                onClick={() => setActiveTab("summary")}
                className={`py-4 border-b-2 transition ${
                  activeTab === "summary"
                    ? "border-blue-600 text-blue-600 font-bold"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Summary
              </button>
              <button
                onClick={() => setActiveTab("labs")}
                className={`py-4 border-b-2 transition ${
                  activeTab === "labs"
                    ? "border-blue-600 text-blue-600 font-bold"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Lab Results
              </button>
              <button
                onClick={() => setActiveTab("visits")}
                className={`py-4 border-b-2 transition ${
                  activeTab === "visits"
                    ? "border-blue-600 text-blue-600 font-bold"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Visit History
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === "summary" && (
              <div className="space-y-6">
                {/* Recent Lab Results */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h3 className="text-xl font-bold text-gray-900">Recent Lab Results</h3>
                  </div>
                  <div className="space-y-3">
                    {labResults.map((lab, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-bold text-gray-900">{lab.test}</p>
                          <p className="text-sm text-gray-600">{lab.date} • {lab.doctor}</p>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          {lab.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Visits */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-teal-500" />
                    <h3 className="text-xl font-bold text-gray-900">Recent Visits</h3>
                  </div>
                  <div className="space-y-4">
                    {visitHistory.map((visit, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg border-l-4 border-teal-500">
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-bold text-gray-900">{visit.date}</p>
                          <p className="text-sm text-gray-600">{visit.doctor}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">
                            <span className="font-bold">Chief Complaint:</span> {visit.complaint}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-bold">Diagnosis:</span> {visit.diagnosis}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "labs" && (
              <div className="space-y-3">
                {labResults.map((lab, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-gray-900">{lab.test}</p>
                        <p className="text-sm text-gray-600">{lab.date} • {lab.doctor}</p>
                      </div>
                      <div className="text-right">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          {lab.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "visits" && (
              <div className="space-y-4">
                {visitHistory.map((visit, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg border-l-4 border-teal-500">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-bold text-gray-900">{visit.date}</p>
                      <p className="text-sm text-gray-600">{visit.doctor}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        <span className="font-bold">Chief Complaint:</span> {visit.complaint}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-bold">Diagnosis:</span> {visit.diagnosis}
                      </p>
                    </div>
                  </div>
                ))}
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
