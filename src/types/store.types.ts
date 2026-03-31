/**
 * type for store
 */
export interface Store {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  whatsapp_number: string | null;
  is_active: boolean | null;
  plan_expires_at: string;
}

/**
 * type for create store with the service
 */
export interface StoreServiceInput {
  user_id: string;
  name: string;
  slug: string;
  logo: File | null;
  description: string | null;
  whatsapp_number: string;
}
