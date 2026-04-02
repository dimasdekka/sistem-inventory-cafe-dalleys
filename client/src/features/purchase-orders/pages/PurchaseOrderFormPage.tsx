import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Plus, Trash2, ArrowLeft, Send } from "lucide-react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ROUTES } from "@/constants";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/components/feedback/Toast";
import {
  suppliersService,
  Supplier,
} from "@/features/suppliers/suppliers.service";
import { productsService, Product } from "@/features/products/products.service";
import { purchaseOrdersService } from "../purchase-orders.service";

export function PurchaseOrderFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEditing = !!id;
  const toast = useToast();

  const [selectedSupplier, setSelectedSupplier] = useState(searchParams.get("supplier") || "");
  const [notes, setNotes] = useState("");
  const [globalTaxPct, setGlobalTaxPct] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState([
    { id: 1, product_id: "", quantity: 1, price: 0 },
  ]);

  const handleAddItem = () => {
    setItems([
      ...items,
      { id: Date.now(), product_id: "", quantity: 1, price: 0 },
    ]);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [suppliersData, productsData] = await Promise.all([
          suppliersService.getAll(),
          productsService.getProducts(),
        ]);
        setSuppliers(suppliersData);
        setProducts(productsData);

        if (isEditing && id) {
          const poData = await purchaseOrdersService.getById(id);
          setSelectedSupplier(poData.supplier_id || "");
          setNotes(poData.notes || "");
          setGlobalTaxPct(poData.tax_percentage || 0);
          if (poData.items && poData.items.length > 0) {
            setItems(
              poData.items.map((i) => ({
                id: Date.now() + Math.random(),
                product_id: i.product_id,
                quantity: i.quantity,
                price: i.unit_cost,
              })),
            );
          }
        }
      } catch (error) {
        toast.error("Error", "Gagal memuat data");
      }
    };
    fetchData();
  }, [toast]);

  const handleRemoveItem = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const handleItemChange = (
    id: number,
    field: string,
    value: string | number,
  ) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  };

  const subtotalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0,
  );

  // Jika globalTaxPct > 0 => pakai pajak global, abaikan pajak per-produk
  const taxAmount = globalTaxPct > 0
    ? subtotalAmount * (globalTaxPct / 100)
    : items.reduce((sum, item) => {
        const product = products.find((p) => p.id === item.product_id);
        const taxRate = product?.tax_percentage || 0;
        return sum + item.quantity * item.price * (taxRate / 100);
      }, 0);

  const grandTotal = subtotalAmount + taxAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) {
      toast.error("Validasi Gagal", "Silakan pilih supplier terlebih dahulu");
      return;
    }
    if (items.some((i) => !i.product_id)) {
      toast.error("Validasi Gagal", "Produk tidak boleh ada yang kosong");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        supplier_id: selectedSupplier,
        notes: notes,
        tax_percentage: globalTaxPct,
        items: items.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity,
          unit_cost: i.price,
        })),
      };

      if (isEditing && id) {
        await purchaseOrdersService.update(id, payload);
        toast.success("PO Diperbarui", "Purchase Order berhasil disimpan");
      } else {
        await purchaseOrdersService.create(payload);
        toast.success(
          "PO Berhasil Dibuat",
          "Purchase Order telah berhasil dibuat di sistem",
        );
      }
      navigate(ROUTES.PURCHASE_ORDERS.LIST);
    } catch (error: any) {
      toast.error("Error", error.response?.data?.error || "Gagal menyimpan PO");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageWrapper
      title={isEditing ? "Edit Purchase Order" : "Buat Purchase Order"}
      breadcrumbs={[
        { label: "Purchase Order", to: ROUTES.PURCHASE_ORDERS.LIST },
        { label: isEditing ? "Edit PO" : "Buat Baru" },
      ]}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Batal
          </Button>
          <Button type="submit" form="po-form" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center">Loading...</span>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                {isEditing ? "Simpan Perubahan" : "Buat & Kirim PO"}
              </>
            )}
          </Button>
        </div>
      }
    >
      <form
        id="po-form"
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Info Formulir */}
        <div className="card p-6 lg:col-span-1 space-y-5 h-fit">
          <h3 className="text-sm font-semibold text-gray-900 border-b pb-3">
            Informasi Pesanan
          </h3>
          <div>
            <label className="form-label">
              Pilih Supplier <span className="text-danger">*</span>
            </label>
            <select
              className="input-base"
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              required
            >
              <option value="">Pilih supplier dari daftar...</option>
              {suppliers
                .filter((s) => s.status === "active")
                .map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
            </select>
          </div>
          <Input
            label="Tanggal Pemesanan"
            type="date"
            defaultValue={new Date().toISOString().split("T")[0]}
          />
          <Input label="Estimasi Kedatangan" type="date" />
          <div>
            <label className="form-label">Catatan Pesanan</label>
            <textarea
              className="input-base min-h-[100px] resize-none"
              placeholder="Instruksi pengiriman, terms of payment, dll..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Global Tax Override */}
          <div>
            <label className="form-label">
              Pajak Global (%)
              <span className="ml-1 text-xs font-normal text-gray-400">– opsional</span>
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              className="input-base"
              placeholder="0 = gunakan pajak per-produk"
              value={globalTaxPct || ""}
              onChange={(e) => setGlobalTaxPct(parseFloat(e.target.value) || 0)}
            />
            {globalTaxPct > 0 && (
              <p className="mt-1 text-xs text-primary-600 font-medium">
                ✓ Pajak global {globalTaxPct}% aktif — mengabaikan pajak per-produk.
              </p>
            )}
          </div>
        </div>

        {/* Daftar Item */}
        <div className="card p-0 lg:col-span-2 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h3 className="text-sm font-semibold text-gray-900">
              Daftar Produk yang Dipesan
            </h3>
            <Button
              size="sm"
              variant="outline"
              type="button"
              onClick={handleAddItem}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Tambah Produk
            </Button>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white text-gray-500 font-medium border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 min-w-[200px]">Nama Produk</th>
                  <th className="px-4 py-3 w-32">Kuantitas</th>
                  <th className="px-4 py-3 w-40">Harga Satuan</th>
                  <th className="px-4 py-3 w-40 text-right">Subtotal</th>
                  <th className="px-4 py-3 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((item) => (
                  <tr key={item.id} className="bg-white">
                    <td className="px-4 py-3">
                      <select
                        className="input-base w-full !shadow-none"
                        value={item.product_id}
                        onChange={(e) => {
                          const val = e.target.value;
                          const selectedProd = products.find(
                            (p) => p.id === val,
                          );

                          setItems(
                            items.map((i) => {
                              if (i.id === item.id) {
                                return {
                                  ...i,
                                  product_id: val,
                                  price: selectedProd
                                    ? selectedProd.price
                                    : i.price,
                                };
                              }
                              return i;
                            }),
                          );
                        }}
                        required
                      >
                        <option value="">Pilih Produk...</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.code})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(
                            item.id,
                            "quantity",
                            parseInt(e.target.value) || 0,
                          )
                        }
                        required
                        className="!shadow-none"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        type="number"
                        min="0"
                        value={item.price}
                        onChange={(e) =>
                          handleItemChange(
                            item.id,
                            "price",
                            parseInt(e.target.value) || 0,
                          )
                        }
                        required
                        className="!shadow-none"
                      />
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {formatCurrency(item.quantity * item.price)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-2 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                        disabled={items.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-6 bg-gray-50 flex justify-end">
            <div className="w-64 space-y-3">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Total Item:</span>
                <span>
                  {items.reduce((sum, item) => sum + item.quantity, 0)} Pcs
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Total Pajak:</span>
                <span>{formatCurrency(taxAmount)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-3 border-t border-gray-200">
                <span>Grand Total:</span>
                <span className="text-primary-600">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </PageWrapper>
  );
}
