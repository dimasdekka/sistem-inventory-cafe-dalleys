// Application-wide constants

export const APP_NAME = "Dalley Inventory";
export const APP_VERSION = "2.0.0";

// API
// Default ke backend Go lokal (PORT=8080, prefix /api/v1).
// Bisa dioverride lewat VITE_API_URL saat build/deploy.
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:8080/api/v1";
export const API_TIMEOUT = 15_000; // ms

// Pagination
export const PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// Polling interval for notifications
export const NOTIFICATION_POLL_INTERVAL = 30_000; // 30 seconds

// Stock thresholds
export const STOCK_WARNING_MULTIPLIER = 1.5; // 150% of minimum = info alert
export const EXPIRY_WARNING_DAYS = 7; // days before expiry to show alert

// Upload limits
export const MAX_IMAGE_SIZE_MB = 2;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Barcode
export const BARCODE_FORMAT = "CODE128" as const;
export const DEFAULT_LABEL_SIZE = "50x30" as const;
