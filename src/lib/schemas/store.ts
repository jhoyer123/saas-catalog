import { z } from "zod";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const logoSchema = z
  .instanceof(File)
  .refine(
    (file) => file.size <= MAX_FILE_SIZE,
    "La imagen no puede superar 2MB",
  )
  .refine(
    (file) => ACCEPTED_TYPES.includes(file.type),
    "Solo se aceptan JPG, PNG o WEBP",
  );

export const storeSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional().nullable(),
  whatsapp_number: z
    .string()
    .min(8, "Número inválido")
    .max(8, "Número inválido"),
  logo: logoSchema.optional(),
  logo_url: z.string().optional().nullable(),
});

export type StoreForm = z.infer<typeof storeSchema>;
