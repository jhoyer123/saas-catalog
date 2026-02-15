import { z } from "zod";

// Esquema para insertar una nueva categoría (después de subir la imagen)
export const CategorySchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(255),
  slug: z.string().min(1, "El slug es requerido").max(255),
  image_url: z.string().url("Debe ser una URL válida").nullable().optional(),
  display_order: z.number().int().nullable().optional(),
});

// Esquema para el formulario de crear (con el archivo)
export const CategoryFormSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(255),
  slug: z.string().min(1, "El slug es requerido").max(255),
  image: z
    .instanceof(File)
    .refine((file) => file.size <= 2 * 1024 * 1024, {
      message: "La imagen debe ser menor a 2MB",
    })
    .refine(
      (file) =>
        ["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(
          file.type,
        ),
      {
        message: "Solo se permiten imágenes JPG, PNG o WebP",
      },
    )
    .nullable()
    .optional(),
});

// Esquema para actualizar en la DB (con URL)
export const updateCategorySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  slug: z.string().min(1).max(255).optional(),
  image_url: z.string().url("Debe ser una URL válida").nullable().optional(),
  display_order: z.number().int().nullable().optional(),
});

// Esquema para el formulario de actualización (con archivo opcional)
export const updateCategoryFormSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  slug: z.string().min(1).max(255).optional(),
  image: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: "La imagen debe ser menor a 5MB",
    })
    .refine(
      (file) =>
        ["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(
          file.type,
        ),
      {
        message: "Solo se permiten imágenes JPG, PNG o WebP",
      },
    )
    .optional() // Solo opcional, NO nullable - si no hay archivo, simplemente no viene
    .or(z.literal(null)), // Permite null explícito si quieren eliminar la imagen
  display_order: z.number().int().nullable().optional(),
});

// Tipos TypeScript inferidos
export type InsertCategory = z.infer<typeof CategorySchema>;
export type CategoryForm = z.infer<typeof CategoryFormSchema>;
export type UpdateCategory = z.infer<typeof updateCategorySchema>;
export type UpdateCategoryForm = z.infer<typeof updateCategoryFormSchema>;
