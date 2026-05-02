import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Stethoscope, Pill, Heart, Activity, UserPlus, Smile, Baby, Shield, Clock, CheckCircle } from "lucide-react";
import { api } from "../api/client";
import { PatientBottomNav } from "../components/PatientBottomNav";

type Step = 'service' | 'triage' | 'tracking';

export function PatientQueue() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('service');
  const [selectedService, setSelectedService] = useState<string>("");
  const [symptoms, setSymptoms] = useState("");
  const [painLevel, setPainLevel] = useState(1);
  const [queueRecord, setQueueRecord] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [profile, activeQ] = await Promise.all([
          api.get('/patient/profile'),
          api.get('/patient/active-queue')
        ]);
        setPatient(profile);
        if (activeQ) {
          setQueueRecord(activeQ);
          setStep('tracking');
        }
      } catch (err) {
        console.error("Failed to fetch queue initialization data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const services = [
    { id: 'OUTPATIENT', label: 'Outpatient (OPD)', icon: Stethoscope, color: 'bg-blue-100 text-blue-600' },
    { id: 'MEDICINE_DISPENSING', label: 'Pharmacy', icon: Pill, color: 'bg-green-100 text-green-600' },
    { id: 'YAKAP', label: 'YAKAP Program', icon: Heart, color: 'bg-pink-100 text-pink-600' },
    { id: 'TB_DOTS', label: 'TB DOTS', icon: Activity, color: 'bg-orange-100 text-orange-600' },
    { id: 'SOCIAL_HYGIENE', label: 'Social Hygiene', icon: Shield, color: 'bg-purple-100 text-purple-600' },
    { id: 'DENTAL', label: 'Dental Clinic', icon: Smile, color: 'bg-teal-100 text-teal-600' },
    { id: 'HEALTH_PROGRAM', label: 'Health Program', icon: UserPlus, color: 'bg-indigo-100 text-indigo-600' },
  ];

  const handleJoinQueue = async () => {
    setLoading(true);
    try {
      const res = await api.post('/queue/join', {
        patient_id: patient.patient_id,
        service_type: selectedService,
        pre_triage_data: { symptoms, painLevel }
      });
      setQueueRecord(res);
      setStep('tracking');
    } catch (err: any) {
      alert(err.message || "Failed to join queue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm mb-6">
        <div className="px-4 py-4">
          <Link to="/patient" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-bold">Back</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Virtual Queue</h1>
          <p className="text-sm text-gray-600">Secure your spot in the clinic</p>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4">
        {step === 'service' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Select Service Department</h2>
              <div className="grid grid-cols-1 gap-3">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => { setSelectedService(service.id); setStep('triage'); }}
                    className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition text-left group"
                  >
                    <div className={`p-3 rounded-lg ${service.color}`}>
                      <service.icon className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-gray-800 flex-1">{service.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 'triage' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Pre-Triage Assessment</h2>
              <p className="text-sm text-gray-600 mb-6">Briefly describe your condition to help us route you correctly.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Main Symptoms / Reason for Visit</label>
                  <textarea
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="e.g. Fever for 2 days, Cough, Check-up"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:outline-none min-h-[120px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Pain Level (1-10)</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={painLevel}
                      onChange={(e) => setPainLevel(parseInt(e.target.value))}
                      className="flex-1 accent-blue-600"
                    />
                    <span className="text-2xl font-bold text-blue-600 w-8">{painLevel}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Mild</span>
                    <span>Severe</span>
                  </div>
                </div>

                <button
                  onClick={handleJoinQueue}
                  disabled={loading || !symptoms}
                  className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:bg-gray-300 disabled:shadow-none transition-all flex items-center justify-center gap-2"
                >
                  {loading ? 'Joining...' : 'Generate Queue Number'}
                  <CheckCircle className="w-5 h-5" />
                </button>
                
                <button 
                  onClick={() => setStep('service')}
                  className="w-full py-2 text-gray-500 font-bold hover:text-gray-700"
                >
                  Change Department
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'tracking' && queueRecord && (
          <div className="space-y-6 animate-in zoom-in-95 duration-300">
            <div className="bg-white p-8 rounded-3xl shadow-xl border-4 border-blue-500 text-center">
              <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-10 h-10 text-blue-600" />
              </div>
              
              <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-2">Your Position</p>
              <h2 className="text-5xl font-black text-gray-900 mb-4">{queueRecord.queue_number}</h2>
              
              <div className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-bold mb-8">
                {queueRecord.status.replace('_', ' ')}
              </div>

              <div className="border-t pt-6 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Department</span>
                  <span className="font-bold text-gray-900">{queueRecord.service_type.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Queue Date</span>
                  <span className="font-bold text-gray-900">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-xl flex gap-3">
              <Shield className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-800 font-medium">
                Please proceed to the Triage section or the specified department window. Show your Health Passport QR code for verification.
              </p>
            </div>

            <button
              onClick={() => navigate('/patient')}
              className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold shadow-lg"
            >
              Back to Health Passport
            </button>
          </div>
        )}
      </div>

      <PatientBottomNav />
    </div>
  );
}
