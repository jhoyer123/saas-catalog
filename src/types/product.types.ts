/* export interface Product {
  id: string;
  store_id: string;
  category_id: string;
  name: string;
  price: number;
  description: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  is_offer: boolean;
  offer_price?: number;
  slug: string;
  brand?: string;
  sku?: string;
  images: string[];
} */

// types/product.ts

export interface ProductCatalog {
  id: string;
  store_id: string;
  category_id: string;
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
  slug: string;
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
