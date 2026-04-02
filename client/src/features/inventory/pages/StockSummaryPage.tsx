import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Search,
  Filter,
  X,
  Package,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageWrapper } from "@/components/layout/PageWrapper";

import { StatusBadge } from "@/components/ui/Badge";
import { ROUTES } from "@/constants";
import { formatDate } from "@/lib/utils";
import { useEffect } from "react";
import { inventoryService, StockSummary } from "../inventory.service";
import { productsService } from "@/features/products/products.service";
import { masterDataService, Category } from "@/services/master-data.service";

const STATUSES = [
  { value: "all", label: "Semua Status" },
  { value: "ok", label: "Aman" },
  { value: "low", label: "Rendah" },
  { value: "critical", label: "Kritis" },
  { value: "out", label: "Habis" },
];

export function StockSummaryPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [summaries, setSummaries] = useState<StockSummary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      inventoryService.getSummaries(),
      productsService.getProducts(),
      masterDataService.getCategories(),
    ])
      .then(([sums, prods, cats]) => {
        const combined: StockSummary[] = [];

        prods.forEach((p) => {
          const pSums = sums.filter((s) => s.productId === p.id);
          if (pSums.length > 0) {
            pSums.forEach((s) => {
              combined.push({ ...s, product: p });
            });
          } else {
            combined.push({
              id: `empty-${p.id}`,
              productId: p.id,
              quantity: 0,
              product: p,
            });
          }
        });

        // Ensure leftover summaries (if any orphaned) are included
        sums.forEach((s) => {
          if (!combined.find((c) => c.id === s.id)) {
            combined.push(s);
          }
        });

        setSummaries(combined);
        setCategories(cats);
      })
      .catch((err) => console.error("Failed to load inventory data", err))
      .finally(() => setIsLoading(false));
  }, []);

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock <= 0) return "out";
    if (stock <= minStock) return "low";
    if (stock <= minStock * 1.5) return "critical";
    return "ok";
  };

  const filtered = summaries.filter((item) => {
    const pName = item.product?.name || "";
    const pSku = item.product?.code || "";
    const pMin = item.product?.min_stock || 0;

    const pCat = item.product?.category?.id || "uncategorized";

    const matchSearch =
      pName.toLowerCase().includes(search.toLowerCase()) ||
      pSku.toLowerCase().includes(search.toLowerCase());

    const status = getStockStatus(item.quantity, pMin);
    const matchStatus = statusFilter === "all" || status === statusFilter;
    const matchCategory = categoryFilter === "all" || pCat === categoryFilter;

    return matchSearch && matchStatus && matchCategory;
  });

  const hasFilter =
    search !== "" || statusFilter !== "all" || categoryFilter !== "all";

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setCategoryFilter("all");
  };

  return (
    <PageWrapper
      title="Ringkasan Stok"
      description="Pantau stok semua produk secara real-time"
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(ROUTES.INVENTORY.STOCK_IN)}
            className="inline-flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <ArrowDownToLine className="w-4 h-4 text-emerald-600" />
            Stok Masuk
          </button>
          <button
            onClick={() => navigate(ROUTES.INVENTORY.STOCK_OUT)}
            className="inline-flex items-center gap-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <ArrowUpFromLine className="w-4 h-4 text-amber-600" />
            Stok Keluar
          </button>
        </div>
      }
    >
      {/* Filter Bar */}
      <div className="card p-4 mb-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <Filter className="w-4 h-4 text-gray-400 shrink-0 hidden sm:block" />
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari produk atau SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base pl-9 w-full text-sm"
          />
        </div>
        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-base text-sm w-full sm:w-44 shrink-0"
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="input-base text-sm w-full sm:w-44 shrink-0"
        >
          <option value="all">Semua Kategori</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Reset */}
        {hasFilter && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-danger shrink-0"
          >
            <X className="w-3.5 h-3.5" />
            Reset
          </button>
        )}
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {[
                "Produk",
                "Kategori",
                "Stok",
                "Min/Max",
                "Status",
                "Saran Restok",
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-sm text-gray-500"
                >
                  Memuat data stok...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-sm text-gray-400"
                >
                  Tidak ada produk yang cocok dengan filter.
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const product = item.product;
                if (!product) return null;

                const isUnderMin = item.quantity <= product.min_stock;
                const restockAmount = isUnderMin
                  ? Math.max(0, product.max_stock - item.quantity)
                  : 0;
                const status = getStockStatus(item.quantity, product.min_stock);

                return (
                  <tr key={item.id} className="hover:bg-gray-50/50">
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
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {product.category?.name || "Uncategorized"}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      {item.quantity} {product.unit?.symbol || ""}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {product.min_stock} / {product.max_stock}{" "}
                      {product.unit?.symbol || ""}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={status} />
                    </td>
                    <td className="px-4 py-3">
                      {restockAmount > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                          + {restockAmount} {product.unit?.symbol || ""}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50 text-xs text-gray-500">
          {filtered.length} dari {summaries.length} produk • Terakhir
          diperbarui: {formatDate(new Date())}
        </div>
      </div>
    </PageWrapper>
  );
}
