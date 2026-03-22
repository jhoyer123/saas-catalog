import { z } from "zod";

// Esquema para el formulario de crear/editar marca
export const BrandSchema = z.object({
  name: z
    .string({ message: "El nombre es requerido" })
    .min(1, "El nombre es requerido")
    .max(255),
});

export type BrandForm = z.infer<typeof BrandSchema>;