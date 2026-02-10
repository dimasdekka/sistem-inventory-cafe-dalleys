import React, { useState } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { User, Lock, Save } from "lucide-react";

const Profile = () => {
  const { user, login } = useAuth();
  const [formData, setFormData] = useState({
    nama_lengkap: user?.nama_lengkap || "",
    password: "",
    confirmPassword: "",
  });
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(
    user?.foto_profil ? `http://localhost:5000${user.foto_profil}` : null,
  );
  const [loading, setLoading] = useState(false);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      return alert("New password and confirmation do not match");
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append("nama_lengkap", formData.nama_lengkap);
      if (formData.password) data.append("password", formData.password);
      if (photo) data.append("photo", photo);

      const res = await api.put("/profile", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Profile updated successfully");
      setFormData({ ...formData, password: "", confirmPassword: "" });

      // Update local storage user data to reflect new photo/name immediately
      const updatedUser = { ...user, ...res.data.user };
      localStorage.setItem("user", JSON.stringify(updatedUser)); // Update persisted user
      window.location.reload(); // Refresh to update context and sidebar
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-white">My Profile</h1>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-6 p-4 bg-gray-800/50 rounded-lg mb-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-700 bg-gray-800 flex items-center justify-center">
                {preview ? (
                  <img
                    src={preview}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-gray-500">
                    {user?.nama_lengkap?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors shadow-lg">
                <User size={16} className="text-white" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
              </label>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white">
                {user?.nama_lengkap}
              </h2>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-bold uppercase tracking-wide">
                  {user?.role}
                </span>
                <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-xs font-bold tracking-wide">
                  @{user?.username}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-gray-400 mb-2 flex items-center gap-2">
              <User size={18} /> Full Name
            </label>
            <input
              type="text"
              className="input-field"
              value={formData.nama_lengkap}
              onChange={(e) =>
                setFormData({ ...formData, nama_lengkap: e.target.value })
              }
              required
            />
          </div>

          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Lock size={18} /> Change Password
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              Leave blank if you don't want to change it.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-1 text-sm">
                  New Password
                </label>
                <input
                  type="password"
                  className="input-field"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1 text-sm">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  className="input-field"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  minLength={6}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="btn btn-primary flex items-center gap-2"
              disabled={loading}
            >
              <Save size={20} /> {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
