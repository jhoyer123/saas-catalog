// src/lib/actions/storeActions.ts
"use server";

import { createClient } from "@/lib/supabase/supabaseServer";
import { uploadFile } from "@/lib/utils/storage";
import { generateSlug } from "@/lib/utils/slug";
import type { StoreForm } from "@/lib/schemas/store";
import { revalidateTag } from "next/cache";

export const createStore = async (dataInput: StoreForm, storeId: string) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  if (!storeId) {
    throw new Error("No se pudo obtener el ID de la tienda");
  }

  // subir logo al storage del usuario
  const logo_url = dataInput.logo
    ? await uploadFile("stores", storeId, "logo", dataInput.logo, "main")
    : null;

  // plan por defecto
  const { data: defaultPlan } = await supabase
    .from("plans")
    .select("id")
    .limit(1)
    .single();

  const { data, error } = await supabase.from("stores").insert({
    user_id: user.id,
    plane_id: defaultPlan!.id,
    name: dataInput.name,
    slug: generateSlug(dataInput.name),
    logo_url,
    description: dataInput.description,
    whatsapp_number: dataInput.whatsapp_number,
    is_active: true,
  });
  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const updateStore = async (storeId: string, dataInput: StoreForm) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

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

  if (error) throw new Error(error.message);
  revalidateTag("store", {});
  return data;
};
