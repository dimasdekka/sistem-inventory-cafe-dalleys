import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import DOMPurify from "dompurify";
import { format, formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";

// ── Tailwind class merge helper ────────────────────────────────
// Install clsx + tailwind-merge if not already: added to deps
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Currency formatter ─────────────────────────────────────────
const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
});

export const formatCurrency = (amount: number): string =>
  currencyFormatter.format(amount);

export const formatCompactCurrency = (value: number): string => {
  if (value >= 1_000_000_000_000)
    return `Rp ${(value / 1_000_000_000_000).toFixed(1)}T`;
  if (value >= 1_000_000_000)
    return `Rp ${(value / 1_000_000_000).toFixed(1)}M`;
  if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)}Jt`;
  if (value >= 1_000) return `Rp ${(value / 1_000).toFixed(1)}Rb`;
  return `Rp ${value.toString()}`;
};

// ── Number formatter ───────────────────────────────────────────
export const formatNumber = (value: number): string =>
  new Intl.NumberFormat("id-ID").format(value);

// ── Date formatters ────────────────────────────────────────────
export const formatDate = (
  date: string | Date,
  fmt = "dd MMM yyyy",
): string => {
  try {
    return format(new Date(date), fmt, { locale: idLocale });
  } catch {
    return "-";
  }
};

export const formatDateTime = (date: string | Date): string =>
  formatDate(date, "dd MMM yyyy, HH:mm");

export const formatRelativeTime = (date: string | Date): string => {
  try {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: idLocale,
    });
  } catch {
    return "-";
  }
};

// ── HTML sanitizer (DOMPurify) ─────────────────────────────────
export const sanitizeHtml = (dirty: string): string =>
  DOMPurify.sanitize(dirty, { USE_PROFILES: { html: true } });

// ── Generate unique ID ─────────────────────────────────────────
export const generateId = (): string =>
  Math.random().toString(36).slice(2) + Date.now().toString(36);

// ── SKU generator ─────────────────────────────────────────────
export const generateSku = (categoryCode: string, sequence: number): string => {
  const seq = String(sequence).padStart(4, "0");
  return `${categoryCode.toUpperCase()}-${seq}`;
};

// ── Truncate text ─────────────────────────────────────────────
export const truncate = (text: string, maxLength: number): string =>
  text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;

// ── Debounce ─────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const debounce = <T extends (...args: any[]) => void>(
  fn: T,
  delay: number,
): ((...args: Parameters<T>) => void) => {
  let timer: ReturnType<typeof setTimeout>;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

// ── File size formatter ─────────────────────────────────────────
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};
