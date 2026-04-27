import { Search, AlertCircle, CheckCircle, X } from "lucide-react";
import { Link } from "react-router";
import { useState } from "react";
import { ProviderLayout } from "../components/ProviderLayout";

export function TriageVerification() {
  const [pendingEmail, setPendingEmail] = useState("");
  const [accountFound, setAccountFound] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [address, setAddress] = useState("");
  const [voterRegistered, setVoterRegistered] = useState<"yes" | "no" | "">("");
  const [householdHead, setHouseholdHead] = useState<"yes" | "no" | "">("");
  const [bloodType, setBloodType] = useState("");
  const [allergies, setAllergies] = useState<string[]>([]);
  const [allergyInput, setAllergyInput] = useState("");
  const [chronicConditions, setChronicConditions] = useState("");
  const [verificationChecked, setVerificationChecked] = useState(false);

  const handleLookup = () => {
    setAccountFound(true);
  };

  const addAllergy = () => {
    if (allergyInput.trim() && !allergies.includes(allergyInput.trim())) {
      setAllergies([...allergies, allergyInput.trim()]);
      setAllergyInput("");
    }
  };

  const removeAllergy = (allergyToRemove: string) => {
    setAllergies(allergies.filter((a) => a !== allergyToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addAllergy();
    }
  };

  return (
    <ProviderLayout>
      <div className="min-h-screen p-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Patient Verification & Intake</h1>
          <p className="text-gray-600">Verify physical ID and establish baseline medical records</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-8">
          {/* Section 1: Account Linking */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Section 1: Account Linking</h2>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Pending Patient Email or ID
                </label>
                <input
                  type="text"
                  value={pendingEmail}
                  onChange={(e) => setPendingEmail(e.target.value)}
                  placeholder="Enter email address or temporary ID"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleLookup}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-bold"
                >
                  <Search className="w-5 h-5" />
                  Lookup
                </button>
              </div>
            </div>

            {accountFound && (
              <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-600 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-bold text-green-900">Pending Account Found</p>
                    <p className="text-xs text-green-700">
                      Email: {pendingEmail} • Created: {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Administrative Demographics */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Section 2: Administrative Demographics</h2>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  First Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter first name"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Last Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter last name"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Date of Birth <span className="text-red-600">*</span>
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Complete Address <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, Barangay, City, Province"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* LGU Tracking Fields with Radio Buttons */}
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Voter Registered <span className="text-red-600">*</span>
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="voterRegistered"
                      value="yes"
                      checked={voterRegistered === "yes"}
                      onChange={(e) => setVoterRegistered(e.target.value as "yes")}
                      className="w-5 h-5 text-blue-600 border-2 border-gray-300 focus:ring-2 focus:ring-blue-600"
                    />
                    <span className="text-gray-900 font-bold">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="voterRegistered"
                      value="no"
                      checked={voterRegistered === "no"}
                      onChange={(e) => setVoterRegistered(e.target.value as "no")}
                      className="w-5 h-5 text-blue-600 border-2 border-gray-300 focus:ring-2 focus:ring-blue-600"
                    />
                    <span className="text-gray-900 font-bold">No</span>
                  </label>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Household Head <span className="text-red-600">*</span>
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="householdHead"
                      value="yes"
                      checked={householdHead === "yes"}
                      onChange={(e) => setHouseholdHead(e.target.value as "yes")}
                      className="w-5 h-5 text-blue-600 border-2 border-gray-300 focus:ring-2 focus:ring-blue-600"
                    />
                    <span className="text-gray-900 font-bold">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="householdHead"
                      value="no"
                      checked={householdHead === "no"}
                      onChange={(e) => setHouseholdHead(e.target.value as "no")}
                      className="w-5 h-5 text-blue-600 border-2 border-gray-300 focus:ring-2 focus:ring-blue-600"
                    />
                    <span className="text-gray-900 font-bold">No</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Baseline Medical Encoding */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Section 3: Baseline Medical Encoding</h2>

            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Blood Type <span className="text-red-600">*</span>
              </label>
              <select
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                required
              >
                <option value="">Select blood type...</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-2">Known Allergies</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={allergyInput}
                  onChange={(e) => setAllergyInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type allergy and press Enter"
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                />
                <button
                  onClick={addAllergy}
                  className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-bold"
                >
                  Add
                </button>
              </div>
              {allergies.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {allergies.map((allergy, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full"
                    >
                      {allergy}
                      <button
                        onClick={() => removeAllergy(allergy)}
                        className="hover:bg-red-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Existing Chronic Conditions
              </label>
              <textarea
                value={chronicConditions}
                onChange={(e) => setChronicConditions(e.target.value)}
                placeholder="List any existing chronic conditions (e.g., Hypertension, Diabetes, Asthma)..."
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Verification and Actions */}
          <div className="border-t pt-6">
            <div className="mb-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={verificationChecked}
                  onChange={(e) => setVerificationChecked(e.target.checked)}
                  className="w-5 h-5 mt-0.5 text-teal-500 border-2 border-gray-300 rounded focus:ring-2 focus:ring-teal-500"
                />
                <span className="text-sm text-gray-900">
                  <span className="font-bold">I confirm I have physically verified the patient's valid Government ID</span>
                  <br />
                  <span className="text-xs text-gray-600">
                    (National ID, Driver's License, Passport, or other government-issued identification)
                  </span>
                </span>
              </label>
            </div>

            <div className="flex gap-4">
              <Link
                to="/dashboard"
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </Link>
              <button
                disabled={!verificationChecked || !firstName || !lastName || !dateOfBirth || !address || !voterRegistered || !householdHead || !bloodType}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-lg hover:opacity-90 transition font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Activate Patient Passport
              </button>
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="mt-6 bg-blue-50 border-l-4 border-blue-600 p-4 rounded-lg">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-sm text-blue-900">
                <span className="font-bold">Data Privacy Notice:</span> All patient information collected during this
                verification process is encrypted and protected under the Data Privacy Act of 2012. This verification
                action will be logged for audit compliance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ProviderLayout>
  );
}
