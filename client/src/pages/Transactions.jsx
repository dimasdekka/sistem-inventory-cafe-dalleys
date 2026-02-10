import React, { useState, useEffect } from "react";
import api from "../utils/api";
import {
  Plus,
  Minus,
  Search,
  History,
  ScanBarcode,
  Edit2,
  Clock,
  User,
} from "lucide-react";
import Modal from "../components/Modal";
import BarcodeScanner from "../components/BarcodeScanner";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const [formData, setFormData] = useState({
    jenis_transaksi: "keluar",
    id_barang: "",
    jumlah: 1,
    id_supplier: "",
    keterangan: "",
    edit_reason: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterDateRange, setFilterDateRange] = useState("all");
  const [filterUser, setFilterUser] = useState("all");
  const [users, setUsers] = useState([]);

  const fetchData = async () => {
    try {
      const [resTrans, resItems, resSuppliers, resUsers] = await Promise.all([
        api.get("/transaksi"),
        api.get("/master/barang"),
        api.get("/master/supplier"),
        api.get("/users"),
      ]);
      setTransactions(resTrans.data);
      setItems(resItems.data);
      setSuppliers(resSuppliers.data);
      setUsers(resUsers.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation for edit
    if (editingTransaction && !formData.edit_reason.trim()) {
      alert("Edit reason is required!");
      return;
    }

    try {
      if (editingTransaction) {
        // Update existing transaction
        await api.put(
          `/transaksi/${editingTransaction.id_transaksi}`,
          formData,
        );
      } else {
        // Create new transaction
        await api.post("/transaksi", formData);
      }

      setIsModalOpen(false);
      setEditingTransaction(null);
      fetchData();

      // Reset form
      setFormData({
        jenis_transaksi: "keluar",
        id_barang: "",
        jumlah: 1,
        id_supplier: "",
        keterangan: "",
        edit_reason: "",
      });
    } catch (error) {
      alert(error.response?.data?.message || "Transaction failed");
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      jenis_transaksi: transaction.jenis_transaksi,
      id_barang: transaction.id_barang,
      jumlah: transaction.jumlah,
      id_supplier: transaction.id_supplier || "",
      keterangan: transaction.keterangan || "",
      edit_reason: "",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
    setFormData({
      jenis_transaksi: "keluar",
      id_barang: "",
      jumlah: 1,
      id_supplier: "",
      keterangan: "",
      edit_reason: "",
    });
  };

  const handleBarcodeDetected = (code) => {
    const item = items.find((i) => i.kode_barcode === code || i.sku === code);

    if (item) {
      setFormData((prev) => ({ ...prev, id_barang: item.id_barang }));
      setIsScannerOpen(false);
      if (!isModalOpen) setIsModalOpen(true);
    } else {
      alert("Item not found for code: " + code);
    }
  };

  const getFilteredTransactions = () => {
    return transactions.filter((t) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        t.Barang?.nama_barang?.toLowerCase().includes(searchLower) ||
        t.Barang?.sku?.toLowerCase().includes(searchLower) ||
        t.Barang?.kode_barcode?.toLowerCase().includes(searchLower) ||
        t.kode_transaksi?.toLowerCase().includes(searchLower) ||
        t.User?.nama_lengkap?.toLowerCase().includes(searchLower);

      // Type filter
      const matchesType =
        filterType === "all" || t.jenis_transaksi === filterType;

      // User filter
      const matchesUser =
        filterUser === "all" || t.id_user === parseInt(filterUser);

      // Date filter
      let matchesDate = true;
      if (filterDateRange !== "all") {
        const transDate = new Date(t.tanggal_transaksi);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        switch (filterDateRange) {
          case "today":
            matchesDate = transDate >= today;
            break;
          case "week":
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            matchesDate = transDate >= weekAgo;
            break;
          case "month":
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            matchesDate = transDate >= monthAgo;
            break;
          default:
            matchesDate = true;
        }
      }

      return matchesSearch && matchesType && matchesUser && matchesDate;
    });
  };

  const filteredTransactions = getFilteredTransactions();

  const clearFilters = () => {
    setSearchQuery("");
    setFilterType("all");
    setFilterDateRange("all");
    setFilterUser("all");
  };

  return (
    <div className="space-y-6">
      {isScannerOpen && (
        <BarcodeScanner
          onDetected={handleBarcodeDetected}
          onClose={() => setIsScannerOpen(false)}
        />
      )}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Transactions</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="btn btn-secondary flex items-center gap-2"
          >
            <ScanBarcode size={20} /> Scan
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={20} /> New Transaction
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by item, code, transaction ID, or user..."
                className="input-field pl-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <select
              className="input-field w-full"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="masuk">Masuk (In)</option>
              <option value="keluar">Keluar (Out)</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <select
              className="input-field w-full"
              value={filterDateRange}
              onChange={(e) => setFilterDateRange(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* User Filter */}
          <div>
            <select
              className="input-field w-full"
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
            >
              <option value="all">All Users</option>
              {users.map((u) => (
                <option key={u.id_user} value={u.id_user}>
                  {u.nama_lengkap}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters & Results Count */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={clearFilters}
              className="btn btn-secondary text-sm"
            >
              Clear Filters
            </button>
            <span className="text-sm text-gray-400">
              Showing {filteredTransactions.length} of {transactions.length}{" "}
              transactions
            </span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-gray-400 border-b border-gray-700 bg-gray-800/20">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Code</th>
                <th className="p-3">Type</th>
                <th className="p-3">Item</th>
                <th className="p-3">Qty</th>
                <th className="p-3">User</th>
                <th className="p-3">Notes</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-gray-400">
                    No transactions found
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t) => (
                  <tr
                    key={t.id_transaksi}
                    className="border-b border-gray-800 hover:bg-white/5"
                  >
                    <td className="p-3 text-gray-400">
                      {new Date(t.tanggal_transaksi).toLocaleDateString()}
                    </td>
                    <td className="p-3 font-mono text-xs text-gray-400">
                      {t.kode_transaksi}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-xs uppercase font-bold ${t.jenis_transaksi === "masuk" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
                      >
                        {t.jenis_transaksi}
                      </span>
                    </td>
                    <td className="p-3 font-medium">
                      <div>{t.Barang?.nama_barang}</div>
                      <div className="text-xs text-gray-500 font-mono">
                        {t.Barang?.sku || t.Barang?.kode_barcode || "-"}
                      </div>
                    </td>
                    <td className="p-3 font-bold">{t.jumlah}</td>
                    <td className="p-3 text-gray-400">
                      {t.User?.nama_lengkap}
                    </td>
                    <td className="p-3 text-gray-400 italic max-w-xs truncate">
                      {t.keterangan || "-"}
                    </td>
                    <td className="p-3">
                      {t.edited_at ? (
                        <div className="flex items-center gap-1 text-xs text-yellow-400">
                          <Clock size={12} />
                          <span>Edited</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">Original</span>
                      )}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleEdit(t)}
                        className="p-2 hover:bg-blue-500/20 text-blue-400 rounded transition-colors"
                        title="Edit Transaction"
                      >
                        <Edit2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTransaction ? "Edit Transaction" : "New Transaction"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Edit Warning */}
          {editingTransaction && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <Clock size={20} className="text-yellow-400 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-yellow-400 font-semibold mb-1">
                    Editing Transaction
                  </h4>
                  <p className="text-sm text-gray-300">
                    Code:{" "}
                    <span className="font-mono">
                      {editingTransaction.kode_transaksi}
                    </span>
                  </p>
                  {editingTransaction.edited_at && (
                    <div className="mt-2 pt-2 border-t border-yellow-500/20">
                      <p className="text-xs text-gray-400">
                        Last edited:{" "}
                        {new Date(
                          editingTransaction.edited_at,
                        ).toLocaleString()}
                      </p>
                      {editingTransaction.edit_reason && (
                        <p className="text-xs text-gray-400 mt-1">
                          Reason: {editingTransaction.edit_reason}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        Edited by:{" "}
                        <span className="text-yellow-400">
                          {editingTransaction.Editor?.nama_lengkap || "Unknown"}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4 mb-4">
            <button
              type="button"
              className={`flex-1 py-2 rounded-lg font-bold border ${formData.jenis_transaksi === "masuk" ? "bg-green-500 text-white border-green-500" : "border-gray-700 text-gray-400"}`}
              onClick={() =>
                setFormData({ ...formData, jenis_transaksi: "masuk" })
              }
            >
              Masuk (In)
            </button>
            <button
              type="button"
              className={`flex-1 py-2 rounded-lg font-bold border ${formData.jenis_transaksi === "keluar" ? "bg-red-500 text-white border-red-500" : "border-gray-700 text-gray-400"}`}
              onClick={() =>
                setFormData({ ...formData, jenis_transaksi: "keluar" })
              }
            >
              Keluar (Out)
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Select Item
            </label>
            <select
              className="input-field"
              value={formData.id_barang}
              onChange={(e) =>
                setFormData({ ...formData, id_barang: e.target.value })
              }
              required
            >
              <option value="">Select Item...</option>
              {items.map((i) => (
                <option key={i.id_barang} value={i.id_barang}>
                  {i.nama_barang} (Stock: {i.stok_current})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Quantity
            </label>
            <input
              type="number"
              min="1"
              className="input-field"
              value={formData.jumlah}
              onChange={(e) =>
                setFormData({ ...formData, jumlah: e.target.value })
              }
              required
            />
          </div>

          {formData.jenis_transaksi === "masuk" && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Supplier
              </label>
              <select
                className="input-field"
                value={formData.id_supplier}
                onChange={(e) =>
                  setFormData({ ...formData, id_supplier: e.target.value })
                }
                required
              >
                <option value="">Select Supplier...</option>
                {suppliers.map((s) => (
                  <option key={s.id_supplier} value={s.id_supplier}>
                    {s.nama_supplier}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Notes
            </label>
            <textarea
              className="input-field"
              value={formData.keterangan}
              onChange={(e) =>
                setFormData({ ...formData, keterangan: e.target.value })
              }
              placeholder="Optional notes..."
              rows={2}
            ></textarea>
          </div>

          {/* Edit Reason - Only show when editing */}
          {editingTransaction && (
            <div>
              <label className="block text-sm font-medium text-yellow-400 mb-1">
                Edit Reason <span className="text-red-400">*</span>
              </label>
              <textarea
                className="input-field border-yellow-500/30 focus:border-yellow-500"
                value={formData.edit_reason}
                onChange={(e) =>
                  setFormData({ ...formData, edit_reason: e.target.value })
                }
                placeholder="Why are you editing this transaction? (Required)"
                rows={3}
                required
              ></textarea>
              <p className="text-xs text-gray-500 mt-1">
                This will be logged for audit purposes
              </p>
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
              {editingTransaction ? "Update Transaction" : "Submit Transaction"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Transactions;
