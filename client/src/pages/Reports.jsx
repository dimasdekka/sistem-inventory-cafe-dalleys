import React, { useState, useEffect } from "react";
import api from "../utils/api";
import {
  FileText,
  Printer,
  Download,
  Calendar,
  FileSpreadsheet,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { motion } from "framer-motion";

const Reports = () => {
  const { user } = useAuth();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [type, setType] = useState("all");
  const [kategori, setKategori] = useState("all");
  const [kategoriList, setKategoriList] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Fetch kategori list
  useEffect(() => {
    const fetchKategori = async () => {
      try {
        const res = await api.get("/master/kategori");
        setKategoriList(res.data);
      } catch (error) {
        console.error("Error fetching kategori:", error);
      }
    };
    fetchKategori();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await api.get("/laporan", {
        params: { startDate, endDate, type, kategori },
      });
      console.log("Report data:", res.data);
      setData(res.data);
    } catch (error) {
      console.error("Error generating report:", error);
      alert(
        "Failed to generate report: " +
          (error.response?.data?.message || error.message),
      );
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    try {
      if (!data || data.length === 0) {
        alert("No data to export");
        return;
      }

      const doc = new jsPDF();

      // Header
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("LAPORAN STOK BARANG", 105, 20, { align: "center" });

      // Report Type
      doc.setFontSize(14);
      doc.setFont("helvetica", "normal");
      const reportTitle =
        type === "masuk"
          ? "Barang Masuk"
          : type === "keluar"
            ? "Barang Keluar"
            : "Semua Transaksi";
      doc.text(reportTitle, 105, 30, { align: "center" });

      // Period
      doc.setFontSize(10);
      doc.text(`Periode: ${startDate} s/d ${endDate}`, 105, 38, {
        align: "center",
      });

      // Line separator
      doc.setLineWidth(0.5);
      doc.line(20, 42, 190, 42);

      // Table
      const tableData = data.map((t) => [
        new Date(t.tanggal_transaksi).toLocaleDateString("id-ID"),
        (t.jenis_transaksi || "").toUpperCase(),
        t.Barang?.nama_barang || "-",
        t.Barang?.Kategori?.nama_kategori || "-",
        t.Barang?.kode_barcode || "-",
        t.User?.nama_lengkap || "-",
        (t.jumlah || 0).toString(),
        t.keterangan || "-",
      ]);

      doc.autoTable({
        startY: 48,
        head: [
          [
            "Tanggal",
            "Jenis",
            "Nama Barang",
            "Kategori",
            "Barcode",
            "User",
            "Qty",
            "Keterangan",
          ],
        ],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: [202, 179, 141],
          textColor: [0, 0, 0],
          fontStyle: "bold",
          halign: "center",
        },
        bodyStyles: {
          fontSize: 8,
        },
        columnStyles: {
          0: { cellWidth: 22 },
          1: { cellWidth: 18, halign: "center" },
          2: { cellWidth: 35 },
          3: { cellWidth: 25 },
          4: { cellWidth: 22 },
          5: { cellWidth: 25 },
          6: { cellWidth: 12, halign: "center" },
          7: { cellWidth: 30 },
        },
        margin: { top: 48, left: 10, right: 10 },
      });

      // Summary
      if (data.length > 0) {
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(`Total Transaksi: ${data.length}`, 20, finalY);

        const totalQty = data.reduce((sum, t) => sum + (t.jumlah || 0), 0);
        doc.text(`Total Quantity: ${totalQty}`, 20, finalY + 6);
      }

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont("helvetica", "italic");
        doc.text(
          `Generated on ${new Date().toLocaleString("id-ID")}`,
          105,
          doc.internal.pageSize.height - 10,
          { align: "center" },
        );
        doc.text(
          `Page ${i} of ${pageCount}`,
          190,
          doc.internal.pageSize.height - 10,
          { align: "right" },
        );
      }

      // Save PDF
      const filename = `Laporan_${type}_${startDate}_${endDate}.pdf`;
      doc.save(filename);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF: " + error.message);
    }
  };

  const generateExcel = () => {
    try {
      if (!data || data.length === 0) {
        alert("No data to export");
        return;
      }

      // Prepare data for Excel
      const excelData = data.map((t) => ({
        Tanggal: new Date(t.tanggal_transaksi).toLocaleDateString("id-ID"),
        Jenis: (t.jenis_transaksi || "").toUpperCase(),
        "Nama Barang": t.Barang?.nama_barang || "-",
        "Kategori Barang": t.Barang?.Kategori?.nama_kategori || "-",
        Barcode: t.Barang?.kode_barcode || "-",
        User: t.User?.nama_lengkap || "-",
        Quantity: t.jumlah || 0,
        Keterangan: t.keterangan || "-",
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      ws["!cols"] = [
        { wch: 12 },
        { wch: 10 },
        { wch: 30 },
        { wch: 20 },
        { wch: 15 },
        { wch: 20 },
        { wch: 10 },
        { wch: 30 },
      ];

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Laporan");

      // Save file
      const filename = `Laporan_${type}_${startDate}_${endDate}.xlsx`;
      XLSX.writeFile(wb, filename);
    } catch (error) {
      console.error("Error generating Excel:", error);
      alert("Failed to generate Excel file: " + error.message);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const isAuthorized = ["owner", "admin", "manajer"].includes(user?.role);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center no-print"
      >
        <h1 className="text-3xl font-bold text-white">Reports</h1>
        {data.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Printer size={20} /> Print
            </button>
            <button
              onClick={generateExcel}
              className="btn btn-primary flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <FileSpreadsheet size={20} /> Export Excel
            </button>
            <button
              onClick={generatePDF}
              className="btn btn-primary flex items-center gap-2"
            >
              <Download size={20} /> Export PDF
            </button>
          </div>
        )}
      </motion.div>

      {/* Filter Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card no-print"
      >
        <form
          onSubmit={handleGenerate}
          className="grid grid-cols-1 md:grid-cols-5 gap-4"
        >
          <div>
            <label className="block text-gray-400 mb-1 text-sm flex items-center gap-2">
              <Calendar size={16} />
              Start Date
            </label>
            <input
              type="date"
              className="input-field"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-1 text-sm flex items-center gap-2">
              <Calendar size={16} />
              End Date
            </label>
            <input
              type="date"
              className="input-field"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-1 text-sm">Type</label>
            <select
              className="input-field"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="all">All Transactions</option>
              <option value="masuk">Barang Masuk</option>
              <option value="keluar">Barang Keluar</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-400 mb-1 text-sm">Kategori</label>
            <select
              className="input-field"
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
            >
              <option value="all">Semua Kategori</option>
              {kategoriList.map((kat) => (
                <option key={kat.id_kategori} value={kat.id_kategori}>
                  {kat.nama_kategori}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-400 mb-1 text-sm">Action</label>
            <button
              type="submit"
              disabled={loading || !isAuthorized}
              className={`w-full btn btn-primary flex items-center justify-center gap-2 ${
                !isAuthorized ? "opacity-50 cursor-not-allowed" : ""
              }`}
              title={
                !isAuthorized
                  ? "Only Owner/Admin/Manajer can generate reports"
                  : ""
              }
            >
              <FileText size={20} />{" "}
              {loading ? "Generating..." : "Generate Report"}
            </button>
          </div>
        </form>
        {!isAuthorized && (
          <p className="text-red-400 text-xs mt-2 text-right">
            Only Owner/Admin/Manajer can generate reports. (Role: "{user?.role}
            ")
          </p>
        )}
      </motion.div>

      {/* No Data Message */}
      {!loading && data.length === 0 && hasSearched && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 bg-gray-800/50 rounded-xl mt-6 border border-gray-700"
        >
          <FileText className="mx-auto mb-4 text-gray-500" size={48} />
          <p className="text-gray-400">
            No transactions found for the selected criteria.
          </p>
        </motion.div>
      )}

      {/* Report Table */}
      {data.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white text-black p-8 rounded-xl shadow-xl printable-area"
        >
          {/* Report Header */}
          <div className="text-center mb-6 border-b-2 border-gray-300 pb-4">
            <h2 className="text-2xl font-bold uppercase mb-2">
              {type === "masuk"
                ? "Laporan Stok Barang Masuk"
                : type === "keluar"
                  ? "Laporan Stok Barang Keluar"
                  : "Laporan Stok Barang"}
            </h2>
            <p className="text-gray-600">
              Periode: {startDate} s/d {endDate}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Generated on {new Date().toLocaleString("id-ID")}
            </p>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="p-2">Date</th>
                  <th className="p-2">Type</th>
                  <th className="p-2">Item Name</th>
                  <th className="p-2">Kategori Barang</th>
                  <th className="p-2">Barcode</th>
                  <th className="p-2">User</th>
                  <th className="p-2 text-right">Qty</th>
                  <th className="p-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {data.map((t) => (
                  <tr key={t.id_transaksi} className="border-b border-gray-300">
                    <td className="p-2">
                      {new Date(t.tanggal_transaksi).toLocaleDateString(
                        "id-ID",
                      )}
                    </td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          t.jenis_transaksi === "masuk"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {(t.jenis_transaksi || "").toUpperCase()}
                      </span>
                    </td>
                    <td className="p-2">{t.Barang?.nama_barang || "-"}</td>
                    <td className="p-2 font-semibold text-blue-700">
                      {t.Barang?.Kategori?.nama_kategori || "-"}
                    </td>
                    <td className="p-2 font-mono text-sm">
                      {t.Barang?.kode_barcode || "-"}
                    </td>
                    <td className="p-2">{t.User?.nama_lengkap || "-"}</td>
                    <td className="p-2 text-right font-mono font-bold">
                      {t.jumlah || 0}
                    </td>
                    <td className="p-2 text-sm text-gray-600 italic">
                      {t.keterangan || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="mt-6 pt-4 border-t-2 border-gray-300">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold">Total Transactions: {data.length}</p>
                <p className="font-bold">
                  Total Quantity:{" "}
                  {data.reduce((sum, t) => sum + (t.jumlah || 0), 0)}
                </p>
              </div>
              <div className="text-right text-sm text-gray-600">
                <p>Inventory Management System</p>
                <p>© 2026 All Rights Reserved</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Reports;
