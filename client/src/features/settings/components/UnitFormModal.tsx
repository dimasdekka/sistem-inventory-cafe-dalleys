import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { masterDataService, Unit } from "@/services/master-data.service";
import { useToast } from "@/components/feedback/Toast";

interface UnitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit?: Unit | null;
  onSuccess: () => void;
}

export function UnitFormModal({
  isOpen,
  onClose,
  unit,
  onSuccess,
}: UnitFormModalProps) {
  const toast = useToast();
  const isEditing = !!unit;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: "", symbol: "" });

  useEffect(() => {
    if (unit) {
      setFormData({ name: unit.name, symbol: unit.symbol });
    } else {
      setFormData({ name: "", symbol: "" });
    }
  }, [unit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.symbol.trim()) {
      toast.error("Nama dan simbol satuan wajib diisi");
      return;
    }

    try {
      setIsSubmitting(true);
      if (isEditing && unit) {
        await masterDataService.updateUnit(unit.id, {
          name: formData.name.trim(),
          symbol: formData.symbol.trim(),
        });
        toast.success("Satuan berhasil diperbarui");
      } else {
        await masterDataService.createUnit({
          name: formData.name.trim(),
          symbol: formData.symbol.trim(),
        });
        toast.success("Satuan baru telah ditambahkan");
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
      title={isEditing ? "Edit Satuan" : "Tambah Satuan Baru"}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="form-label font-medium">Nama Satuan</label>
          <input
            required
            autoFocus
            className="input-base"
            placeholder="Misal: Kilogram"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div>
          <label className="form-label font-medium">Simbol singkatan</label>
          <input
            required
            className="input-base"
            placeholder="Misal: kg / pcs"
            value={formData.symbol}
            onChange={(e) =>
              setFormData({ ...formData, symbol: e.target.value })
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
