import { Heart, UserPlus, AlertCircle, QrCode, Lock, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { api } from "../api/client";

export function PatientRegistration() {
  const [step, setStep] = useState<"registration" | "unverified">("registration");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | "Other" | "">("");
  const [contactNumber, setContactNumber] = useState("");
  const [address, setAddress] = useState("");
  const [voterRegistered, setVoterRegistered] = useState<"yes" | "no" | "">("");
  const [householdHead, setHouseholdHead] = useState<"yes" | "no" | "">("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!dateOfBirth || !gender || !contactNumber || !address || !voterRegistered || !householdHead) {
      setError("Please fill in all required demographic and LGU fields.");
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register/patient', {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        date_of_birth: dateOfBirth,
        gender,
        contact_number: contactNumber,
        address,
        voter_registered: voterRegistered,
        household_head: householdHead
      });
      setStep("unverified");
    } catch (err: any) {
      setError(err.message || "Failed to register account.");
    } finally {
      setLoading(false);
    }
  };

  if (step === "unverified") {
    // ... (Keep existing unverified view, it uses email which is still available)
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 pb-8">
        {/* Header */}
        <header className="bg-white shadow-sm mb-6">
          <div className="px-4 py-4">
            <div className="flex items-center gap-3 mb-2">
              <Heart className="w-6 h-6 text-blue-600" />
              <h1 className="text-lg font-bold text-gray-900">NCHO Patient-Link</h1>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Welcome, {firstName}</h2>
            <p className="text-sm text-gray-600">Your account is pending verification</p>
          </div>
        </header>

        <div className="max-w-md mx-auto px-4 space-y-4">
          {/* Verification Alert Card */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-6 shadow-md">
            <div className="flex gap-3 mb-4">
              <AlertCircle className="w-8 h-8 text-yellow-600 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-yellow-900 mb-2">Account Unverified - Action Required</h3>
                <p className="text-sm text-yellow-800 mb-4">
                  Your shell account has been created successfully. To activate your digital Health Passport,
                  please visit the <span className="font-bold">Naga City Health Office triage desk</span> and
                  present a valid physical ID.
                </p>
                <div className="bg-yellow-100 rounded-lg p-3 text-xs text-yellow-900">
                  <p className="font-bold mb-1">Required Documents:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Valid Government-Issued ID (National ID, Driver's License, or Passport)</li>
                    <li>Proof of Residency in Naga City (Optional but recommended)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Disabled QR Code Placeholder */}
          <div className="bg-white rounded-xl shadow-md p-6 opacity-50 pointer-events-none relative overflow-hidden">
            <div className="absolute inset-0 bg-gray-100 bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="text-center">
                <Lock className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="font-bold text-gray-600">Verification Required</p>
              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Your Health Passport QR CODE</h3>
            <div className="bg-gray-50 rounded-lg p-6 mb-4 flex justify-center">
              <div className="w-48 h-48 bg-white border-4 border-gray-300 rounded-lg flex items-center justify-center">
                <QrCode className="w-32 h-32 text-gray-300" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">Patient ID</p>
              <p className="text-xl font-bold text-gray-400 mb-4">PENDING-VERIFICATION</p>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-bold text-gray-900 mb-4">Account Information</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Email Address</p>
                <p className="font-bold text-gray-900">{email}</p>
              </div>
              <div>
                <p className="text-gray-600">Full Name</p>
                <p className="font-bold text-gray-900">{firstName} {lastName}</p>
              </div>
              <div>
                <p className="text-gray-600">Account Status</p>
                <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                  Unverified - Pending Activation
                </span>
              </div>
            </div>
          </div>

          <Link
            to="/"
            className="block w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg text-center hover:bg-gray-50 transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-2xl">
        {/* Back Navigation */}
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Login</span>
        </Link>

        {/* Logo Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="w-12 h-12 text-blue-600" />
            <div className="text-left">
              <h1 className="text-2xl font-bold text-gray-900">NCHO Patient-Link</h1>
              <p className="text-sm text-gray-600">Naga City Health Office</p>
            </div>
          </div>
        </div>

        {/* Registration Card */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <UserPlus className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Patient Registration</h2>
          </div>

          <p className="text-sm text-gray-600 text-center mb-8">
            Please provide your accurate information to begin the secure verification process.
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
              {error}
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleCreateAccount} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Juan"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Dela Cruz"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Date of Birth</label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none bg-white"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Contact Number</label>
                <input
                  type="tel"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="09123456789"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Complete Address</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street, Barangay, Naga City, Camarines Sur"
                required
                rows={2}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none resize-none"
              />
            </div>

            {/* LGU Specific Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Registered Voter in Naga City? <span className="text-red-600">*</span>
                </label>
                <div className="flex gap-6 w-full px-4 py-3 border-2 border-gray-300 rounded-lg">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="voterRegistered"
                      value="yes"
                      checked={voterRegistered === "yes"}
                      onChange={(e) => setVoterRegistered(e.target.value as "yes")}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-600"
                    />
                    <span className="text-gray-900 font-bold text-sm">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="voterRegistered"
                      value="no"
                      checked={voterRegistered === "no"}
                      onChange={(e) => setVoterRegistered(e.target.value as "no")}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-600"
                    />
                    <span className="text-gray-900 font-bold text-sm">No</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Household Head? <span className="text-red-600">*</span>
                </label>
                <div className="flex gap-6 w-full px-4 py-3 border-2 border-gray-300 rounded-lg">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="householdHead"
                      value="yes"
                      checked={householdHead === "yes"}
                      onChange={(e) => setHouseholdHead(e.target.value as "yes")}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-600"
                    />
                    <span className="text-gray-900 font-bold text-sm">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="householdHead"
                      value="no"
                      checked={householdHead === "no"}
                      onChange={(e) => setHouseholdHead(e.target.value as "no")}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-600"
                    />
                    <span className="text-gray-900 font-bold text-sm">No</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-lg font-bold hover:opacity-90 transition disabled:opacity-50 mt-4 text-lg shadow-lg"
            >
              {loading ? "Creating Account..." : "Register My Account"}
            </button>
          </form>

          {/* Info Alert */}
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-lg mb-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-900">
                  <span className="font-bold">Important:</span> This creates an unverified account only.
                  You must visit NCHO in person to complete verification and activate your Health Passport.
                </p>
              </div>
            </div>
          </div>

          {/* Additional Links */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 hover:underline font-bold">
                Login here
              </Link>
            </p>
            <Link to="/" className="block text-sm text-gray-600 hover:underline">
              Back to Home
            </Link>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-gray-500 mt-6">
          By creating an account, you agree to the Data Privacy Act of 2012 compliance terms.
        </p>
      </div>
    </div>
  );
}
