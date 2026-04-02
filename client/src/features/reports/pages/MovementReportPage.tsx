import { useState, useEffect, useCallback, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { Loader2 } from "lucide-react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ReportFilters, ExportButton, PrintHeader } from "../components";
import { reportsService, MovementReportItem } from "../reports.service";
import { useToast } from "@/components/feedback/Toast";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants";
import { purchaseOrdersService } from "@/features/purchase-orders/purchase-orders.service";
import { formatCurrency } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS = [
  { key: "all",       label: "Semua" },
  { key: "IN",        label: "Barang Masuk" },
  { key: "OUT",       label: "Barang Keluar" },
  { key: "OPNAME",    label: "Opname" },
  { key: "ADJUSTMENT", label: "Penyesuaian" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

// ─── Pure helpers (SRP / DRY) ─────────────────────────────────────────────────

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    IN: "Masuk",
    OUT: "Keluar",
    TRANSFER: "Transfer",
    ADJUSTMENT: "Penyesuaian",
    OPNAME: "Opname",
  };
  return labels[type] ?? type;
}

function getTypeBadge(type: string): string {
  const map: Record<string, string> = {
    IN:         "bg-emerald-100 text-emerald-700",
    OUT:        "bg-red-100 text-red-700",
    TRANSFER:   "bg-blue-100 text-blue-700",
    OPNAME:     "bg-amber-100 text-amber-700",
    ADJUSTMENT: "bg-purple-100 text-purple-700",
  };
  return map[type] ?? "bg-gray-100 text-gray-700";
}

function getQtyColor(type: string): string {
  if (type === "IN") return "text-success-600";
  if (type === "OUT") return "text-danger-600";
  return "text-gray-600";
}

function applyPeriodFilter(item: MovementReportItem, period: string): boolean {
  if (period === "all") return true;
  const itemDate = new Date(item.date).getTime();
  const now = Date.now();
  const diffDays = (now - itemDate) / (1000 * 3600 * 24);
  if (period === "today")      return diffDays <= 1;
  if (period === "7days")      return diffDays <= 7;
  if (period === "30days")     return diffDays <= 30;
  if (period === "this_month") {
    const d = new Date(item.date);
    const n = new Date();
    return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
  }
  return true;
}

// ─── Sub-components (SRP) ────────────────────────────────────────────────────

interface TabBarProps {
  active: TabKey;
  onChange: (t: TabKey) => void;
  counts: Record<string, number>;
}
function TabBar({ active, onChange, counts }: TabBarProps) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-gray-100 px-5 pt-3 print:hidden">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg whitespace-nowrap transition-colors ${
            active === tab.key
              ? "bg-white border border-b-white border-gray-200 text-primary-700 -mb-px"
              : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
          }`}
        >
          {tab.label}
          {counts[tab.key] !== undefined && (
            <span className="ml-1.5 text-xs text-gray-400">
              ({counts[tab.key]})
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function MovementReportPage() {
  const toast = useToast();
  const navigate = useNavigate();

  const [data, setData] = useState<MovementReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMovement, setSelectedMovement] = useState<MovementReportItem | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<TabKey>("all");

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await reportsService.getMovementReport();
      setData(result);
    } catch {
      toast.error("Gagal memuat laporan pergerakan");
    } finally {
      setIsLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadData(); }, [loadData]);

  // ─── Derived data (useMemo for performance) ─────────────────────────────────
  const filteredByPeriodAndSearch = useMemo(() => {
    return data.filter((item) => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        if (
          !item.product_name.toLowerCase().includes(term) &&
          !item.sku.toLowerCase().includes(term) &&
          !(item.reference_no ?? "").toLowerCase().includes(term)
        )
          return false;
      }
      return applyPeriodFilter(item, periodFilter);
    });
  }, [data, searchTerm, periodFilter]);

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: filteredByPeriodAndSearch.filter((i) => i.type === "IN" || i.type === "OUT").length,
    };
    TABS.slice(1).forEach((tab) => {
      counts[tab.key] = filteredByPeriodAndSearch.filter((i) => i.type === tab.key).length;
    });
    return counts;
  }, [filteredByPeriodAndSearch]);

  const filteredData = useMemo(() => {
    if (activeTab === "all") return filteredByPeriodAndSearch.filter((i) => i.type === "IN" || i.type === "OUT");
    return filteredByPeriodAndSearch.filter((i) => i.type === activeTab);
  }, [filteredByPeriodAndSearch, activeTab]);

  // Chart — 7 most recent unique dates (unfiltered, for trend overview)
  const chartData = useMemo(() => {
    const dateMap: Record<string, { date: string; masuk: number; keluar: number }> = {};
    data.forEach((item) => {
      const d = new Date(item.date).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
      });
      if (!dateMap[d]) dateMap[d] = { date: d, masuk: 0, keluar: 0 };
      if (item.quantity > 0) dateMap[d].masuk += item.quantity;
      else dateMap[d].keluar += Math.abs(item.quantity);
    });
    return Object.values(dateMap).slice(-7);
  }, [data]);

  // Summary totals for active tab
  const summary = useMemo(() => {
    const totalValue = filteredData
      .filter((i) => i.total_value > 0)
      .reduce((s, i) => s + i.total_value, 0);
    const inCount   = filteredData.filter((i) => i.type === "IN").reduce((s, i) => s + i.quantity, 0);
    const outCount  = filteredData.filter((i) => i.type === "OUT").reduce((s, i) => s + Math.abs(i.quantity), 0);
    return { totalValue, inCount, outCount };
  }, [filteredData]);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleExport = () => {
    reportsService.exportToCSV(
      filteredData.map((item) => ({
        Tanggal:       new Date(item.date).toLocaleDateString("id-ID"),
        Produk:        item.product_name,
        SKU:           item.sku,
        Tipe:          getTypeLabel(item.type),
        Jumlah:        item.quantity,
        "Harga Beli":  item.unit_cost > 0 ? item.unit_cost : "",
        "Nilai Total": item.total_value > 0 ? item.total_value : "",
        "No Referensi": item.reference_no,
        "Dibuat Oleh": item.created_by,
        Catatan:       item.notes,
      })),
      reportTitle.replace(/ /g, "_"),
    );
  };



  const handleRowClick = async (row: MovementReportItem) => {
    const refNo = row.reference_no;
    if (refNo?.startsWith("PO-")) {
      try {
        const pos = await purchaseOrdersService.getAll();
        const po = pos.find((p) => p.po_number === refNo);
        if (po) {
          navigate(ROUTES.PURCHASE_ORDERS.DETAIL(po.id));
          return;
        }
      } catch {
        toast.error("Gagal membuka detail PO.");
      }
    }
    setSelectedMovement(row);
  };

  const reportTitle = useMemo(() => {
    switch (activeTab) {
      case "all": return "Laporan Semua Transaksi";
      case "IN": return "Laporan Barang Masuk";
      case "OUT": return "Laporan Barang Keluar";
      case "OPNAME": return "Laporan Stok Opname";
      case "ADJUSTMENT": return "Laporan Penyesuaian Stok";
      default: return "Laporan Transaksi";
    }
  }, [activeTab]);

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <PageWrapper
      title={reportTitle}
      description="Riwayat pergerakan stok berdasarkan kategori yang dipilih"
      actions={<ExportButton reportName={reportTitle.replace(/ /g, "_")} onExport={handleExport} />}
    >
      <PrintHeader
        title={reportTitle}
        subtitle={`Kategori: ${TABS.find((t) => t.key === activeTab)?.label || "Semua"}`}
        activeFilters={[
          searchTerm ? `Cari: "${searchTerm}"` : null,
          periodFilter !== "all" ? `Periode: ${periodFilter}` : null,
        ].filter(Boolean).join(" | ") || undefined}
      />

      {/* Filters */}
      <div className="mb-4 card p-4 print:hidden">
        <ReportFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          periodFilter={periodFilter}
          onPeriodChange={setPeriodFilter}
          hideTypeOnly
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
        </div>
      ) : (
        <>
          {/* Trend chart */}
          {chartData.length > 0 && (
            <div className="card p-6 mb-4 h-72 flex flex-col print:hidden">
              <p className="text-gray-900 font-bold mb-4">
                Tren Pergerakan (7 Hari Terakhir)
              </p>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorMasuk" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorKeluar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} />
                    <CartesianGrid vertical={false} stroke="#F3F4F6" />
                    <RechartsTooltip />
                    <Area type="monotone" dataKey="masuk" name="Barang Masuk" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorMasuk)" />
                    <Area type="monotone" dataKey="keluar" name="Barang Keluar" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorKeluar)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Summary strip (visible on current tab) */}
          {filteredData.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-4 print:hidden">
              <div className="card p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">Nilai Transaksi</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(summary.totalValue)}</p>
              </div>
              <div className="card p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">Total Masuk</p>
                <p className="text-lg font-bold text-success-600">+{summary.inCount}</p>
              </div>
              <div className="card p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">Total Keluar</p>
                <p className="text-lg font-bold text-danger-600">-{summary.outCount}</p>
              </div>
            </div>
          )}

          {/* Tab Table */}
          <div className="card overflow-hidden">
            <TabBar
              active={activeTab}
              onChange={setActiveTab}
              counts={tabCounts}
            />

            <div className="overflow-x-auto">
              <table className="w-full print:text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {[
                      "No Referensi",
                      "Tanggal",
                      "Produk",
                      "Tipe",
                      "Qty",
                      "Harga Beli",
                      "Nilai",
                      "Dibuat Oleh",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-10 text-center text-sm text-gray-400"
                      >
                        Tidak ada data transaksi
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((row) => (
                      <tr
                        key={row.id}
                        className="hover:bg-gray-50/50 cursor-pointer transition-colors"
                        onClick={() => handleRowClick(row)}
                      >
                        <td className="px-4 py-3 text-sm font-mono font-medium">
                          {row.reference_no || "—"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                          {new Date(row.date).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                          <br />
                          <span className="text-xs text-gray-400">
                            {new Date(row.date).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium">{row.product_name}</p>
                          <p className="text-xs text-gray-400 font-mono">{row.sku}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTypeBadge(row.type)}`}
                          >
                            {getTypeLabel(row.type)}
                          </span>
                        </td>
                        <td
                          className={`px-4 py-3 text-sm font-bold ${getQtyColor(row.type)}`}
                        >
                          {row.quantity > 0 ? `+${row.quantity}` : row.quantity}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {row.unit_cost > 0
                            ? formatCurrency(row.unit_cost)
                            : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-800">
                          {row.total_value > 0
                            ? formatCurrency(row.total_value)
                            : <span className="text-gray-300 font-normal">—</span>}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {row.created_by}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedMovement}
        onClose={() => setSelectedMovement(null)}
        title="Detail Transaksi"
        size="md"
      >
        {selectedMovement && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Tanggal</p>
                <p className="font-medium text-gray-900">
                  {new Date(selectedMovement.date).toLocaleString("id-ID", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tipe Transaksi</p>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeBadge(selectedMovement.type)}`}
                >
                  {getTypeLabel(selectedMovement.type)}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Produk</p>
                <p className="font-medium text-gray-900">{selectedMovement.product_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">SKU / Kode</p>
                <p className="font-mono text-sm text-gray-900">{selectedMovement.sku || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Kuantitas</p>
                <p className={`font-bold text-lg ${getQtyColor(selectedMovement.type)}`}>
                  {selectedMovement.quantity > 0 ? `+${selectedMovement.quantity}` : selectedMovement.quantity}
                </p>
              </div>
              {selectedMovement.unit_cost > 0 && (
                <div>
                  <p className="text-sm text-gray-500">Harga Beli (Satuan)</p>
                  <p className="font-medium text-gray-900">
                    {formatCurrency(selectedMovement.unit_cost)}
                  </p>
                </div>
              )}
              {selectedMovement.total_value > 0 && (
                <div className="col-span-2 bg-primary-50 rounded-xl p-3">
                  <p className="text-sm text-primary-600">Nilai Total Transaksi</p>
                  <p className="font-bold text-xl text-primary-800">
                    {formatCurrency(selectedMovement.total_value)}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">No. Referensi</p>
                <p className="font-mono text-sm text-gray-900">
                  {selectedMovement.reference_no || "—"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Dibuat Oleh</p>
                <p className="font-medium text-gray-900">{selectedMovement.created_by}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Catatan</p>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg text-sm text-gray-700 min-h-[60px] border border-gray-100">
                  {selectedMovement.notes || "Tidak ada catatan."}
                </div>
              </div>
            </div>
            <div className="pt-4 flex justify-end">
              <Button onClick={() => setSelectedMovement(null)}>Tutup</Button>
            </div>
          </div>
        )}
      </Modal>
    </PageWrapper>
  );
}
