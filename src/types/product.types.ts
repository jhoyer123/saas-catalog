export interface Product {
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