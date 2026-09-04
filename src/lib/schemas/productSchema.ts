import { z } from "zod";

// ── OPTION VALUE PAIR ─────────────────────────────────────
const optionValuePairSchema = z.object({
  option_type_id: z.string().min(1),
  option_value_id: z.string().min(1),
});

// ── VARIANTE ───────────────────────────────────────────────
export const variantSchema = z
  .object({
    _localId: z.string(), // uuid generado en cliente, para linkear imágenes antes de tener id real
    id: z.string().optional(), // presente solo en edit (variante existente)
    price: z.coerce.number().optional(),
    sku: z.string().optional(),
    offer_price: z
      .preprocess(
        (val) => (val === "" || val === undefined ? null : val),
        z.coerce.number().nullable(),
      )
      .optional(),
    is_available: z.boolean().default(true),
    option_values: z
      .array(optionValuePairSchema)
      .min(1, "La variante debe tener al menos un atributo seleccionado"),
    _removed: z.boolean().default(false).optional(),
  })
  .superRefine((val, ctx) => {
    // Si la variante FUE REMOVIDA, saltamos todas sus validaciones internas
    if (!val._removed) {
      // Validamos precio
      if (val.price === undefined || isNaN(val.price) || val.price < 0.01) {
        ctx.addIssue({
          code: "custom",
          path: ["price"],
          message: "El precio debe ser mayor a 0",
        });
      }
      // Validamos que el offer_price sea menor al price (si está definido)
      if (val.offer_price !== null && val.offer_price !== undefined) {
        if (val.price === undefined || val.offer_price >= val.price) {
          ctx.addIssue({
            code: "custom",
            path: ["offer_price"],
            message: "Debe ser menor al precio",
          });
        }
      }
      // Validamos option_values
      if (!val.option_values || val.option_values.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["option_values"],
          message: "La variante debe tener al menos un atributo seleccionado",
        });
      }
    }
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
  //description: z.string().min(1, "La descripción es obligatoria"),
  description: z
    .string({ error: "La descripción es obligatoria" })
    .min(1, "La descripción es obligatoria")
    .refine(
      (val) => {
        const textOnly = val
          .replace(/<[^>]*>?/gm, "")
          .replace(/&nbsp;/g, "")
          .trim();

        return textOnly.length > 0;
      },
      { error: "La descripción es obligatoria" },
    ),
  has_variants: z.boolean().default(false),
  price: z.coerce.number().min(0).nullable().optional(), // null permitido si has_variants
  option_types: z.array(productOptionTypeSchema).default([]),
  variants: z.array(variantSchema).default([]),

  // imagen(es) general del producto. Obligatoria solo si !has_variants (ver superRefine).
  product_images: z.array(z.instanceof(File)).default([]),
  product_existing_images: z.array(z.string()).default([]),

  // campo interno para trackear qué imágenes existentes se quieren borrar en edit. No se manda al backend, solo sirve para el form.
  imageToDelete: z.array(z.string()).default([]),
});

// ── SCHEMA FINAL (usado en create, edit y view) ─────────────
export const productFormSchema = productBaseSchema.superRefine((data, ctx) => {
  // La imagen general es obligatoria (mínimo 1).
  const totalProductImages =
    data.product_images.length + data.product_existing_images.length;
  if (totalProductImages === 0) {
    ctx.addIssue({
      code: "custom",
      path: ["product_images"],
      message: "Debes subir al menos 1 imagen del producto",
    });
  }

  if (!data.has_variants) {
    if (data.price === null || data.price === undefined || data.price <= 0) {
      ctx.addIssue({
        code: "custom",
        path: ["price"],
        message: "El precio debe ser mayor a 0",
      });
    }
    return;
  }

  // ==== A PARTIR DE AQUÍ: LÓGICA PARA PRODUCTOS CON VARIANTES ====

  // Filtramos para obtener SOLO las variantes que NO están removidas
  const activeVariants = data.variants.filter((v) => !v._removed);

  // condiciones para productos con variantes
  if (data.option_types.length === 0) {
    ctx.addIssue({
      code: "custom",
      path: ["option_types"],
      message:
        "Aún no agregaste atributos. Agregá al menos uno (ej: Talla o Color) para poder crear variantes.",
    });
  }

  //cada atributo seleccionado debe tener al menos un valor elegido en alguna variante
  data.option_types.forEach((ot) => {
    const hasValue = data.variants.some((v) =>
      v.option_values.some((ov) => ov.option_type_id === ot.option_type_id),
    );
    if (!hasValue) {
      ctx.addIssue({
        code: "custom",
        path: ["option_types"],
        message: `Debes seleccionar al menos un valor en cada atributo.`,
      });
    }
  });

  // Controlamos que haya al menos 1 variante "activa"
  if (activeVariants.length === 0) {
    ctx.addIssue({
      code: "custom",
      path: ["variants"],
      message: "Debe haber al menos una variante activa",
    });
    // Hacemos return prematuro porque las siguientes validaciones fallarían sin variantes activas
    return;
  }

  // cada variante debe tener al menos un atributo seleccionado (ver variantSchema)
  if (data.variants.length === 0) {
    console.log("superRefine: no hay variantes", data.variants.length);
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
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
export type ProductFormInput = z.input<typeof productFormSchema>;
export type ProductFormOutput = z.output<typeof productFormSchema>;
