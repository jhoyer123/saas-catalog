"use server";

import { supabasePublic } from "@/lib/supabase/server-public";
import { ProductCatalogCard, ProductDetailCatalog } from "@/types/product.types";
import { unstable_cache } from "next/cache";
import { cache } from "react";

/**
 * get public store info (name, slug, logo_url) for the catalog header
 */
async function getPublicStoreRaw(storeSlug: string) {
  const { data, error } = await supabasePublic
    .from("stores")
    .select(
      "id,name, slug, logo_url, whatsapp_number,primary_color,secondary_color, updated_at",
    )
    .eq("slug", storeSlug)
    .single();
  if (error || !data) throw new Error("Tienda no encontrada");
  return data as {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    whatsapp_number: string | null;
    primary_color: string | null;
    secondary_color: string | null;
    updated_at: string;
  };
}

// ← único cambio: cache() wrapeando lo que ya tenías
export const getPublicStore = cache((storeSlug: string) => {
  return unstable_cache(
    async () => getPublicStoreRaw(storeSlug),
    ["public-store", storeSlug],
    { tags: [`store-${storeSlug}`], revalidate: false },
  )();
});

/**
 * get categories for public catalog
 */
async function getPublicCategoriesRaw(storeId: string) {
  //const storeId = await getStoreIdBySlug(storeSlug);
  const { data, error } = await supabasePublic
    .from("categories")
    .select("id, name, slug")
    .eq("store_id", storeId)
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getPublicCategories(storeSlug: string, storeId: string) {
  return unstable_cache(
    async () => getPublicCategoriesRaw(storeId),
    ["public-categories", storeSlug],
    { tags: [`categories-${storeSlug}`], revalidate: false },
  )();
}

/**
 * get brands for public catalog
 */
async function getPublicBrandsRaw(storeId: string) {
  //const storeId = await getStoreIdBySlug(storeSlug);
  const { data, error } = await supabasePublic
    .from("brands")
    .select("id, name, slug")
    .eq("store_id", storeId)
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);

  return data ?? [];
}

export async function getPublicBrands(storeSlug: string, storeId: string) {
  return unstable_cache(
    async () => getPublicBrandsRaw(storeId),
    ["public-brands", storeSlug],
    { tags: [`brands-${storeSlug}`], revalidate: false },
  )();
}

/**
 * get banners for public catalog
 * @param storeSlug
 * @returns
 */
async function getPublicBannersRaw(storeId: string) {
  //const storeId = await getStoreIdBySlug(storeSlug);
  const { data, error } = await supabasePublic
    .from("store_banners")
    .select("id, image_url")
    .eq("store_id", storeId)
    .eq("is_active", true)
    .order("display_order");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getPublicBanners(storeSlug: string, storeId: string) {
  return unstable_cache(
    async () => getPublicBannersRaw(storeId),
    ["public-banners", storeSlug],
    { tags: [`banners-${storeSlug}`], revalidate: false },
  )();
}

/**
 * Get initial products for public catalog (first page, no filters)
 * Se cachea a nivel de servidor porque es la consulta más común y no cambia con el tiempo (no depende de ofertas activas)
 * Se revalida solo cuando el dueño cambia algo en los productos (revalidateTag "products")
 */
async function getPublicProductsInitialRaw(storeId: string) {
  //const storeId = await getStoreIdBySlug(storeSlug);

  const { data, error, count } = await supabasePublic
    .from("products")
    .select(
      `id, name, price, is_offer, offer_price, offer_start, offer_end, slug,is_available, images:product_images(image_url)`,
      { count: "exact" },
    )
    .limit(1, { foreignTable: "product_images" })
    .eq("store_id", storeId)
    .range(0, 11);

  if (error) throw new Error(error.message);
  return {
    products: (data ?? []).map((product) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      is_offer: product.is_offer ?? false,
      is_available: product.is_available,
      offer_price: product.offer_price ?? null,
      offer_start: product.offer_start ?? null,
      offer_end: product.offer_end ?? null,
      slug: product.slug,
      images: product.images ?? [],
    })) as ProductCatalogCard[],
    total: count ?? 0,
    page: 1,
    pageSize: 12,
    totalPages: Math.ceil((count ?? 0) / 12),
  };
}

export async function getPublicProductsInitial(
  storeSlug: string,
  storeId: string,
) {
  return unstable_cache(
    async () => getPublicProductsInitialRaw(storeId),
    ["public-products-initial", storeSlug],
    {
      tags: [`products-${storeSlug}`],
      revalidate: false,
    },
  )();
}

/**
 * Get public product detail by slug
 * Usa la misma query/mapeo que fetchPublicProductBySlug
 */
async function getPublicProductBySlugRaw(
  slug: string,
): Promise<ProductDetailCatalog> {
  const { data, error } = await supabasePublic
    .from("products")
    .select(
      `
      id, name, price, description, is_offer, offer_price, slug, offer_start, offer_end,is_available,
      brand:brands(name),
      category:categories(name),
      images:product_images(image_url)
      `,
    )
    .eq("slug", slug)
    .single();

  if (error || !data) throw new Error("Producto no encontrado");

  return {
    id: data.id,
    name: data.name,
    price: data.price,
    description: data.description,
    is_offer: data.is_offer ?? false,
    offer_price: data.offer_price ?? null,
    offer_start: data.offer_start ?? null,
    offer_end: data.offer_end ?? null,
    slug: data.slug,
    brand: (data.brand as unknown as { name: string } | null)?.name ?? null,
    images: (data.images ?? []).map(
      (img: { image_url: string }) => img.image_url,
    ),
    is_available: data.is_available,
  };
}

export async function getPublicProductBySlug(storeSlug: string, slug: string) {
  return unstable_cache(
    async () => getPublicProductBySlugRaw(slug),
    ["public-product", storeSlug, slug],
    { tags: [`product-${storeSlug}-${slug}`], revalidate: false },
  )();
}
