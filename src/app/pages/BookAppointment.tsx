import { useState } from "react";
import { ArrowLeft, Calendar, MapPin, Clock, Search, ChevronRight, Stethoscope, CheckCircle2 } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";

export function BookAppointment() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Mock Data
  const hospitals = [
    { id: "h1", name: "NCHO Main Center", address: "123 Health Ave, Manila", distance: "2.5 km" },
    { id: "h2", name: "City Health Clinic", address: "45 Wellness Blvd, Quezon City", distance: "5.1 km" },
  ];

  const specialties = [
    { id: "s1", name: "Cardiology", icon: "❤️" },
    { id: "s2", name: "General Practice", icon: "👨‍⚕️" },
    { id: "s3", name: "Pediatrics", icon: "👶" },
    { id: "s4", name: "Dermatology", icon: "✨" },
  ];

  const doctors = [
    { id: "d1", name: "Dr. Elena Rodriguez", specialty: "Cardiology", rating: "4.9", availability: "Available Today" },
    { id: "d2", name: "Dr. James Smith", specialty: "Cardiology", rating: "4.7", availability: "Available Tomorrow" },
  ];

  const timeSlots = ["09:00 AM", "09:30 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:30 PM"];

  // Selections
  const [selectedHospital, setSelectedHospital] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => {
    if (step === 1) navigate("/appointments");
    else setStep(prev => prev - 1);
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Select Location</h2>
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search hospitals or clinics..." 
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div className="space-y-3">
              {hospitals.map(hospital => (
                <div 
                  key={hospital.id}
                  onClick={() => { setSelectedHospital(hospital.id); handleNext(); }}
                  className={`p-4 rounded-xl border ${selectedHospital === hospital.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'} cursor-pointer hover:border-blue-300 transition-all`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <MapPin className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{hospital.name}</h3>
                        <p className="text-xs text-gray-500">{hospital.address}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-blue-600">{hospital.distance}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Select Specialty</h2>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {specialties.map(spec => (
                <div 
                  key={spec.id}
                  onClick={() => { setSelectedSpecialty(spec.name); handleNext(); }}
                  className={`p-4 rounded-xl border ${selectedSpecialty === spec.name ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'} cursor-pointer hover:border-blue-300 transition-all text-center`}
                >
                  <div className="text-3xl mb-2">{spec.icon}</div>
                  <h3 className="font-bold text-gray-800 text-sm">{spec.name}</h3>
                </div>
              ))}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Select Doctor</h2>
            <div className="space-y-4 mb-6">
              {doctors.map(doc => (
                <div 
                  key={doc.id}
                  onClick={() => { setSelectedDoctor(doc.name); handleNext(); }}
                  className={`p-4 rounded-xl border ${selectedDoctor === doc.name ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'} cursor-pointer hover:border-blue-300 transition-all`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <Stethoscope className="w-6 h-6 text-gray-500" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{doc.name}</h3>
                        <p className="text-xs text-gray-500">{doc.specialty}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-green-600 block">{doc.availability}</span>
                      <span className="text-xs text-gray-500">⭐ {doc.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Select Date & Time</h2>
            
            {/* Simple Date Picker Mock */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-700 mb-3">May 2026</h3>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {[14, 15, 16, 17, 18, 19, 20].map(day => (
                  <div 
                    key={day}
                    onClick={() => setSelectedDate(`May ${day}, 2026`)}
                    className={`min-w-[60px] p-3 rounded-xl border text-center cursor-pointer flex-shrink-0 transition-all ${
                      selectedDate === `May ${day}, 2026` ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white border-gray-200 text-gray-700'
                    }`}
                  >
                    <span className="text-xs block mb-1 opacity-80">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][day % 7]}</span>
                    <span className="text-lg font-bold">{day}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-sm font-bold text-gray-700 mb-3">Available Time Slots</h3>
              <div className="grid grid-cols-3 gap-3">
                {timeSlots.map(time => (
                  <div 
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`p-2 rounded-lg border text-center text-sm cursor-pointer transition-all ${
                      selectedTime === time ? 'bg-teal-500 text-white border-teal-500 shadow-md' : 'bg-white border-gray-200 text-gray-700'
                    }`}
                  >
                    {time}
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={handleNext}
              disabled={!selectedDate || !selectedTime}
              className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors shadow-md"
            >
              Review Booking
            </button>
          </motion.div>
        );

      case 5:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Confirm Booking</h2>
              <p className="text-sm text-gray-600">Please review your appointment details</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4 mb-8">
              <div>
                <p className="text-xs text-gray-500 mb-1">Doctor</p>
                <p className="font-bold text-gray-900">{selectedDoctor}</p>
                <p className="text-sm text-blue-600">{selectedSpecialty}</p>
              </div>
              
              <div className="flex items-center gap-4 py-4 border-y border-gray-100">
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Date</p>
                  <p className="font-bold text-gray-900">{selectedDate}</p>
                </div>
                <div className="w-px h-10 bg-gray-200"></div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Time</p>
                  <p className="font-bold text-gray-900">{selectedTime}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Location</p>
                <p className="font-bold text-gray-900">NCHO Main Center</p>
                <p className="text-sm text-gray-600">123 Health Ave, Manila</p>
              </div>
            </div>

            <button 
              onClick={() => navigate("/appointments")}
              className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
            >
              Confirm Appointment
            </button>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm mb-6 sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center">
          <button onClick={handleBack} className="p-2 -ml-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1 flex justify-center">
            {/* Step Indicators */}
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map(i => (
                <div 
                  key={i} 
                  className={`h-2 rounded-full transition-all ${
                    step >= i ? 'w-6 bg-blue-600' : 'w-2 bg-gray-200'
                  } ${step === 5 ? 'hidden' : 'block'}`} 
                />
              ))}
            </div>
          </div>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>
      </header>

      <div className="max-w-md mx-auto px-4">
        <AnimatePresence mode="wait">
          {renderStepContent()}
        </AnimatePresence>
      </div>
    </div>
  );
}
