import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ROUTES } from "@/constants";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/feedback/Toast";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { inventoryService } from "../inventory.service";
import { productsService, Product } from "../../products/products.service";

interface StockAdjustmentFormData {
  productId: string;
  quantity: number;
  reason: string;
  notes?: string;
}

export function StockAdjustmentPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<StockAdjustmentFormData>();

  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    productsService.getProducts().then(setProducts).catch(console.error);
  }, []);
  const onSubmit = async (data: StockAdjustmentFormData) => {
    try {
      await inventoryService.stockAdjustment({
        ...data,
        notes: `[${data.reason.toUpperCase()}] ${data.notes || ""}`.trim(),
      });
      toast.success("Penyesuaian stok berhasil disimpan");
      navigate(ROUTES.INVENTORY.SUMMARY);
    } catch (e: any) {
      toast.error("Gagal menyimpan penyesuaian", e?.response?.data?.message);
    }
  };
  return (
    <PageWrapper
      title="Penyesuaian Stok"
      breadcrumbs={[
        { label: "Inventaris", to: ROUTES.INVENTORY.SUMMARY },
        { label: "Penyesuaian" },
      ]}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="card p-6 space-y-5">
          <div>
            <label className="form-label">
              Produk <span className="text-danger">*</span>
            </label>
            <select className="input-base" required {...register("productId")}>
              <option value="">Pilih produk...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.code ? `(${p.code})` : ""}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Jumlah Penyesuaian (+/-)"
            placeholder="Contoh: -2 atau 5"
            type="number"
            required
            step="any"
            {...register("quantity", { valueAsNumber: true })}
          />
          <div>
            <label className="form-label">
              Alasan Penyesuaian <span className="text-danger">*</span>
            </label>
            <select className="input-base" {...register("reason")}>
              <option value="opname">Hasil Stock Opname</option>
              <option value="rusak">Barang Rusak</option>
              <option value="koreksi">Koreksi Input</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>
          <div>
            <label className="form-label">Catatan</label>
            <textarea
              className="input-base resize-none"
              rows={3}
              {...register("notes")}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" type="button" onClick={() => navigate(-1)}>
            Batal
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Simpan Penyesuaian
          </Button>
        </div>
      </form>
    </PageWrapper>
  );
}
