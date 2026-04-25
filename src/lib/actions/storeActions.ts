// src/lib/actions/storeActions.ts
"use server";

import { createClient } from "@/lib/supabase/supabaseServer";
import { uploadFile } from "@/lib/utils/storage";
import { generateSlug } from "@/lib/utils/slug";
import type { StoreAction, StoreForm } from "@/lib/schemas/store";
import { revalidatePath, revalidateTag } from "next/cache";
import { getTrialExpirationDate } from "../helpers/DataFormat";
import { purgeCatalogCache } from "../cloudflare/purgeCache";

/**
 * Crea una tienda nueva.
 *
 * Flujo:
 *  1. Insertar la tienda SIN logo para obtener el ID generado por la DB.
 *  2. Si el usuario adjuntó un logo, subirlo al storage usando ese ID.
 *  3. Actualizar la tienda con la URL pública del logo.
 *
 * ¿Por qué no subimos el logo antes del insert?
 *  Porque necesitamos el ID de la tienda como parte de la ruta en Storage
 *  (stores/{storeId}/logo/main.ext). Ese ID lo genera Supabase al insertar.
 */
export const createStore = async (dataInput: StoreAction, userId: string) => {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("No autenticado");

  if (!userId) {
    throw new Error("No se pudo obtener el ID del usuario");
  }

  // ── 1. Obtener el plan por defecto ──
  const { data: defaultPlan } = await supabase
    .from("plans")
    .select("id")
    .eq("name", "Básico")
    .single();

  if (!defaultPlan) return { error: "No se pudo obtener el plan por defecto" };

  // ── 2. Insertar la tienda SIN logo (para obtener el ID) ──
  const { data: newStore, error } = await supabase
    .from("stores")
    .insert({
      user_id: userId,
      plan_id: defaultPlan.id,
      name: dataInput.name,
      slug: generateSlug(dataInput.name),
      logo_url: null,
      description: dataInput.description,
      whatsapp_number: dataInput.whatsapp_number,
      is_active: true,
      plan_expires_at: getTrialExpirationDate(), // fecha de expiración de la prueba gratuita
    })
    .select("id") // ← pedimos el ID de vuelta
    .single();

  if (error || !newStore) {
    console.error("ERROR createStore: ", error);
    return { error: "Error al crear la tienda" };
  }

  return newStore;
};

/**
 * updateStore for logo_url only
 */
export const updateStoreLogo = async (storeId: string, logoUrl: string) => {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { error: "No autenticado" };

  const { data, error } = await supabase
    .from("stores")
    .update({ logo_url: logoUrl })
    .eq("id", storeId);

  if (error) {
    console.error("ERROR updateStoreLogo: ", error);
    return { error: "Error al actualizar el url del logo de la tienda" };
  }

  return data;
};

/**
 * updateStore para datos generales de la tienda (name, description, whatsapp_number)
 * @param storeId
 * @param dataInput
 * @returns
 */
export const updateStore = async (storeId: string, dataInput: StoreAction) => {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { error: "No autenticado" };

  const { data, error } = await supabase
    .from("stores")
    .update({
      name: dataInput.name,
      slug: generateSlug(dataInput.name),
      description: dataInput.description,
      whatsapp_number: dataInput.whatsapp_number,
    })
    .eq("id", storeId);

  if (error) {
    console.error("ERROR updateStore: ", error);
    return { error: "Error al actualizar la tienda" };
  }

  return data;
};

/**
 * revalidateStoreCache se encarga de limpiar la cache de Next.js y Cloudflare
 * @param storeSlug
 */
export const revalidateStoreCache = async (storeSlug: string) => {
  revalidateTag(`store-${storeSlug}`, "max");
  revalidatePath(`/public/${storeSlug}`);
  if (storeSlug) {
    await purgeCatalogCache(storeSlug);
  }
};
