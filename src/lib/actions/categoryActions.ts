"use server";

import { createClient } from "@/lib/supabase/supabaseServer";
import type { CategoryForm } from "@/lib/schemas/category";
import { generateSlug } from "@/lib/utils/slug";
import { CreateCategoryInput } from "@/types/category.types";
import { revalidateTag } from "next/cache";
import { purgeCatalogCache } from "../cloudflare/purgeCache";

/**
 * service for creating a new category in the database
 * @param dataInput
 */
export const createCategory = async (
  dataInput: CreateCategoryInput,
  storeSlug: string,
) => {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { error: "No autenticado" };

  const { data, error } = await supabase.from("categories").insert({
    store_id: dataInput.store_id,
    name: dataInput.name,
    slug: generateSlug(dataInput.name),
    description: dataInput.description,
  });

  if (error) {
    if (error.code === "23505") {
      console.error("ERROR createCategory: ", error);
      return { error: "Ya existe una categoría con este nombre" };
    }
    console.error("ERROR createCategory: ", error);
    return { error: "Error al crear la categoría" };
  }

  revalidateTag(`categories-${storeSlug}`, "max");
  if (storeSlug) {
    await purgeCatalogCache(storeSlug);
  }
  return data;
};

/**
 * service for update a category in the database
 * @param id
 * @param dataInput
 */
export const updateCategory = async (
  id: string,
  dataInput: CategoryForm,
  storeSlug: string,
) => {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { error: "No autenticado" };

  const { data, error } = await supabase
    .from("categories")
    .update({
      name: dataInput.name,
      slug: generateSlug(dataInput.name),
      description: dataInput.description,
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      console.error("ERROR updateCategory: ", error);
      return { error: "Ya existe una categoría con este nombre" };
    }
    console.error("ERROR updateCategory: ", error);
    return { error: "Error al actualizar la categoría" };
  }

  revalidateTag(`categories-${storeSlug}`, "max");
  if (storeSlug) {
    await purgeCatalogCache(storeSlug);
  }
  return data;
};

/**
 * service for delete a category in the database
 * @param id
 */
export const deleteCategory = async (
  categoryId: string,
  storeId: string,
  storeSlug: string,
) => {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { error: "No autenticado" };

  const { error } = await supabase.rpc("delete_category", {
    p_category_id: categoryId,
    p_store_id: storeId,
  });

  if (error) {
    console.error("ERROR deleteCategory: ", error);
    return { error: error.message || "Error al eliminar la categoría" };
  }

  revalidateTag(`categories-${storeSlug}`, "max");
  if (storeSlug) {
    await purgeCatalogCache(storeSlug);
  }
};
