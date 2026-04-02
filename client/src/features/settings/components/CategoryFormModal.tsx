import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { masterDataService, Category } from "@/services/master-data.service";
import { useToast } from "@/components/feedback/Toast";

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
  onSuccess: () => void;
}

export function CategoryFormModal({
  isOpen,
  onClose,
  category,
  onSuccess,
}: CategoryFormModalProps) {
  const toast = useToast();
  // categories only have create/delete currently but we setup editing structure
  const isEditing = !!category;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || "",
      });
    } else {
      setFormData({ name: "", description: "" });
    }
  }, [category, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Nama kategori wajib diisi");
      return;
    }

    try {
      setIsSubmitting(true);
      if (isEditing && category) {
        await masterDataService.updateCategory(category.id, {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
        });
        toast.success("Kategori berhasil diperbarui");
      } else {
        await masterDataService.createCategory({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
        });
        toast.success("Kategori berhasil ditambahkan");
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(
        "Gagal menyimpan",
        error?.response?.data?.message || "Terjadi kesalahan",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Kategori" : "Tambah Kategori Baru"}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="form-label font-medium">Nama Kategori</label>
          <input
            required
            autoFocus
            className="input-base"
            placeholder="Misal: Bahan Baku, Kemasan"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div>
          <label className="form-label font-medium">Deskripsi</label>
          <textarea
            className="input-base min-h-[80px]"
            placeholder="Catatan opsional..."
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEditing ? "Simpan" : "Tambah"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
