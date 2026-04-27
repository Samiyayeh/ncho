import { Calendar, Plus, MapPin, Clock, Stethoscope, ChevronRight } from "lucide-react";
import { Link } from "react-router";
import { PatientBottomNav } from "../components/PatientBottomNav";
import { motion } from "framer-motion";

export function Appointments() {
  const upcomingAppointments = [
    {
      id: "APT-2026-001",
      doctor: "Dr. Elena Rodriguez",
      specialty: "Cardiology",
      hospital: "NCHO Main Center",
      date: "May 15, 2026",
      time: "10:00 AM",
      status: "Confirmed",
    },
    {
      id: "APT-2026-002",
      doctor: "Dr. Marcus Chen",
      specialty: "General Practice",
      hospital: "City Health Clinic",
      date: "June 02, 2026",
      time: "2:30 PM",
      status: "Pending",
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm mb-6 sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">Appointments</h1>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 space-y-6">
        
        {/* Book New Appointment Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-teal-500 rounded-xl shadow-lg p-6 text-white"
        >
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold mb-1">Need a consultation?</h2>
              <p className="text-blue-100 text-sm">Book a new appointment with our top specialists.</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
          </div>
          <Link 
            to="/appointments/book" 
            className="w-full flex items-center justify-center gap-2 bg-white text-blue-600 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Book Appointment
          </Link>
        </motion.div>

        {/* Upcoming Appointments List */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Upcoming Visits</h3>
          <div className="space-y-4">
            {upcomingAppointments.map((apt, index) => (
              <motion.div 
                key={apt.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 relative overflow-hidden"
              >
                {/* Status Indicator Bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${apt.status === 'Confirmed' ? 'bg-green-500' : 'bg-orange-400'}`}></div>
                
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">{apt.doctor}</h4>
                    <p className="text-sm text-blue-600 font-medium">{apt.specialty}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    apt.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {apt.status}
                  </span>
                </div>

                <div className="space-y-2 mt-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{apt.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{apt.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{apt.hospital}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xs text-gray-400">ID: {apt.id}</span>
                  <button className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:text-blue-700">
                    View Details
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>

      <PatientBottomNav />
    </div>
  );
}
