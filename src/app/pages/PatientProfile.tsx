import { ArrowLeft, User, Mail, Phone, MapPin, Calendar, CreditCard, ChevronRight } from "lucide-react";
import { Link } from "react-router";
import { PatientBottomNav } from "../components/PatientBottomNav";

export function PatientProfile() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm mb-6">
        <div className="px-4 py-4">
          <Link to="/patient" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-bold">Back to Health Passport</span>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <User className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          </div>
          <p className="text-sm text-gray-600">Personal information and account settings</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4">
        {/* Personal Information */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Personal Information</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <User className="w-5 h-5 text-gray-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Full Name</p>
                <p className="font-bold text-gray-900">Maria Santos</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Date of Birth</p>
                <p className="font-bold text-gray-900">March 15, 1985</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-gray-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Email Address</p>
                <p className="font-bold text-gray-900">maria.santos@email.com</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Phone className="w-5 h-5 text-gray-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Contact Number</p>
                <p className="font-bold text-gray-900">+63 917 123 4567</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <MapPin className="w-5 h-5 text-gray-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Address</p>
                <p className="font-bold text-gray-900">123 Rizal Street, Naga City, Camarines Sur</p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Account Information</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Patient ID</p>
                <p className="font-bold text-gray-900">NCH-2026-001234</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Account Status</p>
                <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                  Active & Verified
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Registration Date</p>
                <p className="font-bold text-gray-900">January 10, 2026</p>
              </div>
            </div>
          </div>
        </div>

        {/* Billing & Payments */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-500 rounded-xl shadow-md p-6 mb-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold">Billing & Payments</h2>
            </div>
          </div>
          <p className="text-blue-100 text-sm mb-4">Manage your medical bills, view outstanding balances, and check your payment history.</p>
          <Link to="/billing" className="w-full flex items-center justify-between bg-white text-blue-600 py-3 px-4 rounded-lg font-bold hover:bg-blue-50 transition-colors shadow-sm">
            <span>View Billing Dashboard</span>
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button className="w-full px-6 py-3 border-2 border-blue-600 text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition">
            Update Contact Information
          </button>
          <button className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition">
            Change Password
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <PatientBottomNav />
    </div>
  );
}
