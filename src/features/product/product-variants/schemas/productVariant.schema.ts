import { z } from 'zod';

export const variantFormSchema = z.object({
  sku: z.string().trim().optional().nullable(),
  price: z.coerce.number().positive(),
  offer_price: z.coerce.number().positive().optional().nullable(),
  stock: z.coerce.number().int().min(0).default(0),
  is_available: z.boolean().default(true),
});

export const variantTableSchema = z.record(z.string(), variantFormSchema);

export const combinatorSelectionSchema = z
  .array(z.string().uuid())
  .min(1, 'Debe seleccionar al menos un valor por atributo');

export type VariantForm = z.infer<typeof variantFormSchema>;
export type VariantTableForm = z.infer<typeof variantTableSchema>;
