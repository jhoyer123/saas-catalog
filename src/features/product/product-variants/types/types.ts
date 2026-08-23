export const NO_VISUAL_KEY = "__general__";
// corresponde a product_images.visual_signature === null en el schema:
// la galería compartida cuando NO hay ningún atributo marcado is_visual.

// ── Tipos de generación de combinaciones (usados por helpers puros y el save) ──

export interface VariantValueRef {
  optionTypeId: string;
  optionValueId: string;
}

export interface VariantCombination {
  values: VariantValueRef[];
  signature: string;
}

// Draft transaccional que consume `create_product_with_variants`:
// estructura plana lista para serializar en el payload del RPC.
export interface ProductVariantDraft {
  optionTypes: { optionTypeId: string; isVisual: boolean }[];
  variants: {
    sku: string | null;
    price: number;
    offerPrice: number | null;
    stock: number;
    isAvailable: boolean;
    optionValueIds: string[];
  }[];
}

export type ImageEntry = { url: string; ids: string[]; variantIds: string[] };

export type GalleryState = {
  existing: ImageEntry[];
  newFiles: File[];
};

export type ImagesState = {
  general: GalleryState; // signature "" -> compartida por variantes sin atributo visual
  bySignature: Record<string, GalleryState>;

  // NUEVO: imágenes que perdieron su firma (variante borrada, o el regroup no
  // pudo asignarlas sin ambigüedad). Antes esto cualquiera de estos dos casos
  // caía silenciosamente /*  */en `general`, mezclando "sin atributo visual"
  // (legítimo) con "sin dueño" (bug). Ahora quedan acá, separadas, para que
  // se puedan mostrar aparte y el usuario decida (o se descarten a propósito).
  orphaned: ImageEntry[];

  // NUEVO: borrados centralizados en un solo array plano, no repartido por
  // galería. Mismo criterio que ya usamos en ProductMediaSection para
  // imageToDelete: un solo lugar de verdad, sin necesidad de mergear N
  // arrays al submit.
  deletedIds: string[];
};

export const emptyGallery = (): GalleryState => ({
  existing: [],
  newFiles: [],
});
