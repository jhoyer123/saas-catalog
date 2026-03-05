// lib/schemas/product.ts
import { z } from "zod";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_FILES = 10;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

// ============================================
// SCHEMA BASE
// ============================================

const productBaseSchema = z.object({
  name: z.string().min(1, "El nombre del producto es obligatorio"),
  sku: z.string().optional(),
  slug: z.string().optional(),
  brand: z.string().optional(),
  price: z.coerce
    .number({ message: "El precio es obligatorio" })
    .min(0.01, "El precio debe ser mayor a 0"),
  description: z
    .string({ message: "La descripción es obligatoria" })
    .min(1, "La descripción es obligatoria"),
  category_id: z
    .string({ message: "La categoría es obligatoria" })
    .min(1, "La categoría es obligatoria"),
});

// ============================================
// HELPER PARA IMAGES
// ============================================

const createImageFileListSchema = (isRequired: boolean) => {
  // ✅ Solución para Next.js: FileList solo existe en el browser
  // Usamos z.any() y validamos manualmente
  let schema = z.custom<FileList>(
    (val) => {
      // En el servidor, permitir cualquier valor (la validación real pasa en el cliente)
      if (typeof window === "undefined") return true;
      // En el cliente, validar que sea FileList
      return val instanceof FileList;
    },
    { message: "Debes seleccionar al menos una imagen" },
  );

  if (isRequired) {
    schema = schema.refine(
      (files) => {
        if (typeof window === "undefined") return true;
        return files.length > 0;
      },
      { message: "Se requiere al menos una imagen" },
    );
  }

  return schema
    .refine(
      (files) => {
        if (typeof window === "undefined") return true;
        return files.length <= MAX_FILES;
      },
      { message: `Máximo ${MAX_FILES} imágenes permitidas` },
    )
    .refine(
      (files) => {
        if (typeof window === "undefined") return true;
        return Array.from(files).every((file) =>
          ACCEPTED_IMAGE_TYPES.includes(file.type),
        );
      },
      { message: "Solo se permiten imágenes (JPG, PNG, WebP)" },
    )
    .refine(
      (files) => {
        if (typeof window === "undefined") return true;
        return Array.from(files).every((file) => file.size <= MAX_FILE_SIZE);
      },
      {
        message: `Cada imagen debe pesar menos de ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
      },
    );
};

// ============================================
// SCHEMAS
// ============================================

export const productFormSchema = productBaseSchema.extend({
  images: createImageFileListSchema(true),
});

export const productFormSchemaUpdate = productBaseSchema
  .extend({
    images: createImageFileListSchema(false).nullable().optional(),
    imageExisting: z.array(z.string()).optional(),
    imageToDelete: z.array(z.string()).optional(),
  })
  .superRefine((data, ctx) => {
    // Solo validar en el cliente
    if (typeof window === "undefined") return;

    const newCount = data.images?.length ?? 0;
    const existingCount = data.imageExisting?.length ?? 0;
    const total = newCount + existingCount;

    if (total === 0) {
      ctx.addIssue({
        path: ["images"],
        message: "Debes tener al menos una imagen",
        code: "custom",
      });
    }

    if (total > MAX_FILES) {
      ctx.addIssue({
        path: ["images"],
        message: `El total de imágenes no puede superar ${MAX_FILES}`,
        code: "custom",
      });
    }
  });

// ============================================
// TYPES
// ============================================

export type ProductFormInput = z.infer<typeof productFormSchema>;

export type ProductInputService = Omit<ProductFormInput, "images"> & {
  images: File[];
};

export type ProductFormInputUpdate = z.infer<typeof productFormSchemaUpdate>;

export type ProductInputServiceUpdate = Omit<
  ProductFormInputUpdate,
  "images"
> & {
  images?: File[];
  imageExisting?: string[];
  imageToDelete?: string[];
};

// Este esquema se usa SOLO al activar la oferta.
// Al desactivar no necesitamos validar nada (solo mandamos is_offer: false).
export const offerSchema = z
  .object({
    is_offer: z.boolean(),

    offer_price: z
      .number({ message: "El precio de oferta es obligatorio" })
      .min(0.01, "El precio debe ser mayor a 0")
      .optional(),

    offer_start: z.string().optional(),
    offer_end: z.string().optional(),
  })
  // Solo validamos precio y fechas si is_offer = true
  .superRefine((data, ctx) => {
    if (!data.is_offer) return; // desactivando → sin validaciones

    // precio obligatorio
    if (!data.offer_price) {
      ctx.addIssue({
        code: "custom",
        message: "El precio de oferta es obligatorio.",
        path: ["offer_price"],
      });
    }

    // fecha inicio obligatoria
    if (!data.offer_start) {
      ctx.addIssue({
        code: "custom",
        message: "La fecha de inicio es obligatoria.",
        path: ["offer_start"],
      });
    }

    // fecha fin obligatoria
    if (!data.offer_end) {
      ctx.addIssue({
        code: "custom",
        message: "La fecha de fin es obligatoria.",
        path: ["offer_end"],
      });
    }

    // offer_end posterior a offer_start
    if (data.offer_start && data.offer_end) {
      if (new Date(data.offer_end) <= new Date(data.offer_start)) {
        ctx.addIssue({
          code: "custom",
          message: "La fecha de fin debe ser posterior a la de inicio.",
          path: ["offer_end"],
        });
      }
    }

    // offer_end en el futuro
    if (data.offer_end && new Date(data.offer_end) <= new Date()) {
      ctx.addIssue({
        code: "custom",
        message: "La fecha de fin debe ser en el futuro.",
        path: ["offer_end"],
      });
    }

    // offer_start no puede ser en el pasado (tolerancia de 10 minutos)
    if (data.offer_start) {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      if (new Date(data.offer_start) < tenMinutesAgo) {
        ctx.addIssue({
          code: "custom",
          message: "La fecha de inicio no puede ser en el pasado.",
          path: ["offer_start"],
        });
      }
    }
  });

export type OfferFormValues = z.infer<typeof offerSchema>;
