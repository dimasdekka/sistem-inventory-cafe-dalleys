import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Box,
  CheckCircle2,
  PackageCheck,
  Printer,
  Loader2,
} from "lucide-react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ROUTES } from "@/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/components/feedback/Toast";
import {
  purchaseOrdersService,
  PurchaseOrder,
} from "../purchase-orders.service";

export function PurchaseOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReceiving, setIsReceiving] = useState(false);

  const fetchPOAndHistory = async () => {
    try {
      if (!id) return;
      setIsLoading(true);
      const [data, historyData] = await Promise.all([
        purchaseOrdersService.getById(id),
        purchaseOrdersService.getHistory(id),
      ]);
      setOrder(data);
      setHistory(historyData);
    } catch (error) {
      toast.error("Error", "Gagal memuat detail purchase order");
      navigate(ROUTES.PURCHASE_ORDERS.LIST);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPOAndHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleReceive = async () => {
    try {
      if (!id || !order) return;
      setIsReceiving(true);
      await purchaseOrdersService.updateStatus(order.id, "completed");
      toast.success(
        "Penerimaan Berhasil",
        "Barang telah diterima dan stok inventory otomatis bertambah",
      );
      const updatedData = await purchaseOrdersService.getById(order.id);
      setOrder(updatedData);
      const historyData = await purchaseOrdersService.getHistory(order.id);
      setHistory(historyData);
    } catch (error) {
      toast.error("Error", "Gagal melakukan penerimaan barang");
    } finally {
      setIsReceiving(false);
    }
  };

  if (isLoading) {
    return (
      <PageWrapper title="Detail PO">
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </PageWrapper>
    );
  }

  if (!order) return null;

  const isPending = order.status === "pending";

  return (
    <PageWrapper
      title={`Detail PO: ${order.po_number}`}
      breadcrumbs={[
        { label: "Purchase Order", to: ROUTES.PURCHASE_ORDERS.LIST },
        { label: order.po_number },
      ]}
      actions={
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(ROUTES.PURCHASE_ORDERS.LIST)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
          <Button variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Cetak PDF
          </Button>
          {isPending && (
            <Button
              variant="outline"
              onClick={() => navigate(ROUTES.PURCHASE_ORDERS.EDIT(order.id))}
            >
              Edit PO
            </Button>
          )}
          {isPending && (
            <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-100">
              <Button
                onClick={handleReceive}
                disabled={isReceiving}
                className="shadow-sm"
              >
                {isReceiving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <PackageCheck className="w-4 h-4 mr-2" />
                )}
                Terima Barang
              </Button>
            </div>
          )}
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Summary & History */}
        <div className="lg:col-span-1 space-y-4">
          {/* PO Summary */}
          <div className="card p-5 space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                Status Pemesanan
              </p>
              {isPending ? (
                <Badge variant="warning" dot>
                  Menunggu Pengiriman
                </Badge>
              ) : order.status === "completed" ? (
                <Badge variant="success" dot>
                  Selesai Diterima
                </Badge>
              ) : (
                <Badge variant="danger" dot>
                  Dibatalkan
                </Badge>
              )}
            </div>

            <div className="space-y-3 pt-3 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-500">Supplier</p>
                <p className="font-semibold text-gray-900 mt-0.5">
                  {order.supplier?.name || "-"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Tanggal Order</p>
                  <p className="font-medium text-gray-900 mt-0.5">
                    {formatDate(order.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Produk</p>
                  <p className="font-medium text-gray-900 mt-0.5 text-sm">
                    {order.items?.length ?? 0} Jenis
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500">Catatan</p>
                <p className="font-medium text-gray-900 mt-0.5 text-sm">
                  {order.notes || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* PO History Timeline (Compact) */}
          <div className="card p-5 space-y-3">
            <h3 className="text-sm font-bold text-gray-900 border-b pb-2">
              Riwayat Aktivitas
            </h3>
            <div className="relative border-l-2 border-gray-100 ml-2 space-y-4">
              {(history?.length ?? 0) > 0 ? (
                history.map((log: any) => (
                  <div key={log.id} className="relative pl-5">
                    <div className="absolute w-2.5 h-2.5 bg-primary-200 rounded-full -left-[6.5px] top-1.5 border-2 border-white shadow-sm"></div>
                    <div className="text-xs font-medium text-gray-500 mb-0.5">
                      {formatDate(log.created_at)}
                    </div>
                    <div className="text-sm font-medium text-gray-800 leading-relaxed">
                      {log.detail}
                    </div>
                    <div className="text-xs text-primary-600 mt-1 italic">
                      oleh {log.user_name}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-400 pl-5">
                  Belum ada riwayat.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: PO Items */}
        <div className="card lg:col-span-2 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Box className="w-5 h-5 text-gray-500" />
              <h3 className="font-semibold text-gray-900">Daftar Barang</h3>
            </div>
            <span className="text-sm font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
              {order.items?.length ?? 0} Jenis Barang
            </span>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/50 text-gray-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Nama Produk</th>
                  <th className="px-6 py-4 text-center">Dikirim / Dipesan</th>
                  <th className="px-6 py-4 text-right">Harga Satuan</th>
                  <th className="px-6 py-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {order.items?.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {item.product?.name || "-"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`font-semibold ${isPending ? "text-warning-600" : "text-success-600"}`}
                      >
                        {isPending ? "0" : item.quantity}
                      </span>
                      <span className="text-gray-400 mx-1">/</span>
                      <span className="text-gray-600">{item.quantity}</span>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-600">
                      {formatCurrency(item.unit_cost)}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">
                      {formatCurrency(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-gray-50 border-t border-gray-100">
            <div className="w-64 ml-auto space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal:</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Total Pajak:</span>
                <span>{formatCurrency(order.tax_amount)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-200">
                <span>Grand Total:</span>
                <span className="text-primary-600">
                  {formatCurrency(order.total)}
                </span>
              </div>
            </div>

            {order.status === "completed" && (
              <div className="mt-8 p-4 bg-success-50 border border-success-100 rounded-lg flex items-start gap-3 text-success-800 text-sm leading-relaxed">
                <CheckCircle2 className="w-5 h-5 text-success-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">
                    Penerimaan Barang Selesai
                  </p>
                  <p className="text-success-700 opacity-90">
                    Semua barang dalam PO ini telah diterima dan stok inventaris
                    telah diperbarui secara otomatis pada tanggal{" "}
                    {formatDate(order.updated_at)}.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
