import React, { useState, useEffect } from "react";
import api from "../utils/api";
import {
  TrendingUp,
  TrendingDown,
  Package,
  AlertCircle,
  Calendar,
  Bell,
  LogIn,
  LogOut,
  UserPlus,
  PackagePlus,
  PackageMinus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import LowStockNotification from "../components/LowStockNotification";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(7);
  const [notifications, setNotifications] = useState([]);
  const [notifFilter, setNotifFilter] = useState("all");
  const [lowStockItems, setLowStockItems] = useState([]);
  const [showLowStockPopup, setShowLowStockPopup] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchNotifications();
    fetchLowStockItems();
  }, [period]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/dashboard/stats?period=${period}`);
      setStats(res.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/activity-logs", {
        params: { limit: 20 },
      });
      setNotifications(res.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    }
  };

  const fetchLowStockItems = async () => {
    try {
      const res = await api.get("/master/barang");
      const lowStock = res.data.filter(
        (item) => item.stok_current <= item.stok_minimum,
      );
      setLowStockItems(lowStock);

      // Show popup only if there are low stock items
      if (lowStock.length > 0) {
        const hasSeenPopup = sessionStorage.getItem("lowStockPopupShown");
        if (!hasSeenPopup) {
          setShowLowStockPopup(true);
          sessionStorage.setItem("lowStockPopupShown", "true");
        }
      }
    } catch (error) {
      console.error("Error fetching low stock items:", error);
    }
  };

  const getNotificationIcon = (type) => {
    const iconProps = { size: 16, className: "flex-shrink-0" };
    switch (type) {
      case "barang_masuk":
        return <PackagePlus {...iconProps} className="text-green-400" />;
      case "barang_keluar":
        return <PackageMinus {...iconProps} className="text-red-400" />;
      case "login":
        return <LogIn {...iconProps} className="text-blue-400" />;
      case "logout":
        return <LogOut {...iconProps} className="text-gray-400" />;
      case "user_created":
        return <UserPlus {...iconProps} className="text-purple-400" />;
      default:
        return <Bell {...iconProps} className="text-yellow-400" />;
    }
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (notifFilter === "all") return true;
    return notif.type === notifFilter;
  });

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = Math.floor((now - timestamp) / 1000); // seconds

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="-m-8 p-6 h-screen flex flex-col space-y-6 overflow-hidden">
      {/* Low Stock Popup Notification */}
      {showLowStockPopup && (
        <LowStockNotification
          items={lowStockItems}
          onClose={() => setShowLowStockPopup(false)}
        />
      )}

      {/* Header with Period Selector */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center shrink-0"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">
            Overview of your inventory system
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPeriod(7)}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
              period === 7
                ? "bg-primary text-secondary font-semibold shadow-lg"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            <Calendar size={16} />7 Days
          </button>
          <button
            onClick={() => setPeriod(30)}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
              period === 30
                ? "bg-primary text-secondary font-semibold shadow-lg"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            <Calendar size={16} />1 Month
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Total Items",
            value: stats.totalBarang,
            icon: Package,
            color: "from-blue-500 to-blue-600",
            bgColor: "bg-blue-500/10",
            textColor: "text-blue-400",
          },
          {
            title: "Barang Masuk",
            value: stats.totalMasuk,
            icon: TrendingUp,
            color: "from-green-500 to-green-600",
            bgColor: "bg-green-500/10",
            textColor: "text-green-400",
          },
          {
            title: "Barang Keluar",
            value: stats.totalKeluar,
            icon: TrendingDown,
            color: "from-red-500 to-red-600",
            bgColor: "bg-red-500/10",
            textColor: "text-red-400",
          },
          {
            title: "Low Stock Items",
            value: stats.lowStockCount || 0,
            icon: AlertCircle,
            color:
              stats.lowStockCount > 0
                ? "from-red-500 to-red-600"
                : "from-yellow-500 to-yellow-600",
            bgColor:
              stats.lowStockCount > 0 ? "bg-red-500/10" : "bg-yellow-500/10",
            textColor:
              stats.lowStockCount > 0 ? "text-red-400" : "text-yellow-400",
            borderColor: stats.lowStockCount > 0 ? "border-red-500" : "",
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`card hover:shadow-xl transition-all duration-300 group ${
              stat.borderColor ? `border-2 ${stat.borderColor}` : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">{stat.title}</p>
                <p className={`text-3xl font-bold ${stat.textColor}`}>
                  <CountUp end={stat.value} duration={2} />
                </p>
              </div>
              <div
                className={`p-4 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform`}
              >
                <stat.icon size={24} className={stat.textColor} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts and Notifications Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
        {/* Transaction Trend Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 card flex-1 min-h-0 flex flex-col"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-primary" />
            Transaction Trends
          </h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={stats.chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorMasuk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorKeluar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#374151"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke="#9ca3af"
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#9ca3af"
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
                <Area
                  type="monotone"
                  dataKey="masuk"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorMasuk)"
                  name="Barang Masuk"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="keluar"
                  stroke="#ef4444"
                  fillOpacity={1}
                  fill="url(#colorKeluar)"
                  name="Barang Keluar"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Notifications Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="card flex-1 min-h-0 flex flex-col"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Bell size={20} className="text-primary" />
              Activity Feed
            </h3>
            <select
              value={notifFilter}
              onChange={(e) => setNotifFilter(e.target.value)}
              className="text-xs bg-gray-800 text-gray-300 rounded px-2 py-1 border border-gray-700"
            >
              <option value="all">All</option>
              <option value="barang_masuk">Stock In</option>
              <option value="barang_keluar">Stock Out</option>
              <option value="login">Logins</option>
              <option value="logout">Logouts</option>
              <option value="user_created">Users</option>
            </select>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            <AnimatePresence>
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No activities yet</p>
                </div>
              ) : (
                filteredNotifications.map((notif, index) => (
                  <motion.div
                    key={notif.id_activity}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-gray-800/50 rounded-lg p-3 border border-gray-700 hover:border-primary/50 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {getNotificationIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-300 leading-snug">
                          {notif.message}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">
                            {notif.User?.nama_lengkap || "System"}
                          </span>
                          <span className="text-xs text-gray-600">•</span>
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(new Date(notif.created_at))}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
