import { useState, useEffect } from "react";
import { ArrowDownRight, ArrowUpRight, RefreshCw, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import {
  inventoryService,
  StockLedger,
} from "@/features/inventory/inventory.service";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

export function ProductStockHistory({ productId }: { productId?: string }) {
  const [history, setHistory] = useState<StockLedger[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (productId) {
      setIsLoading(true);
      inventoryService
        .getLedgers(productId)
        .then((data) => setHistory(data))
        .catch((err) => console.error("Failed to load ledgers", err))
        .finally(() => setIsLoading(false));
    }
  }, [productId]);

  return (
    <div className="card mt-6">
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Riwayat Pergerakan Stok
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Log masuk, keluar, dan penyesuaian untuk item ini
          </p>
        </div>
        <button className="text-sm font-medium text-primary-600 hover:text-primary-700">
          Muat Ulang
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-3">Tanggal & Waktu</th>
              <th className="px-6 py-3">Jenis Mutasi</th>
              <th className="px-6 py-3">Keterangan</th>
              <th className="px-6 py-3 text-right">Kuantitas</th>
              <th className="px-6 py-3">Pelaku</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary-600" />
                  Memuat riwayat...
                </td>
              </tr>
            ) : history.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Belum ada pergerakan stok untuk produk ini.
                </td>
              </tr>
            ) : (
              history.map((item) => {
                // Backend returns type string like 'IN', 'OUT', 'TRANSFER', 'ADJUSTMENT', 'OPNAME'
                const typeLower =
                  item.movementType?.toLowerCase() ||
                  (item as any).type?.toLowerCase() ||
                  "";

                let title = typeLower;
                let Icon = RefreshCw;
                let iconColor = "text-blue-500";

                if (typeLower === "in") {
                  title = "Stok Masuk";
                  Icon = ArrowDownRight;
                  iconColor = "text-emerald-500";
                } else if (typeLower === "out") {
                  title = "Stok Keluar";
                  Icon = ArrowUpRight;
                  iconColor = "text-danger";
                } else if (typeLower === "transfer") {
                  title = "Transfer Antar Cabang";
                  Icon = RefreshCw;
                  iconColor = "text-blue-500";
                } else if (typeLower === "adjustment") {
                  title = "Penyesuaian Stok (Manual)";
                  Icon = RefreshCw;
                  iconColor = "text-orange-500";
                } else if (typeLower === "opname") {
                  title = "Stok Opname";
                  Icon = RefreshCw;
                  iconColor = "text-purple-500";
                }

                const unitSymbol = item.product?.unit?.symbol || "unit";

                return (
                  <tr key={item.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-3 text-gray-500 whitespace-nowrap">
                      {format(new Date(item.createdAt), "dd MMM yyyy, HH:mm", {
                        locale: localeId,
                      })}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${iconColor}`} />
                        <span className="font-medium text-gray-900 uppercase text-xs">
                          {title}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-gray-500">
                      {item.notes || "-"}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Badge
                        variant={
                          item.quantity > 0
                            ? "success"
                            : item.quantity < 0
                              ? "danger"
                              : "neutral"
                        }
                      >
                        {item.quantity > 0 ? "+" : ""}
                        {item.quantity} {unitSymbol}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 text-gray-500">
                      {(item as any).created_by_name || "Sistem"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
