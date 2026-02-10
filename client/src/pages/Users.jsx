import React, { useState, useEffect } from "react";
import api from "../utils/api";
import {
  Users,
  Plus,
  Trash2,
  Shield,
  Eye,
  EyeOff,
  Edit2,
  RotateCcw,
  AlertCircle,
  Archive,
} from "lucide-react";
import Modal from "../components/Modal";
import ConfirmationModal from "../components/ConfirmationModal";
import { useAuth } from "../context/AuthContext";

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const [activeUsers, setActiveUsers] = useState([]);
  const [archivedUsers, setArchivedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "danger",
    onConfirm: () => {},
  });

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    nama_lengkap: "",
    role: "staff", // Default to staff
    id_user: null, // For editing
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const resActive = await api.get("/users");
      setActiveUsers(resActive.data);

      const resArchived = await api.get("/users/deleted");
      setArchivedUsers(resArchived.data);

      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteClick = (user) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete User?",
      message: `Are you sure you want to delete ${user.nama_lengkap}? They will be moved to the archive and can be restored later.`,
      type: "danger",
      confirmText: "Yes, Delete",
      onConfirm: () => handleDelete(user.id_user),
    });
  };

  const handleRestoreClick = (user) => {
    setConfirmModal({
      isOpen: true,
      title: "Restore User?",
      message: `Are you sure you want to restore ${user.nama_lengkap}? They will be able to access the system again.`,
      type: "info",
      confirmText: "Restore Account",
      onConfirm: () => handleRestore(user.id_user),
    });
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (error) {
      console.error("Delete error:", error);
      const msg = error.response?.data?.message || "Failed to delete user.";
      alert(msg);
    }
  };

  const handleRestore = async (id) => {
    try {
      await api.post(`/users/${id}/restore`);
      fetchUsers();
    } catch (error) {
      console.error("Restore error:", error);
      alert(error.response?.data?.message || "Failed to restore user");
    }
  };

  const handleEdit = (user) => {
    setFormData({
      username: user.username,
      password: "", // Leave blank to keep unchanged
      nama_lengkap: user.nama_lengkap,
      role: user.role,
      id_user: user.id_user,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      username: "",
      password: "",
      nama_lengkap: "",
      role: "staff",
      id_user: null,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id_user) {
        // Edit Mode
        const payload = {
          username: formData.username,
          nama_lengkap: formData.nama_lengkap,
          role: formData.role,
        };
        if (formData.password) payload.password = formData.password;

        await api.put(`/users/${formData.id_user}`, payload);
      } else {
        // Create Mode
        await api.post("/users", formData);
      }

      handleCloseModal();
      fetchUsers();
    } catch (error) {
      console.error("User operation error:", error);
      alert(error.response?.data?.message || "Operation failed");
    }
  };

  // Role hierarchy: owner > manajer > admin > staff
  // Owner can create: owner, manajer, admin, staff
  // Manajer can create/edit: admin, staff (NOT owner or other manajer)
  // Admin can create/edit: staff only (NOT admin, manajer, owner)
  const canCreateAdmin =
    currentUser?.role === "owner" || currentUser?.role === "manajer";
  const canCreateManajer = currentUser?.role === "owner";

  // Check if current user can edit a specific user
  const canEditUser = (targetUser) => {
    if (currentUser?.role === "owner") return true;
    if (currentUser?.role === "manajer") {
      // Manajer cannot edit owner or other manajer
      return targetUser.role !== "owner" && targetUser.role !== "manajer";
    }
    if (currentUser?.role === "admin") {
      // Admin can only edit staff, not other admins
      return targetUser.role === "staff";
    }
    return false;
  };

  const displayUsers = showArchived ? archivedUsers : activeUsers;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            {showArchived ? (
              <Archive className="text-gray-400" />
            ) : (
              <Users className="text-primary" />
            )}
            {showArchived ? "Archived Users" : "User Management"}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {showArchived
              ? "View and restore deleted accounts"
              : "Manage active system users"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${showArchived ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800"}`}
          >
            {showArchived ? <Users size={18} /> : <Archive size={18} />}
            {showArchived ? "View Active Users" : "View Archive"}
          </button>

          {!showArchived && (
            <button
              onClick={() => {
                setFormData({
                  username: "",
                  password: "",
                  nama_lengkap: "",
                  role: "staff",
                  id_user: null,
                });
                setIsModalOpen(true);
              }}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus size={20} /> Add New User
            </button>
          )}
        </div>
      </div>

      <div className="card">
        {displayUsers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No {showArchived ? "archived" : "active"} users found.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="text-gray-400 border-b border-gray-700 bg-gray-800/20">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Username</th>
                <th className="p-3">Role</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayUsers.map((u) => (
                <tr
                  key={u.id_user}
                  className={`border-b border-gray-800 hover:bg-white/5 transition-colors ${showArchived ? "opacity-75 grayscale-[0.5]" : ""}`}
                >
                  <td className="p-3 font-medium flex items-center gap-3">
                    {u.foto_profil && (
                      <img
                        src={`http://localhost:5000${u.foto_profil}`}
                        className="w-8 h-8 rounded-full object-cover border border-gray-700"
                        alt=""
                      />
                    )}
                    {u.nama_lengkap}
                  </td>
                  <td className="p-3 text-gray-400">{u.username}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs uppercase font-bold 
                                            ${
                                              u.role === "owner"
                                                ? "bg-purple-500/20 text-purple-400"
                                                : u.role === "manajer"
                                                  ? "bg-orange-500/20 text-orange-400"
                                                  : u.role === "admin"
                                                    ? "bg-blue-500/20 text-blue-400"
                                                    : "bg-green-500/20 text-green-400"
                                            }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 text-right flex justify-end gap-2">
                    {showArchived ? (
                      /* RESTORE ACTION */
                      <button
                        onClick={() => handleRestoreClick(u)}
                        className="px-3 py-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded flex items-center gap-2 text-sm font-medium transition-colors border border-blue-500/20"
                        title="Restore User"
                      >
                        <RotateCcw size={14} /> Restore
                      </button>
                    ) : (
                      /* ACTIVE ACTIONS */
                      <>
                        {/* Edit Button */}
                        {canEditUser(u) && (
                          <button
                            onClick={() => handleEdit(u)}
                            className="p-2 hover:bg-blue-500/20 text-blue-400 rounded transition-colors"
                            title="Edit User"
                          >
                            <Edit2 size={16} />
                          </button>
                        )}

                        {/* Delete Button */}
                        {u.id_user !== currentUser.id_user &&
                          canEditUser(u) && (
                            <button
                              onClick={() => handleDeleteClick(u)}
                              className="p-2 hover:bg-red-500/20 text-red-400 rounded transition-colors"
                              title="Archive User"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={formData.id_user ? "Edit User" : "Create New User"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 mb-1 text-sm">
              Full Name
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
          <div>
            <label className="block text-gray-400 mb-1 text-sm">Username</label>
            <input
              type="text"
              className="input-field"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              required
            />
          </div>
          <div className="relative">
            <label className="block text-gray-400 mb-1 text-sm">
              {formData.id_user ? "New Password (Optional)" : "Password"}
            </label>
            <input
              type={showPassword ? "text" : "password"}
              className="input-field pr-10"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required={!formData.id_user} // Required only for new users
              placeholder={
                formData.id_user ? "Leave blank to keep current" : ""
              }
            />
            <button
              type="button"
              className="absolute right-3 top-9 text-gray-400"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {formData.role !== "owner" && (
            <div>
              <label className="block text-gray-400 mb-1 text-sm">Role</label>
              <select
                className="input-field"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              >
                <option value="staff">Staff (Barista)</option>
                {canCreateAdmin && <option value="admin">Admin</option>}
                {canCreateManajer && <option value="manajer">Manajer</option>}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {formData.role === "staff"
                  ? "Can manage transactions only."
                  : formData.role === "admin"
                    ? "Can manage inventory and staff."
                    : formData.role === "manajer"
                      ? "Can manage inventory, staff, and admins."
                      : "Full system access."}
              </p>
            </div>
          )}
          {formData.role === "owner" && (
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded text-purple-400 text-sm">
              Role: <strong>Owner</strong> (Cannot be changed)
            </div>
          )}

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCloseModal}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {formData.id_user ? "Save Changes" : "Create Account"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText={confirmModal.confirmText}
      />
    </div>
  );
};

export default UserManagement;
