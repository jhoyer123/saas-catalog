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
import type { Plan, PlanDetails } from "@/types/plan.types";
import type {
  PaginationParams,
  PaginatedResponse,
} from "@/types/pagination.types";
import type { ProductCatalog, ProductDetail } from "@/types/product.types";
import type { CategorySimple, Category } from "@/types/category.types";
import type { BrandDashboard, BrandOfForm } from "@/types/brand.types";
import { checkIsOfferActive } from "@/lib/helpers/validations";

// ── Tipos ──

export type SessionData = {
  profile: User | null;
  store: Store | null;
  plan: Plan | null;
  hasStore: boolean;
};

// Así
export const fetchSessionData = async (): Promise<SessionData | null> => {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const userId = session.user.id;

  const [{ data: profile }, { data: stores }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id,full_name,email,is_active")
      .eq("id", userId)
      .single(),
    supabase
      .from("stores")
      .select(
        "id,slug,name,logo_url,description,whatsapp_number,is_active,plans(id,name,price,max_products,max_images_per_product,max_banners)",
      )
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  if (!profile) return null;

  return {
    profile,
    store: stores ?? null,
    plan: Array.isArray(stores?.plans)
      ? (stores.plans[0] ?? null)
      : (stores?.plans ?? null),
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

//PRODUCTS
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
      id,name,price,is_offer,offer_price,offer_start,offer_end,sku,is_available,category_id,brand_id,
      category:categories(name),
      brand:brands(name),
      images:product_images(image_url)
      `,
      { count: "exact" },
    )
    .limit(1, { foreignTable: "product_images" })
    .eq("store_id", storeId);

  if (search) {
    // Primero buscar brand_ids que coincidan con el search
    const { data: matchedBrands } = await supabase
      .from("brands")
      .select("id")
      .eq("store_id", storeId)
      .ilike("name", `%${search}%`);

    const brandIds = (matchedBrands ?? []).map((b) => b.id);

    // Luego filtrar productos por nombre, sku o brand_id
    if (brandIds.length > 0) {
      query = query.or(
        `name.ilike.%${search}%,sku.ilike.%${search}%,brand_id.in.(${brandIds.join(",")})`,
      );
    } else {
      query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);
    }
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
      name_category: Array.isArray(p.category)
        ? (p.category[0]?.name ?? "Sin categoría")
        : "Sin categoría",
      name: p.name,
      category_id: p.category_id,
      brand_id: p.brand_id ?? null,
      sku: p.sku ?? null,
      price: p.price,
      is_available: p.is_available,
      is_offer: p.is_offer ?? false,
      offer_price: p.offer_price ?? null,
      offer_end: p.offer_end ?? null,
      offer_start: p.offer_start ?? null,
      brand: (p.brand as unknown as { name: string } | null)?.name ?? null,
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
export const fetchProductById = async (id: string): Promise<ProductDetail> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
    id,category_id,brand_id,name,price,description,sku,images:product_images(image_url)
    `,
    )
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);

  return {
    id: data.id,
    category_id: data.category_id,
    brand_id: data.brand_id ?? null,
    name: data.name,
    sku: data.sku ?? null,
    price: data.price,
    description: data.description,
    images:
      data.images?.map((img: { image_url: string }) => img.image_url) ?? [],
  };
};

//CATEGORIES
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

  let query = supabase
    .from("categories")
    .select("id, name, description, created_at, product_count", {
      count: "exact",
    });

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

  const total = count || 0;
  return {
    data: data ?? [],
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

//BRANDS
// ── Brands (sin paginación) ──
export const fetchBrands = async (storeId: string): Promise<BrandOfForm[]> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("brands")
    .select("id, name")
    .eq("store_id", storeId);

  if (error) throw new Error(error.message);

  return data ?? [];
};

// ── Brands paginated ──
export const fetchBrandsPaginated = async (
  params: PaginationParams,
  storeId: string,
): Promise<PaginatedResponse<BrandDashboard>> => {
  const supabase = createClient();

  const {
    page = 1,
    pageSize = 10,
    search = "",
    sortBy = "created_at",
    sortOrder = "desc",
  } = params;

  const offset = (page - 1) * pageSize;

  let query = supabase
    .from("brands")
    .select("id, name, created_at, product_count", { count: "exact" });

  query = query.eq("store_id", storeId);

  if (search) {
    query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%`);
  }

  query = query.order(sortBy, { ascending: sortOrder === "asc" });
  query = query.range(offset, offset + pageSize - 1);

  const { data, error, count } = await query;
  if (error) throw new Error("No se pudieron cargar las marcas");

  const items: BrandDashboard[] = (data || []).map((b) => ({
    id: b.id,
    name: b.name,
    created_at: b.created_at,
    product_count: b.product_count,
  }));

  const total = count || 0;
  return {
    data: items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
};

// ── Planes ──
export const fetchPlans = async (): Promise<PlanDetails[]> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("plans")
    .select(
      "id, name, price, max_products, max_images_per_product, max_banners, description",
    );

  if (error) throw new Error(error.message);

  return data ?? [];
};
