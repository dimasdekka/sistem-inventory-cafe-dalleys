import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  ShoppingCart,
  Calendar,
  Clock,
  CheckCircle2,
  ChevronRight,
  XCircle,
  Loader2,
} from "lucide-react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { ROUTES } from "@/constants";
import { useNavigate } from "react-router-dom";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  purchaseOrdersService,
  PurchaseOrder,
} from "../purchase-orders.service";

export function PurchaseOrderListPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPOs = async () => {
      try {
        setIsLoading(true);
        const data = await purchaseOrdersService.getAll();
        setPos(data);
      } catch (error) {
        console.error("Failed to fetch purchase orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPOs();
  }, []);

  const filteredPOs = pos.filter(
    (po) =>
      po?.po_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (po?.supplier?.name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="warning" dot>
            Menunggu Barang
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="success" dot>
            Selesai
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="danger" dot>
            Dibatalkan
          </Badge>
        );
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-warning-500" />;
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-success-500" />;
      case "cancelled":
        return <XCircle className="w-5 h-5 text-danger-500" />;
      default:
        return <ShoppingCart className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <PageWrapper
      title="Purchase Order"
      description="Kelola pesanan pembelian ke supplier"
      actions={
        <Button onClick={() => navigate(ROUTES.PURCHASE_ORDERS.NEW)}>
          <Plus className="w-4 h-4 mr-2" />
          Buat PO Baru
        </Button>
      }
    >
      <div className="card">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Cari nomor PO atau supplier..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="shrink-0">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-4">Nomor PO</th>
                <th className="px-6 py-4">Supplier</th>
                <th className="px-6 py-4">Tanggal Order</th>
                <th className="px-6 py-4 text-right">Total Item & Harga</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <div className="flex justify-center items-center">
                      <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
                    </div>
                  </td>
                </tr>
              ) : filteredPOs.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    Tidak ada transaksi Purchase Order.
                  </td>
                </tr>
              ) : (
                filteredPOs.map((po) => (
                  <tr
                    key={po.id}
                    className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                    onClick={() =>
                      navigate(ROUTES.PURCHASE_ORDERS.DETAIL(po.id))
                    }
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                          {getStatusIcon(po.status)}
                        </div>
                        <span className="font-medium text-gray-900">
                          {po.po_number}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">
                        {po.supplier?.name || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {formatDate(po.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-medium text-gray-900">
                        {formatCurrency(po.total)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {po.items?.length || 0} jenis dipesan
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(po.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {po.status === "pending" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary-600 hover:text-primary-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(ROUTES.PURCHASE_ORDERS.EDIT(po.id));
                            }}
                          >
                            Edit
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-gray-900"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageWrapper>
  );
}
