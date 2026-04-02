import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Building2,
  Phone,
  Mail,
  Loader2,
  X,
} from "lucide-react";
import {
  ActionButtons,
  ViewAction,
  EditAction,
  DeleteAction,
} from "@/components/ui/ActionButtons";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { ROUTES } from "@/constants";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/feedback/Toast";
import {
  suppliersService,
  Supplier,
  CreateSupplierDto,
} from "../suppliers.service";

// ── Supplier Form Modal ───────────────────────────────────────────────────────

interface SupplierFormModalProps {
  supplier?: Supplier | null;
  onClose: () => void;
  onSaved: () => void;
}

function SupplierFormModal({
  supplier,
  onClose,
  onSaved,
}: SupplierFormModalProps) {
  const toast = useToast();
  const isEdit = !!supplier;

  const [form, setForm] = useState<CreateSupplierDto>({
    name: supplier?.name ?? "",
    contact: supplier?.contact ?? "",
    email: supplier?.email ?? "",
    phone: supplier?.phone ?? "",
    address: supplier?.address ?? "",
    status: supplier?.status ?? "active",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.contact || !form.phone) {
      toast.error("Validasi", "Nama, kontak, dan telepon wajib diisi");
      return;
    }
    try {
      setIsSubmitting(true);
      const fd = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        fd.append(key, String(value));
      });
      if (imageFile) {
        fd.append("image", imageFile);
      }

      if (isEdit && supplier) {
        await suppliersService.update(supplier.id, fd);
        toast.success(
          "Supplier diperbarui",
          `${form.name} berhasil diperbarui`,
        );
      } else {
        await suppliersService.create(fd);
        toast.success(
          "Supplier ditambahkan",
          `${form.name} berhasil ditambahkan`,
        );
      }
      onSaved();
      onClose();
    } catch (error: any) {
      toast.error(
        "Gagal menyimpan",
        error?.response?.data?.message || "Terjadi kesalahan sistem",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {isEdit ? "Edit Supplier" : "Tambah Supplier Baru"}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {isEdit
                ? "Perbarui informasi supplier"
                : "Isi data pemasok barang baru"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="mb-2">
            <ImageUploader
              variant="product"
              label="Foto / Logo Supplier"
              currentImageUrl={supplier?.image_url}
              onFileSelected={(file) => setImageFile(file)}
              onRemove={() => setImageFile(null)}
              className="max-w-[200px]"
            />
          </div>
          <Input
            label="Nama Perusahaan / Supplier"
            name="name"
            required
            placeholder="Contoh: PT. Maju Jaya Abadi"
            value={form.name}
            onChange={handleChange}
          />
          <Input
            label="Nama Kontak Person"
            name="contact"
            required
            placeholder="Nama PIC yang bisa dihubungi"
            value={form.contact}
            onChange={handleChange}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="No. Telepon"
              name="phone"
              required
              type="tel"
              placeholder="08xx-xxxx-xxxx"
              value={form.phone}
              onChange={handleChange}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="email@supplier.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="form-label">Alamat</label>
            <textarea
              name="address"
              className="input-base min-h-[80px] resize-none"
              placeholder="Alamat lengkap supplier..."
              value={form.address}
              onChange={handleChange}
            />
          </div>

          {isEdit && (
            <div>
              <label className="form-label">Status</label>
              <select
                name="status"
                className="input-base"
                value={form.status}
                onChange={handleChange}
              >
                <option value="active">Aktif</option>
                <option value="inactive">Non-aktif</option>
              </select>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {isEdit ? "Simpan Perubahan" : "Tambah Supplier"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function SupplierListPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Supplier | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<Supplier | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSuppliers = async () => {
    try {
      setIsLoading(true);
      const data = await suppliersService.getAll();
      setSuppliers(data);
    } catch (error) {
      console.error("Failed to fetch suppliers:", error);
      toast.error("Gagal memuat", "Tidak dapat mengambil data supplier");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!confirmTarget) return;
    setIsDeleting(true);
    try {
      await suppliersService.delete(confirmTarget.id);
      toast.success("Supplier dihapus", `${confirmTarget.name} berhasil dihapus`);
      fetchSuppliers();
    } catch (error: any) {
      toast.error(
        "Gagal menghapus",
        error?.response?.data?.message || "Terjadi kesalahan sistem",
      );
    } finally {
      setIsDeleting(false);
      setConfirmTarget(null);
    }
  };

  const openCreate = () => {
    setEditTarget(null);
    setModalOpen(true);
  };

  const openEdit = (supplier: Supplier) => {
    setEditTarget(supplier);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditTarget(null);
  };

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.contact.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <>
      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Supplier?"
        description={`Supplier "${confirmTarget?.name}" akan dihapus secara permanen.`}
        confirmLabel="Hapus Supplier"
        isLoading={isDeleting}
      />

      {/* Create / Edit Modal */}
      {modalOpen && (
        <SupplierFormModal
          supplier={editTarget}
          onClose={closeModal}
          onSaved={fetchSuppliers}
        />
      )}

      <PageWrapper
        title="Daftar Supplier"
        description="Kelola data pemasok barang dan bahan baku"
        actions={
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Supplier
          </Button>
        }
      >
        <div className="card">
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Cari nama supplier atau kontak..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/50 text-gray-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Informasi Supplier</th>
                  <th className="px-6 py-4">Kontak</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSuppliers.map((supplier) => (
                  <tr
                    key={supplier.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        {supplier.image_url ? (
                          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 mt-0.5 border border-gray-100">
                            <img src={supplier.image_url} alt={supplier.name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 mt-0.5">
                            <Building2 className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">
                            {supplier.name}
                          </p>
                          <p className="text-gray-500 text-xs mt-0.5">
                            {supplier.id.split("-")[0].toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="font-medium text-gray-900">
                          {supplier.contact}
                        </p>
                        <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                          <Phone className="w-3 h-3" />
                          {supplier.phone}
                        </div>
                        {supplier.email && supplier.email !== "-" && (
                          <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                            <Mail className="w-3 h-3" />
                            {supplier.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          supplier.status === "active" ? "success" : "neutral"
                        }
                      >
                        {supplier.status === "active" ? "Aktif" : "Non-aktif"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ActionButtons align="right">
                        <ViewAction
                          onClick={() =>
                            navigate(ROUTES.SUPPLIERS.DETAIL(supplier.id))
                          }
                        />
                        <EditAction onClick={() => openEdit(supplier)} />
                        <DeleteAction
                          onClick={() => setConfirmTarget(supplier)}
                        />
                      </ActionButtons>
                    </td>
                  </tr>
                ))}
                {isLoading && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
                      </div>
                    </td>
                  </tr>
                )}
                {!isLoading && filteredSuppliers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-gray-500">
                          {searchQuery
                            ? "Tidak ada supplier ditemukan."
                            : "Belum ada supplier. Klik 'Tambah Supplier' untuk memulai."}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </PageWrapper>
    </>
  );
}
