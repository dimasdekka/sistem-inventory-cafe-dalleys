import React, { useState, useEffect } from "react";
import api from "../utils/api";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";

const Inventory = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);

  // Helper function to determine stock status
  const getStockStatus = (current, minimum, maximum) => {
    if (current <= minimum) {
      return {
        label: "Critical",
        color: "red",
        bgColor: "bg-red-500/10",
        textColor: "text-red-400",
        borderColor: "border-red-500/20",
        icon: AlertCircle,
      };
    }
    if (current <= minimum * 1.5) {
      return {
        label: "Low",
        color: "yellow",
        bgColor: "bg-yellow-500/10",
        textColor: "text-yellow-400",
        borderColor: "border-yellow-500/20",
        icon: AlertTriangle,
      };
    }
    if (maximum && current >= maximum * 0.8) {
      return {
        label: "High",
        color: "blue",
        bgColor: "bg-blue-500/10",
        textColor: "text-blue-400",
        borderColor: "border-blue-500/20",
        icon: TrendingUp,
      };
    }
    return {
      label: "Normal",
      color: "green",
      bgColor: "bg-green-500/10",
      textColor: "text-green-400",
      borderColor: "border-green-500/20",
      icon: CheckCircle,
    };
  };

  // Form State
  const [formData, setFormData] = useState({
    kode_barcode: "",
    sku: "",
    nama_barang: "",
    id_kategori: "",
    id_satuan: "",
    stok_minimum: 0,
    stok_maksimum: 0,
    id_barang: null, // For edit
  });

  const fetchData = async () => {
    try {
      const [resItems, resCats, resUnits] = await Promise.all([
        api.get("/master/barang"),
        api.get("/master/kategori"),
        api.get("/master/satuan"),
      ]);
      setItems(resItems.data);
      setCategories(resCats.data);
      setUnits(resUnits.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching inventory", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (item = null) => {
    if (item) {
      setFormData({
        ...item,
        id_barang: item.id_barang,
        sku: item.sku || "",
        // Ensure optional fields are handled
        stok_maksimum: item.stok_maksimum || 0,
      });
    } else {
      setFormData({
        kode_barcode: "",
        sku: "",
        nama_barang: "",
        id_kategori: categories[0]?.id_kategori || "",
        id_satuan: units[0]?.id_satuan || "",
        stok_minimum: 5,
        stok_maksimum: 0,
        id_barang: null,
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await api.delete(`/master/barang/${id}`);
        fetchData();
      } catch (error) {
        alert(error.response?.data?.message || "Failed to delete");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id_barang) {
        await api.put(`/master/barang/${formData.id_barang}`, formData);
      } else {
        await api.post("/master/barang", formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Operation failed");
    }
  };

  const filteredItems = items.filter(
    (item) =>
      item.nama_barang.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kode_barcode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-white">Inventory</h1>
        {(user?.role === "owner" || user?.role === "admin") && (
          <button
            onClick={() => handleOpenModal()}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Add New Item
          </button>
        )}
      </div>

      <div className="card space-y-4">
        <div className="flex items-center gap-4 bg-dark/50 p-3 rounded-lg border border-gray-700">
          <Search className="text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search items by name, barcode, or SKU..."
            className="bg-transparent border-none focus:outline-none text-gray-100 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-gray-400 border-b border-gray-700 bg-gray-800/20">
              <tr>
                <th className="p-3">SKU</th>
                <th className="p-3">Barcode</th>
                <th className="p-3">Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Status</th>
                <th className="p-3">Unit</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredItems.map((item) => {
                const status = getStockStatus(
                  item.stok_current,
                  item.stok_minimum,
                  item.stok_maksimum,
                );
                const StatusIcon = status.icon;

                return (
                  <tr
                    key={item.id_barang}
                    className={`border-b transition-colors ${
                      item.stok_current <= item.stok_minimum
                        ? "border-red-500 bg-red-500/5 hover:bg-red-500/10"
                        : "border-gray-800 hover:bg-white/5"
                    }`}
                  >
                    <td className="p-3 font-mono text-blue-400">
                      {item.sku || "-"}
                    </td>
                    <td className="p-3 font-mono text-gray-400">
                      {item.kode_barcode || "-"}
                    </td>
                    <td className="p-3 font-medium">{item.nama_barang}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-gray-700 rounded text-xs">
                        {item.Kategori?.nama_kategori}
                      </span>
                    </td>
                    <td
                      className={`p-3 font-bold ${item.stok_current <= item.stok_minimum ? "text-red-400" : "text-green-400"}`}
                    >
                      {item.stok_current}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${status.bgColor} ${status.textColor} border ${status.borderColor} rounded-full text-xs font-medium`}
                      >
                        <StatusIcon size={14} />
                        {status.label}
                      </span>
                    </td>
                    <td className="p-3 text-gray-400">{item.Satuan?.simbol}</td>
                    <td className="p-3 text-right flex justify-end gap-2">
                      {(user?.role === "owner" || user?.role === "admin") && (
                        <>
                          <button
                            onClick={() => handleOpenModal(item)}
                            className="p-2 hover:bg-blue-500/20 text-blue-400 rounded transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id_barang)}
                            className="p-2 hover:bg-red-500/20 text-red-400 rounded transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={formData.id_barang ? "Edit Item" : "Add New Item"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Internal SKU
              </label>
              <input
                type="text"
                className="input-field"
                value={formData.sku}
                onChange={(e) =>
                  setFormData({ ...formData, sku: e.target.value })
                }
                placeholder="PROD-001"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Scan Barcode
              </label>
              <input
                type="text"
                className="input-field"
                value={formData.kode_barcode}
                onChange={(e) =>
                  setFormData({ ...formData, kode_barcode: e.target.value })
                }
                placeholder="Scan or type..."
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Item Name
            </label>
            <input
              type="text"
              className="input-field"
              value={formData.nama_barang}
              onChange={(e) =>
                setFormData({ ...formData, nama_barang: e.target.value })
              }
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Category
              </label>
              <select
                className="input-field"
                value={formData.id_kategori}
                onChange={(e) =>
                  setFormData({ ...formData, id_kategori: e.target.value })
                }
                required
              >
                <option value="">Select...</option>
                {categories.map((c) => (
                  <option key={c.id_kategori} value={c.id_kategori}>
                    {c.nama_kategori}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Unit
              </label>
              <select
                className="input-field"
                value={formData.id_satuan}
                onChange={(e) =>
                  setFormData({ ...formData, id_satuan: e.target.value })
                }
                required
              >
                <option value="">Select...</option>
                {units.map((u) => (
                  <option key={u.id_satuan} value={u.id_satuan}>
                    {u.nama_satuan} ({u.simbol})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Min Stock
              </label>
              <input
                type="number"
                className="input-field"
                value={formData.stok_minimum}
                onChange={(e) =>
                  setFormData({ ...formData, stok_minimum: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Max Stock (Opt)
              </label>
              <input
                type="number"
                className="input-field"
                value={formData.stok_maksimum}
                onChange={(e) =>
                  setFormData({ ...formData, stok_maksimum: e.target.value })
                }
              />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Item
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Inventory;
