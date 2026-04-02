import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { reportsService } from "@/features/reports/reports.service";

const COLORS = [
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#3b82f6",
  "#ec4899",
  "#14b8a6",
  "#f43f5e",
];

export function CategoryPieChart() {
  const [data, setData] = useState<
    { name: string; value: number; color: string }[]
  >([]);

  useEffect(() => {
    reportsService.getStockReport().then((items) => {
      const grouped: Record<string, number> = {};
      items.forEach((item) => {
        if (!grouped[item.category]) {
          grouped[item.category] = 0;
        }
        grouped[item.category] += item.quantity; // Sum by item quantity, or you can do total_value if desired
      });

      const pieData = Object.keys(grouped)
        .map((key, idx) => ({
          name: key || "Lainnya",
          value: grouped[key],
          color: COLORS[idx % COLORS.length],
        }))
        // filter out zero values
        .filter((d) => d.value > 0);

      setData(pieData);
    });
  }, []);

  return (
    <div className="card h-full min-h-[400px] flex flex-col">
      <div className="px-5 py-4 border-b border-gray-100 flex-shrink-0">
        <h2 className="text-base font-semibold text-gray-900">
          Komposisi Kategori
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Distribusi total item (kuantitas) per kategori utama
        </p>
      </div>
      <div className="flex-1 p-5 min-h-0 flex flex-col">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-gray-400">
            Belum ada stok barang
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                itemStyle={{ fontWeight: "bold" }}
                formatter={(value: number) => [`${value}`, "Kuantitas"]}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
