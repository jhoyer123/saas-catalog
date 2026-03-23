// category que devuelve la base de datos
export interface Category {
  id: string;
  store_id?: string | null;
  name: string;
  slug?: string | null;
  description: string | null;
  image_url?: string | null;
  created_at: string;
  updated_at?: string | null;
  product_count: number; // campo virtual para contar productos relacionados
}

/**
 * category sample for form select for example
 */
export interface CategorySimple {
  id: string;
  name: string;
}

/**
 * type for action create category
 */
export interface CreateCategoryInput {
  store_id: string;
  name: string;
  description?: string;
}
