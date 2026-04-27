import { ArrowLeft, CreditCard, Receipt, Download, ChevronRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router";
import { useState } from "react";
import { motion } from "framer-motion";

export function Billing() {
  const [activeTab, setActiveTab] = useState<"unpaid" | "history">("unpaid");

  const bills = [
    {
      id: "BILL-2026-001",
      appointmentId: "APT-2026-001",
      hospital: "NCHO Main Center",
      service: "Cardiology Consultation & ECG",
      date: "May 15, 2026",
      dueDate: "May 22, 2026",
      amount: "₱ 2,500.00",
      status: "Unpaid",
    },
    {
      id: "BILL-2026-002",
      appointmentId: "APT-2026-002",
      hospital: "City Health Clinic",
      service: "General Practice Visit",
      date: "April 10, 2026",
      dueDate: "April 17, 2026",
      amount: "₱ 800.00",
      status: "Unpaid",
    }
  ];

  const paidHistory = [
    {
      id: "BILL-2025-089",
      appointmentId: "APT-2025-089",
      hospital: "NCHO Main Center",
      service: "Annual Physical Exam",
      date: "November 20, 2025",
      paidOn: "November 20, 2025",
      amount: "₱ 3,200.00",
      status: "Paid",
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm mb-6">
        <div className="px-4 py-4">
          <Link to="/patient/profile" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-bold">Back to Profile</span>
          </Link>
          <div className="flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Billing & Invoices</h1>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 space-y-6">

        {/* Total Balance Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden"
        >
          {/* Decorative background circle */}
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10"></div>
          
          <p className="text-blue-100 text-sm font-medium mb-1">Total Outstanding Balance</p>
          <h2 className="text-4xl font-bold mb-6">₱ 3,300.00</h2>
          
          <div className="flex gap-3">
            <button className="flex-1 bg-blue-500 hover:bg-blue-600 transition text-white font-bold py-3 px-4 rounded-xl text-sm shadow-md">
              Pay All Now
            </button>
            <button className="flex-1 bg-white/20 hover:bg-white/30 transition text-white font-bold py-3 px-4 rounded-xl text-sm border border-white/30 backdrop-blur-sm">
              Payment Methods
            </button>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("unpaid")}
            className={`flex-1 py-3 text-center text-sm transition ${
              activeTab === "unpaid"
                ? "border-b-2 border-blue-600 text-blue-600 font-bold"
                : "text-gray-500 hover:text-gray-900 font-medium"
            }`}
          >
            Unpaid Bills (2)
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-3 text-center text-sm transition ${
              activeTab === "history"
                ? "border-b-2 border-blue-600 text-blue-600 font-bold"
                : "text-gray-500 hover:text-gray-900 font-medium"
            }`}
          >
            Payment History
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "unpaid" && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {bills.map((bill, i) => (
              <div key={bill.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-400"></div>
                
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900">{bill.hospital}</h3>
                    <p className="text-sm text-gray-600">{bill.service}</p>
                  </div>
                  <p className="font-bold text-lg text-gray-900">{bill.amount}</p>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <span className="bg-gray-100 px-2 py-1 rounded">Date: {bill.date}</span>
                  <span className="text-orange-600 font-bold bg-orange-50 px-2 py-1 rounded">Due: {bill.dueDate}</span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400">Ref: {bill.id}</p>
                  <button className="text-blue-600 font-bold text-sm hover:text-blue-700 transition flex items-center gap-1">
                    Pay Now <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === "history" && (
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {paidHistory.map((bill) => (
              <div key={bill.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900">{bill.hospital}</h3>
                    <p className="text-sm text-gray-600">{bill.service}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 mb-1">{bill.amount}</p>
                    <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full flex items-center justify-end gap-1 w-fit ml-auto">
                      <CheckCircle2 className="w-3 h-3" /> Paid
                    </span>
                  </div>
                </div>

                <div className="text-xs text-gray-500 mb-4">
                  Paid on {bill.paidOn} via Visa ending in •••• 4242
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400">Ref: {bill.id}</p>
                  <button className="text-gray-600 font-bold text-sm hover:text-gray-900 transition flex items-center gap-1">
                    <Download className="w-4 h-4" /> Receipt
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        )}

      </div>
    </div>
  );
}
