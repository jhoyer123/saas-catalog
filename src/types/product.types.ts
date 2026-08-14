/**
 * Tipos relacionados con productos para el dashboard
 */
export interface ProductCatalog {
  id: string;
  slug: string;
  name: string;
  price: number;
  has_variants: boolean;
  is_offer: boolean;
  category_id: string;
  brand_id?: string | null;
  offer_price?: number | null; // si hay oferta tiene precio, si no null
  offer_start?: string | null; // fecha de inicio de la oferta (opcional)
  offer_end?: string | null; // fecha de fin de la oferta (opcional)
  sku?: string | null; // no todos los productos tienen SKU
  is_available: boolean;
  name_category: string; // nombre de la categoría para mostrar
  brand?: string | null; // no todos los productos tienen marca
  images: string[]; // array de URLs de imágenes
}

/**
 * Fila de product_images con todos los campos necesarios para
 * reconstruir las galerías por firma visual en el formulario.
 */
export interface ProductImageDetail {
  id: string;
  image_url: string;
  variant_id: string | null;
  visual_signature: string | null;
}

/**
 * Variante persistida (product_variants) con su combinación de valores.
 */
export interface ProductVariantDetail {
  id: string;
  price: number;
  sku: string | null;
  offer_price: number | null;
  is_available: boolean;
  variant_option_values: {
    option_type_id: string;
    option_value_id: string;
  }[];
}

/**
 * Atributo elegido por producto (product_option_types).
 */
export interface ProductOptionTypeDetail {
  option_type_id: string;
  is_visual: boolean;
}

/**
 * Tipo para detalle de producto en el dashboard (editable)
 */
export interface ProductDetail {
  id: string;
  category_id: string;
  slug?: string | null;
  brand_id?: string | null;
  has_variants: boolean;
  name: string;
  price: number;
  description: string;
  sku?: string | null; // no todos los productos tienen SKU
  images: string[]; // array de URLs de imágenes
  /** Filas completas de product_images (para galerías por firma visual). */
  image_details: ProductImageDetail[];
  product_option_types: ProductOptionTypeDetail[];
  product_variants: ProductVariantDetail[];
}

/**
 * Tipo para detalle de producto en el catálogo público
 */
export interface ProductDetailCatalog {
  id: string;
  name: string;
  description: string;
  price: number;
  has_variants: boolean;
  brand_id?: string | null;
  //store_id: string;
  category_id: string;
  is_offer: boolean;
  offer_price?: number | null;
  offer_start?: string | null;
  offer_end?: string | null;
  brand?: string | null;
  slug: string;
  is_available: boolean;
  images: string[];
}

//super type para el formulario
export interface ProductType {
  sku?: string;
  name: string;
  slug?: string;
  price: number;
  has_variants: boolean;
  description: string;
  brand?: string;
  category_id: string;

  // superset de ambos schemas
  images?: FileList | null;
  imageExisting?: string[];
  imageToDelete?: string[];
}

/**
 * type for offer product
 */
export interface ProductOffer {
  is_offer: boolean;
  offer_price: number | null;
  offer_start: string | null;
  offer_end: string | null;
}

/**
 * Tipo para mostrar en el catálogo público
 */
export interface ProductCatalogCard {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  is_available: boolean;
  //is_offer_active: boolean;
  is_offer: boolean;
  offer_price: number | null;
  offer_start: string | null;
  offer_end: string | null;
  brand?: string | null;
  slug: string;
  images: { image_url: string }[];
}
