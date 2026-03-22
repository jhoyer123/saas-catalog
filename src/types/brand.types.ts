/**
 * type for catalog brands
 */
export interface BrandCatalog {
  id: string;
  name: string;
  slug: string;
}

/**
 * type for forms of product
 */
export type BrandOfForm = Omit<BrandCatalog, "slug">;

/**
 * type for paginated response of brands
 */
export interface BrandDashboard extends Omit<BrandCatalog, "slug"> {
  created_at: string;
  product_count: number;
}
