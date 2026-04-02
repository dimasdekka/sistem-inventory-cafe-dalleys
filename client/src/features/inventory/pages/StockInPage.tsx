import { useState, useEffect } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ROUTES } from "@/constants";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/feedback/Toast";
import { inventoryService } from "../inventory.service";
import { productsService, Product } from "../../products/products.service";
import {
  purchaseOrdersService,
  PurchaseOrder,
} from "../../purchase-orders/purchase-orders.service";
import { formatCurrency } from "@/lib/utils";
import { ProductScannerSelect } from "../components/ProductScannerSelect";

// ─── Domain Types ────────────────────────────────────────────────────────────
interface StockInDraftItem {
  id: string;
  productId: string;
  quantity: number;
  unitCost: number;   // harga beli sebelum pajak
  taxPct: number;     // persentase pajak (0-100)
}

// ─── Pure helpers (DRY / SRP) ─────────────────────────────────────────────────
function calcEffectiveCost(unitCost: number, taxPct: number): number {
  return unitCost * (1 + taxPct / 100);
}

function calcRowTotal(item: StockInDraftItem): number {
  return item.quantity * calcEffectiveCost(item.unitCost, item.taxPct);
}

function buildDraftFromProduct(product: Product, qty = 1): StockInDraftItem {
  return {
    id: crypto.randomUUID(),
    productId: product.id,
    quantity: qty,
    unitCost: product.price ?? 0,
    taxPct: product.tax_percentage ?? 0,
  };
}

// ─── Component ───────────────────────────────────────────────────────────────
export function StockInPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [draftItems, setDraftItems] = useState<StockInDraftItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [pendingPos, setPendingPos] = useState<PurchaseOrder[]>([]);
  const [referenceNo, setReferenceNo] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    productsService.getProducts().then(setProducts).catch(console.error);
    purchaseOrdersService
      .getAll()
      .then((data) => setPendingPos(data.filter((po) => po.status === "pending")))
      .catch(console.error);
  }, []);

  // Auto-populate from PO when referenceNo matches a pending PO
  useEffect(() => {
    const matchedPo = pendingPos.find((po) => po.po_number === referenceNo);
    if (!matchedPo) return;

    const newDraft: StockInDraftItem[] = (matchedPo.items ?? [])
      .filter((item) => item?.product)
      .map((item) => ({
        id: crypto.randomUUID(),
        productId: item.product!.id,
        quantity: item.quantity,
        unitCost: item.unit_cost ?? 0,
        taxPct: 0, // PO items use their own tax via PO-level tax setting
      }));

    setDraftItems(newDraft);
    toast.success(`Berhasil menarik ${newDraft.length} item dari PO`);
  }, [referenceNo, pendingPos]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Draft Mutations ────────────────────────────────────────────────────────
  function upsertDraft(product: Product) {
    setDraftItems((prev) => {
      const idx = prev.findIndex((i) => i.productId === product.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [...prev, buildDraftFromProduct(product)];
    });
    toast.success(`${product.name} ditambahkan ke draft`);
  }

  function updateDraftField<K extends keyof StockInDraftItem>(
    id: string,
    field: K,
    value: StockInDraftItem[K],
  ) {
    setDraftItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  }

  const removeDraftItem = (id: string) =>
    setDraftItems((prev) => prev.filter((item) => item.id !== id));

  // ─── Submit ─────────────────────────────────────────────────────────────────
  const grandTotal = draftItems.reduce((sum, i) => sum + calcRowTotal(i), 0);

  const handleSaveStockIn = async () => {
    if (draftItems.length === 0) {
      toast.error("Tidak ada item yang akan dimasukkan.");
      return;
    }
    if (draftItems.some((i) => i.quantity <= 0)) {
      toast.error("Kuantitas tidak valid (minimal 1).");
      return;
    }

    const payload = {
      items: draftItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unit_cost: item.unitCost,
        tax_pct: item.taxPct,
      })),
      referenceNo: referenceNo.trim(),
      notes: notes.trim(),
    };

    setIsSubmitting(true);
    try {
      await inventoryService.stockIn(payload);
      toast.success(
        `Berhasil memproses stok masuk untuk ${draftItems.length} transaksi produk`,
      );
      navigate(ROUTES.INVENTORY.SUMMARY);
    } catch (e: any) {
      toast.error("Gagal menyimpan mutasi", e?.response?.data?.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <PageWrapper
      title="Stok Masuk (Penerimaan)"
      breadcrumbs={[
        { label: "Inventaris", to: ROUTES.INVENTORY.SUMMARY },
        { label: "Stok Masuk" },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── Kolom Kiri: Form Utama & Scanner ─────────────────────── */}
        <div className="lg:col-span-4 space-y-6">
          <div className="card p-6 border border-gray-100 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-gray-900 border-b pb-3 border-gray-100">
              Informasi Penerimaan
            </h2>

            <div>
              <Input
                label="Reference No (Opsional)"
                placeholder="Kosongkan untuk auto-generate. Pilih PO untuk tarik item"
                list="pending-pos"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
              />
              <datalist id="pending-pos">
                {pendingPos.map((po) => (
                  <option key={po.id} value={po.po_number}>
                    {po.supplier?.name ? `PO dari ${po.supplier.name}` : "Menunggu Barang"}
                  </option>
                ))}
              </datalist>
              {referenceNo && pendingPos.some((p) => p.po_number === referenceNo) && (
                <p className="text-xs text-success-600 mt-1 font-medium">
                  ✓ Purchase Order ditemukan, otomatis melengkapi item.
                </p>
              )}
            </div>

            {/* Scanner */}
            <ProductScannerSelect
              products={products}
              onProductFound={upsertDraft}
              label="Scan Item Tambahan"
            />

            {/* Grand Total summary card */}
            {draftItems.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mt-2">
                <p className="text-xs text-gray-500 mb-1">Total Nilai Pembelian</p>
                <p className="text-2xl font-bold text-primary-700">
                  {formatCurrency(grandTotal)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {draftItems.length} item · termasuk pajak
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Kolom Kanan: Daftar Item Draft ───────────────────────── */}
        <div className="lg:col-span-8">
          <div className="card overflow-hidden h-full flex flex-col">
            <div className="px-5 py-4 border-b border-gray-100 flex gap-4 items-center bg-gray-50/50 justify-between">
              <h3 className="font-semibold text-gray-800">Item Barang Masuk</h3>
              <span className="text-xs text-gray-500 font-medium px-2 py-1 bg-gray-100 rounded-full">
                {draftItems.length} Barang
              </span>
            </div>

            <div className="flex-1 overflow-x-auto">
              {draftItems.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                  <div className="text-4xl mb-3 opacity-20">📦</div>
                  <p>Belum ada produk yang ditambahkan.</p>
                  <p className="text-sm mt-1">
                    Isi Reference No PO atau Scan barcode di panel kiri.
                  </p>
                </div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3 w-[28%]">Produk</th>
                      <th className="px-4 py-3 w-[12%] text-center">Qty</th>
                      <th className="px-4 py-3 w-[20%] text-right">Harga Beli (Rp)</th>
                      <th className="px-4 py-3 w-[10%] text-center">Pajak %</th>
                      <th className="px-4 py-3 w-[18%] text-right">Efektif / Satuan</th>
                      <th className="px-4 py-3 w-[10%] text-right">Total</th>
                      <th className="px-4 py-3 w-[4%]"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {draftItems.map((item) => {
                      const product = products.find((p) => p.id === item.productId);
                      if (!product) return null;

                      const effective = calcEffectiveCost(item.unitCost, item.taxPct);
                      const rowTotal = item.quantity * effective;

                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          {/* Produk */}
                          <td className="px-4 py-4">
                            <div className="font-medium text-gray-900">{product.name}</div>
                            <div className="text-xs text-gray-400 mt-0.5">
                              {product.barcode || product.code || ""}
                            </div>
                          </td>

                          {/* Qty */}
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center gap-1">
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) =>
                                  updateDraftField(
                                    item.id,
                                    "quantity",
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                                className="w-16 px-2 py-1.5 text-center border border-gray-200 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none bg-white font-medium shadow-sm"
                                min="0"
                                step="any"
                              />
                              <span className="text-xs text-gray-500">
                                {product.unit?.symbol || ""}
                              </span>
                            </div>
                          </td>

                          {/* Harga Beli */}
                          <td className="px-4 py-4">
                            <input
                              type="number"
                              value={item.unitCost || ""}
                              onChange={(e) =>
                                updateDraftField(
                                  item.id,
                                  "unitCost",
                                  parseFloat(e.target.value) || 0,
                                )
                              }
                              className="w-full px-2 py-1.5 text-right border border-gray-200 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none bg-white font-medium shadow-sm"
                              min="0"
                              step="any"
                              placeholder="0"
                            />
                          </td>

                          {/* Pajak % */}
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center gap-0.5">
                              <input
                                type="number"
                                value={item.taxPct || ""}
                                onChange={(e) =>
                                  updateDraftField(
                                    item.id,
                                    "taxPct",
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                                className="w-14 px-2 py-1.5 text-center border border-gray-200 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none bg-white font-medium shadow-sm"
                                min="0"
                                max="100"
                                step="0.5"
                                placeholder="0"
                              />
                              <span className="text-xs text-gray-400">%</span>
                            </div>
                          </td>

                          {/* Harga+Pajak */}
                          <td className="px-4 py-4 text-right text-sm text-gray-700">
                            {effective > 0
                              ? formatCurrency(effective)
                              : <span className="text-gray-300">—</span>}
                            {item.taxPct > 0 && (
                              <div className="text-xs text-primary-500 font-medium">
                                +{item.taxPct}% PPN
                              </div>
                            )}
                          </td>

                          {/* Total row */}
                          <td className="px-4 py-4 text-right text-sm font-semibold text-gray-800">
                            {formatCurrency(rowTotal)}
                          </td>

                          {/* Delete */}
                          <td className="px-4 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => removeDraftItem(item.id)}
                              className="p-2 text-gray-400 hover:text-danger-500 hover:bg-danger-50 rounded-lg transition-colors"
                              title="Hapus"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M3 6h18" />
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer */}
            <div className="p-5 bg-white border-t border-gray-100 flex flex-col gap-4 mt-auto">
              <div>
                <label className="form-label text-sm">Catatan Mutasi</label>
                <textarea
                  className="input-base resize-none text-sm py-2"
                  rows={2}
                  placeholder="Keterangan tambahan mutasi stok masuk (opsional)..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <div className="flex justify-between items-center pt-2">
                {draftItems.length > 0 && (
                  <p className="text-sm text-gray-500">
                    Grand Total:{" "}
                    <span className="font-bold text-gray-900">
                      {formatCurrency(grandTotal)}
                    </span>
                  </p>
                )}
                <div className="flex gap-3 ml-auto">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => navigate(ROUTES.INVENTORY.SUMMARY)}
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={handleSaveStockIn}
                    isLoading={isSubmitting}
                    disabled={draftItems.length === 0}
                    className="shadow-sm pl-4 pr-5"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Proses Barang Masuk
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
