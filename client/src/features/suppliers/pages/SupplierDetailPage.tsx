import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Edit,
  ArrowLeft,
  Plus,
  Loader2,
} from "lucide-react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ROUTES } from "@/constants";
import { suppliersService, Supplier } from "../suppliers.service";
import {
  purchaseOrdersService,
  PurchaseOrder,
} from "@/features/purchase-orders/purchase-orders.service";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Link } from "react-router-dom";

export function SupplierDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        setIsLoading(true);
        const [supplierData, poData] = await Promise.all([
          suppliersService.getById(id),
          purchaseOrdersService.getBySupplierId(id),
        ]);
        setSupplier(supplierData);
        setPos(poData);
      } catch (error) {
        console.error("Failed to fetch supplier data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <PageWrapper title="Detail Supplier">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      </PageWrapper>
    );
  }

  if (!supplier) {
    return (
      <PageWrapper title="Detail Supplier">
        <div className="flex flex-col h-64 items-center justify-center gap-4">
          <p className="text-gray-500">Supplier tidak ditemukan</p>
          <Button
            variant="outline"
            onClick={() => navigate(ROUTES.SUPPLIERS.LIST)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
          </Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Detail Supplier"
      breadcrumbs={[
        { label: "Supplier", to: ROUTES.SUPPLIERS.LIST },
        { label: supplier.name },
      ]}
      actions={
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(ROUTES.SUPPLIERS.LIST)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Edit Supplier
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info Card */}
        <div className="card p-6 lg:col-span-1 space-y-6">
          <div className="flex items-center gap-4">
            {supplier.image_url ? (
              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                <img src={supplier.image_url} alt={supplier.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                <Building2 className="w-8 h-8" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {supplier.name}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-500">
                  ID: {supplier.id.split("-")[0].toUpperCase()}
                </span>
                <span className="text-gray-300">•</span>
                <Badge
                  variant={supplier.status === "active" ? "success" : "neutral"}
                >
                  {supplier.status === "active" ? "Aktif" : "Non-aktif"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Informasi Kontak
              </p>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="mt-0.5 text-gray-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {supplier.contact}
                    </p>
                    <p className="text-xs text-gray-500">Contact Person</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="mt-0.5 text-gray-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">{supplier.phone}</p>
                    <p className="text-xs text-gray-500">Nomor Telepon</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="mt-0.5 text-gray-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">{supplier.email}</p>
                    <p className="text-xs text-gray-500">Alamat Email</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="mt-0.5 text-gray-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900 leading-relaxed">
                      {supplier.address || "-"}
                    </p>
                    <p className="text-xs text-gray-500">Alamat Lengkap</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* History / POs */}
        <div className="card lg:col-span-2 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">
              Riwayat Purchase Order
            </h3>
            <Button size="sm" onClick={() => navigate(`${ROUTES.PURCHASE_ORDERS.NEW}?supplier=${supplier.id}`)}>
              <Plus className="w-4 h-4 mr-2" />
              Buat PO Baru
            </Button>
          </div>

          <div className="flex-1 overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 z-10 bg-gray-50 border-b border-gray-100 shadow-sm">
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No. PO
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {(pos?.length ?? 0) > 0 ? (
                  pos.map((po) => (
                    <tr
                      key={po.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          to={ROUTES.PURCHASE_ORDERS.DETAIL(po.id)}
                          className="text-sm font-medium text-primary-600 hover:underline"
                        >
                          {po.po_number}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(po.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant={
                            po.status === "completed"
                              ? "success"
                              : po.status === "pending"
                                ? "info"
                                : "neutral"
                          }
                        >
                          {po.status === "completed"
                            ? "Diterima"
                            : po.status === "pending"
                              ? "Menunggu"
                              : "Draft"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900">
                        {formatCurrency(po.total)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      Belum ada riwayat purchase order.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
