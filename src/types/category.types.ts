// category que devuelve la base de datos
export interface Category {
  id: string;
  store_id: string;
  name: string;
  slug: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}
