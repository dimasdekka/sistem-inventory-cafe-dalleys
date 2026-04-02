import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency, formatCompactCurrency } from "@/lib/utils";
import { reportsService } from "@/features/reports/reports.service";

interface ChartData {
  name: string;
  Pengeluaran: number;
}

export function SupplierExpenseChart() {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportsService.getPurchaseReport().then((purchases) => {
      // Setup last 7 days bins
      const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        d.setHours(0, 0, 0, 0);
        return d;
      });

      const chartData: ChartData[] = last7Days.map((date) => {
        const dayStr = date.toISOString().split("T")[0];
        const dayName = new Intl.DateTimeFormat("id-ID", {
          weekday: "short",
        }).format(date);

        return {
          name: dayName,
          dateStr: dayStr, // hidden helper
          Pengeluaran: 0,
        };
      });

      // Aggregate data
      // For purchases, sum up the total of POs where status isn't rejected/cancelled
      purchases.forEach((p) => {
        if (p.status === "cancelled" || p.status === "rejected") return;

        const pDate = new Date(p.created_at);
        const pDayStr = pDate.toISOString().split("T")[0];

        const bin = (chartData as any[]).find((c) => c.dateStr === pDayStr);
        if (bin) {
          bin.Pengeluaran += p.total;
        }
      });

      setData(chartData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="card basis-full lg:basis-1/2 h-[400px] flex flex-col">
      <div className="px-5 py-4 border-b border-gray-100 flex-shrink-0">
        <h2 className="text-base font-semibold text-gray-900">
          Tren Pengeluaran PO (7 Hari)
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Total nilai Purchase Order yang diajukan per hari
        </p>
      </div>
      <div className="flex-1 p-5 min-h-0">
        {loading ? (
          <div className="h-full flex items-center justify-center text-sm text-gray-400">
            Memuat grafik...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 30, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f3f4f6"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#6b7280" }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#6b7280" }}
                tickFormatter={(value) => formatCompactCurrency(value)}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                formatter={(value: number) => [
                  formatCurrency(value),
                  "Pengeluaran",
                ]}
                labelStyle={{
                  color: "#374151",
                  fontWeight: "bold",
                  marginBottom: "4px",
                }}
              />
              <Area
                type="monotone"
                dataKey="Pengeluaran"
                stroke="#3b82f6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorExpense)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
