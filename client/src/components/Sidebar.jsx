import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FileText,
  LogOut,
  Tags,
  ScanBarcode,
  Coffee,
  User,
  Settings as SettingsIcon,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const { user, logout } = useAuth();

  // Define base items
  let finalNavItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Inventory", path: "/inventory", icon: Package },
    { name: "Transaksi", path: "/transactions", icon: ShoppingCart },
  ];

  // Add items based on role
  if (user && ["admin", "owner", "manajer"].includes(user.role)) {
    finalNavItems.splice(1, 0, {
      name: "Master Data",
      path: "/master",
      icon: Tags,
    });
    finalNavItems.push({
      name: "Laporan",
      path: "/reports",
      icon: FileText,
    });
    finalNavItems.push({
      name: "User Management",
      path: "/users",
      icon: Users,
    });
    finalNavItems.push({
      name: "Settings",
      path: "/settings",
      icon: SettingsIcon,
    });
  }

  return (
    <div className="min-h-screen w-64 bg-secondary text-primary flex flex-col shadow-xl sticky top-0">
      <div className="p-6 border-b border-primary/20 flex items-center gap-3 flex-shrink-0">
        <div className="p-2 bg-primary rounded-lg text-secondary">
          <Coffee size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold font-sans">Tempat Ngopi</h1>
          <p className="text-xs text-primary/70">Inventory System</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <NavLink
          to="/profile"
          className="mb-6 px-4 py-3 bg-primary/10 rounded-xl border border-primary/20 flex items-center gap-3 hover:bg-primary/20 transition-colors cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/20 flex-shrink-0 flex items-center justify-center group-hover:ring-2 ring-primary/50 transition-all">
            {user?.foto_profil ? (
              <img
                src={`http://localhost:5000${user.foto_profil}`}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white font-bold">
                {user?.nama_lengkap?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="overflow-hidden">
            <p className="font-semibold text-white truncate text-sm">
              {user?.nama_lengkap}
            </p>
            <div className="mt-1 px-2 py-0.5 bg-primary/20 rounded inline-block">
              <p className="text-[10px] uppercase tracking-wider text-primary font-bold truncate">
                {user?.role}
              </p>
            </div>
          </div>
        </NavLink>

        <nav className="space-y-2">
          {finalNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-secondary shadow-lg font-medium"
                    : "hover:bg-primary/10 hover:text-white"
                }`
              }
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-primary/20 flex-shrink-0">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-colors text-primary/70"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
