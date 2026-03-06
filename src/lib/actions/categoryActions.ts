"use server";

import { createClient } from "@/lib/supabase/supabaseServer";
import type { CategoryForm } from "@/lib/schemas/category";
import { generateSlug } from "@/lib/utils/slug";
import { CreateCategoryInput, CategorySimple } from "@/types/category.types";
import { Category } from "@/types/category.types";
import { PaginationParams, PaginatedResponse } from "@/types/pagination.types";
import { revalidateTag } from "next/cache";

/**
 * service for creating a new category in the database
 * @param dataInput
 */
export const createCategory = async (dataInput: CreateCategoryInput) => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase.from("categories").insert({
    store_id: dataInput.store_id,
    name: dataInput.name,
    slug: generateSlug(dataInput.name),
    description: dataInput.description,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidateTag("categories", {});
  revalidateTag("products", {});
  return data;
};

/**
 * service for update a category in the database
 * @param id
 * @param dataInput
 */
export const updateCategory = async (id: string, dataInput: CategoryForm) => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("categories")
    .update({
      name: dataInput.name,
      slug: generateSlug(dataInput.name),
      description: dataInput.description,
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidateTag("categories", {});
  revalidateTag("products", {});
  return data;
};

/**
 * service for delete a category in the database
 * @param id
 */
export const deleteCategory = async (
  categoryId: string,
  storeId: string,
): Promise<void> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { error } = await supabase.rpc("delete_category", {
    p_category_id: categoryId,
    p_store_id: storeId,
  });

  if (error) throw new Error(error.message);
  revalidateTag("categories", {});
  revalidateTag("products", {});
};

/**
 * service for get a categories without pagination
 */
export const getCategories = async (
  storeId: string,
): Promise<CategorySimple[] | null> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("categories")
    .select("id, name")
    .eq("store_id", storeId);

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

/**
 * service for get all categories of a store with pagination
 * @param params
 * Este Server Action se ejecuta SIEMPRE en el servidor
 * Puede acceder a cookies y usar supabaseServer
 * Se puede llamar desde Client Components sin problemas
 */
export const getCategoriesPaginate = async (
  params: PaginationParams,
  storeId: string,
): Promise<PaginatedResponse<Category>> => {
  const supabase = await createClient();
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

  // Supabase devuelve product_count como [{ count: 3 }], lo normalizamos
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
