import { useState, useEffect } from 'react';
import { ProviderLayout } from '../components/ProviderLayout';
import { api, getApiUrl } from '../api/client';
import { Check, X, ShieldAlert, FileText, Eye, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface PendingPatient {
  patient_id: string;
  first_name: string;
  last_name: string;
  email: string;
  date_of_birth: string;
  id_type: string;
  id_number: string;
  id_image_url: string;
  created_at: string;
}

export function VerificationQueue() {
  const [patients, setPatients] = useState<PendingPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<PendingPatient | null>(null);
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    fetchPendingVerifications();
  }, []);

  const fetchPendingVerifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/provider/pending-verifications');
      setPatients(res);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch pending verifications');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (patientId: string, status: 'VERIFIED' | 'REJECTED') => {
    if (!confirm(`Are you sure you want to mark this ID as ${status}?`)) return;

    try {
      setReviewing(true);
      await api.put(`/provider/verify-patient/${patientId}`, { status });
      toast.success(`Patient verification ${status}`);
      setSelectedPatient(null);
      fetchPendingVerifications();
    } catch (error: any) {
      toast.error(error.message || 'Failed to review verification');
    } finally {
      setReviewing(false);
    }
  };

  // Securely get the image URL (must pass through the auth endpoint)
  const getImageUrl = (filename: string) => {
    const token = localStorage.getItem('ncho_token');
    return `${getApiUrl()}/api/admin/view-id/${filename}?token=${token}`; // Assuming token auth might be needed if not using cookies. 
    // Wait, since it's an img src, we can't easily pass Authorization headers without a fetch request.
    // An alternative is an object URL, but let's try this first. If it fails due to auth middleware, we will fetch it as a blob.
  };

  const [imageSrc, setImageSrc] = useState<string>('');

  useEffect(() => {
    if (selectedPatient?.id_image_url) {
      // Securely fetch image as blob to bypass the inability to send Auth headers in <img src="">
      const fetchImage = async () => {
        try {
          const response = await fetch(`${getApiUrl()}/api/provider/view-id/${selectedPatient.id_image_url}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('ncho_token')}`
            }
          });
          if (response.ok) {
            const blob = await response.blob();
            setImageSrc(URL.createObjectURL(blob));
          } else {
            setImageSrc('');
          }
        } catch (error) {
          console.error("Failed to load secure image", error);
        }
      };
      fetchImage();
    } else {
      setImageSrc('');
    }
  }, [selectedPatient]);


  return (
    <ProviderLayout>
      <div className="min-h-screen p-8">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <ShieldAlert className="w-8 h-8 text-blue-600" />
              ID Verification Queue
            </h1>
            <p className="text-gray-600 mt-2">Review and verify patient government IDs securely.</p>
          </div>
          <button 
            onClick={fetchPendingVerifications}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition font-bold text-sm"
          >
            Refresh Queue
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-100">
                  <th className="p-4 font-bold text-sm text-gray-700">Patient</th>
                  <th className="p-4 font-bold text-sm text-gray-700">DOB</th>
                  <th className="p-4 font-bold text-sm text-gray-700">ID Type</th>
                  <th className="p-4 font-bold text-sm text-gray-700">Submitted</th>
                  <th className="p-4 font-bold text-sm text-gray-700 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">Loading pending verifications...</td>
                  </tr>
                ) : patients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <Check className="w-12 h-12 text-green-400 mb-2" />
                        <p>No pending verifications at the moment.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  patients.map((patient) => (
                    <tr key={patient.patient_id} className="hover:bg-blue-50/50 transition">
                      <td className="p-4">
                        <div className="font-bold text-gray-900">{patient.first_name} {patient.last_name}</div>
                        <div className="text-xs text-gray-500">{patient.patient_id}</div>
                        <div className="text-xs text-gray-500">{patient.email}</div>
                      </td>
                      <td className="p-4 text-sm text-gray-600">{new Date(patient.date_of_birth).toLocaleDateString()}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
                          <FileText className="w-3 h-3" />
                          {patient.id_type}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-600">{new Date(patient.created_at).toLocaleString()}</td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => setSelectedPatient(patient)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-bold shadow-sm"
                        >
                          <Eye className="w-4 h-4" />
                          Review
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Review Modal */}
        {selectedPatient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
              <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
                <h2 className="text-2xl font-bold text-gray-900">Review Identity Verification</h2>
                <button 
                  onClick={() => setSelectedPatient(null)}
                  className="text-gray-400 hover:text-gray-900 transition p-2 hover:bg-gray-200 rounded-full"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 flex-1 overflow-y-auto">
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="md:col-span-1 space-y-6">
                    <div>
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Patient Details</h3>
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <p className="font-bold text-lg">{selectedPatient.first_name} {selectedPatient.last_name}</p>
                        <p className="text-sm text-gray-600 mb-2">{selectedPatient.patient_id}</p>
                        <hr className="my-2 border-gray-200" />
                        <p className="text-sm"><span className="text-gray-500">DOB:</span> {new Date(selectedPatient.date_of_birth).toLocaleDateString()}</p>
                        <p className="text-sm"><span className="text-gray-500">Email:</span> {selectedPatient.email}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">ID Information</h3>
                      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <p className="text-sm"><span className="text-gray-500">Type:</span> <span className="font-bold text-blue-900">{selectedPatient.id_type}</span></p>
                        <p className="text-sm mt-1"><span className="text-gray-500">Number:</span> <span className="font-bold text-gray-900">{selectedPatient.id_number || 'Not provided'}</span></p>
                      </div>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 flex gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                      <p className="text-xs text-yellow-800">Ensure the ID details match the patient details exactly. If there are discrepancies, reject the submission.</p>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Uploaded Document</h3>
                    <div className="bg-gray-100 rounded-xl border-2 border-gray-200 min-h-[400px] flex items-center justify-center overflow-hidden">
                      {imageSrc ? (
                        <img 
                          src={imageSrc} 
                          alt="Patient ID" 
                          className="max-w-full max-h-[600px] object-contain"
                        />
                      ) : (
                        <div className="text-gray-400 flex flex-col items-center">
                          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mb-2"></div>
                          Loading secure image...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t bg-gray-50 rounded-b-2xl flex justify-end gap-4">
                <button
                  onClick={() => handleReview(selectedPatient.patient_id, 'REJECTED')}
                  disabled={reviewing}
                  className="px-6 py-3 bg-white border-2 border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 hover:border-red-300 transition flex items-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Reject & Request Resubmission
                </button>
                <button
                  onClick={() => handleReview(selectedPatient.patient_id, 'VERIFIED')}
                  disabled={reviewing}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-teal-500 text-white font-bold rounded-xl hover:opacity-90 transition shadow-lg flex items-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Approve & Verify Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProviderLayout>
  );
}
