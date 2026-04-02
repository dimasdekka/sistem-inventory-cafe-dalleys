import { useState, useEffect } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ROUTES } from "@/constants";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/feedback/Toast";
import { inventoryService, StockSummary } from "../inventory.service";
import { productsService, Product } from "../../products/products.service";
import { ProductScannerSelect } from "../components/ProductScannerSelect";

interface StockOutDraftItem {
  id: string; // unique literal id for draft arrays
  productId: string;
  quantity: number;
}

export function StockOutPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [draftItems, setDraftItems] = useState<StockOutDraftItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [summaries, setSummaries] = useState<StockSummary[]>([]);

  // Form states
  const [referenceNo, setReferenceNo] = useState<string>("");
  const [reason, setReason] = useState<string>("produksi");
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    productsService.getProducts().then(setProducts).catch(console.error);
    inventoryService.getSummaries().then(setSummaries).catch(console.error);
  }, []);

  const getAvailableStock = (productId: string): number => {
    const sum = summaries.find((s) => s.productId === productId);
    return sum ? sum.quantity : 0;
  };

  const upsertDraft = (product: Product) => {
    setDraftItems((prev) => {
      const existingIdx = prev.findIndex((i) => i.productId === product.id);
      if (existingIdx >= 0) {
        const newArr = [...prev];
        newArr[existingIdx] = { ...newArr[existingIdx], quantity: newArr[existingIdx].quantity + 1 };
        return newArr;
      }
      return [
        ...prev,
        { id: crypto.randomUUID(), productId: product.id, quantity: 1 },
      ];
    });
    toast.success(`${product.name} ditambahkan ke draft`);
  };

  const updateQuantity = (id: string, value: number) => {
    if (isNaN(value)) value = 0;
    setDraftItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: value } : item,
      ),
    );
  };

  const removeDraftItem = (id: string) => {
    setDraftItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSaveStockOut = async () => {
    if (draftItems.length === 0) {
      toast.error("Tidak ada item yang akan dikeluarkan.");
      return;
    }

    // Validation
    for (const item of draftItems) {
      const avail = getAvailableStock(item.productId);
      if (item.quantity > avail) {
        toast.error(
          `Stok tidak mencukupi! Hanya ada ${avail} stok untuk produk ini.`,
        );
        return;
      }
      if (item.quantity <= 0) {
        toast.error(`Kuantitas tidak valid (minimal 1).`);
        return;
      }
    }

    const finalNotes = `[${reason.toUpperCase()}] ${notes || ""}`.trim();

    const payload = {
      items: draftItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      referenceNo: referenceNo.trim(),
      notes: finalNotes,
    };

    setIsSubmitting(true);
    try {
      await inventoryService.stockOut(payload);
      toast.success(
        `Berhasil mencatat stok keluar untuk ${draftItems.length} record produk`,
      );
      navigate(ROUTES.INVENTORY.SUMMARY);
    } catch (e: any) {
      toast.error("Gagal mencatat stok keluar", e?.response?.data?.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageWrapper
      title="Stok Keluar (Pengeluaran)"
      breadcrumbs={[
        { label: "Inventaris", to: ROUTES.INVENTORY.SUMMARY },
        { label: "Stok Keluar" },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Form Utama & Scanner */}
        <div className="lg:col-span-4 space-y-6">
          <div className="card p-6 border border-gray-100 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-gray-900 border-b pb-3 border-gray-100">
              Informasi Pengeluaran
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold text-gray-900 block mb-1">
                  Alasan
                </label>
                <select
                  className="input-base text-sm"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                >
                  <option value="produksi">Produksi / Jual</option>
                  <option value="kadaluarsa">Kadaluarsa</option>
                  <option value="rusak">Rusak / Pecah</option>
                  <option value="lainnya">Lain-lain</option>
                </select>
              </div>
              <div>
                <Input
                  label="Referensi (Opsional)"
                  placeholder="Kosongkan untuk auto-generate"
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                />
              </div>
            </div>

            <ProductScannerSelect
              products={products}
              onProductFound={upsertDraft}
              label="Scan Item Tambahan"
            />
          </div>
        </div>

        {/* Kolom Kanan: Daftar Item Draft */}
        <div className="lg:col-span-8">
          <div className="card overflow-hidden h-full flex flex-col min-h-[500px]">
            <div className="px-5 py-4 border-b border-gray-100 flex gap-4 items-center bg-gray-50/50 justify-between">
              <h3 className="font-semibold text-gray-800">
                Item Barang Keluar
              </h3>
              <span className="text-xs text-gray-500 font-medium px-2 py-1 bg-gray-100 rounded-full">
                {draftItems.length} Barang
              </span>
            </div>

            <div className="flex-1">
              {draftItems.length === 0 ? (
                <div className="p-12 text-center text-gray-400 flex flex-col items-center justify-center h-full">
                  <div className="text-4xl mb-3 opacity-20">📦</div>
                  <p>Belum ada produk yang ditambahkan.</p>
                  <p className="text-sm mt-1">
                    Scan barcode atau pilih produk di panel kiri.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                      <tr>
                        <th className="px-5 py-3 w-[50%]">Produk</th>
                        <th className="px-5 py-3 w-[40%] text-center">
                          Kuantitas Keluar
                        </th>
                        <th className="px-5 py-3 w-[10%] text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {draftItems.map((item) => {
                        const product = products.find(
                          (p) => p.id === item.productId,
                        );
                        if (!product) return null;

                        return (
                          <tr
                            key={item.id}
                            className="hover:bg-gray-50/50 transition-colors"
                          >
                            <td className="px-5 py-4">
                              <div className="font-medium text-gray-900">
                                {product.name}
                              </div>
                              <div className="text-xs text-gray-400 mt-0.5 flex gap-2">
                                <span>
                                  {product.barcode || product.code || ""}
                                </span>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) =>
                                    updateQuantity(
                                      item.id,
                                      parseFloat(e.target.value),
                                    )
                                  }
                                  className={`w-20 px-2 py-1.5 text-center border rounded-lg focus:outline-none bg-white font-medium shadow-sm transition-all text-danger ${getAvailableStock(product.id) < item.quantity ? "border-danger-500 focus:border-danger-500 focus:ring-1 focus:ring-danger-500" : "border-gray-200 focus:border-gray-400"}`}
                                  min="0"
                                  step="any"
                                />
                                <span className="text-xs font-medium text-gray-500">
                                  {product.unit?.symbol || ""}
                                </span>
                              </div>
                              {getAvailableStock(product.id) <
                                item.quantity && (
                                <div className="text-xs text-danger-500 font-medium mt-1 text-center">
                                  Stok tidak cukup! (Sisa:{" "}
                                  {getAvailableStock(product.id)})
                                </div>
                              )}
                            </td>
                            <td className="px-5 py-4 text-right">
                              <button
                                type="button"
                                onClick={() => removeDraftItem(item.id)}
                                className="p-2 text-gray-400 hover:text-danger-500 hover:bg-danger-50 rounded-lg transition-colors inline-block"
                                title="Hapus"
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
                                >
                                  <path d="M3 6h18"></path>
                                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                </svg>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="p-5 bg-white border-t border-gray-100 flex flex-col gap-4 mt-auto">
              <div>
                <label className="form-label text-sm">
                  Catatan Pengeluaran
                </label>
                <textarea
                  className="input-base resize-none text-sm py-2"
                  rows={2}
                  placeholder="Keterangan tambahan (opsional)..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => navigate(ROUTES.INVENTORY.SUMMARY)}
                >
                  Batal
                </Button>
                <Button
                  variant="danger"
                  onClick={handleSaveStockOut}
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
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Proses Barang Keluar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
