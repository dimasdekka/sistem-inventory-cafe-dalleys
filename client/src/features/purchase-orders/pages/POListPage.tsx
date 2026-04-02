import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ROUTES } from "@/constants";
import { formatDate, formatCurrency } from "@/lib/utils";

const MOCK_POS = [
  {
    id: "PO-001",
    supplier: "CV Kopi Nusantara",
    date: "2026-02-20T00:00:00Z",
    total: 1_080_000,
    status: "received",
    items: 3,
  },
  {
    id: "PO-002",
    supplier: "PT Bintang Susu",
    date: "2026-02-22T00:00:00Z",
    total: 440_000,
    status: "confirmed",
    items: 1,
  },
  {
    id: "PO-003",
    supplier: "UD Kemasan Prima",
    date: "2026-02-25T00:00:00Z",
    total: 225_000,
    status: "draft",
    items: 2,
  },
];

const statusVariant: Record<
  string,
  "success" | "warning" | "info" | "neutral"
> = {
  received: "success",
  confirmed: "info",
  sent: "warning",
  draft: "neutral",
  closed: "neutral",
};

const statusLabel: Record<string, string> = {
  received: "Diterima",
  confirmed: "Dikonfirmasi",
  sent: "Dikirim",
  draft: "Draft",
  closed: "Selesai",
};

export function POListPage() {
  const navigate = useNavigate();
  return (
    <PageWrapper
      title="Purchase Order"
      description="Kelola pembelian dari supplier"
      actions={
        <Button
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate(ROUTES.PURCHASE_ORDERS.NEW)}
        >
          Buat PO
        </Button>
      }
    >
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {["No. PO", "Supplier", "Tanggal", "Total", "Status", "Aksi"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {MOCK_POS.map((po) => (
              <tr key={po.id} className="hover:bg-gray-50/50">
                <td className="px-4 py-3 text-sm font-mono font-medium text-primary-600">
                  {po.id}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {po.supplier}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {formatDate(po.date)}
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                  {formatCurrency(po.total)}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={statusVariant[po.status]} dot>
                    {statusLabel[po.status]}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      navigate(ROUTES.PURCHASE_ORDERS.DETAIL(po.id))
                    }
                  >
                    Detail
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageWrapper>
  );
}

export function PODetailPage() {
  return (
    <PageWrapper
      title="Detail PO-001"
      breadcrumbs={[
        { label: "Purchase Order", to: ROUTES.PURCHASE_ORDERS.LIST },
        { label: "PO-001" },
      ]}
    >
      <div className="card p-6">
        <div className="grid grid-cols-2 gap-4 text-sm mb-6">
          {[
            ["No. PO", "PO-001"],
            ["Supplier", "CV Kopi Nusantara"],
            ["Tanggal", "20 Feb 2026"],
            ["Status", "Diterima"],
            ["Total", "Rp 1.080.000"],
          ].map(([l, v]) => (
            <div key={l}>
              <p className="text-xs text-gray-500">{l}</p>
              <p className="font-medium mt-0.5">{v}</p>
            </div>
          ))}
        </div>
        <h3 className="text-sm font-semibold mb-3">Item Pesanan</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-left font-medium text-gray-500">
                Produk
              </th>
              <th className="py-2 text-right font-medium text-gray-500">Qty</th>
              <th className="py-2 text-right font-medium text-gray-500">
                Harga
              </th>
              <th className="py-2 text-right font-medium text-gray-500">
                Subtotal
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2">Biji Kopi Arabica</td>
              <td className="py-2 text-right">6 kg</td>
              <td className="py-2 text-right">Rp 180.000</td>
              <td className="py-2 text-right">Rp 1.080.000</td>
            </tr>
          </tbody>
        </table>
      </div>
    </PageWrapper>
  );
}

export function POFormPage() {
  return (
    <PageWrapper
      title="Buat Purchase Order"
      breadcrumbs={[
        { label: "Purchase Order", to: ROUTES.PURCHASE_ORDERS.LIST },
        { label: "Buat PO" },
      ]}
    >
      <div className="card p-6 space-y-4">
        <div>
          <label className="form-label">
            Supplier <span className="text-danger">*</span>
          </label>
          <select className="input-base">
            <option>CV Kopi Nusantara</option>
            <option>PT Bintang Susu</option>
          </select>
        </div>
        <div>
          <label className="form-label">Tanggal Order</label>
          <input type="date" className="input-base" defaultValue="2026-02-27" />
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm font-medium mb-3">Item Pesanan</p>
          <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 mb-2">
            <span className="col-span-5">Produk</span>
            <span className="col-span-2">Qty</span>
            <span className="col-span-2">Satuan</span>
            <span className="col-span-3">Harga</span>
          </div>
          <div className="grid grid-cols-12 gap-2">
            <select className="col-span-5 input-base text-xs">
              <option>Biji Kopi Arabica</option>
            </select>
            <input
              type="number"
              className="col-span-2 input-base text-xs"
              defaultValue={6}
            />
            <select className="col-span-2 input-base text-xs">
              <option>kg</option>
            </select>
            <input
              type="number"
              className="col-span-3 input-base text-xs"
              defaultValue={180000}
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-4">
        <Button variant="outline">Batal</Button>
        <Button variant="secondary">Simpan Draft</Button>
        <Button>Kirim PO</Button>
      </div>
    </PageWrapper>
  );
}
