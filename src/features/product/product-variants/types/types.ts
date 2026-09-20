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
  bySignature: Record<string, GalleryState>;

  // Imágenes que perdieron su firma (variante borrada, o el regroup no
  // pudo asignarlas sin ambigüedad). Quedan acá separadas para que
  // el usuario decida (o se descarten a propósito).
  orphaned: ImageEntry[];

  // Borrados centralizados en un solo array plano.
  deletedIds: string[];
};

export const emptyGallery = (): GalleryState => ({
  existing: [],
  newFiles: [],
});
