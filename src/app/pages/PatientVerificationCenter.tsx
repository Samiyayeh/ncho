import { useState, useEffect } from 'react';
import { Shield, Upload, Clock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { api } from '../api/client';
import { useNavigate, Link } from 'react-router';
import { toast } from 'sonner';

export function PatientVerificationCenter() {
  const [status, setStatus] = useState<'UNVERIFIED' | 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED'>('UNVERIFIED');
  const [idType, setIdType] = useState<'PHILHEALTH' | 'PHILSYS'>('PHILHEALTH');
  const [idNumber, setIdNumber] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/patient/profile');
      setStatus(res.verification_status || 'UNVERIFIED');
    } catch (error: any) {
      toast.error(error.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(selectedFile.type)) {
        toast.error('Invalid file type. Only JPG, PNG, and WEBP are allowed.');
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('File too large. Maximum size is 5MB.');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select an ID image to upload.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('id_type', idType);
      formData.append('id_number', idNumber);
      formData.append('id_image', file);

      await api.post('/patient/verify-upload', formData);
      
      toast.success('ID submitted successfully!');
      setStatus('PENDING_REVIEW');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit ID.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/patient" className="text-gray-500 hover:text-gray-900 transition">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Shield className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">Verification Center</h1>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {status === 'VERIFIED' && (
          <div className="bg-white rounded-xl shadow-sm border border-green-100 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Verified</h2>
            <p className="text-gray-600 mb-6">Your identity has been successfully verified. You have full access to NCHO services.</p>
            <button
              onClick={() => navigate('/patient')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold"
            >
              Return to Passport
            </button>
          </div>
        )}

        {status === 'PENDING_REVIEW' && (
          <div className="bg-white rounded-xl shadow-sm border border-yellow-100 p-8 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-yellow-600 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Under Review</h2>
            <p className="text-gray-600 mb-6">Your ID is currently being reviewed by clinic staff. Please check back later.</p>
            <button
              onClick={() => navigate('/patient')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold"
            >
              Return to Passport
            </button>
          </div>
        )}

        {(status === 'UNVERIFIED' || status === 'REJECTED') && (
          <div className="bg-white rounded-xl shadow-sm border p-8">
            {status === 'REJECTED' && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-red-900">Verification Rejected</h3>
                  <p className="text-sm text-red-700">Your previous submission was rejected. Please ensure the image is clear and the ID is valid.</p>
                </div>
              </div>
            )}

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Submit ID for Verification</h2>
              <p className="text-gray-600">Please provide a valid government ID to unlock queueing and clinic services.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">ID Type</label>
                <select
                  value={idType}
                  onChange={(e) => setIdType(e.target.value as any)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                  required
                >
                  <option value="PHILHEALTH">PhilHealth ID</option>
                  <option value="PHILSYS">PhilSys National ID</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">ID Number (Optional)</label>
                <input
                  type="text"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  placeholder="e.g. 1234-5678-9012"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Upload ID Image</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    required
                  />
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="font-bold text-gray-900">{file ? file.name : "Click or drag image here"}</p>
                  <p className="text-sm text-gray-500">PNG, JPG or WEBP (Max 5MB)</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !file}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-lg font-bold hover:opacity-90 transition disabled:opacity-50 text-lg shadow-lg flex items-center justify-center gap-2"
              >
                {submitting ? 'Submitting...' : 'Submit for Review'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
