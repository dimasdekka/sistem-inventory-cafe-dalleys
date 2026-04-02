import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Package, Trash2 } from "lucide-react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/feedback/Toast";
import { ROUTES } from "@/constants";
import { formatCurrency } from "@/lib/utils";
import { productsService, Product } from "../products.service";
import { ProductStockHistory } from "../components";
import { usePermission } from "@/features/auth";

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { can } = usePermission();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Note: Local image change in detail page doesn't save automatically yet to backend unless uploaded via form
  // so this just sets preview. Full edit is handled by Edit mode.
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      productsService
        .getProductById(id)
        .then((data) => {
          setProduct(data);
          if (data.image_url) {
            setImageUrl(data.image_url);
          }
        })
        .catch((err) => {
          console.error(err);
          toast.error("Gagal memuat detail produk");
          navigate(ROUTES.PRODUCTS.LIST);
        })
        .finally(() => setIsLoading(false));
    }
  }, [id, navigate, toast]);

  if (isLoading || !product) {
    return (
      <PageWrapper
        title="Detail Produk"
        breadcrumbs={[
          { label: "Produk", to: ROUTES.PRODUCTS.LIST },
          { label: "Detail" },
        ]}
      >
        <div className="flex justify-center py-12 text-gray-500">
          Memuat data produk...
        </div>
      </PageWrapper>
    );
  }

  const isLowStock = product.stock <= product.min_stock;
  const restockAmount = product.max_stock - product.stock;

  const handleDelete = async () => {
    if (!window.confirm(`Hapus produk ${product.name}?`)) return;
    try {
      await productsService.deleteProduct(product.id);
      toast.success("Produk berhasil dihapus");
      navigate(ROUTES.PRODUCTS.LIST);
    } catch (err: any) {
      toast.error("Gagal menghapus produk", err.response?.data?.message);
    }
  };

  return (
    <PageWrapper
      title="Detail Produk"
      breadcrumbs={[
        { label: "Produk", to: ROUTES.PRODUCTS.LIST },
        { label: "Detail" },
      ]}
      actions={
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(ROUTES.PRODUCTS.LIST)}
          >
            Kembali
          </Button>
          {can("products:write") && (
            <>
              <Button
                variant="outline"
                onClick={() =>
                  navigate(ROUTES.PRODUCTS.PRINT_BARCODE(product.id))
                }
              >
                🖨️ Cetak Barcode
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(ROUTES.PRODUCTS.EDIT(product.id))}
              >
                Edit Produk
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Hapus
              </Button>
            </>
          )}
        </div>
      }
    >
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative w-16 h-16 rounded-xl bg-primary-50 flex-shrink-0">
            <div className="w-full h-full rounded-xl overflow-hidden flex items-center justify-center">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="w-8 h-8 text-primary-600" />
              )}
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{product.name}</h2>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
              <span>SKU: {product.code}</span>
              {product.barcode && (
                <>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span>Barcode: {product.barcode}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
          <div>
            <p className="text-xs text-gray-500 mb-1">Kategori</p>
            <div className="font-medium text-gray-900">
              {product.category.name}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Satuan</p>
            <div className="font-medium text-gray-900">
              {product.unit.name} ({product.unit.symbol})
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Harga Beli</p>
            <div className="font-medium text-gray-900">
              {formatCurrency(product.price)}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Stok Saat Ini (Aktual)</p>
            <div className="font-medium text-gray-900 text-lg">
              {product.stock}{" "}
              <span className="text-sm font-normal text-gray-500">
                {product.unit.symbol}
              </span>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Batas Restok (Min)</p>
            <div className="font-medium text-gray-900">
              {product.min_stock} {product.unit.symbol}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Target Maksimum</p>
            <div className="font-medium text-gray-900">
              {product.max_stock} {product.unit.symbol}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Saran Restok</p>
            <div className="font-medium text-gray-900">
              {isLowStock ? (
                <span className="text-orange-600 font-bold">
                  + {restockAmount} {product.unit.symbol}
                </span>
              ) : (
                <span className="text-gray-400 font-normal">Cukup</span>
              )}
            </div>
          </div>
        </div>

        {product.description && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-1">
              Deskripsi &amp; Catatan
            </p>
            <div className="text-sm text-gray-700 whitespace-pre-wrap">
              {product.description}
            </div>
          </div>
        )}
      </div>

      <ProductStockHistory productId={product.id} />
    </PageWrapper>
  );
}
