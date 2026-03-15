"use server";

import { supabasePublic } from "@/lib/supabase/server-public";
import { ProductCatalog, ProductCatalogCard } from "@/types/product.types";
import { checkIsOfferActive } from "../helpers/validations";
import { unstable_cache } from "next/cache";

type GetPublicProductsParams = {
  storeSlug: string;
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  onlyOffers?: string;
  sort?: "price_asc" | "price_desc" | "newest" | "display_order";
  page?: number;
  pageSize?: number;
};

/**
 * get public store info (name, slug, logo_url) for the catalog header
 */
export const getPublicStore = unstable_cache(
  async (storeSlug: string) => {
    const { data, error } = await supabasePublic
      .from("stores")
      .select("name, slug, logo_url, whatsapp_number")
      .eq("slug", storeSlug)
      .single();
    if (error || !data) throw new Error("Tienda no encontrada");
    return data as {
      name: string;
      slug: string;
      logo_url: string | null;
      whatsapp_number: string | null;
    };
  },
  ["public-store"],
  { revalidate: 3600, tags: ["store"] },
);

//store_id cacheado 1 hora — nunca hay razón para buscarlo dos veces
const getStoreIdBySlug = unstable_cache(
  async (storeSlug: string): Promise<string> => {
    const { data, error } = await supabasePublic
      .from("stores")
      .select("id")
      .eq("slug", storeSlug)
      .single();
    if (error || !data) throw new Error("Tienda no encontrada");
    return data.id;
  },
  ["store-id-by-slug"],
  { revalidate: 3600 },
);

/**
 * get categories for public catalog
 */
export const getPublicCategories = unstable_cache(
  async (storeSlug: string) => {
    const storeId = await getStoreIdBySlug(storeSlug);
    const { data, error } = await supabasePublic
      .from("categories")
      .select("id, name")
      .eq("store_id", storeId)
      .order("name", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  },
  ["public-categories"],
  { revalidate: 3600, tags: ["categories"] },
);
/**
 * get brands for public catalog
 */
export const getPublicBrands = unstable_cache(
  async (storeSlug: string) => {
    const storeId = await getStoreIdBySlug(storeSlug);
    const { data, error } = await supabasePublic
      .from("products")
      .select("brand")
      .eq("store_id", storeId)
      .eq("is_available", true)
      .not("brand", "is", null);
    if (error) throw new Error(error.message);
    const unique = [
      ...new Set((data ?? []).map((p) => p.brand).filter(Boolean)),
    ];
    return unique as string[];
  },
  ["public-brands"],
  { revalidate: 3600, tags: ["products"] },
);

/**
 * get banners for public catalog
 * @param storeSlug
 * @returns
 */
export const getPublicBanners = unstable_cache(
  async (storeSlug: string) => {
    const storeId = await getStoreIdBySlug(storeSlug);
    const { data, error } = await supabasePublic
      .from("store_banners")
      .select("*")
      .eq("store_id", storeId)
      .eq("is_active", true)
      .order("display_order");
    if (error) throw new Error(error.message);
    return data ?? [];
  },
  ["public-banners"],
  { revalidate: 3600, tags: ["banners"] },
);

/**
 * Get product by slug for public catalog
 * @param slug
 * @returns
 */
export const getPublicProductBySlug = unstable_cache(
  async (slug: string): Promise<ProductCatalog> => {
    const { data, error } = await supabasePublic
      .from("products")
      .select(
        `
      *,
      category:categories(name),
      images:product_images(image_url)
    `,
      )
      .eq("slug", slug)
      .eq("is_available", true)
      .single();

    if (error) throw new Error(error.message);
    const now = new Date();
    const isOfferActive = checkIsOfferActive(
      {
        is_offer: data.is_offer ?? false,
        offer_price: data.offer_price ?? null,
        offer_start: data.offer_start ?? null,
        offer_end: data.offer_end ?? null,
      },
      now,
    );

    const mapped: ProductCatalog = {
      id: data.id,
      store_id: data.store_id,
      category_id: data.category_id,
      name_category: data.category?.name ?? "Sin categoría",
      name: data.name,
      sku: data.sku ?? null,
      price: data.price,
      description: data.description,
      is_available: data.is_available,
      display_order: data.display_order ?? 0,
      created_at: data.created_at,
      updated_at: data.updated_at,
      is_offer: data.is_offer ?? false,
      offer_price: data.offer_price ?? null,
      offer_start: data.offer_start ?? null,
      offer_end: data.offer_end ?? null,
      slug: data.slug,
      is_offer_active: isOfferActive,
      brand: data.brand ?? null,
      images:
        data.images?.map((img: { image_url: string }) => img.image_url) ?? [],
    };

    return mapped;
  },
  ["public-product-by-slug"],
  { revalidate: 3600, tags: ["products"] },
);

/**
 * Get products for public catalog with filters, sorting and pagination.
 * @param param0
 * @returns
 */
// Productos del catálogo público.
// No se cachean a nivel de servidor porque el estado de las ofertas cambia con el tiempo.
export async function getPublicProducts({
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
}: GetPublicProductsParams) {
  const storeId = await getStoreIdBySlug(storeSlug);
  const table = onlyOffers === "true" ? "active_offers" : "products";

  let query = supabasePublic
    .from(table)
    .select(
      `
      id, name, description, price, is_offer, offer_price, offer_start, offer_end,
      brand, slug,
      images:product_images(image_url)
      `,
      { count: "exact" },
    )
    .limit(1, { foreignTable: "product_images" })
    .eq("store_id", storeId)
    .eq("is_available", true);

  if (search) query = query.ilike("name", `%${search}%`);
  if (category) query = query.eq("category_id", category);
  if (brand) query = query.ilike("brand", `%${brand}%`);
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

  if (error) throw new Error(error.message);

  const now = new Date();

  return {
    products: (data ?? []).map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description ?? null,
      price: product.price,
      is_offer: product.is_offer ?? false,
      offer_price: product.offer_price ?? null,
      offer_start: product.offer_start ?? null,
      offer_end: product.offer_end ?? null,
      brand: product.brand ?? null,
      slug: product.slug,
      categories: null,
      images: product.images ?? [],
      is_offer_active: checkIsOfferActive(
        {
          is_offer: product.is_offer ?? false,
          offer_price: product.offer_price ?? null,
          offer_start: product.offer_start ?? null,
          offer_end: product.offer_end ?? null,
        },
        now,
      ),
    })) as ProductCatalogCard[],
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  };
}
