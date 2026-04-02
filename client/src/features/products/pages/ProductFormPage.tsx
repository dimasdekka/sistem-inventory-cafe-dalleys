import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { QrCode, Wand2 } from "lucide-react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { ROUTES } from "@/constants";
import { useToast } from "@/components/feedback/Toast";

import {
  masterDataService,
  Category,
  Unit,
} from "@/services/master-data.service";
import { productsService } from "../products.service";

const productSchema = z
  .object({
    name: z.string().min(2, "Nama minimal 2 karakter"),
    code: z.string().min(2, "Kode SKU minimal 2 karakter"),
    barcode: z.string().optional(),
    categoryId: z.string().min(1, "Pilih kategori"),
    unitId: z.string().min(1, "Pilih satuan"),
    price: z.number().min(0, "Harga tidak boleh negatif"),
    taxPercentage: z.number().min(0, "Pajak tidak boleh negatif").max(100, "Maksimal pajak 100%"),
    minStock: z.number().min(0, "Stok minimum tidak boleh negatif"),
    maxStock: z.number().min(0, "Stok maksimum tidak boleh negatif"),
    description: z.string().optional(),
  })
  .refine((data) => data.maxStock >= data.minStock, {
    message:
      "Stok maksimum (Target) harus lebih besar atau sama dengan stok minimum (Batas Restok)",
    path: ["maxStock"],
  });

type ProductFormValues = z.infer<typeof productSchema>;

export function ProductFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const toast = useToast();

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      price: 0,
      taxPercentage: 0,
      minStock: 0,
      maxStock: 0,
      barcode: "",
    },
  });

  useEffect(() => {
    Promise.all([
      masterDataService.getCategories(),
      masterDataService.getUnits(),
    ])
      .then(([cats, uns]) => {
        setCategories(cats);
        setUnits(uns);
      })
      .catch((err) => {
        console.error("Failed to load master data", err);
        toast.error("Gagal memuat referensi data");
      });

    if (isEditMode) {
      productsService
        .getProductById(id)
        .then((product) => {
          if (product.image_url) {
            setImageUrl(product.image_url);
          }
          reset({
            name: product.name,
            code: product.code,
            barcode: product.barcode || "",
            categoryId: product.category.id,
            unitId: product.unit.id,
            price: product.price,
            taxPercentage: product.tax_percentage || 0,
            minStock: product.min_stock,
            maxStock: product.max_stock,
            description: product.description || "",
          });
        })
        .catch((err) => {
          console.error(err);
          toast.error("Gagal memuat data produk");
          navigate(ROUTES.PRODUCTS.LIST);
        });
    }
  }, [id, isEditMode, reset, navigate]);

  const handleImageUpload = (file: File) => {
    setFileToUpload(file);
  };

  const handleImageRemove = () => {
    setImageUrl(null);
    setFileToUpload(null);
  };

  const handleGenerateBarcode = () => {
    // Generate a simple 13-digit barcode mock
    const prefix = "899"; // Indonesian country code standard
    const randomDigits = Math.floor(Math.random() * 1000000000)
      .toString()
      .padStart(9, "0");
    const mockCheckDigit = "1";
    const generatedBarcode = prefix + randomDigits + mockCheckDigit;

    setValue("barcode", generatedBarcode, {
      shouldValidate: true,
      shouldDirty: true,
    });
    toast.success("Barcode berhasil digenerate: " + generatedBarcode);
  };

  const onSubmit = async (data: ProductFormValues) => {
    try {
      const fd = new FormData();
      fd.append("code", data.code);
      fd.append("name", data.name);
      fd.append("category_id", data.categoryId);
      fd.append("unit_id", data.unitId);
      fd.append("price", data.price.toString());
      fd.append("tax_percentage", data.taxPercentage.toString());
      fd.append("min_stock", data.minStock.toString());
      fd.append("max_stock", data.maxStock.toString());
      if (data.description) {
        fd.append("description", data.description);
      }
      if (data.barcode) {
        fd.append("barcode", data.barcode);
      }
      if (fileToUpload) {
        fd.append("image", fileToUpload);
      }

      if (isEditMode) {
        await productsService.updateProduct(id, fd);
        toast.success(
          "Produk berhasil diperbarui",
          `${data.name} telah diupdate`,
        );
      } else {
        await productsService.createProduct(fd);
        toast.success(
          "Produk berhasil disimpan",
          `${data.name} telah ditambahkan`,
        );
      }
      navigate(ROUTES.PRODUCTS.LIST);
    } catch (error: any) {
      console.error(error);
      toast.error(
        "Gagal menyimpan produk",
        error?.response?.data?.message || "Terjadi kesalahan sistem",
      );
    }
  };

  return (
    <PageWrapper
      title={isEditMode ? "Edit Produk" : "Tambah Produk"}
      breadcrumbs={[
        { label: "Produk", to: ROUTES.PRODUCTS.LIST },
        { label: isEditMode ? "Edit Produk" : "Tambah Produk" },
      ]}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6 space-y-5">
              <h3 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">
                Informasi Umum
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  label="Nama Produk"
                  required
                  error={errors.name?.message}
                  {...register("name")}
                />
                <Input
                  label="Kode Produk (SKU)"
                  required
                  placeholder="Contoh: PRD-00123"
                  error={errors.code?.message}
                  {...register("code")}
                />
              </div>

              <div>
                <label className="form-label font-medium block">
                  Barcode Scanner ID
                </label>
                <div className="flex gap-2.5 mt-1">
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      className={`input-base pl-9 ${errors.barcode ? "border-danger focus:ring-danger" : ""}`}
                      placeholder="Scan atau ketik kode barcode fisik..."
                      {...register("barcode")}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGenerateBarcode}
                  >
                    <Wand2 className="w-4 h-4 mr-2 text-primary-600" />
                    Auto Generate
                  </Button>
                </div>
                {errors.barcode && (
                  <p className="mt-1 text-xs text-danger">
                    {errors.barcode.message}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1.5">
                  Gunakan auto-generate jika produk tidak memiliki barcode
                  bawaan fisik. Barcode ini bisa di-print nanti.
                </p>
              </div>

              <div>
                <label className="form-label">Deskripsi</label>
                <textarea
                  className="input-base min-h-[80px] resize-none"
                  placeholder="Catatan atau deskripsi produk..."
                  {...register("description")}
                />
              </div>
            </div>

            <div className="card p-6 space-y-5">
              <h3 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">
                Harga &amp; Stok
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="form-label">
                    Kategori <span className="text-danger">*</span>
                  </label>
                  <select className="input-base" {...register("categoryId")}>
                    <option value="">Pilih kategori...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <p className="mt-1 text-xs text-danger">
                      {errors.categoryId.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="form-label">
                    Satuan <span className="text-danger">*</span>
                  </label>
                  <select className="input-base" {...register("unitId")}>
                    <option value="">Pilih satuan...</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.symbol})
                      </option>
                    ))}
                  </select>
                  {errors.unitId && (
                    <p className="mt-1 text-xs text-danger">
                      {errors.unitId.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  label="Harga Beli (Rp)"
                  type="number"
                  required
                  error={errors.price?.message}
                  {...register("price", { valueAsNumber: true })}
                />
                <Input
                  label="Pajak (%)"
                  type="number"
                  step="0.01"
                  error={errors.taxPercentage?.message}
                  {...register("taxPercentage", { valueAsNumber: true })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                <Input
                  label="Min Stok (Batas Restok)"
                  type="number"
                  error={errors.minStock?.message}
                  {...register("minStock", { valueAsNumber: true })}
                />
                <Input
                  label="Max Stok (Target)"
                  type="number"
                  error={errors.maxStock?.message}
                  {...register("maxStock", { valueAsNumber: true })}
                />
              </div>
            </div>
          </div>

            <div className="space-y-6">
            <div className="card p-6 h-full flex flex-col">
              <h3 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-5">
                Gambar Produk
              </h3>
              <ImageUploader
                currentImageUrl={imageUrl}
                onFileSelected={handleImageUpload}
                onRemove={handleImageRemove}
              />
              <p className="text-xs text-center text-gray-400 mt-4">
                Gambar resolusi tinggi membantu identifikasi barang saat stok fisik.
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" type="button" onClick={() => navigate(-1)}>
            Batal
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEditMode ? "Simpan Perubahan" : "Simpan Produk"}
          </Button>
        </div>
      </form>
    </PageWrapper>
  );
}
