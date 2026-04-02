import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { reportsService } from "@/features/reports/reports.service";

interface ChartData {
  name: string;
  Masuk: number;
  Keluar: number;
}

export function MovementTrendChart() {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportsService.getMovementReport().then((movements) => {
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
          Masuk: 0,
          Keluar: 0,
        };
      });

      // Aggregate data
      // For movement types: "IN" is positive stock gain, "OUT" is removed stock.
      movements.forEach((m) => {
        const mDate = new Date(m.date);
        const mDayStr = mDate.toISOString().split("T")[0];

        const bin = (chartData as any[]).find((c) => c.dateStr === mDayStr);
        if (bin) {
          if (m.type === "IN") {
            bin.Masuk += Math.abs(m.quantity);
          } else if (m.type === "OUT") {
            bin.Keluar += Math.abs(m.quantity);
          }
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
          Pergerakan Stok (7 Hari)
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Kuantitas barang masuk dan keluar per hari
        </p>
      </div>
      <div className="flex-1 p-5 min-h-0">
        {loading ? (
          <div className="h-full flex items-center justify-center text-sm text-gray-400">
            Memuat grafik...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
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
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                labelStyle={{
                  color: "#374151",
                  fontWeight: "bold",
                  marginBottom: "4px",
                }}
                cursor={{ fill: "transparent" }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              <Bar dataKey="Masuk" fill="#10b981" radius={[4, 4, 0, 0]} barSize={12} />
              <Bar dataKey="Keluar" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
