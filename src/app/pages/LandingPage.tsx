import { Heart, Shield, QrCode, FileText, Users, Activity, Lock, Clock, FolderOpen, UserCheck } from "lucide-react";
import { Link } from "react-router";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">NCHO Patient-Link</h1>
              <p className="text-xs text-gray-600">Naga City Health Office</p>
            </div>
          </div>
          <Link
            to="/login"
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-lg hover:opacity-90 transition"
          >
            Login
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="inline-block px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm mb-6">
          Digital Health Passport System
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Your Health Records, <span className="text-blue-600">Always With You</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Say goodbye to heavy paper folders and lost medical records. Access your complete health history anytime, anywhere with a simple QR code.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            to="/register"
            className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-lg text-lg hover:opacity-90 transition"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="inline-block px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-lg text-lg hover:bg-blue-50 transition"
          >
            Login
          </Link>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <QrCode className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">QR Code Access</h3>
            <p className="text-gray-600">
              Show your unique QR code to any NCHO healthcare provider for instant access to your records.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-full mb-4">
              <FileText className="w-8 h-8 text-teal-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Complete Records</h3>
            <p className="text-gray-600">
              All your medical history, lab results, and prescriptions in one secure digital location.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Privacy First</h3>
            <p className="text-gray-600">
              Your data is protected with bank-level encryption and complies with the Data Privacy Act.
            </p>
          </div>
        </div>
      </section>

      {/* Why NCHO Patient-Link */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
          Why NCHO Patient-Link?
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Lock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Data Privacy Compliant</h3>
                <p className="text-gray-600">
                  Fully compliant with the Philippine Data Privacy Act. All access is logged and audited for your protection.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-teal-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Faster Care</h3>
                <p className="text-gray-600">
                  Doctors can access your complete medical history instantly, leading to faster diagnosis and better treatment decisions.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No More Lost Records</h3>
                <p className="text-gray-600">
                  Your health records are securely stored in the cloud. No more worrying about damaged or misplaced documents.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-teal-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Patient-Controlled</h3>
                <p className="text-gray-600">
                  You decide who can access your records. Track every access with detailed audit logs you can review anytime.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-400">
            © 2026 Naga City Health Office. All rights reserved. | Data Privacy Compliant
          </p>
        </div>
      </footer>
    </div>
  );
}
