/**
 * Servicios de LECTURA para el dashboard — ejecutan en el BROWSER.
 *
 * Usan el cliente Supabase de browser (supabaseClient.ts) para que
 * las queries vayan directas: Browser → Supabase (1 hop).
 *
 * Las mutaciones (create, update, delete) siguen usando Server Actions
 * porque manejan uploads, revalidación de tags y lógica de negocio.
 */

import { createClient } from "@/lib/supabase/supabaseClient";
import type { User } from "@/types/auth.types";
import type { Store } from "@/types/store.types";
import type { Plan } from "@/types/plan.types";
import type {
  PaginationParams,
  PaginatedResponse,
} from "@/types/pagination.types";
import type { ProductCatalog } from "@/types/product.types";
import type { CategorySimple, Category } from "@/types/category.types";
import { checkIsOfferActive } from "@/lib/helpers/validations";

// ── Tipos ──

export type SessionData = {
  profile: User | null;
  store: Store | null;
  plan: Plan | null;
  hasStore: boolean;
};

// ✅ Así
export const fetchSessionData = async (): Promise<SessionData | null> => {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const userId = session.user.id;

  const [{ data: profile }, { data: stores }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase
      .from("stores")
      .select("*, plans(*)")
      .eq("user_id", userId)
      .maybeSingle(), // 👈
  ]);

  if (!profile) return null;

  return {
    profile,
    store: stores ?? null,
    plan: stores?.plans ?? null,
    hasStore: !!stores,
  };
};

// ── Product count (para panel) ──
export const fetchProductCount = async (storeId: string): Promise<number> => {
  const supabase = createClient();

  const { count, error } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("store_id", storeId);

  if (error) {
    console.error("fetchProductCount error:", error);
    return 0;
  }

  return count ?? 0;
};

// ── Products paginated ──
export const fetchProductsPaginated = async (
  storeId: string,
  params: PaginationParams,
): Promise<PaginatedResponse<ProductCatalog>> => {
  const supabase = createClient();

  const {
    page = 1,
    pageSize = 10,
    search = "",
    sortBy = "created_at",
    sortOrder = "asc",
  } = params;

  let query = supabase
    .from("products")
    .select(
      `
      *,
      category:categories(name),
      images:product_images(image_url)
      `,
      { count: "exact" },
    )
    .limit(1, { foreignTable: "product_images" })
    .eq("store_id", storeId);

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,sku.ilike.%${search}%,brand.ilike.%${search}%`,
    );
  }

  query = query
    .order(sortBy, { ascending: sortOrder === "asc" })
    .range((page - 1) * pageSize, page * pageSize - 1);

  const { data, count, error } = await query;

  if (error) throw new Error(error.message);

  const now = new Date();

  const mapped = (data || []).map((p) => {
    const isOfferActive = checkIsOfferActive(
      {
        is_offer: p.is_offer ?? false,
        offer_price: p.offer_price ?? null,
        offer_start: p.offer_start ?? null,
        offer_end: p.offer_end ?? null,
      },
      now,
    );

    return {
      id: p.id,
      store_id: p.store_id,
      category_id: p.category_id,
      name_category: p.category?.name ?? "Sin categoría",
      name: p.name,
      sku: p.sku ?? null,
      price: p.price,
      description: p.description,
      is_available: p.is_available,
      display_order: p.display_order ?? 0,
      created_at: p.created_at,
      updated_at: p.updated_at,
      is_offer: p.is_offer ?? false,
      offer_price: p.offer_price ?? null,
      offer_end: p.offer_end ?? null,
      offer_start: p.offer_start ?? null,
      slug: p.slug,
      brand: p.brand ?? null,
      is_offer_active: isOfferActive,
      images:
        p.images?.map((img: { image_url: string }) => img.image_url) ?? [],
    };
  });

  return {
    data: mapped,
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  };
};

// ── Product by ID ──

export const fetchProductById = async (id: string): Promise<ProductCatalog> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
    *,
    category:categories(name),
    images:product_images(image_url)
    `,
    )
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);

  return {
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
    slug: data.slug,
    brand: data.brand ?? null,
    images:
      data.images?.map((img: { image_url: string }) => img.image_url) ?? [],
  };
};

// ── Categories (sin paginación) ──

export const fetchCategories = async (
  storeId: string,
): Promise<CategorySimple[]> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("id, name")
    .eq("store_id", storeId);

  if (error) throw new Error(error.message);

  return data ?? [];
};

// ── Categories paginated ──

export const fetchCategoriesPaginated = async (
  params: PaginationParams,
  storeId: string,
): Promise<PaginatedResponse<Category>> => {
  const supabase = createClient();

  const {
    page = 1,
    pageSize = 10,
    search = "",
    sortBy = "created_at",
    sortOrder = "desc",
  } = params;
  const offset = (page - 1) * pageSize;

  let query = supabase.from("categories").select(
    `
        *,
        product_count:products(count)
      `,
    { count: "exact" },
  );

  query = query.eq("store_id", storeId);

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,description.ilike.%${search}%,slug.ilike.%${search}%`,
    );
  }

  query = query.order(sortBy, { ascending: sortOrder === "asc" });
  query = query.range(offset, offset + pageSize - 1);

  const { data, error, count } = await query;
  if (error) throw new Error("No se pudieron cargar las categorías");

  const normalized = (data || []).map((cat) => ({
    ...cat,
    product_count: (cat.product_count as { count: number }[])[0]?.count ?? 0,
  }));

  const total = count || 0;
  return {
    data: normalized,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
};

// ── Banners ──

export const fetchBanners = async (storeId: string): Promise<string[]> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("store_banners")
    .select("image_url")
    .eq("store_id", storeId);

  if (error) throw new Error(error.message);

  return data.map((item) => item.image_url);
};
