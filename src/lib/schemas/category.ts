import { z } from "zod";

// Esquema para el formulario de crear
export const CategorySchema = z.object({
  name: z
    .string({ message: "El nombre es requerido" })
    .min(1, "El nombre es requerido")
    .max(255),
  description: z.string().max(500).optional(),
});

// Tipos TypeScript inferidos
export type CategoryForm = z.infer<typeof CategorySchema>;
