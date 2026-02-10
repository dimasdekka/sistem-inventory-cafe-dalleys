import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Database,
  Download,
  Upload,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import api from "../utils/api";
import { motion } from "framer-motion";

const Settings = () => {
  const { user } = useAuth();
  const [backupStatus, setBackupStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const isAuthorized = ["owner", "admin", "manajer"].includes(user?.role);

  const handleBackup = async () => {
    if (!isAuthorized) {
      alert("Only Owner/Admin can perform database backup");
      return;
    }

    setLoading(true);
    setBackupStatus("");

    try {
      const response = await api.get("/backup/download", {
        responseType: "blob",
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      link.setAttribute("download", `backup_${timestamp}.sql`);

      document.body.appendChild(link);
      link.click();
      link.remove();

      setBackupStatus("success");
      setTimeout(() => setBackupStatus(""), 3000);
    } catch (error) {
      console.error("Backup error:", error);
      setBackupStatus("error");
      alert(
        "Failed to create backup: " +
          (error.response?.data?.message || error.message),
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={64} />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400">
            Only Owner and Admin can access settings.
          </p>
          <p className="text-sm text-gray-500 mt-2">Your role: {user?.role}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">
          Manage system settings and database backup
        </p>
      </motion.div>

      {/* Database Backup Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/20 rounded-lg">
            <Database className="text-primary" size={32} />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-2">
              Database Backup
            </h2>
            <p className="text-gray-400 mb-4">
              Create a backup of your database. This will download an SQL file
              containing all your data.
            </p>

            {/* Backup Info */}
            <div className="bg-gray-900/50 rounded-lg p-4 mb-4 border border-gray-700">
              <h3 className="text-sm font-semibold text-white mb-2">
                Backup Information:
              </h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>
                  • Includes all tables: Users, Barang, Transaksi, Kategori,
                  etc.
                </li>
                <li>
                  • File format: SQL (can be restored using MySQL/MariaDB)
                </li>
                <li>• Recommended: Create backups regularly (daily/weekly)</li>
                <li>• Store backups in a safe location</li>
              </ul>
            </div>

            {/* Backup Button */}
            <button
              onClick={handleBackup}
              disabled={loading}
              className="btn btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              <Download size={20} />
              {loading ? "Creating Backup..." : "Download Database Backup"}
            </button>

            {/* Status Messages */}
            {backupStatus === "success" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-green-500/20 border border-green-500 rounded-lg flex items-center gap-2"
              >
                <CheckCircle className="text-green-500" size={20} />
                <span className="text-green-400">
                  Backup created successfully!
                </span>
              </motion.div>
            )}

            {backupStatus === "error" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-red-500/20 border border-red-500 rounded-lg flex items-center gap-2"
              >
                <AlertCircle className="text-red-500" size={20} />
                <span className="text-red-400">
                  Failed to create backup. Please try again.
                </span>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* System Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <h2 className="text-xl font-bold text-white mb-4">
          System Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
            <p className="text-sm text-gray-400 mb-1">Logged in as</p>
            <p className="text-white font-semibold">{user?.nama_lengkap}</p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
            <p className="text-sm text-gray-400 mb-1">Role</p>
            <p className="text-white font-semibold capitalize">{user?.role}</p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
            <p className="text-sm text-gray-400 mb-1">Username</p>
            <p className="text-white font-semibold">{user?.username}</p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
            <p className="text-sm text-gray-400 mb-1">System Version</p>
            <p className="text-white font-semibold">v1.0.0</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;
