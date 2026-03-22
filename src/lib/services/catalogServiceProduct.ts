import { createClient } from "@/lib/supabase/supabaseClient";
import { checkIsOfferActive } from "@/lib/helpers/validations";
import type { ProductCatalogCard, ProductCatalog } from "@/types/product.types";

export type SortOption =
  | "price_asc"
  | "price_desc"
  | "newest"
  | "display_order";

export type FetchPublicProductsParams = {
  storeSlug: string;
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  onlyOffers?: string;
  sort?: SortOption;
  page?: number;
  pageSize?: number;
};

export type FetchPublicProductsResult = {
  products: ProductCatalogCard[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

// Instancia única — no se recrea en cada llamada
const supabase = createClient();

// store_id en memoria — si ya lo buscamos, no volvemos a Supabase
const storeIdCache = new Map<string, string>();

async function getStoreId(storeSlug: string): Promise<string> {
  if (storeIdCache.has(storeSlug)) return storeIdCache.get(storeSlug)!;

  const { data, error } = await supabase
    .from("stores")
    .select("id")
    .eq("slug", storeSlug)
    .single();

  if (error || !data) throw new Error("Tienda no encontrada");
  storeIdCache.set(storeSlug, data.id);
  return data.id;
}

/**
 * Fetch de productos para el catálogo público.
 * Llamado directamente desde TanStack en el cliente — sin pasar por Next.js.
 * onlyOffers usa la vista active_offer_products para precisión exacta en UTC.
 */
export async function fetchPublicProducts({
  storeSlug,
  search,
  category,
  brand,
  minPrice,
  maxPrice,
  onlyOffers,
  sort = "display_order",
  page = 1,
  pageSize = 12,
}: FetchPublicProductsParams): Promise<FetchPublicProductsResult> {
  const storeId = await getStoreId(storeSlug);

  // Si onlyOffers está activo usamos la vista — el filtro de fechas lo resuelve Supabase
  const table = onlyOffers === "true" ? "active_offers" : "products";

  let query = supabase
    .from(table)
    .select(
      `
      id, name, price, is_offer, offer_price, offer_start, offer_end,
      slug, images:product_images(image_url)
      `,
      { count: "exact" },
    )
    .limit(1, { foreignTable: "product_images" })
    .eq("store_id", storeId)
    .eq("is_available", true);

  if (search) query = query.ilike("name", `%${search}%`);
  if (category) query = query.eq("category_id", category);
  if (brand) query = query.eq("brand_id", brand);
  if (minPrice) query = query.gte("price", Number(minPrice));
  if (maxPrice) query = query.lte("price", Number(maxPrice));

  switch (sort) {
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    default:
      query = query.order("display_order", { ascending: true });
  }

  const from = (page - 1) * pageSize;
  query = query.range(from, from + pageSize - 1);

  const { data, error, count } = await query;
  if (error) {
    console.error("Error fetching products:", error);
    throw new Error(error.message);
  }

  const now = new Date();

  const products: ProductCatalogCard[] = (data ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    //description: p.description ?? null,
    price: p.price,
    is_offer: p.is_offer ?? false,
    offer_price: p.offer_price ?? null,
    offer_start: p.offer_start ?? null,
    offer_end: p.offer_end ?? null,
    //brand: (p.brand as unknown as { name: string } | null)?.name ?? null,
    slug: p.slug,
    //categories: null,
    images: p.images ?? [],
    is_offer_active: checkIsOfferActive(
      {
        is_offer: p.is_offer ?? false,
        offer_price: p.offer_price ?? null,
        offer_start: p.offer_start ?? null,
        offer_end: p.offer_end ?? null,
      },
      now,
    ),
  }));
  //console.log("fetch product");
  return {
    products,
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  };
}

/**
 * Fetch de producto por slug para el detalle público.
 * Llamado desde TanStack en el cliente — sin pasar por Next.js.
 * Usado también para prefetch en hover desde ProductCard.
 */
export async function fetchPublicProductBySlug(
  slug: string,
): Promise<ProductCatalog> {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id, name, price, description, is_offer, offer_price, slug, offer_start, offer_end,
      brand:brands(name),
      category:categories(name),
      images:product_images(image_url)
      `,
    )
    .eq("slug", slug)
    .eq("is_available", true)
    .single();

  if (error || !data) throw new Error("Producto no encontrado");

  const now = new Date();

  return {
    id: data.id,
    //store_id: data.store_id,
    //category_id: data.category_id,
    //brand_id: data.brand_id ?? null,
    //name_category: data.category?.name ?? "Sin categoría",
    name: data.name,
    //sku: data.sku ?? null,
    price: data.price,
    description: data.description,
    //is_available: data.is_available,
    //display_order: data.display_order ?? 0,
    //created_at: data.created_at,
    //updated_at: data.updated_at,
    is_offer: data.is_offer ?? false,
    offer_price: data.offer_price ?? null,
    offer_start: data.offer_start ?? null,
    offer_end: data.offer_end ?? null,
    slug: data.slug,
    brand: (data.brand as unknown as { name: string } | null)?.name ?? null,
    images: (data.images ?? []).map(
      (img: { image_url: string }) => img.image_url,
    ),
  };
}
