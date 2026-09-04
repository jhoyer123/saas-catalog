import { ImagesState, emptyGallery } from "../types/types";
import { visualSignature, type ComboValue } from "./generateCombinations";
import type { ProductImageDetail } from "@/types/product.types";

type ProductForImages = {
  image_details?: ProductImageDetail[];
  product_variants?: {
    id: string;
    variant_option_values: {
      option_type_id: string;
      option_value_id: string;
    }[];
  }[];
};

export function buildInitialImagesState(
  product?: ProductForImages,
  visualTypeIds: string[] = [],
): ImagesState {
  const state: ImagesState = {
    bySignature: {},
    orphaned: [],
    deletedIds: [],
  };
  if (!product?.image_details) return state;

  // variant_id -> sigKey, para resolver imágenes viejas que referencian
  // directamente a una variante (visual_signature null pero variant_id set).
  const variantToSig = new Map<string, string | null>();
  product.product_variants?.forEach((v) => {
    const combo: ComboValue[] = v.variant_option_values.map((ov) => ({
      option_type_id: ov.option_type_id,
      option_value_id: ov.option_value_id,
    }));
    variantToSig.set(v.id, visualSignature(combo, visualTypeIds));
  });

  for (const img of product.image_details) {
    // Si la imagen ya tiene firma visual (guardada por el módulo de variantes).
    // Se asigna directo a su galería.
    if (img.visual_signature) {
      const target = (state.bySignature[img.visual_signature] ??= emptyGallery());
      const existing = target.existing.find((e) => e.url === img.image_url);
      if (existing) {
        existing.ids.push(img.id);
      } else {
        target.existing.push({
          url: img.image_url,
          ids: [img.id],
          variantIds: [],
        });
      }
      continue;
    }

    // Imagen sin visual_signature -> imagen general del producto.
    // Estas las maneja el schema Zod (product_images / product_existing_images).
    // No las tocamos acá.
  }

  return state;
}
