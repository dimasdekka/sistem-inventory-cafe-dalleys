import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Coffee } from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 p-12 flex-col justify-between">
        {/* Logo & Title */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary rounded-xl">
              <Coffee size={40} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                SISTEM INFORMASI
              </h1>
              <h1 className="text-3xl font-bold text-white">INVENTORY</h1>
            </div>
          </div>
          <p className="text-gray-400 text-lg ml-1">Kafe Tempat Ngopi</p>
        </div>

        {/* Footer */}
        <div>
          <p className="text-gray-500">© 2026 Tempat Ngopi</p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary rounded-xl">
                <Coffee size={32} className="text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-xl font-bold text-gray-900">
                  SISTEM INFORMASI
                </h1>
                <h1 className="text-xl font-bold text-gray-900">INVENTORY</h1>
              </div>
            </div>
          </div>

          {/* Login Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              LOGIN SISTEM
            </h2>
            <p className="text-gray-600">
              Masukkan username dan password untuk mengakses sistem
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary transition-colors"
                placeholder="Masukkan username"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary transition-colors"
                placeholder="Masukkan password"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
            >
              Login
            </button>
          </form>

          {/* Footer Note */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Hanya pengguna terdaftar yang dapat mengakses sistem
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
