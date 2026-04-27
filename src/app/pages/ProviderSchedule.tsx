import { Calendar as CalendarIcon, Clock, Filter, Plus, ChevronLeft, ChevronRight, User } from "lucide-react";
import { ProviderLayout } from "../components/ProviderLayout";

export function ProviderSchedule() {
  const appointments = [
    { id: "APT-2026-042", patient: "Carlos Mendoza", time: "09:00 AM", duration: "30m", type: "Follow-up", status: "Waiting", color: "orange" },
    { id: "APT-2026-043", patient: "Maria Santos", time: "10:30 AM", duration: "45m", type: "New Consultation", status: "Confirmed", color: "blue" },
    { id: "APT-2026-044", patient: "Elena Cruz", time: "01:00 PM", duration: "30m", type: "Check-up", status: "Confirmed", color: "blue" },
    { id: "APT-2026-045", patient: "Juan Dela Cruz", time: "02:30 PM", duration: "60m", type: "Procedure", status: "Pending", color: "gray" },
    { id: "APT-2026-046", patient: "Sofia Reyes", time: "04:00 PM", duration: "30m", type: "Lab Review", status: "Confirmed", color: "blue" },
  ];

  return (
    <ProviderLayout>
      <div className="min-h-screen p-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Schedule & Bookings</h1>
            <p className="text-gray-600">Manage your patient appointments and calendar</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center gap-2 font-bold">
              <Filter className="w-5 h-5" />
              Filter
            </button>
            <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-lg hover:opacity-90 transition flex items-center gap-2 font-bold">
              <Plus className="w-5 h-5" />
              Add Booking
            </button>
          </div>
        </div>

        {/* Calendar Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-lg hover:bg-gray-100 transition"><ChevronLeft className="w-5 h-5" /></button>
            <h2 className="text-xl font-bold text-gray-900">May 15, 2026</h2>
            <button className="p-2 rounded-lg hover:bg-gray-100 transition"><ChevronRight className="w-5 h-5" /></button>
          </div>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button className="px-4 py-1.5 bg-white shadow-sm rounded-md text-sm font-bold text-gray-900">Day</button>
            <button className="px-4 py-1.5 rounded-md text-sm font-bold text-gray-600 hover:text-gray-900">Week</button>
            <button className="px-4 py-1.5 rounded-md text-sm font-bold text-gray-600 hover:text-gray-900">Month</button>
          </div>
        </div>

        {/* Schedule List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-700 uppercase tracking-wider text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" /> Today's Agenda
            </h3>
            <span className="text-sm text-gray-500 font-bold">{appointments.length} Appointments</span>
          </div>
          
          <div className="divide-y divide-gray-100">
            {appointments.map((apt) => (
              <div key={apt.id} className="p-6 hover:bg-gray-50 transition flex items-center gap-6">
                
                {/* Time Column */}
                <div className="w-32 text-right border-r-4 border-gray-200 pr-6 border-opacity-50" style={{ borderRightColor: apt.color === 'blue' ? '#3b82f6' : apt.color === 'orange' ? '#f97316' : '#9ca3af' }}>
                  <p className="text-lg font-bold text-gray-900">{apt.time}</p>
                  <p className="text-sm text-gray-500">{apt.duration}</p>
                </div>

                {/* Patient Info */}
                <div className="flex-1 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full bg-${apt.color}-100 flex items-center justify-center`}>
                    <User className={`w-6 h-6 text-${apt.color}-600`} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">{apt.patient}</h4>
                    <p className="text-sm text-gray-600">{apt.id} • {apt.type}</p>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 bg-${apt.color}-100 text-${apt.color}-700 rounded-full text-sm font-bold`}>
                    {apt.status}
                  </span>
                  <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-bold transition text-sm">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </ProviderLayout>
  );
}
