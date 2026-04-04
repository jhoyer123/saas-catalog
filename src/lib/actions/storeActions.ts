// src/lib/actions/storeActions.ts
"use server";

import { createClient } from "@/lib/supabase/supabaseServer";
import { uploadFile } from "@/lib/utils/storage";
import { generateSlug } from "@/lib/utils/slug";
import type { StoreForm } from "@/lib/schemas/store";
import { revalidateTag } from "next/cache";
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
export const createStore = async (
  dataInput: StoreForm,
  userId: string,
  storeSlug: string,
) => {
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

  // ── 3. Si hay logo, subirlo y actualizar la tienda ──
  if (dataInput.logo) {
    const logo_url = await uploadFile(
      "stores",
      newStore.id,
      "logo",
      dataInput.logo,
      "main",
    );

    const { error: updateError } = await supabase
      .from("stores")
      .update({ logo_url })
      .eq("id", newStore.id);

    if (updateError) {
      console.error("ERROR updating store with logo: ", updateError);
      return { error: "Error al actualizar la tienda con el logo" };
    }
  }

  revalidateTag(`store-${storeSlug}`, "max");
  if (storeSlug) {
    await purgeCatalogCache(storeSlug);
  }
  return newStore;
};

export const updateStore = async (
  storeId: string,
  dataInput: StoreForm,
  storeSlug: string,
) => {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { error: "No autenticado" };

  // solo sube imagen nueva si mandaron un File
  const logo_url =
    dataInput.logo instanceof File
      ? await uploadFile("stores", storeId, "logo", dataInput.logo, "main")
      : dataInput.logo_url; // mantiene la url actual

  const { data, error } = await supabase
    .from("stores")
    .update({
      name: dataInput.name,
      slug: generateSlug(dataInput.name),
      logo_url,
      description: dataInput.description,
      whatsapp_number: dataInput.whatsapp_number,
    })
    .eq("id", storeId);

  if (error) {
    console.error("ERROR updateStore: ", error);
    return { error: "Error al actualizar la tienda" };
  }

  revalidateTag(`store-${storeSlug}`, "max");
  if (storeSlug) {
    await purgeCatalogCache(storeSlug);
  }
  return data;
};
