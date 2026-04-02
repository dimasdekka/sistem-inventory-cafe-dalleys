import { Eye, Pencil, Trash2, Power, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  title?: string;
  className?: string;
  children?: React.ReactNode;
}

function ActionBtn({
  onClick,
  disabled,
  isLoading,
  title,
  className,
  children,
}: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      title={title}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5",
        "text-xs font-medium transition-all duration-150",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        className,
      )}
    >
      {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : children}
    </button>
  );
}

/** Tombol "Detail / Lihat" */
export function ViewAction({ onClick, disabled, title = "Lihat Detail" }: ActionButtonProps) {
  return (
    <ActionBtn
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="text-primary-600 hover:bg-primary-50 hover:text-primary-700"
    >
      <Eye className="w-3.5 h-3.5" />
      <span>Detail</span>
    </ActionBtn>
  );
}

/** Tombol "Edit" */
export function EditAction({ onClick, disabled, title = "Edit" }: ActionButtonProps) {
  return (
    <ActionBtn
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="text-gray-600 hover:bg-gray-100 hover:text-gray-800"
    >
      <Pencil className="w-3.5 h-3.5" />
      <span>Edit</span>
    </ActionBtn>
  );
}

/** Tombol "Hapus" */
export function DeleteAction({
  onClick,
  disabled,
  isLoading,
  title = "Hapus",
}: ActionButtonProps) {
  return (
    <ActionBtn
      onClick={onClick}
      disabled={disabled}
      isLoading={isLoading}
      title={title}
      className="text-red-500 hover:bg-red-50 hover:text-red-700"
    >
      <Trash2 className="w-3.5 h-3.5" />
      <span>Hapus</span>
    </ActionBtn>
  );
}

/** Tombol "Aktifkan / Nonaktifkan" */
export function ToggleStatusAction({
  onClick,
  disabled,
  isLoading,
  isActive,
}: ActionButtonProps & { isActive: boolean }) {
  return (
    <ActionBtn
      onClick={onClick}
      disabled={disabled}
      isLoading={isLoading}
      title={isActive ? "Nonaktifkan" : "Aktifkan"}
      className={
        isActive
          ? "text-orange-500 hover:bg-orange-50 hover:text-orange-700"
          : "text-green-600 hover:bg-green-50 hover:text-green-700"
      }
    >
      <Power className="w-3.5 h-3.5" />
      <span>{isActive ? "Nonaktifkan" : "Aktifkan"}</span>
    </ActionBtn>
  );
}

/** Wrapper container untuk kumpulan tombol aksi */
export function ActionButtons({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-1",
        align === "right" && "justify-end",
      )}
    >
      {children}
    </div>
  );
}
