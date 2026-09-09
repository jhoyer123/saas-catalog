"use server";

import { supabasePublic } from "@/lib/supabase/server-public";
import {
  ProductCatalogCard,
  ProductDetailCatalog,
} from "@/types/product.types";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { cacheKey, cacheTag } from "../helpers/cacheKeys";
import {
  mapToProductDetailCatalog,
  RawProductRow,
} from "@/components/catalog/lib/product-detail.mapper";

/**
 * get public store info (name, slug, logo_url) for the catalog header
 */
async function getPublicStoreRaw(storeSlug: string) {
  const { data, error } = await supabasePublic
    .from("stores")
    .select(
      "id,name,description, slug, logo_url, whatsapp_number,primary_color,secondary_color,tertiary_color, updated_at,plan_expires_at,is_active",
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
    tertiary_color: string | null;
    updated_at: string;
    plan_expires_at: string | null;
    is_active: boolean;
  };
}

// cache() wrapeando
export const getPublicStore = cache((storeSlug: string) => {
  return unstable_cache(
    async () => getPublicStoreRaw(storeSlug),
    cacheKey("public-store", storeSlug),
    {
      tags: [cacheTag("store", storeSlug), cacheTag("store-data", storeSlug)],
      revalidate: false,
    },
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
    cacheKey("public-categories", storeSlug),
    {
      tags: [
        cacheTag("categories", storeSlug),
        cacheTag("store-data", storeSlug),
      ],
      revalidate: false,
    },
  )();
}

/**
 * get brands for public catalog
 */
async function getPublicBrandsRaw(storeId: string) {
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
    cacheKey("public-brands", storeSlug),
    {
      tags: [cacheTag("brands", storeSlug), cacheTag("store-data", storeSlug)],
      revalidate: false,
    },
  )();
}

/**
 * get banners for public catalog
 * @param storeSlug
 * @returns
 */
async function getPublicBannersRaw(storeId: string) {
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
    cacheKey("public-banners", storeSlug),
    {
      tags: [cacheTag("banners", storeSlug), cacheTag("store-data", storeSlug)],
      revalidate: false,
    },
  )();
}

/**
 * Get initial products for public catalog (first page, no filters)
 * Se cachea a nivel de servidor porque es la consulta más común
 * Se revalida solo cuando el dueño cambia algo en los productos (revalidateTag "products")
 */
async function getPublicProductsInitialRaw(storeId: string) {
  const { data, error, count } = await supabasePublic
    .from("products")
    .select(
      `id, name, price, has_variants, is_offer, offer_price, offer_start, offer_end, slug,is_available, images:product_images(image_url)`,
      { count: "exact" },
    )
    .eq("store_id", storeId)
    .order("created_at", { ascending: true })
    .range(0, 11)
    .limit(1, { foreignTable: "product_images" });

  if (error) throw new Error(error.message);
  return {
    products: (data ?? []).map((product) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      has_variants: product.has_variants ?? false,
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
    cacheKey("public-products-initial", storeSlug),
    {
      tags: [
        cacheTag("products", storeSlug),
        cacheTag("store-data", storeSlug),
      ],
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
      id, name, price, description, has_variants, is_offer, offer_price,
      slug, offer_start, offer_end, is_available,brand_id,category_id,
      images:product_images(image_url, display_order, visual_signature),
      option_types:product_option_types(
        is_visual,
        option_type:store_option_types(id, name, input_type)
      ),
      variants:product_variants(
        id, sku, price, offer_price, stock, is_available, option_signature,
        values:variant_option_values(
          option_type_id,
          option_value:store_option_values(id, value, image_url, color_hexes, unit)
        )
      )
    `,
    )
    .eq("slug", slug)
    .single();

  if (error || !data) throw new Error("Producto no encontrado");
  return mapToProductDetailCatalog(data as unknown as RawProductRow);
}

export async function getPublicProductBySlug(storeSlug: string, slug: string) {
  return unstable_cache(
    async () => getPublicProductBySlugRaw(slug),
    cacheKey("public-product", storeSlug, slug),
    {
      tags: [
        cacheTag(`product-${slug}`, storeSlug),
        cacheTag("store-data", storeSlug),
      ],
      revalidate: false,
    },
  )();
}

/**
 * get store social media links for footer
 */
async function getPublicStoreSocialMediaRaw(storeId: string) {
  const { data, error } = await supabasePublic
    .from("store_social_links")
    .select("id, platform, url")
    .eq("store_id", storeId);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getPublicStoreSocialMedia(
  storeSlug: string,
  storeId: string,
) {
  return unstable_cache(
    async () => getPublicStoreSocialMediaRaw(storeId),
    cacheKey("public-store-social-links", storeSlug),
    {
      tags: [
        cacheTag("store-social-links", storeSlug),
        cacheTag("store-data", storeSlug),
      ],
      revalidate: false,
    },
  )();
}

/**
 * get branches for footer
 */
async function getPublicStoreBranchesRaw(storeId: string) {
  const { data, error } = await supabasePublic
    .from("store_branches")
    .select("id, name, address, phone, lat, lng")
    .eq("store_id", storeId);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getPublicStoreBranches(
  storeSlug: string,
  storeId: string,
) {
  return unstable_cache(
    async () => getPublicStoreBranchesRaw(storeId),
    cacheKey("public-store-branches", storeSlug),
    {
      tags: [
        cacheTag("store-branches", storeSlug),
        cacheTag("store-data", storeSlug),
      ],
      revalidate: false,
    },
  )();
}
