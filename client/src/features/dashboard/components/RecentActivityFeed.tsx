import { useState, useEffect } from "react";
import { PackagePlus, Truck, RefreshCw, Layers } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import {
  reportsService,
  MovementReportItem,
} from "@/features/reports/reports.service";

/*
  Helper to get styling for different movement types.
  Backend types: "IN", "OUT", "TRANSFER", "OPNAME", "ADJUSTMENT"
*/
const getStyleForType = (type: string) => {
  switch (type) {
    case "IN":
      return {
        icon: PackagePlus,
        iconBg: "bg-emerald-100",
        iconColor: "text-emerald-600",
        badgeVariant: "success" as const,
        labelTitle: "Barang Masuk",
      };
    case "OUT":
      return {
        icon: Truck,
        iconBg: "bg-danger/10",
        iconColor: "text-danger",
        badgeVariant: "danger" as const,
        labelTitle: "Barang Keluar",
      };
    case "TRANSFER":
      return {
        icon: RefreshCw,
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
        badgeVariant: "info" as const,
        labelTitle: "Transfer Gudang",
      };
    default:
      return {
        icon: Layers,
        iconBg: "bg-amber-100",
        iconColor: "text-amber-600",
        badgeVariant: "warning" as const,
        labelTitle: "Penyesuaian Stok",
      };
  }
};

const formatTimeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes} menit yang lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam yang lalu`;
  const days = Math.floor(hours / 24);
  return `${days} hari yang lalu`;
};

export function RecentActivityFeed() {
  const [activities, setActivities] = useState<MovementReportItem[]>([]);

  useEffect(() => {
    reportsService.getMovementReport().then((data) => {
      // Take only the top 5 most recent activities
      setActivities(data.slice(0, 5));
    });
  }, []);

  return (
    <div className="card flex-1 h-full min-h-[400px] overflow-hidden flex flex-col">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Aktivitas Terkini
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Log pergerakan barang terbaru
          </p>
        </div>
      </div>
      <div className="p-5 flex-1 overflow-y-auto">
        <div className="space-y-6">
          {activities.length === 0 ? (
            <div className="text-center text-sm text-gray-500 py-4">
              Belum ada aktivitas stok
            </div>
          ) : (
            activities.map((activity, index) => {
              const style = getStyleForType(activity.type);
              const Icon = style.icon;
              return (
                <div key={activity.id} className="relative flex gap-4">
                  {/* Connector line */}
                  {index !== activities.length - 1 && (
                    <div className="absolute left-[19px] top-10 bottom-[-24px] w-px bg-gray-200" />
                  )}

                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${style.iconBg}`}
                  >
                    <Icon className={`w-5 h-5 ${style.iconColor}`} />
                  </div>

                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {style.labelTitle} - {activity.product_name}
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {activity.notes ||
                            `Referensi: ${activity.reference_no || "-"}`}
                        </p>
                      </div>
                      <Badge variant={style.badgeVariant}>
                        {activity.quantity > 0 ? "+" : ""}
                        {activity.quantity} pcs
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">
                      {formatTimeAgo(activity.date)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
