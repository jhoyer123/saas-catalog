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
    general: emptyGallery(),
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
    // PRIORIDAD 1: la imagen ya tiene firma visual (guardada por el módulo de
    // variantes). Se asigna directo a su galería, sin depender de variant_id.
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

    // PRIORIDAD 2: imagen general del producto (sin variante ni firma).
    if (!img.variant_id) {
      const existing = state.general.existing.find(
        (e) => e.url === img.image_url,
      );
      if (existing) {
        existing.ids.push(img.id);
      } else {
        state.general.existing.push({
          url: img.image_url,
          ids: [img.id],
          variantIds: [],
        });
      }
      continue;
    }

    // PRIORIDAD 3: imagen vieja referenciando una variante. Se resuelve la
    // firma desde esa variante; si la variante ya no existe -> huérfana.
    const sig = variantToSig.get(img.variant_id);

    if (sig === undefined) {
      const existing = state.orphaned.find((e) => e.url === img.image_url);
      if (existing) {
        existing.ids.push(img.id);
        existing.variantIds.push(img.variant_id);
      } else {
        state.orphaned.push({
          url: img.image_url,
          ids: [img.id],
          variantIds: [img.variant_id],
        });
      }
      continue;
    }

    const target =
      sig === null
        ? state.general
        : (state.bySignature[sig] ??= emptyGallery());
    const existing = target.existing.find((e) => e.url === img.image_url);
    if (existing) {
      existing.ids.push(img.id);
      existing.variantIds.push(img.variant_id);
    } else {
      target.existing.push({
        url: img.image_url,
        ids: [img.id],
        variantIds: [img.variant_id],
      });
    }
  }

  return state;
}
