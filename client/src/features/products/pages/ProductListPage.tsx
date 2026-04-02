import { useState, useEffect } from "react";
import { Plus, Search, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  ActionButtons,
  ViewAction,
  EditAction,
  DeleteAction,
} from "@/components/ui/ActionButtons";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { usePermission } from "@/features/auth";
import { ROUTES } from "@/constants";
import { formatCurrency } from "@/lib/utils";
import { productsService, Product } from "../products.service";
import { useToast } from "@/components/feedback/Toast";

export function ProductListPage() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmTarget, setConfirmTarget] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const { can } = usePermission();
  const toast = useToast();

  const fetchProducts = () => {
    productsService
      .getProducts()
      .then((data) => setProducts(data))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!confirmTarget) return;
    try {
      setIsDeleting(true);
      await productsService.deleteProduct(confirmTarget.id);
      toast.success("Produk dihapus", `${confirmTarget.name} berhasil dihapus`);
      fetchProducts();
    } catch (err: any) {
      toast.error("Gagal menghapus", err.response?.data?.message || "Terjadi kesalahan");
    } finally {
      setIsDeleting(false);
      setConfirmTarget(null);
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <ConfirmModal
        isOpen={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Produk?"
        description={`Produk "${confirmTarget?.name}" akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus Produk"
        isLoading={isDeleting}
      />

      <PageWrapper
        title="Produk & Inventaris"
        description="Kelola semua produk dan bahan baku"
        actions={
          can("products:write") && (
            <Button
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => navigate(ROUTES.PRODUCTS.NEW)}
            >
              Tambah Produk
            </Button>
          )
        }
      >
        {/* Search */}
        <div className="mb-4">
          <Input
            placeholder="Cari nama produk atau SKU..."
            leftElement={<Search className="w-4 h-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Produk
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Kategori
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Harga Beli
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Stok
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Saran Restok
                  </th>
                  {can("products:write") && (
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Aksi
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      Memuat data produk...
                    </td>
                  </tr>
                ) : (
                  filtered.map((product) => {
                    let stockStatus: "ok" | "low" | "out" = "ok";
                    if (product.stock <= 0) stockStatus = "out";
                    else if (product.stock <= product.min_stock)
                      stockStatus = "low";

                    const isLowStock = product.stock <= product.min_stock;
                    const restockAmount = product.max_stock - product.stock;

                    return (
                      <tr
                        key={product.id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                              {product.image_url ? (
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package className="w-4 h-4 text-primary-600" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {product.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {product.code}
                                {product.barcode && ` • ${product.barcode}`}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="neutral">{product.category.name}</Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {formatCurrency(product.price)}/{product.unit.symbol}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {product.stock}{" "}
                          <span className="text-xs text-gray-500 font-normal">
                            {product.unit.symbol}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={stockStatus} />
                        </td>
                        <td className="px-4 py-3">
                          {isLowStock ? (
                            <div className="flex flex-col">
                              <span className="text-orange-600 font-medium text-sm">
                                + {restockAmount} {product.unit.symbol}
                              </span>
                              <span className="text-xs text-gray-400">
                                ke target {product.max_stock}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm font-medium text-gray-400">
                              -
                            </span>
                          )}
                        </td>
                        {can("products:write") && (
                          <td className="px-4 py-3">
                            <ActionButtons>
                              <ViewAction
                                onClick={() =>
                                  navigate(ROUTES.PRODUCTS.DETAIL(product.id))
                                }
                              />
                              <EditAction
                                onClick={() =>
                                  navigate(ROUTES.PRODUCTS.EDIT(product.id))
                                }
                              />
                              <DeleteAction
                                onClick={() => setConfirmTarget(product)}
                              />
                            </ActionButtons>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            {!isLoading && filtered.length === 0 && (
              <EmptyState
                icon={<Package className="w-8 h-8" />}
                title="Tidak ada produk ditemukan"
                description="Coba ubah kata kunci pencarian Anda"
              />
            )}
          </div>
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
            <p className="text-xs text-gray-500">
              Menampilkan {filtered.length} dari {products.length} produk
            </p>
          </div>
        </div>
      </PageWrapper>
    </>
  );
}
