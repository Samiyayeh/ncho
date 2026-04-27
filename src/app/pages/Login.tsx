import { Heart, Lock, AlertCircle } from "lucide-react";
import { Link } from "react-router";
import { useState } from "react";

export function Login() {
  const [role, setRole] = useState<"patient" | "provider">("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
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

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Lock className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Secure Login</h2>
          </div>

          {/* Role Selection Toggle */}
          <div className="flex gap-2 bg-gray-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => setRole("patient")}
              className={`flex-1 py-2 rounded-lg transition ${
                role === "patient"
                  ? "bg-blue-600 text-white font-bold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Patient
            </button>
            <button
              onClick={() => setRole("provider")}
              className={`flex-1 py-2 rounded-lg transition ${
                role === "provider"
                  ? "bg-teal-500 text-white font-bold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Healthcare Provider
            </button>
          </div>

          {/* Login Form */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Login Button */}
          <Link
            to={role === "patient" ? "/patient" : "/dashboard"}
            className="block w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-lg text-center font-bold hover:opacity-90 transition mb-4"
          >
            Login
          </Link>

          {/* Provider 2FA Notice */}
          {role === "provider" && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                <div>
                  <p className="text-sm text-yellow-900">
                    <span className="font-bold">Provider Access requires Two-Factor Authentication (2FA).</span>
                    <br />
                    Check your email for the secure link after clicking Login.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Additional Links */}
          <div className="mt-6 text-center space-y-2">
            <Link to="/" className="block text-sm text-blue-600 hover:underline">
              Forgot Password?
            </Link>
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link to="/register" className="text-blue-600 hover:underline font-bold">
                Register here
              </Link>
            </p>
            <Link to="/" className="block text-sm text-gray-600 hover:underline">
              Back to Home
            </Link>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-gray-500 mt-6">
          Protected by 256-bit encryption. Data Privacy Act compliant.
        </p>
      </div>
    </div>
  );
}
