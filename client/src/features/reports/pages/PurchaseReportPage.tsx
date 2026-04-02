import { useState, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { Loader2 } from "lucide-react";
import { PageWrapper } from "@/components/layout/PageWrapper";

import { formatCurrency, formatCompactCurrency } from "@/lib/utils";
import { ReportFilters, ExportButton, PrintHeader } from "../components";
import { reportsService, PurchaseReportItem } from "../reports.service";
import { useToast } from "@/components/feedback/Toast";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants";

export function PurchaseReportPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const [data, setData] = useState<PurchaseReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await reportsService.getPurchaseReport();
      setData(result);
    } catch {
      toast.error("Gagal memuat laporan pembelian");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const [searchTerm, setSearchTerm] = useState("");
  const [periodFilter, setPeriodFilter] = useState("all");

  const filteredData = data.filter((po) => {
    // 1. Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchPo = po.po_number.toLowerCase().includes(term);
      const matchSupplier = po.supplier.toLowerCase().includes(term);
      if (!matchPo && !matchSupplier) return false;
    }

    // 2. Period filter
    if (periodFilter !== "all") {
      const poDate = new Date(po.created_at).getTime();
      const now = new Date().getTime();
      const diffDays = (now - poDate) / (1000 * 3600 * 24);

      if (periodFilter === "today" && diffDays > 1) return false;
      if (periodFilter === "7days" && diffDays > 7) return false;
      if (periodFilter === "30days" && diffDays > 30) return false;
      if (periodFilter === "this_month") {
        const itemD = new Date(po.created_at);
        const currD = new Date();
        if (
          itemD.getMonth() !== currD.getMonth() ||
          itemD.getFullYear() !== currD.getFullYear()
        ) {
          return false;
        }
      }
    }

    return true;
  });

  const totalPurchase = filteredData.reduce((sum, po) => sum + po.total, 0);

  // Build per-supplier chart data grouped by month
  const supplierMap: Record<string, number> = {};
  filteredData.forEach((po) => {
    supplierMap[po.supplier] = (supplierMap[po.supplier] ?? 0) + po.total;
  });
  const chartData = Object.entries(supplierMap).map(([supplier, total]) => ({
    supplier,
    total,
  }));

  const handleExport = () => {
    reportsService.exportToCSV(
      filteredData.map((po) => ({
        "No. PO": po.po_number,
        Supplier: po.supplier,
        Total: po.total,
        Status: po.status,
        "Jml Item": po.item_count,
        Tanggal: new Date(po.created_at).toLocaleDateString("id-ID"),
      })),
      "Laporan_Pembelian",
    );
  };

  return (
    <PageWrapper
      title="Laporan Pembelian"
      description="Rangkuman pembelian per periode dan berdasar supplier"
      actions={<ExportButton reportName="Pembelian" onExport={handleExport} />}
    >
      <PrintHeader
        title="Laporan Pembelian"
        subtitle="Rangkuman pembelian per periode dan berdasar supplier"
        activeFilters={[
          searchTerm ? `Cari: "${searchTerm}"` : null,
          periodFilter !== "all" ? `Periode: ${periodFilter}` : null,
        ].filter(Boolean).join(" | ") || undefined}
      />

      <div className="mb-6 card p-4 print:hidden">
        <ReportFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          periodFilter={periodFilter}
          onPeriodChange={setPeriodFilter}
          hideTypeOnly={true}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
        </div>
      ) : (
        <>
          {chartData.length > 0 && (
            <div className="card p-6 mb-6 h-72 flex flex-col print:hidden">
              <p className="text-gray-900 font-bold mb-4">
                Pengeluaran per Supplier
              </p>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#E5E7EB"
                    />
                    <XAxis
                      dataKey="supplier"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#6B7280" }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#6B7280" }}
                      tickFormatter={(val) => formatCompactCurrency(val)}
                    />
                    <RechartsTooltip
                      formatter={(value: number) => formatCurrency(value)}
                      cursor={{ fill: "#F3F4F6" }}
                    />
                    <Bar
                      dataKey="total"
                      name="Total Pembelian"
                      fill="#10B981"
                      radius={[4, 4, 0, 0]}
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {[
                    "No. PO",
                    "Tanggal",
                    "Supplier",
                    "Item",
                    "Total",
                    "Status",
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
                      colSpan={6}
                      className="px-4 py-8 text-center text-sm text-gray-400"
                    >
                      Tidak ada data pembelian yang cocok dengan pencarian
                    </td>
                  </tr>
                ) : (
                  filteredData.map((po) => (
                    <tr
                      key={po.id}
                      className="hover:bg-gray-50/50 cursor-pointer transition-colors"
                      onClick={() =>
                        navigate(ROUTES.PURCHASE_ORDERS.DETAIL(po.id))
                      }
                    >
                      <td className="px-4 py-3 text-sm font-mono text-primary-600">
                        {po.po_number}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(po.created_at).toLocaleString("id-ID", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {po.supplier}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {po.item_count} item
                      </td>
                      <td className="px-4 py-3 text-sm font-bold">
                        {formatCurrency(po.total)}
                      </td>
                      <td className="px-4 py-3 text-sm text-success-600 font-medium capitalize">
                        {po.status}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 border-t border-gray-200">
                  <td
                    colSpan={4}
                    className="px-4 py-3 text-sm font-semibold text-right"
                  >
                    Total Pembelian:
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-primary-600">
                    {formatCurrency(totalPurchase)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </PageWrapper>
  );
}
