import { NavLink, Outlet } from "react-router-dom";
import { Building2, Ruler, Tag, ScanLine, Plus, Trash2 } from "lucide-react";
import { ROUTES } from "@/constants";
import { cn } from "@/lib/utils";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { useEffect, useState } from "react";
import {
  masterDataService,
  Unit,
  Category,
} from "@/services/master-data.service";
import { useToast } from "@/components/feedback/Toast";
import { UnitFormModal } from "../components/UnitFormModal";
import { CategoryFormModal } from "../components/CategoryFormModal";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { settingsService } from "@/services/settings.service";
import { useUiStore } from "@/store/ui.store";

const SETTINGS_NAV = [
  { label: "Profil Bisnis", to: ROUTES.SETTINGS.PROFILE, icon: Building2 },
  { label: "Satuan", to: ROUTES.SETTINGS.UNITS, icon: Ruler },
  { label: "Kategori", to: ROUTES.SETTINGS.CATEGORIES, icon: Tag },
  { label: "Scanner & Barcode", to: ROUTES.SETTINGS.SCANNER, icon: ScanLine },
];

export function SettingsLayout() {
  return (
    <PageWrapper
      title="Pengaturan"
      description="Konfigurasi aplikasi dan bisnis"
    >
      <div className="flex gap-6">
        {/* Settings nav */}
        <nav className="w-52 flex-shrink-0">
          <div className="card py-1">
            {SETTINGS_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                    isActive
                      ? "text-primary-700 bg-primary-50 font-medium"
                      : "text-gray-600 hover:bg-gray-50",
                  )
                }
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
        {/* Settings content */}
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </PageWrapper>
  );
}

export function BusinessProfilePage() {
  const toast = useToast();
  const { setBusinessProfile } = useUiStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    business_name: "",
    address: "",
    phone: "",
    email: "",
    logo: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getById("profile");
      if (data && data.value) {
        const loaded = {
          business_name: data.value.business_name || "",
          address: data.value.address || "",
          phone: data.value.phone || "",
          email: data.value.email || "",
          logo: data.value.logo || "",
        };
        setProfile(loaded);
        // Sync to Sidebar immediately on load
        setBusinessProfile(loaded.business_name, loaded.logo);
      }
    } catch (err: any) {
      if (err?.response?.status !== 404) {
        toast.error("Gagal memuat profil bisnis");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile((prev) => ({ ...prev, logo: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await settingsService.save("profile", profile);
      // Sync to Sidebar right after saving
      setBusinessProfile(profile.business_name, profile.logo);
      toast.success("Profil bisnis berhasil disimpan");
    } catch (err) {
      toast.error("Gagal menyimpan profil bisnis");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-sm text-gray-500 animate-pulse">Memuat profil...</div>;

  return (
    <div className="card p-6 space-y-5">
      <h2 className="text-sm font-semibold text-gray-800">Profil Bisnis</h2>
      
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="w-full md:w-32 flex-shrink-0">
          <label className="form-label block mb-2">Logo Bisnis</label>
          <ImageUploader 
            variant="avatar" 
            currentImageUrl={profile.logo} 
            onFileSelected={handleLogoUpload}
            onRemove={() => setProfile((prev) => ({ ...prev, logo: "" }))}
          />
        </div>
        
        <div className="flex-1 space-y-4">
          <div>
            <label className="form-label">Nama Bisnis</label>
            <input name="business_name" className="input-base" value={profile.business_name} onChange={handleChange} placeholder="Caffe Dalley" />
          </div>
          <div>
            <label className="form-label">Alamat</label>
            <input name="address" className="input-base" value={profile.address} onChange={handleChange} placeholder="Jl. Sudirman No. 10..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">No. Telepon</label>
              <input name="phone" className="input-base" value={profile.phone} onChange={handleChange} placeholder="021-..." />
            </div>
            <div>
              <label className="form-label">Email</label>
              <input name="email" className="input-base" value={profile.email} onChange={handleChange} placeholder="hello@domain.com" />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="btn-base bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 px-4 py-2 text-sm"
        >
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
    </div>
  );
}

export function UnitsPage() {
  const toast = useToast();
  const [units, setUnits] = useState<Unit[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

  const loadUnits = async () => {
    try {
      const data = await masterDataService.getUnits();
      setUnits(data);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat satuan");
    }
  };

  useEffect(() => {
    loadUnits();
  }, []);

  const handleOpenModal = (unit?: Unit) => {
    setSelectedUnit(unit || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUnit(null);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Hapus satuan "${name}" ini secara permanen?`)) return;
    try {
      await masterDataService.deleteUnit(id);
      setUnits((prev) => prev.filter((u) => u.id !== id));
      toast.success("Satuan berhasil dihapus");
    } catch (error: any) {
      console.error(error);
      toast.error(
        "Gagal menghapus satuan",
        error?.response?.data?.message || "Terjadi kesalahan sistem",
      );
    }
  };

  return (
    <div className="card p-6">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">
            Satuan Pengukuran
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Kelola data master satuan untuk inventaris barang Anda.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-base bg-primary-600 text-white hover:bg-primary-700 flex items-center justify-center gap-1.5 px-3 py-2 text-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          Tambah Satuan
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {units.map((u) => (
          <div
            key={u.id}
            className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
          >
            <div>
              <span className="text-sm font-mono text-gray-900">
                {u.symbol}
              </span>
              <p className="text-[11px] text-gray-500">{u.name}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleOpenModal(u)}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(u.id, u.name)}
                className="text-xs text-danger hover:text-red-700 inline-flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
      {units.length === 0 && (
        <div className="py-12 border-2 border-dashed border-gray-100 rounded-xl text-center">
          <Ruler className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-medium">
            Belum ada satuan tersimpan.
          </p>
        </div>
      )}

      {isModalOpen && (
        <UnitFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          unit={selectedUnit}
          onSuccess={loadUnits}
        />
      )}
    </div>
  );
}

export function CategoriesPage() {
  const toast = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  const loadCategories = async () => {
    try {
      const data = await masterDataService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat kategori");
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenModal = (category?: Category) => {
    setSelectedCategory(category || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Hapus kategori "${name}" secara permanen?`)) return;
    try {
      await masterDataService.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success("Kategori berhasil dihapus");
    } catch (error: any) {
      console.error(error);
      toast.error(
        "Gagal menghapus kategori",
        error?.response?.data?.message || "Terjadi kesalahan sistem",
      );
    }
  };

  return (
    <div className="card p-6">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">
            Kategori Produk
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Kelompokkan produk mempermudah analisa penjualan.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-base bg-primary-600 text-white hover:bg-primary-700 flex items-center justify-center gap-1.5 px-3 py-2 text-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          Tambah Kategori
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center justify-between py-2.5 px-3 bg-gray-50 rounded-lg"
          >
            <div>
              <span className="text-sm text-gray-900">{cat.name}</span>
              {cat.description && (
                <p className="text-[11px] text-gray-500">{cat.description}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleOpenModal(cat)}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(cat.id, cat.name)}
                className="text-xs text-danger hover:text-red-700 inline-flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
      {categories.length === 0 && (
        <div className="py-12 border-2 border-dashed border-gray-100 rounded-xl text-center">
          <Tag className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-medium">
            Belum ada kategori tersimpan.
          </p>
        </div>
      )}

      {isModalOpen && (
        <CategoryFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          category={selectedCategory}
          onSuccess={loadCategories}
        />
      )}
    </div>
  );
}

export function ScannerSettingsPage() {
  return (
    <div className="card p-6 space-y-5">
      <h2 className="text-sm font-semibold text-gray-800 border-b border-gray-100 pb-2">
        Pengaturan Scanner Barcode
      </h2>
      <div className="space-y-4">
        <div>
          <label className="form-label font-medium block">
            Mode Input Otomatis (Append Enter)
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Jika diaktifkan, setelah melakukan scan, sistem akan otomatis
            melakukan pencarian tanpa harus menekan Enter (Berguna untuk scanner
            hardware dengan fitur "Carriage Return" / Suffix Enter).
          </p>
          <div className="flex items-center gap-2 mt-1">
            <input
              type="checkbox"
              className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
              defaultChecked
            />
            <span className="text-sm text-gray-700">Aktifkan Auto-Submit</span>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <label className="form-label font-medium block">
            Bunyi Bip Scanner (Software)
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Mainkan suara notifikasi kecil saat barang berhasil ditemukan
            melalui pemindaian manual.
          </p>
          <div className="flex items-center gap-2 mt-1">
            <input
              type="checkbox"
              className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
              defaultChecked
            />
            <span className="text-sm text-gray-700">Aktifkan Suara Beep</span>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <label className="form-label font-medium block">
            Format Cetak Default
          </label>
          <select className="input-base max-w-xs mt-1">
            <option value="50x30">Stiker 50x30 mm</option>
            <option value="40x25">Stiker 40x25 mm</option>
            <option value="A4">A4 (Grid)</option>
          </select>
        </div>
      </div>

      <div className="pt-4 flex">
        <button className="btn-base bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 px-4 py-2 text-sm ml-auto">
          Simpan Konfigurasi
        </button>
      </div>
    </div>
  );
}
