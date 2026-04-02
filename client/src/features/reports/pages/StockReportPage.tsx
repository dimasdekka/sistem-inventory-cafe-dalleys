import { useState, useEffect, useCallback } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";
import { Loader2 } from "lucide-react";
import { PageWrapper } from "@/components/layout/PageWrapper";

import { StatusBadge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import { ReportFilters, ExportButton, PrintHeader } from "../components";
import { reportsService, StockReportItem } from "../reports.service";
import { useToast } from "@/components/feedback/Toast";

const CATEGORY_COLORS = [
  "#10B981",
  "#3B82F6",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
];

export function StockReportPage() {
  const toast = useToast();
  const [data, setData] = useState<StockReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await reportsService.getStockReport();
      setData(result);
    } catch {
      toast.error("Gagal memuat laporan stok");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = data.filter((item) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const matchName = item.product_name.toLowerCase().includes(term);
    const matchSku = item.sku.toLowerCase().includes(term);
    return matchName || matchSku;
  });

  const totalValue = filteredData.reduce(
    (sum, item) => sum + item.total_value,
    0,
  );

  // Build chart data grouped by category
  const categoryMap: Record<string, number> = {};
  filteredData.forEach((item) => {
    categoryMap[item.category] =
      (categoryMap[item.category] ?? 0) + item.total_value;
  });
  const chartData = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value,
  }));

  const handleExport = () => {
    reportsService.exportToCSV(
      filteredData.map((item) => ({
        Produk: item.product_name,
        SKU: item.sku,
        Kategori: item.category,
        Stok: item.quantity,
        Satuan: item.unit,
        Harga: item.price,
        "Total Nilai": item.total_value,
        Status: item.status,
      })),
      "Laporan_Stok",
    );
  };

  return (
    <PageWrapper
      title="Laporan Stok"
      description="Laporan nilai dan kondisi stok per produk"
      actions={<ExportButton reportName="Stok" onExport={handleExport} />}
    >
      <PrintHeader
        title="Laporan Stok"
        subtitle="Laporan nilai dan kondisi stok per produk"
        activeFilters={searchTerm ? `Cari: "${searchTerm}"` : undefined}
      />

      <div className="mb-6 card p-4 print:hidden">
        <ReportFilters searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="card p-6 flex flex-col justify-center">
              <p className="text-gray-500 font-medium mb-2">
                Total Nilai Inventaris
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(totalValue)}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Valuasi berdasarkan harga produk.
              </p>
            </div>

            <div className="card p-6 lg:col-span-2 h-64 flex flex-col print:hidden">
              <p className="text-gray-900 font-bold mb-4">
                Nilai Inventaris per Kategori
              </p>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend
                      verticalAlign="middle"
                      align="right"
                      layout="vertical"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Produk", "Kategori", "Stok", "Nilai", "Status"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-sm text-gray-400"
                    >
                      Tidak ada produk yang cocok dengan pencarian
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.sku} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium">
                          {item.product_name}
                        </p>
                        <p className="text-xs text-gray-500">{item.sku}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {item.category}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {formatCurrency(item.total_value)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={item.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </PageWrapper>
  );
}
