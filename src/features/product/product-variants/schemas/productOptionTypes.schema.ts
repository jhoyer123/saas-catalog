import { z } from 'zod';

export const productOptionTypesSelectionSchema = z
  .array(
    z.object({
      optionTypeId: z.string().uuid(),
      isVisual: z.boolean(),
    })
  )
  .min(1);

export const productOptionTypesSelectionFormSchema = z.object({
  items: productOptionTypesSelectionSchema,
});

export type ProductOptionTypesSelection = z.infer<
  typeof productOptionTypesSelectionSchema
>;

export type ProductOptionTypesSelectionForm = z.infer<
  typeof productOptionTypesSelectionFormSchema
>;
