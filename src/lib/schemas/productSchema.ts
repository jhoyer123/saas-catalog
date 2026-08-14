import { z } from "zod";

// ── OPTION VALUE PAIR ─────────────────────────────────────
const optionValuePairSchema = z.object({
  option_type_id: z.string().min(1),
  option_value_id: z.string().min(1),
});

// ── VARIANTE ───────────────────────────────────────────────
export const variantSchema = z.object({
  _localId: z.string(), // uuid generado en cliente, para linkear imágenes antes de tener id real
  id: z.string().optional(), // presente solo en edit (variante existente)
  price: z.coerce
    .number({ message: "El precio es obligatorio" })
    .min(0.01, "El precio debe ser mayor a 0"),
  sku: z.string().optional(),
  offer_price: z.coerce.number().optional().nullable(),
  is_available: z.boolean().default(true),
  option_values: z
    .array(optionValuePairSchema)
    .min(1, "La variante debe tener al menos un atributo seleccionado"),
  _removed: z.boolean().default(false).optional(),
});

// ── ATRIBUTOS DEL PRODUCTO (option_types elegidos) ─────────
const productOptionTypeSchema = z.object({
  option_type_id: z.string().min(1),
  is_visual: z.boolean().default(false),
});

// NOTA: la galería de imágenes por firma visual (variant_galleries) vivía acá
// antes, pero se sacó del schema. Esa data la maneja `imagesApi`
// (useVariantImages), que es estado externo a React Hook Form/Zod — no tiene
// sentido declarar un campo que el form nunca llena. La validación de
// "cada firma visual en uso necesita >=1 imagen" ahora se hace a mano en
// FormProduct.handleSubmit, leyendo imagesApi.state directamente, DESPUÉS de
// que Zod ya validó el resto (ver Opción B, decisión tomada con el usuario).

// ── PRODUCTO BASE ───────────────────────────────────────────
const productBaseSchema = z.object({
  name: z.string().min(1, "El nombre del producto es obligatorio"),
  sku: z.string().optional(),
  slug: z.string().optional(),
  brand_id: z.string().optional(),
  category_id: z.string().min(1, "La categoría es obligatoria"),
  description: z.string().min(1, "La descripción es obligatoria"),
  has_variants: z.boolean().default(false),
  price: z.coerce.number().min(0).nullable().optional(), // null permitido si has_variants
  option_types: z.array(productOptionTypeSchema).default([]),
  variants: z.array(variantSchema).default([]),

  // NUEVO: imagen(es) general del producto. Obligatoria solo si !has_variants (ver superRefine).
  product_images: z.array(z.instanceof(File)).default([]),
  product_existing_images: z.array(z.string()).default([]),

  // NUEVO: urls existentes (de producto y/o de galerías de variantes) marcadas
  // para borrar en el back al guardar. En el submit se combina lo que junta
  // ProductMediaSection acá con imagesApi.state.deletedIds (ver FormProduct).
  imageToDelete: z.array(z.string()).default([]),
});

// ── SCHEMA FINAL (usado en create, edit y view) ─────────────
export const productFormSchema = productBaseSchema.superRefine((data, ctx) => {
  if (!data.has_variants) {
    if (data.price === null || data.price === undefined || data.price <= 0) {
      ctx.addIssue({
        code: "custom",
        path: ["price"],
        message: "El precio debe ser mayor a 0",
      });
    }

    // NUEVO: sin variantes, la imagen general es obligatoria (mínimo 1).
    const totalProductImages =
      data.product_images.length + data.product_existing_images.length;
    if (totalProductImages === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["product_images"],
        message: "Debes subir al menos 1 imagen del producto",
      });
    }

    return;
  }

  // has_variants === true ?
  if (data.option_types.length === 0) {
    ctx.addIssue({
      code: "custom",
      path: ["option_types"],
      message: "Debe definir al menos un atributo (ej: Talla, Color)",
    });
  }

  if (data.variants.length === 0) {
    ctx.addIssue({
      code: "custom",
      path: ["variants"],
      message: "Debe agregar al menos una variante",
    });
    return;
  }

  // cada variante debe tener valor para cada option_type definido
  data.variants.forEach((variant, i) => {
    data.option_types.forEach((ot) => {
      const has = variant.option_values.some(
        (ov) => ov.option_type_id === ot.option_type_id,
      );
      if (!has) {
        ctx.addIssue({
          code: "custom",
          path: ["variants", i, "option_values"],
          message: "Faltan atributos por seleccionar en esta variante",
        });
      }
    });
  });

  // no permitir option_signature duplicada (misma combinación 2 veces)
  const signatures = data.variants.map((v) =>
    [...v.option_values]
      .sort((a, b) => a.option_type_id.localeCompare(b.option_type_id))
      .map((ov) => ov.option_value_id)
      .join("|"),
  );

  const dupIndex = signatures.findIndex(
    (sig, i) => signatures.indexOf(sig) !== i,
  );

  if (dupIndex !== -1) {
    ctx.addIssue({
      code: "custom",
      path: ["variants", dupIndex],
      message: "Ya existe una variante con esta misma combinación de atributos",
    });
  }

  // NOTA: acá antes había una validación de "cada firma visual necesita >=1
  // imagen" contra `variant_galleries`. Se sacó del schema junto con ese
  // campo — ver la nota arriba de productBaseSchema. Esa validación ahora
  // vive en FormProduct.handleSubmit, después de este superRefine, leyendo
  // imagesApi.state (que es donde realmente vive esa data).
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
export type ProductFormInput = z.input<typeof productFormSchema>;
export type ProductFormOutput = z.output<typeof productFormSchema>;
