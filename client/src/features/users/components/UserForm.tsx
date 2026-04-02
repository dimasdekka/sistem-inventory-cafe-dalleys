import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ROLE_LABELS } from "@/types";
import type { User, Role } from "@/types";

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User;
  onSubmit: (data: Partial<User>) => void;
}

export function UserForm({ isOpen, onClose, user, onSubmit }: UserFormProps) {
  const isEditing = !!user;

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: (user?.role || "Staff") as Role,
    password: "",
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: user?.name || "",
        email: user?.email || "",
        role: (user?.role || "Staff") as Role,
        password: "",
      });
    }
  }, [isOpen, user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData };
    if (!payload.password) delete (payload as any).password;
    onSubmit(payload);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Pengguna" : "Tambah Pengguna Baru"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
        <div>
          <label className="form-label">Nama Lengkap</label>
          <input
            autoFocus
            required
            className="input-base"
            placeholder="Misal: Budi Santoso"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            autoComplete="off"
          />
        </div>

        <div>
          <label className="form-label">Email</label>
          <input
            required
            type="email"
            className="input-base"
            placeholder="budi@example.com"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            autoComplete="new-password" // Using new-password trick to stop edge cases in Chrome autofill for emails
          />
        </div>

        <div>
          <label className="form-label">Role Akses</label>
          <select
            className="input-base"
            value={formData.role}
            onChange={(e) =>
              setFormData({ ...formData, role: e.target.value as Role })
            }
          >
            {Object.entries(ROLE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label">
            Password{" "}
            {isEditing && (
              <span className="font-normal text-gray-500">
                (Kosongkan jika tidak ingin diubah)
              </span>
            )}
          </label>
          <input
            type="password"
            className="input-base"
            required={!isEditing}
            placeholder={isEditing ? "••••••••" : "Min. 6 karakter"}
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            autoComplete="new-password"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit">
            {isEditing ? "Simpan Perubahan" : "Simpan Pengguna"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
