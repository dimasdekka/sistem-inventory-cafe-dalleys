import { useRef, useState } from "react";
import { UploadCloud, X, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  label?: string;
  currentImageUrl?: string | null;
  onFileSelected: (file: File) => void;
  onRemove?: () => void;
  variant?: "product" | "avatar";
  maxSizeMB?: number;
  className?: string;
}

export function ImageUploader({
  label = "Unggah Gambar",
  currentImageUrl,
  onFileSelected,
  onRemove,
  variant = "product",
  maxSizeMB = 2,
  className,
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl ?? null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar (PNG/JPG)");
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Ukuran gambar maksimal ${maxSizeMB}MB`);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    onFileSelected(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onRemove?.();
  };

  // ── Avatar Variant ────────────────────────────────────────────────────────
  if (variant === "avatar") {
    return (
      <div className={cn("flex flex-col items-center gap-3", className)}>
        <div
          className="relative w-24 h-24 rounded-full cursor-pointer group"
          onClick={() => fileInputRef.current?.click()}
        >
          {preview ? (
            <img
              src={preview}
              alt="Avatar"
              className="w-full h-full rounded-full object-cover border-4 border-white shadow-md"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-primary-100 flex items-center justify-center border-4 border-white shadow-md">
              <Camera className="w-8 h-8 text-primary-400" />
            </div>
          )}
          {/* overlay on hover */}
          <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Camera className="w-6 h-6 text-white" />
          </div>
          {preview && onRemove && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-sm hover:bg-red-600 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500">Klik untuk mengganti foto profil</p>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleChange}
        />
      </div>
    );
  }

  // ── Product Variant ───────────────────────────────────────────────────────
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <p className="text-sm font-medium text-gray-700">{label}</p>
      )}
      <div
        className={cn(
          "border-2 border-dashed rounded-xl bg-gray-50 flex flex-col items-center justify-center text-center cursor-pointer transition-colors relative overflow-hidden min-h-[180px]",
          isDragging
            ? "border-primary-400 bg-primary-50"
            : "border-gray-200 hover:border-primary-300 hover:bg-gray-100",
        )}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt="Preview"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <p className="text-white text-sm font-medium drop-shadow">Klik untuk ganti gambar</p>
            </div>
            {onRemove && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow hover:bg-red-600 transition-colors z-10"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </>
        ) : (
          <div className="p-6 flex flex-col items-center">
            <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3">
              <UploadCloud className="w-6 h-6 text-primary-500" />
            </div>
            <p className="text-sm font-medium text-gray-800">
              {isDragging ? "Lepaskan untuk mengunggah" : "Pilih atau seret gambar"}
            </p>
            <p className="text-xs text-gray-500 mt-1">PNG, JPG (Maks. {maxSizeMB}MB)</p>
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleChange}
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
