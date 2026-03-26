/**
 * types for plans
 */
export interface Plan {
  id: string;
  name: string;
  price: number;
  max_products: number;
  max_images_per_product: number;
  max_banners: number;
}

export interface PlanDetails extends Plan {
  description: string;
}
