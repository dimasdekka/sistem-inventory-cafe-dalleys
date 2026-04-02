import { z } from "zod";

// ── Shared Zod schemas ─────────────────────────────────────────

export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export const idSchema = z.string().uuid("ID tidak valid");

export const phoneSchema = z
  .string()
  .regex(/^(\+62|62|0)[0-9]{8,13}$/, "Format nomor telepon tidak valid");

export const emailSchema = z.string().email("Format email tidak valid");

export const passwordSchema = z
  .string()
  .min(8, "Password minimal 8 karakter")
  .regex(/[A-Z]/, "Password harus mengandung huruf besar")
  .regex(/[0-9]/, "Password harus mengandung angka");

export const positiveNumberSchema = z
  .number()
  .positive("Nilai harus lebih dari 0");

export const nonNegativeNumberSchema = z
  .number()
  .min(0, "Nilai tidak boleh negatif");

export const dateSchema = z
  .string()
  .refine((val) => !isNaN(Date.parse(val)), "Format tanggal tidak valid");

export const skuSchema = z
  .string()
  .min(3, "SKU minimal 3 karakter")
  .max(20, "SKU maksimal 20 karakter")
  .regex(/^[A-Z0-9-]+$/, "SKU hanya boleh A-Z, 0-9, dan -");
