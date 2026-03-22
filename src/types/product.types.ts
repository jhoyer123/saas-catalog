export interface ProductCatalog {
  id: string;
  store_id: string;
  category_id: string;
  brand_id: string | null;
  name_category: string; // nombre de la categoría para mostrar
  name: string;
  price: number;
  description: string;
  is_available: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  is_offer: boolean;
  offer_price: number | null; // si hay oferta tiene precio, si no null
  offer_start?: string; // fecha de inicio de la oferta (opcional)
  offer_end?: string; // fecha de fin de la oferta (opcional)
  //isOfferActive?: boolean; // campo calculado para indicar si la oferta está activa
  is_offer_active?: boolean; // campo calculado para indicar si la oferta está activa,
  slug: string;
  sku: string | null; // no todos los productos tienen SKU
  brand: string | null; // no todos los productos tienen marca
  images: string[]; // array de URLs de imágenes
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
  description: string | null;
  price: number;
  is_offer_active: boolean;
  is_offer: boolean;
  offer_price: number | null;
  offer_start: string | null;
  offer_end: string | null;
  brand: string | null;
  slug: string;
  //categories: { name: string } | null;
  images: { image_url: string }[];
}
