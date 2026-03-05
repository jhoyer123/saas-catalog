"use server";

import { createClient } from "@/lib/supabase/supabaseServer";
import { ProductCatalog, ProductCatalogCard } from "@/types/product.types";
import { checkIsOfferActive } from "../helpers/validations";

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
 * Get products for public catalog with filters, sorting and pagination.
 * @param param0
 * @returns
 */
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
  const supabase = await createClient();

  // Primero resuelves el slug a id
  const { data: store, error: storeError } = await supabase
    .from("stores")
    .select("id")
    .eq("slug", storeSlug)
    .single();

  if (storeError || !store) throw new Error("Tienda no encontrada");

  // Luego filtras productos por store_id
  let query = supabase
    .from("products")
    .select(
      `
    id,
    name,
    description,
    price,
    is_offer,
    offer_price,
    offer_start,
    offer_end,
    brand,
    slug,
    category:categories(name),
    images:product_images(image_url)
    `,
      { count: "exact" },
    )
    .limit(1, { foreignTable: "product_images" })
    .eq("store_id", store.id)
    .eq("is_available", true);

  // Filtros
  if (search) query = query.ilike("name", `%${search}%`);
  if (category) query = query.eq("category_id", category);
  if (brand) query = query.ilike("brand", `%${brand}%`);
  if (minPrice) query = query.gte("price", Number(minPrice));
  if (maxPrice) query = query.lte("price", Number(maxPrice));
  if (onlyOffers === "true") query = query.eq("is_offer", true);

  // Ordenamiento
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
    case "display_order":
    default:
      query = query.order("display_order", { ascending: true });
      break;
  }

  // Paginación
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) throw new Error(error.message);
  const now = new Date();
  return {
    products: (data ?? []).map((p) => ({
      ...p,
      is_offer_active: checkIsOfferActive(
        {
          is_offer: p.is_offer ?? false,
          offer_price: p.offer_price ?? null,
          offer_start: p.offer_start ?? null,
          offer_end: p.offer_end ?? null,
        },
        now,
      ),
    })) as unknown as ProductCatalogCard[],
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  };
}

/**
 * get categories for public catalog
 */
export async function getPublicCategories(storeSlug: string) {
  const supabase = await createClient();

  const { data: store, error: storeError } = await supabase
    .from("stores")
    .select("id")
    .eq("slug", storeSlug)
    .single();

  if (storeError || !store) throw new Error("Tienda no encontrada");

  const { data, error } = await supabase
    .from("categories")
    .select("id, name")
    .eq("store_id", store.id)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);

  return data ?? [];
}

/**
 * get brands for public catalog
 */
export async function getPublicBrands(storeSlug: string) {
  const supabase = await createClient();

  const { data: store, error: storeError } = await supabase
    .from("stores")
    .select("id")
    .eq("slug", storeSlug)
    .single();

  if (storeError || !store) throw new Error("Tienda no encontrada");

  const { data, error } = await supabase
    .from("products")
    .select("brand")
    .eq("store_id", store.id)
    .eq("is_available", true)
    .not("brand", "is", null);

  if (error) throw new Error(error.message);

  // Marcas únicas y ordenadas
  const brands = [...new Set(data.map((p) => p.brand as string))].sort();

  return brands;
}

/**
 * Get product by slug for public catalog
 * @param slug
 * @returns
 */
export async function getPublicProductBySlug(
  slug: string,
): Promise<ProductCatalog> {
  const supabase = await createClient();

  const { data, error } = await supabase
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
}

/**
 * get banners for public catalog
 * @param storeSlug
 * @returns
 */
export async function getPublicBanners(storeSlug: string) {
  const supabase = await createClient();

  const { data: store, error: storeError } = await supabase
    .from("stores")
    .select("id")
    .eq("slug", storeSlug)
    .single();

  if (storeError || !store) throw new Error("Tienda no encontrada");

  const { data, error } = await supabase
    .from("store_banners")
    .select("id,image_url")
    .eq("store_id", store.id);

  if (error) throw new Error(error.message);

  return data;
}
