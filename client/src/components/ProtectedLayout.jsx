import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";

const ProtectedLayout = () => {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center text-primary">
        Loading...
      </div>
    );

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen bg-dark text-gray-100">
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default ProtectedLayout;
