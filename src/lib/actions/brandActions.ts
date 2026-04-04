"use server";

import { createClient } from "@/lib/supabase/supabaseServer";
import { generateSlug } from "@/lib/utils/slug";
import { revalidateTag } from "next/cache";
import { purgeCatalogCache } from "../cloudflare/purgeCache";

/**
 * service for creating a new brand in the database
 */
export const createBrand = async (
  name: string,
  storeId: string,
  storeSlug: string,
) => {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { error: "No autenticado" };

  const { data, error } = await supabase.from("brands").insert({
    name,
    store_id: storeId,
    slug: generateSlug(name),
  });

  if (error) {
    console.error("ERROR createBrand: ", error);
    if (
      error.code === "23505" &&
      error.message.includes("brands_store_slug_unique")
    ) {
      return { error: "Ya existe una marca con este nombre en tu tienda" };
    }
    return { error: "Error al crear la marca" };
  }
  revalidateTag(`brands-${storeSlug}`, "max");
  if (storeSlug) {
    await purgeCatalogCache(storeSlug);
  }
  return data;
};

/**
 * service for update a brand in the database
 * @param id
 * @param name
 * @param storeId
 * @param storeSlug
 */
export const updateBrand = async (
  id: string,
  name: string,
  storeId: string,
  storeSlug: string,
) => {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { error: "No autenticado" };

  const { data, error } = await supabase
    .from("brands")
    .update({
      name,
      store_id: storeId,
      slug: generateSlug(name),
    })
    .eq("id", id);

  if (error) {
    console.error("ERROR updateBrand: ", error);
    if (
      error.code === "23505" &&
      error.message.includes("brands_store_slug_unique")
    ) {
      return { error: "Ya existe una marca con este nombre en tu tienda" };
    }
    return { error: "Error al actualizar la marca" };
  }
  revalidateTag(`brands-${storeSlug}`, "max");
  if (storeSlug) {
    await purgeCatalogCache(storeSlug);
  }
  return data;
};

/**
 * service for delete a brand in the database
 * @param id
 * @param storeId
 */
export const deleteBrand = async (
  brandId: string,
  storeId: string,
  storeSlug: string,
) => {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { error: "No autenticado" };

  const { error } = await supabase.rpc("delete_brand", {
    p_brand_id: brandId,
    p_store_id: storeId,
  });

  if (error) {
    if (error.code === "P0001") {
      return { error: error.message }; // mensaje de negocio
    }
    console.error("ERROR deleteBrand: ", error);
    return { error: "Error al eliminar la marca" }; // error técnico
  }
  revalidateTag(`brands-${storeSlug}`, "max");
  if (storeSlug) {
    await purgeCatalogCache(storeSlug);
  }
};
