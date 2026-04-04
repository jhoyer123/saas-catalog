/**
 * Tipos relacionados con productos para el dashboard
 */
export interface ProductCatalog {
  id: string;
  slug: string;
  name: string;
  price: number;
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
 * Tipo para detalle de producto en el dashboard (editable)
 */
export interface ProductDetail {
  id: string;
  category_id: string;
  slug?: string | null;
  brand_id?: string | null;
  name: string;
  price: number;
  description: string;
  sku?: string | null; // no todos los productos tienen SKU
  images: string[]; // array de URLs de imágenes
}

/**
 * Tipo para detalle de producto en el catálogo público
 */
export interface ProductDetailCatalog {
  id: string;
  name: string;
  description: string;
  price: number;
  brand_id?: string | null;
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
  is_offer_active: boolean;
  is_offer: boolean;
  offer_price: number | null;
  offer_start: string | null;
  offer_end: string | null;
  brand?: string | null;
  slug: string;
  images: { image_url: string }[];
}
