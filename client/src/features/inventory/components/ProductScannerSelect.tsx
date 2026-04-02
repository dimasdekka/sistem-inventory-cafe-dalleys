import { useState } from "react";
import { QrCode, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Product } from "@/features/products/products.service";

interface ProductScannerSelectProps {
  products: Product[];
  /** Called when a product is found by scan or manual select */
  onProductFound: (product: Product) => void;
  label?: string;
}

/**
 * Reusable component wrapping the "Scan Item Tambahan" block:
 * - Barcode / SKU text input (with Enter key support)
 * - Search button
 * - Divider "atau"
 * - Manual dropdown select from all products
 *
 * Used in StockInPage, StockOutPage, and StockOpnamePage.
 */
export function ProductScannerSelect({
  products,
  onProductFound,
  label = "Scan / Pilih Item",
}: ProductScannerSelectProps) {
  const [barcodeInput, setBarcodeInput] = useState("");
  const [error, setError] = useState("");

  const findAndSubmit = (query: string) => {
    if (!query.trim()) return;
    const found = products.find(
      (p) => p.barcode === query.trim() || p.code === query.trim()
    );
    if (found) {
      onProductFound(found);
      setBarcodeInput("");
      setError("");
    } else {
      setError(`Barcode / SKU "${query}" tidak terdaftar`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      findAndSubmit(barcodeInput);
    }
  };

  const handleSearchClick = () => findAndSubmit(barcodeInput);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pid = e.target.value;
    if (!pid) return;
    const found = products.find((p) => p.id === pid);
    if (found) onProductFound(found);
    e.target.value = "";
  };

  return (
    <div className="bg-primary-50 p-4 rounded-xl border border-primary-100 flex flex-col gap-3">
      <label className="text-sm font-semibold text-primary-900 flex items-center gap-2">
        <QrCode className="w-5 h-5 text-primary-600" />
        {label}
      </label>

      {/* Scan input */}
      <div className="flex gap-2 w-full">
        <input
          type="text"
          className="input-base flex-1 border-primary-300 focus:border-primary-500 bg-white"
          placeholder="Arahkan scanner atau ketik kode..."
          value={barcodeInput}
          onChange={(e) => {
            setBarcodeInput(e.target.value);
            setError("");
          }}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        <Button type="button" onClick={handleSearchClick} size="sm">
          <Search className="w-4 h-4" />
        </Button>
      </div>

      {error && (
        <p className="text-xs text-danger-600 font-medium -mt-1">{error}</p>
      )}

      {/* Divider */}
      <div className="relative flex items-center py-1">
        <div className="flex-grow border-t border-primary-200" />
        <span className="flex-shrink-0 mx-4 text-primary-400 text-xs font-medium">
          atau
        </span>
        <div className="flex-grow border-t border-primary-200" />
      </div>

      {/* Manual dropdown */}
      <select
        className="input-base border-primary-300 focus:border-primary-500 bg-white text-sm"
        onChange={handleSelectChange}
        value=""
      >
        <option value="">Pilih manual dari daftar produk...</option>
        {products.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} {p.code ? `(${p.code})` : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
