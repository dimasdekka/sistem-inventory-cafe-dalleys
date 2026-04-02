import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/constants";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Save,
  Trash2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { inventoryService } from "../inventory.service";
import { productsService, Product } from "../../products/products.service";
import { useToast } from "@/components/feedback/Toast";
import { ProductScannerSelect } from "../components/ProductScannerSelect";

interface OpnameDraftItem {
  productId: string;
  physicalStock: number;
}

export function StockOpnamePage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [draftItems, setDraftItems] = useState<Record<string, OpnameDraftItem>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    productsService.getProducts().then(setProducts).catch(console.error);
  }, []);

  // Upsert a product into the opname draft
  // Scanning the same product increments its physical stock count
  const upsertDraft = (product: Product) => {
    const pid = product.id;
    setDraftItems((prev) => {
      const existing = prev[pid];
      return {
        ...prev,
        [pid]: {
          productId: pid,
          // First add: pre-fill with system stock; subsequent scans: increment
          physicalStock: existing
            ? existing.physicalStock + 1
            : product.stock || 0,
        },
      };
    });
    toast.success(`${product.name} ditambahkan ke draft opname`);
  };

  const updatePhysicalStock = (productId: string, value: number) => {
    if (isNaN(value)) value = 0;
    setDraftItems((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], physicalStock: value },
    }));
  };

  const removeDraftItem = (productId: string) => {
    setDraftItems((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  };

  const handleSaveOpname = async () => {
    const items = Object.values(draftItems);
    if (items.length === 0) {
      toast.error("Tidak ada item yang di-opname.");
      return;
    }

    setIsSubmitting(true);
    try {
      await Promise.all(
        items.map((item) =>
          inventoryService.stockOpname({
            productId: item.productId,
            actualQuantity: item.physicalStock,
            notes: "Hasil Pemeriksaan Opname",
          }),
        ),
      );
      toast.success(`Berhasil menyimpan sesi opname untuk ${items.length} produk`);
      navigate(ROUTES.INVENTORY.SUMMARY);
    } catch (e: any) {
      toast.error("Gagal menyimpan hasil opname", e?.response?.data?.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const draftCount = Object.keys(draftItems).length;

  return (
    <PageWrapper
      title="Stock Opname (Penyesuaian Fisik)"
      breadcrumbs={[
        { label: "Inventaris", to: ROUTES.INVENTORY.SUMMARY },
        { label: "Stock Opname" },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── Kolom Kiri: Scanner & Manual Select ─────────────────────── */}
        <div className="lg:col-span-4 space-y-6">
          <div className="card p-6 border border-gray-100 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-gray-900 border-b pb-3 border-gray-100">
              Pemilihan Produk
            </h2>

            <ProductScannerSelect
              products={products}
              onProductFound={upsertDraft}
              label="Scan / Pilih Item Opname"
            />

            {/* Summary badge */}
            {draftCount > 0 && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Total Item Draft</p>
                <p className="text-2xl font-bold text-primary-700">{draftCount}</p>
                <p className="text-xs text-gray-400 mt-1">produk diperiksa</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Kolom Kanan: Tabel Draft ───────────────────────────────── */}
        <div className="lg:col-span-8">
          <div className="card overflow-hidden h-full flex flex-col">
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-semibold text-gray-800">Draft Opname Saat Ini</h3>
              <span className="text-xs text-gray-500 font-medium px-2 py-1 bg-gray-100 rounded-full">
                {draftCount} Item
              </span>
            </div>

            {draftCount === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <div className="text-4xl mb-3 opacity-20">📋</div>
                <p>Belum ada produk yang diamati.</p>
                <p className="text-sm mt-1">
                  Scan barcode atau pilih produk di panel kiri.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                    <tr>
                      <th className="px-5 py-3 w-[38%]">Produk</th>
                      <th className="px-5 py-3 w-[17%] text-right">Stok Sistem</th>
                      <th className="px-5 py-3 w-[25%] text-center">Stok Fisik Real</th>
                      <th className="px-5 py-3 w-[10%] text-center">Selisih</th>
                      <th className="px-5 py-3 w-[10%] text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {Object.values(draftItems).map((item) => {
                      const product = products.find((p) => p.id === item.productId);
                      if (!product) return null;

                      const systemStock = product.stock || 0;
                      const variance = item.physicalStock - systemStock;
                      const isMinus = variance < 0;

                      return (
                        <tr
                          key={item.productId}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-5 py-4">
                            <div className="font-medium text-gray-900">{product.name}</div>
                            <div className="text-xs text-gray-400 mt-0.5">
                              {product.barcode || product.code || ""}
                            </div>
                          </td>
                          <td className="px-5 py-4 text-right font-medium text-gray-600">
                            {systemStock}{" "}
                            <span className="text-xs font-normal text-gray-400">
                              {product.unit?.symbol || ""}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <input
                                type="number"
                                value={item.physicalStock}
                                onChange={(e) =>
                                  updatePhysicalStock(
                                    item.productId,
                                    parseFloat(e.target.value),
                                  )
                                }
                                className="w-20 px-2 py-1 text-center border-b-2 border-gray-200 focus:border-primary-500 focus:outline-none bg-transparent transition-colors"
                                step="any"
                              />
                              <span className="text-xs text-gray-500">
                                {product.unit?.symbol || ""}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-center">
                            {variance === 0 ? (
                              <div className="inline-flex items-center text-success-600 bg-success-50 px-2 py-1 rounded-md text-xs font-medium">
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Cocok
                              </div>
                            ) : (
                              <div
                                className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold ${
                                  isMinus
                                    ? "text-danger-600 bg-danger-50"
                                    : "text-warning-700 bg-warning-50"
                                }`}
                              >
                                {isMinus ? (
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                ) : (
                                  <TrendingUpIcon className="w-3 h-3 mr-1" />
                                )}
                                {variance > 0 ? "+" : ""}
                                {variance}
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button
                              onClick={() => removeDraftItem(item.productId)}
                              className="p-1.5 text-gray-400 hover:text-danger-500 hover:bg-danger-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {draftCount > 0 && (
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center mt-auto">
                <span className="text-sm text-gray-500">
                  Pastikan seluruh data fisik telah direkam sebelum difinalisasi.
                </span>
                <Button onClick={handleSaveOpname} isLoading={isSubmitting} className="shadow-sm">
                  <Save className="w-4 h-4 mr-2" />
                  Aplikasi Hasil Opname
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

// Helper icon
function TrendingUpIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}
