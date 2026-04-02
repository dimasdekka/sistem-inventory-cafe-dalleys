import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/constants";
import { productsService, Product } from "@/features/products/products.service";
import { barcodeService } from "@/features/barcode/barcode.service";

export function ProductPrintBarcodePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [barcodeUrl, setBarcodeUrl] = useState("");

  useEffect(() => {
    if (!id) return;
    productsService
      .getProductById(id)
      .then((p: Product) => {
        setProduct(p);
        setBarcodeUrl(barcodeService.getBarcodeImageUrl(id));
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <PageWrapper title="Cetak Label Barcode">
        <div className="flex justify-center p-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
        </div>
      </PageWrapper>
    );
  }

  if (!product) {
    return (
      <PageWrapper title="Produk Tidak Ditemukan">
        <div className="card p-8 text-center">
          <p className="text-gray-500 mb-4">Produk yang Anda cari tidak ada.</p>
          <Button onClick={() => navigate(ROUTES.PRODUCTS.LIST)}>
            Kembali ke Daftar Produk
          </Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Cetak Label Barcode"
      breadcrumbs={[
        { label: "Produk", to: ROUTES.PRODUCTS.LIST },
        { label: "Cetak Label" },
      ]}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Batal
          </Button>
          <Button onClick={() => window.print()}>
            🖨️ Print via Printer Thermal
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: config */}
        <div className="card p-4 space-y-4 print:hidden">
          <h3 className="text-sm font-semibold text-gray-800">
            Pengaturan Cetak
          </h3>
          <div>
            <label className="form-label">Produk Terpilih</label>
            <input
              type="text"
              className="input-base bg-gray-50"
              value={product.name}
              disabled
            />
          </div>
          <div>
            <label className="form-label">Ukuran Kertas/Label</label>
            <select className="input-base">
              <option value="50x30">50×30 mm (Standar Barcode/Stiker)</option>
              <option value="40x25">40×25 mm (Kecil)</option>
            </select>
          </div>
          <div>
            <label className="form-label">Jumlah Copy/Salinan</label>
            <input
              type="number"
              className="input-base"
              defaultValue={1}
              min={1}
              max={100}
            />
          </div>
          <div className="bg-primary-50 text-primary-800 text-xs p-3 rounded-lg">
            <p>
              <strong>Tips Cetak:</strong> Pastikan Anda telah mengatur ukuran
              kertas pada setting printer bawaan sistem sesuai dengan opsi di
              atas, hilangkan `margin`, `header/footer` sebelum mencetak.
            </p>
          </div>
        </div>

        {/* Right: preview */}
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3 print:hidden">
            Preview Layout
          </h3>
          {/* Print container */}
          <div className="flex justify-center print:block print:w-full">
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-white print:border-none print:p-0 print:m-0"
              style={{
                width: "250px",
                minHeight: "113px",
              }}
            >
              <div className="flex flex-col items-center justify-center h-full gap-1">
                {barcodeUrl ? (
                  <img
                    src={barcodeUrl}
                    alt={`Barcode ${product?.code}`}
                    className="max-w-full h-auto"
                    onError={() => setBarcodeUrl("")}
                  />
                ) : (
                  /* Fallback CSS Barcode */
                  <div className="flex gap-0.5">
                    {Array.from({ length: 42 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-0.5 bg-black"
                        style={{ height: `${i % 3 === 0 ? 32 : 24}px` }}
                      />
                    ))}
                  </div>
                )}
                <p className="text-[10px] sm:text-[8px] font-mono font-bold">
                  {product?.code}
                </p>
                <p className="text-[10px] sm:text-[7px] text-gray-800 text-center font-semibold leading-tight px-1 uppercase line-clamp-2">
                  {product.name}
                </p>
                <p className="text-[8px] sm:text-[6px] text-gray-600">
                  Kode: {product.code}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
