import { useState, useCallback } from "react";
import { Camera, X, ArrowDownCircle, ArrowUpCircle, Package, Tag, Percent } from "lucide-react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/constants";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/feedback/Toast";
import { barcodeService, BarcodeLookupResult } from "../barcode.service";
import { inventoryService } from "@/features/inventory/inventory.service";
import { formatCurrency } from "@/lib/utils";

// ─── Sub-components (SRP) ────────────────────────────────────────────────────

interface StockBadgeProps {
  stock: number;
}
function StockBadge({ stock }: StockBadgeProps) {
  if (stock <= 0)
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-danger-50 text-danger-700">
        Habis
      </span>
    );
  if (stock <= 5)
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-warning-50 text-warning-700">
        Sedikit ({stock})
      </span>
    );
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-success-50 text-success-700">
      {stock} tersedia
    </span>
  );
}

interface ProductInfoCardProps {
  product: BarcodeLookupResult;
  barcode: string;
  onClose: () => void;
  onStockIn: () => void;
  onStockOut: () => void;
}
function ProductInfoCard({
  product,
  barcode,
  onClose,
  onStockIn,
  onStockOut,
}: ProductInfoCardProps) {
  const priceAfterTax =
    product.tax_percentage > 0
      ? product.price * (1 + product.tax_percentage / 100)
      : product.price;

  return (
    <div className="card border-l-4 border-l-primary-500 overflow-hidden animate-fade-in shadow-lg">
      {/* Header */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                {product.code}
              </span>
              {barcode && barcode !== product.code && (
                <span className="text-xs text-gray-400">{barcode}</span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-1.5 rounded-full transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Stok */}
          <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
            <Package className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Stok Saat Ini</p>
              <StockBadge stock={product.stock} />
              <p className="text-xs text-gray-400 mt-0.5">{product.unit_symbol}</p>
            </div>
          </div>

          {/* Kategori */}
          <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
            <Tag className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Kategori</p>
              <p className="text-sm font-semibold text-gray-800">{product.category}</p>
            </div>
          </div>

          {/* Harga Jual */}
          <div className="bg-primary-50 rounded-xl p-3 flex items-center gap-3">
            <svg
              className="w-5 h-5 text-primary-500 flex-shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
              <path d="M12 18V6" />
            </svg>
            <div>
              <p className="text-xs text-primary-600 mb-0.5">Harga Jual</p>
              <p className="text-sm font-bold text-primary-800">
                {formatCurrency(product.price)}
              </p>
            </div>
          </div>

          {/* Pajak */}
          <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
            <Percent className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Pajak (PPN)</p>
              {product.tax_percentage > 0 ? (
                <>
                  <p className="text-sm font-bold text-gray-800">{product.tax_percentage}%</p>
                  <p className="text-xs text-gray-500">
                    +Pajak: {formatCurrency(priceAfterTax)}
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-400">Tidak dikenakan pajak</p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="border-success text-success hover:bg-success hover:text-white group"
            onClick={onStockIn}
          >
            <ArrowDownCircle className="w-4 h-4 mr-2 group-hover:text-white" />
            Stok Masuk
          </Button>
          <Button
            variant="outline"
            className="border-danger text-danger hover:bg-danger hover:text-white group"
            onClick={onStockOut}
            disabled={product.stock <= 0}
          >
            <ArrowUpCircle className="w-4 h-4 mr-2 group-hover:text-white" />
            Stok Keluar
          </Button>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-gray-50 px-5 py-3 flex gap-4 text-sm border-t border-gray-100">
        <button
          className="text-primary-600 hover:text-primary-700 font-medium text-sm"
          onClick={() => window.location.assign(ROUTES.PRODUCTS.DETAIL(product.id))}
        >
          Lihat Detail Produk &rarr;
        </button>
      </div>
    </div>
  );
}

interface ActionFormProps {
  mode: "in" | "out";
  unitSymbol: string;
  onSubmit: (qty: number) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}
function ActionForm({ mode, unitSymbol, onSubmit, onCancel, isSubmitting }: ActionFormProps) {
  const [qty, setQty] = useState<number | "">("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qty || qty <= 0) return;
    onSubmit(Number(qty));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="card p-5 animate-fade-in border border-gray-100"
    >
      <div className="flex justify-between items-center mb-4">
        <h4
          className={`font-semibold flex items-center gap-2 ${
            mode === "in" ? "text-success" : "text-danger"
          }`}
        >
          {mode === "in" ? (
            <ArrowDownCircle className="w-4 h-4" />
          ) : (
            <ArrowUpCircle className="w-4 h-4" />
          )}
          Input {mode === "in" ? "Barang Masuk" : "Barang Keluar"}
        </h4>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs font-medium text-gray-500 hover:text-gray-800"
        >
          Batal
        </button>
      </div>

      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className="text-xs font-medium text-gray-600 block mb-1">
            Jumlah ({unitSymbol})
          </label>
          <input
            type="number"
            className="input-base w-full text-lg font-semibold py-2"
            placeholder="0"
            min="1"
            step="any"
            autoFocus
            value={qty}
            onChange={(e) =>
              setQty(e.target.value === "" ? "" : Number(e.target.value))
            }
            required
          />
        </div>
        <Button
          type="submit"
          variant={mode === "in" ? "primary" : "danger"}
          className="px-6 py-2 h-[42px]"
          isLoading={isSubmitting}
        >
          Simpan
        </Button>
      </div>
    </form>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

interface ScanResult {
  barcode: string;
  product: BarcodeLookupResult;
}

export function BarcodeScannerPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [manualBarcode, setManualBarcode] = useState("");
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [actionMode, setActionMode] = useState<"in" | "out" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!manualBarcode.trim()) return;
    setIsSearching(true);
    setError("");
    setScanResult(null);
    setActionMode(null);
    try {
      const product = await barcodeService.lookup(manualBarcode.trim());
      setScanResult({ barcode: manualBarcode.trim(), product });
    } catch {
      setError(`Barcode "${manualBarcode}" tidak ditemukan`);
    } finally {
      setIsSearching(false);
    }
  }, [manualBarcode]);

  const resetScan = () => {
    setScanResult(null);
    setManualBarcode("");
    setActionMode(null);
  };

  const handleActionSubmit = async (qty: number) => {
    if (!scanResult) return;
    setIsSubmitting(true);
    try {
      const note = `Via Barcode Scanner (${scanResult.barcode})`;
      if (actionMode === "in") {
        await inventoryService.stockIn({
          items: [{ 
            productId: scanResult.product.id, 
            quantity: qty,
            unit_cost: scanResult.product.price,
            tax_pct: scanResult.product.tax_percentage
          }],
          notes: note,
        });
        toast.success(
          `Berhasil menambah ${qty} ${scanResult.product.unit_symbol} stok ${scanResult.product.name}`,
        );
      } else {
        await inventoryService.stockOut({
          items: [{ productId: scanResult.product.id, quantity: qty }],
          notes: note,
        });
        toast.success(
          `Berhasil mengurangi ${qty} ${scanResult.product.unit_symbol} stok ${scanResult.product.name}`,
        );
      }
      resetScan();
    } catch {
      toast.error("Gagal memproses transaksi stok.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageWrapper
      title="Barcode Scanner"
      description="Scan barcode / RFID untuk mengecek stok dan harga secara cepat, atau langsung input mutasi"
      actions={
        <Button variant="outline" onClick={() => navigate(ROUTES.BARCODE.PRINT)}>
          🖨️ Cetak Label
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto items-start">
        {/* ──── Kiri: Kamera & Input ─────────────────────── */}
        <div className="space-y-4">
          {/* Camera placeholder */}
          <div className="card p-8 text-center border-2 border-dashed border-gray-200">
            <Camera className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-500 mb-3">Kamera pemindai aktif</p>
            <p className="text-xs text-gray-400">
              Arahkan barcode ke kamera untuk memindai otomatis
            </p>
          </div>

          {/* Manual input */}
          <div className="card p-4">
            <p className="text-xs font-medium text-gray-500 mb-2">
              Pencarian Manual / RFID
            </p>
            <div className="flex gap-2">
              <input
                className="input-base flex-1"
                placeholder="Scan barcode di sini atau ketik SKU/kode manual..."
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                autoFocus
                disabled={isSearching}
              />
              <Button onClick={handleSearch} size="sm" isLoading={isSearching}>
                Cari
              </Button>
            </div>
            {error && <p className="mt-2 text-xs text-danger">{error}</p>}
          </div>
        </div>

        {/* ──── Kanan: Hasil Produk & Form Aksi ─────────── */}
        <div className="space-y-4">
          {/* Empty state */}
          {!scanResult && !actionMode && (
            <div className="card p-8 text-center border-2 border-dashed border-gray-100 text-gray-300">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">Hasil scan akan muncul di sini</p>
              <p className="text-xs mt-1">Scan atau ketik barcode di panel kiri</p>
            </div>
          )}

          {/* Product Info Card */}
          {scanResult && !actionMode && (
            <ProductInfoCard
              product={scanResult.product}
              barcode={scanResult.barcode}
              onClose={resetScan}
              onStockIn={() => setActionMode("in")}
              onStockOut={() => setActionMode("out")}
            />
          )}

          {/* Action Form */}
          {scanResult && actionMode && (
            <ActionForm
              mode={actionMode}
              unitSymbol={scanResult.product.unit_symbol}
              onSubmit={handleActionSubmit}
              onCancel={() => setActionMode(null)}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
