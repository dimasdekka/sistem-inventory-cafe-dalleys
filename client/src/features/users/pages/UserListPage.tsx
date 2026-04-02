import { useState, useEffect } from "react";
import {
  UserPlus,
  Activity,
  Clock,
  Shield,
  RotateCcw,
  Save,
  Check,
} from "lucide-react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  ActionButtons,
  EditAction,
  ToggleStatusAction,
} from "@/components/ui/ActionButtons";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { UserAvatar } from "@/features/auth/components/UserAvatar";
import { ROLE_LABELS } from "@/types";
import {
  PERMISSION_LABELS,
  PERMISSION_GROUPS,
} from "@/constants";
import { usersService, type ActivityLog } from "../users.service";
import { useNavigate } from "react-router-dom";
import { authService } from "@/features/auth/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { usePermissionsStore } from "@/store/permissions.store";
import { UserForm } from "../components/UserForm";
import type { User, Role, PermissionKey } from "@/types";
import { useToast } from "@/components/feedback/Toast";

type TabId = "users" | "logs" | "roles";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "users", label: "Daftar Pengguna", icon: UserPlus },
  { id: "logs", label: "Log Aktivitas", icon: Activity },
  { id: "roles", label: "Manajemen Role & Akses", icon: Shield },
];

const ROLE_ORDER: Role[] = ["Manager", "Admin", "Staff"];

const ROLE_BADGE_VARIANT: Record<Role, string> = {
  Owner: "primary",
  Manager: "info",
  Admin: "warning",
  Staff: "neutral",
};

// Role column config
const ROLE_COLUMNS: {
  role: Role | "Owner";
  label: string;
  color: string;
  bg: string;
  border: string;
  locked?: boolean;
}[] = [
  {
    role: "Owner",
    label: "Owner",
    color: "text-violet-700",
    bg: "bg-violet-50",
    border: "border-violet-200",
    locked: true,
  },
  {
    role: "Manager",
    label: "Manajer",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  {
    role: "Admin",
    label: "Admin",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  {
    role: "Staff",
    label: "Staff",
    color: "text-gray-700",
    bg: "bg-gray-50",
    border: "border-gray-200",
  },
];

// ─────────────────────────────────────────────────────────
// Permissions Matrix Tab
// ─────────────────────────────────────────────────────────
function PermissionsMatrix() {
  const toast = useToast();
  const { rolePermissions, updateRolePermissions, resetToDefaults } =
    usePermissionsStore();

  const [draft, setDraft] = useState<Record<Role, PermissionKey[]>>(() => ({
    Owner: [...rolePermissions.Owner],
    Manager: [...rolePermissions.Manager],
    Admin: [...rolePermissions.Admin],
    Staff: [...rolePermissions.Staff],
  }));

  const [isDirty, setIsDirty] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    setDraft({
      Owner: [...rolePermissions.Owner],
      Manager: [...rolePermissions.Manager],
      Admin: [...rolePermissions.Admin],
      Staff: [...rolePermissions.Staff],
    });
    setIsDirty(false);
  }, [rolePermissions]);

  const togglePermission = (role: Role, perm: PermissionKey) => {
    if (role === "Owner") return;
    setDraft((prev) => {
      const current = prev[role];
      const updated = current.includes(perm)
        ? current.filter((p) => p !== perm)
        : [...current, perm];
      return { ...prev, [role]: updated };
    });
    setIsDirty(true);
  };

  const handleSave = () => {
    ROLE_ORDER.forEach((role) => updateRolePermissions(role, draft[role]));
    setIsDirty(false);
    toast.success("Pengaturan akses disimpan", "Perubahan permission role sudah diterapkan.");
  };

  const handleReset = () => {
    resetToDefaults();
    setShowResetConfirm(false);
    toast.success("Reset berhasil", "Semua permission role telah dikembalikan ke default.");
  };

  return (
    <>
      <ConfirmModal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleReset}
        title="Reset ke Default?"
        description="Semua perubahan permission akan dikembalikan ke pengaturan bawaan sistem. Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Reset Sekarang"
        variant="danger"
      />

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary-500" />
            Matriks Hak Akses Role
          </h2>
          <p className="text-sm text-gray-500 mt-1 max-w-lg">
            Atur permission untuk setiap role. Klik toggle untuk mengaktifkan
            atau menonaktifkan akses.{" "}
            <span className="inline-flex items-center gap-1 font-semibold text-violet-600">
              Owner
            </span>{" "}
            selalu memiliki akses penuh dan tidak dapat diubah.
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button
            variant="outline"
            leftIcon={<RotateCcw className="w-4 h-4" />}
            onClick={() => setShowResetConfirm(true)}
          >
            Reset Default
          </Button>
          <Button
            leftIcon={<Save className="w-4 h-4" />}
            onClick={handleSave}
            disabled={!isDirty}
          >
            Simpan Perubahan
          </Button>
        </div>
      </div>

      {/* ── Dirty warning banner ── */}
      {isDirty && (
        <div className="mb-5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0 animate-pulse" />
          <span>
            Ada perubahan yang belum disimpan.{" "}
            <button
              type="button"
              onClick={handleSave}
              className="font-semibold underline underline-offset-2 hover:text-amber-900"
            >
              Simpan sekarang
            </button>
          </span>
        </div>
      )}

      {/* ── Role legend chips ── */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <span className="text-xs text-gray-400 font-medium mr-1">Role:</span>
        {ROLE_COLUMNS.map((col) => (
          <span
            key={col.role}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
              col.bg
            } ${col.color} ${col.border}`}
          >
            {col.locked && <span className="text-[10px]">🔒</span>}
            {col.label}
          </span>
        ))}
      </div>

      {/* ── Permission groups ── */}
      <div className="space-y-6">
        {/* Sticky Master Header for Roles */}
        <div className="sticky top-0 z-20 bg-gray-50/95 backdrop-blur-sm shadow-sm border-b border-gray-200 mt-2 rounded-t-xl overflow-hidden">
          <table className="w-full text-left table-fixed min-w-[640px]">
            <thead>
              <tr>
                <th className="w-[40%] px-5 py-3.5 text-xs font-bold text-gray-800 uppercase tracking-widest bg-gray-100">
                  Grup Modul & Akses
                </th>
                {ROLE_COLUMNS.map((col) => (
                  <th key={col.role} className="w-[15%] px-2 py-3.5 text-center bg-white border-l border-gray-100">
                    <div
                      title={col.locked ? "Owner memiliki akses penuh" : ""}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border shadow-sm ${col.bg} ${col.color} ${col.border}`}
                    >
                      {col.label}
                      {col.locked && <span className="opacity-70 ml-0.5">🔒</span>}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
          </table>
        </div>

        {/* Separated Group Cards */}
        <div className="space-y-5">
          {PERMISSION_GROUPS.map((group) => (
            <div key={group.label} className="card shadow-md overflow-hidden border border-gray-200">
              {/* Distinct Group Header */}
              <div className="bg-slate-800 px-5 py-3.5 border-b border-gray-200">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-primary-500 rounded-full" />
                  {group.label}
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left table-fixed min-w-[640px]">
                  <tbody className="divide-y divide-gray-100">
                    {/* Permission Rows */}
                    {group.permissions.map((perm, idx) => (
                      <tr
                        key={perm}
                        className={`hover:bg-primary-50/40 transition-colors ${
                          idx % 2 === 1 ? "bg-slate-50/40" : "bg-white"
                        }`}
                      >
                        <td className="w-[40%] px-5 py-4 align-middle border-r border-gray-50">
                          <p className="text-sm font-semibold text-gray-800 leading-none">
                            {PERMISSION_LABELS[perm]}
                          </p>
                          {/* Raw permission string has been removed per request */}
                        </td>

                        {/* Toggle cells */}
                        {ROLE_COLUMNS.map((col) => {
                          const checked = draft[col.role as Role]?.includes(perm) ?? false;
                          return (
                            <td key={col.role} className="w-[15%] px-5 py-4 align-middle text-center border-r border-gray-50 last:border-none">
                              <div className="flex justify-center">
                                <PermissionToggle
                                  checked={checked}
                                  locked={!!col.locked}
                                  onChange={() => togglePermission(col.role as Role, perm)}
                                />
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-5 text-xs text-gray-400 text-center">
        ⓘ Perubahan disimpan secara lokal di perangkat ini dan langsung berlaku
        untuk semua pengguna dengan role tersebut.
      </p>
    </>
  );
}

// ── Modern pill toggle ──────────────────────────────────
function PermissionToggle({
  checked,
  locked = false,
  onChange,
}: {
  checked: boolean;
  locked?: boolean;
  onChange: () => void;
}) {
  if (locked) {
    // Owner: always-on, displayed as a static filled pill
    return (
      <div
        className="w-11 h-6 rounded-full bg-violet-500 flex items-center justify-end pr-0.5 cursor-not-allowed opacity-75"
        title="Owner selalu memiliki akses penuh"
      >
        <span className="w-5 h-5 rounded-full bg-white shadow-sm flex items-center justify-center">
          <Check className="w-3 h-3 text-violet-500" strokeWidth={3} />
        </span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onChange}
      className={`
        relative w-11 h-6 rounded-full transition-all duration-200 focus:outline-none
        focus:ring-2 focus:ring-offset-1 focus:ring-primary-400
        ${checked ? "bg-primary-500" : "bg-gray-200 hover:bg-gray-300"}
      `}
    >
      <span
        className={`
          absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md
          transition-all duration-200 flex items-center justify-center
          ${checked ? "left-[22px]" : "left-0.5"}
        `}
      >
        {checked && (
          <Check className="w-3 h-3 text-primary-500" strokeWidth={3} />
        )}
      </span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────
// Activity Log format
// ─────────────────────────────────────────────────────────
function formatActionLabel(action: string) {
  const mapping: Record<string, { label: string; variant: any }> = {
    LOGIN: { label: "Login", variant: "info" },
    CHANGE_PASSWORD: { label: "Ubah Password", variant: "neutral" },
    CREATE_PURCHASE_ORDER: { label: "Buat PO", variant: "primary" },
    UPDATE_PURCHASE_ORDER: { label: "Edit PO", variant: "warning" },
    UPDATE_PO_STATUS: { label: "Update Status PO", variant: "info" },
    STOCK_IN: { label: "Stok Masuk", variant: "success" },
    STOCK_OUT: { label: "Stok Keluar", variant: "danger" },
    STOCK_ADJUSTMENT: { label: "Penyesuaian Stok", variant: "warning" },
    STOCK_OPNAME: { label: "Opname Stok", variant: "info" },
    CREATE_PRODUCT: { label: "Tambah Produk", variant: "primary" },
    UPDATE_PRODUCT: { label: "Edit Produk", variant: "warning" },
    DELETE_PRODUCT: { label: "Hapus Produk", variant: "danger" },
  };
  return mapping[action] || { label: action, variant: "neutral" };
}

// ─────────────────────────────────────────────────────────
// Main UserListPage
// ─────────────────────────────────────────────────────────
export function UserListPage() {
  const { user: currentUser } = useAuthStore();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<TabId>("users");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [confirmToggle, setConfirmToggle] = useState<User | null>(null);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  const canManageRoles = currentUser?.role === "Owner";

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await usersService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      setIsLoadingLogs(true);
      const data = await usersService.getActivityLogs(20);
      setLogs(data);
    } catch (error) {
      console.error("Failed to fetch activity logs:", error);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchLogs();
  }, []);

  const handleOpenForm = (user?: User) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedUser(undefined);
  };

  const handleSubmitUser = async (data: Partial<User>) => {
    try {
      if (selectedUser) {
        await usersService.updateUser(selectedUser.id, data as any);
        toast.success("Pengguna diperbarui", "Data pengguna berhasil disimpan.");
      } else {
        await usersService.createUser(data as any);
        toast.success("Pengguna ditambahkan", "Pengguna baru berhasil dibuat.");
      }
      handleCloseForm();
      fetchUsers();
      fetchLogs();
    } catch (error: any) {
      console.error(error);
      toast.error(
        "Gagal menyimpan pengguna",
        error?.response?.data?.message || "Pastikan email belum digunakan dan data valid.",
      );
    }
  };

  const handleToggleStatus = async () => {
    if (!confirmToggle) return;
    try {
      setIsTogglingStatus(true);
      await usersService.updateUser(confirmToggle.id, {
        is_active: !confirmToggle.isActive,
      });
      toast.success("Status diperbarui", `Pengguna kini ${!confirmToggle.isActive ? "aktif" : "nonaktif"}.`);
      fetchUsers();
    } catch (error: any) {
      console.error(error);
      toast.error(
        "Gagal mengubah status",
        error?.response?.data?.message || "Terjadi kesalahan pada sistem.",
      );
    } finally {
      setIsTogglingStatus(false);
      setConfirmToggle(null);
    }
  };

  // Filter tabs based on permissions
  const visibleTabs = TABS.filter(
    (t) => t.id !== "roles" || canManageRoles,
  );

  return (
    <>
      <ConfirmModal
        isOpen={!!confirmToggle}
        onClose={() => setConfirmToggle(null)}
        onConfirm={handleToggleStatus}
        title={
          confirmToggle?.isActive
            ? "Nonaktifkan Pengguna?"
            : "Aktifkan Pengguna?"
        }
        description={`Pengguna "${confirmToggle?.name}" akan ${confirmToggle?.isActive ? "dinonaktifkan" : "diaktifkan"}.`}
        confirmLabel={confirmToggle?.isActive ? "Nonaktifkan" : "Aktifkan"}
        variant={confirmToggle?.isActive ? "danger" : "warning"}
        isLoading={isTogglingStatus}
      />

      <PageWrapper
        title="Manajemen Pengguna"
        description="Kelola akun, hak akses, dan aktivitas pengguna di sistem"
        actions={
          activeTab === "users" ? (
            <Button
              leftIcon={<UserPlus className="w-4 h-4" />}
              onClick={() => handleOpenForm()}
            >
              Tambah Pengguna
            </Button>
          ) : null
        }
      >
        {/* ── Tab Navigation ────────────────────── */}
        <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${
                    isActive
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Tab: Daftar Pengguna ──────────────── */}
        {activeTab === "users" && (
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Pengguna", "Role", "Status", "Login Terakhir", "Aksi"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      Memuat data pengguna...
                    </td>
                  </tr>
                ) : (users?.length ?? 0) === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      Tidak ada data pengguna
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <UserAvatar user={user as any} size="sm" showLabel />
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            ROLE_BADGE_VARIANT[user.role] as any ?? "neutral"
                          }
                        >
                          {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] ||
                            user.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={user.isActive ? "success" : "neutral"}
                          dot
                        >
                          {user.isActive ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">—</td>
                      <td className="px-4 py-3">
                        <ActionButtons>
                          <EditAction onClick={() => handleOpenForm(user)} />
                          <ToggleStatusAction
                            isActive={!!user.isActive}
                            onClick={() => setConfirmToggle(user)}
                          />
                        </ActionButtons>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Tab: Log Aktivitas ────────────────── */}
        {activeTab === "logs" && (
          <div className="card overflow-hidden">
            <div className="max-h-[560px] overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 z-10 bg-gray-50 border-b border-gray-100 shadow-sm">
                  <tr>
                    {["Waktu", "Pengguna", "Aksi", "Detail"].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {isLoadingLogs ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        Memuat log aktivitas...
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        Belum ada log aktivitas tercatat
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => {
                      const actionInfo = formatActionLabel(log.action);
                      return (
                        <tr key={log.id} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(log.created_at).toLocaleString("id-ID", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {log.user_name}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={actionInfo.variant}>
                              {actionInfo.label}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {log.detail}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Tab: Manajemen Role & Akses ───────── */}
        {activeTab === "roles" && canManageRoles && <PermissionsMatrix />}

        <UserForm
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          user={selectedUser}
          onSubmit={handleSubmitUser}
        />
      </PageWrapper>
    </>
  );
}

// ─────────────────────────────────────────────────────────
// ProfilePage (unchanged)
// ─────────────────────────────────────────────────────────
export function ProfilePage() {
  const { user, fetchProfile } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    oldPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name,
        email: user.email,
      }));
    }
  }, [user]);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (formData.oldPassword && formData.newPassword) {
        await authService.changePassword({
          old_password: formData.oldPassword,
          new_password: formData.newPassword,
        });
        toast.success("Password berhasil diubah!");
        setFormData((prev) => ({ ...prev, oldPassword: "", newPassword: "" }));
      }

      // Update basic info
      await usersService.updateUser(user.id, {
        name: formData.name,
        email: formData.email,
      });

      if (avatarFile) {
        await authService.uploadAvatar(avatarFile);
      }

      await fetchProfile();

      if (!formData.oldPassword) {
        toast.success("Profil berhasil diperbarui");
      }

      navigate(-1);
    } catch (error: any) {
      toast.error(
        "Gagal menyimpan",
        error?.response?.data?.message || error.message || "Terjadi kesalahan",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageWrapper title="Profil Saya" description="Kelola informasi akun Anda">
      <div className="max-w-xl">
        <form onSubmit={handleSubmit} className="card p-6 space-y-5">
          <div className="flex items-center gap-6 mb-2">
            <ImageUploader
              variant="avatar"
              currentImageUrl={user.avatar_url}
              onFileSelected={(file) => setAvatarFile(file)}
              onRemove={() => setAvatarFile(null)}
            />
            <div>
              <h2 className="font-bold text-gray-900 text-xl">{user.name}</h2>
              <p className="text-gray-500 mb-2">{user.email}</p>
              <Badge variant="primary" className="mt-1">
                {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] ||
                  user.role}
              </Badge>
            </div>
          </div>
          <hr className="border-gray-100" />

          <div className="space-y-4">
            <div>
              <label className="form-label font-medium">Nama Lengkap</label>
              <input
                className="input-base"
                value={formData.name}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, name: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <label className="form-label font-medium">Email</label>
              <input
                className="input-base"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, email: e.target.value }))
                }
                required
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 space-y-4">
            <h3 className="text-sm font-semibold text-gray-800">
              Ubah Password
            </h3>
            <p className="text-xs text-gray-400 -mt-3 mb-2">
              Kosongkan jika tidak ingin mengubah password.
            </p>

            <div>
              <label className="form-label font-medium">Password Lama</label>
              <input
                className="input-base"
                type="password"
                placeholder="••••••••"
                value={formData.oldPassword}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, oldPassword: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="form-label font-medium">Password Baru</label>
              <input
                className="input-base"
                type="password"
                placeholder="Minimal 6 karakter"
                value={formData.newPassword}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, newPassword: e.target.value }))
                }
                minLength={6}
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" isLoading={isSubmitting}>
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </div>
    </PageWrapper>
  );
}
