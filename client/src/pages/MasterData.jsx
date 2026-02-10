import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { Plus, Edit2, Trash2 } from "lucide-react";
import Modal from "../components/Modal";

const MasterData = () => {
  const [activeTab, setActiveTab] = useState("kategori"); // kategori, satuan, supplier
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/master/${activeTab}`);
      setData(res.data);
    } catch (error) {
      alert("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleOpenModal = (item = null) => {
    setFormData(item || {});
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      await api.delete(`/master/${activeTab}/${id}`);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Delete failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const idKey = `id_${activeTab}`; // id_kategori, id_satuan, id_supplier
      if (formData[idKey]) {
        await api.put(`/master/${activeTab}/${formData[idKey]}`, formData);
      } else {
        await api.post(`/master/${activeTab}`, formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Save failed");
    }
  };

  const tabs = [
    { id: "kategori", label: "Kategori" },
    { id: "satuan", label: "Satuan" },
    { id: "supplier", label: "Supplier" },
  ];

  const renderForm = () => {
    switch (activeTab) {
      case "kategori":
        return (
          <>
            <div className="mb-4">
              <label className="block text-gray-400 mb-1">Nama Kategori</label>
              <input
                className="input-field"
                value={formData.nama_kategori || ""}
                onChange={(e) =>
                  setFormData({ ...formData, nama_kategori: e.target.value })
                }
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-400 mb-1">Deskripsi</label>
              <textarea
                className="input-field"
                value={formData.deskripsi || ""}
                onChange={(e) =>
                  setFormData({ ...formData, deskripsi: e.target.value })
                }
              />
            </div>
          </>
        );
      case "satuan":
        return (
          <>
            <div className="mb-4">
              <label className="block text-gray-400 mb-1">Nama Satuan</label>
              <input
                className="input-field"
                value={formData.nama_satuan || ""}
                onChange={(e) =>
                  setFormData({ ...formData, nama_satuan: e.target.value })
                }
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-400 mb-1">Simbol</label>
              <input
                className="input-field"
                value={formData.simbol || ""}
                onChange={(e) =>
                  setFormData({ ...formData, simbol: e.target.value })
                }
              />
            </div>
          </>
        );
      case "supplier":
        return (
          <>
            <div className="mb-4">
              <label className="block text-gray-400 mb-1">Nama Supplier</label>
              <input
                className="input-field"
                value={formData.nama_supplier || ""}
                onChange={(e) =>
                  setFormData({ ...formData, nama_supplier: e.target.value })
                }
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-400 mb-1">Telepon</label>
              <input
                className="input-field"
                value={formData.telepon || ""}
                onChange={(e) =>
                  setFormData({ ...formData, telepon: e.target.value })
                }
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-400 mb-1">Email</label>
              <input
                className="input-field"
                value={formData.email || ""}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Master Data</h1>

      <div className="flex gap-4 border-b border-gray-700 pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium transition-colors ${activeTab === tab.id ? "text-primary border-b-2 border-primary" : "text-gray-400 hover:text-white"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <button
        onClick={() => handleOpenModal()}
        className="btn btn-primary flex items-center gap-2"
      >
        <Plus size={20} /> Add New {tabs.find((t) => t.id === activeTab).label}
      </button>

      <div className="card">
        <table className="w-full text-left text-sm">
          <thead className="text-gray-400 border-b border-gray-700 bg-gray-800/20">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Name</th>
              <th className="p-3">Details</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                key={Object.values(item)[0]}
                className="border-b border-gray-800 hover:bg-white/5"
              >
                <td className="p-3 text-gray-500">{Object.values(item)[0]}</td>
                <td className="p-3 font-medium">
                  {item.nama_kategori || item.nama_satuan || item.nama_supplier}
                </td>
                <td className="p-3 text-gray-400">
                  {item.deskripsi || item.simbol || item.telepon}
                </td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleOpenModal(item)}
                      className="text-blue-400 hover:bg-blue-500/10 p-1 rounded"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(Object.values(item)[0])}
                      className="text-red-400 hover:bg-red-500/10 p-1 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Manage ${activeTab}`}
      >
        <form onSubmit={handleSubmit}>
          {renderForm()}
          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MasterData;
