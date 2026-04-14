import { z } from "zod";

const optionalUrlSchema = z
  .string()
  .trim()
  .max(500, "URL inválida")
  .refine((value) => value === "" || isValidUrl(value), "URL inválida");

function isValidUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export const branchSchema = z.object({
  name: z.string().trim().min(1, "El nombre de la sucursal es requerido"),
  address: z.string().trim().min(1, "La dirección es requerida"),
  phone: z.string().trim().min(8, "Número inválido").max(20, "Número inválido"),
});

export const settingsSchema = z.object({
  branches: z.array(branchSchema).min(1, "Agrega al menos una sucursal"),
});

export type BranchForm = z.infer<typeof branchSchema>;
export type SettingsForm = z.infer<typeof settingsSchema>;

export const socialSchema = z.object({
  facebook: optionalUrlSchema,
  instagram: optionalUrlSchema,
  tiktok: optionalUrlSchema,
  x: optionalUrlSchema,
});

export type SocialLinksForm = z.infer<typeof socialSchema>;
