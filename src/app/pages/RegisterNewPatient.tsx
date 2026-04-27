import { ArrowLeft, UserPlus, X, Shield } from "lucide-react";
import { Link } from "react-router";
import { useState } from "react";
import { ProviderLayout } from "../components/ProviderLayout";

export function RegisterNewPatient() {
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [civilStatus, setCivilStatus] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");

  const [houseStreet, setHouseStreet] = useState("");
  const [barangay, setBarangay] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [zipCode, setZipCode] = useState("");

  const [registeredVoter, setRegisteredVoter] = useState<"yes" | "no" | "">("");
  const [householdHead, setHouseholdHead] = useState<"yes" | "no" | "">("");

  const [bloodType, setBloodType] = useState("");
  const [allergies, setAllergies] = useState<string[]>([]);
  const [allergyInput, setAllergyInput] = useState("");
  const [chronicConditions, setChronicConditions] = useState("");

  const [verificationChecked, setVerificationChecked] = useState(false);

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
        {/* Header & Navigation */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Go Back</span>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Register New Patient</h1>
          <p className="text-gray-600">Please fill out the form below to register a new patient.</p>
        </div>

        {/* Section 1: Personal Information */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Section 1: Personal Information</h2>

          <div className="grid md:grid-cols-3 gap-4 mb-4">
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
              <label className="block text-sm font-bold text-gray-700 mb-2">Middle Name</label>
              <input
                type="text"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                placeholder="Enter middle name"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
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
                Gender <span className="text-red-600">*</span>
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                required
              >
                <option value="">Select gender...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Civil Status <span className="text-red-600">*</span>
              </label>
              <select
                value={civilStatus}
                onChange={(e) => setCivilStatus(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                required
              >
                <option value="">Select civil status...</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Contact Number <span className="text-red-600">*</span>
              </label>
              <input
                type="tel"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="+63 917 123 4567"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Address Information */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Section 2: Address Information</h2>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                House No. / Street <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={houseStreet}
                onChange={(e) => setHouseStreet(e.target.value)}
                placeholder="123 Rizal Street"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Barangay <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={barangay}
                onChange={(e) => setBarangay(e.target.value)}
                placeholder="Barangay name"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                City / Municipality <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Naga City"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Province <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                placeholder="Camarines Sur"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Zip Code <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="4400"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 3: LGU Specific Information */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Section 3: LGU Specific Information</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <label className="block text-sm font-bold text-gray-700 mb-4">
                Are you a registered voter in Naga City? <span className="text-red-600">*</span>
              </label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="registeredVoter"
                    value="yes"
                    checked={registeredVoter === "yes"}
                    onChange={(e) => setRegisteredVoter(e.target.value as "yes")}
                    className="w-5 h-5 text-blue-600 border-2 border-gray-300 focus:ring-2 focus:ring-blue-600"
                  />
                  <span className="text-gray-900 font-bold">Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="registeredVoter"
                    value="no"
                    checked={registeredVoter === "no"}
                    onChange={(e) => setRegisteredVoter(e.target.value as "no")}
                    className="w-5 h-5 text-blue-600 border-2 border-gray-300 focus:ring-2 focus:ring-blue-600"
                  />
                  <span className="text-gray-900 font-bold">No</span>
                </label>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <label className="block text-sm font-bold text-gray-700 mb-4">
                Are you the head of the household? <span className="text-red-600">*</span>
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

        {/* Section 4: Baseline Medical Information */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Section 4: Baseline Medical Information</h2>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
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

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Known Allergies</label>
              <div className="flex gap-2">
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
                <div className="flex flex-wrap gap-2 mt-3">
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
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Existing Chronic Conditions</label>
            <input
              type="text"
              value={chronicConditions}
              onChange={(e) => setChronicConditions(e.target.value)}
              placeholder="e.g., Hypertension, Diabetes, Asthma (comma-separated)"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="mb-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={verificationChecked}
                onChange={(e) => setVerificationChecked(e.target.checked)}
                className="w-5 h-5 mt-0.5 text-teal-500 border-2 border-gray-300 rounded focus:ring-2 focus:ring-teal-500"
              />
              <span className="text-sm text-gray-900">
                <span className="font-bold">
                  I confirm that the information provided is accurate and verified against a valid Government ID.
                </span>
              </span>
            </label>
          </div>

          <div className="flex gap-4 justify-end">
            <Link
              to="/dashboard"
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </Link>
            <button
              disabled={
                !verificationChecked ||
                !firstName ||
                !lastName ||
                !dateOfBirth ||
                !gender ||
                !civilStatus ||
                !contactNumber ||
                !houseStreet ||
                !barangay ||
                !city ||
                !province ||
                !zipCode ||
                !registeredVoter ||
                !householdHead ||
                !bloodType
              }
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-lg hover:opacity-90 transition font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Register Patient
            </button>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="mt-6 bg-blue-50 border-l-4 border-blue-600 p-4 rounded-lg">
          <div className="flex gap-3">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-sm text-blue-900">
                <span className="font-bold">Data Privacy Notice:</span> All patient information is encrypted and
                protected under the Data Privacy Act of 2012. This registration action will be logged for audit
                compliance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ProviderLayout>
  );
}
