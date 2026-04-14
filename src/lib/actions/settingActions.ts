"use server";

import { createClient } from "@/lib/supabase/supabaseServer";
import { revalidatePath, revalidateTag } from "next/cache";
import { purgeCatalogCache } from "../cloudflare/purgeCache";

type SocialLink = {
  platform: string;
  url: string;
};

export const saveSocialLinks = async (
  storeId: string,
  links: SocialLink[],
  storeSlug: string,
) => {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { error: "No autenticado" };

  // 1. Borramos todas las redes de esta tienda
  const { error: deleteError } = await supabase
    .from("store_social_links")
    .delete()
    .eq("store_id", storeId);

  if (deleteError) return { error: "Error al limpiar las redes sociales" };

  // 2. Insertamos las nuevas (si hay alguna)
  if (links.length > 0) {
    const { error: insertError } = await supabase
      .from("store_social_links")
      .insert(
        links.map((link) => ({
          store_id: storeId,
          platform: link.platform,
          url: link.url,
        })),
      );

    if (insertError) return { error: "Error al guardar las redes sociales" };
  }

  revalidateTag(`store-social-links-${storeSlug}`, "max");
  revalidatePath(`/public/${storeSlug}`);
  await purgeCatalogCache(storeSlug);
  return { success: true };
};

type Branch = {
  name: string;
  address: string;
  phone: string;
  lat?: number;
  lng?: number;
};

export const saveBranches = async (
  storeId: string,
  branches: Branch[],
  storeSlug: string,
) => {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { error: "No autenticado" };

  // 1. Borramos todas las sucursales de esta tienda
  const { error: deleteError } = await supabase
    .from("store_branches")
    .delete()
    .eq("store_id", storeId);

  if (deleteError) return { error: "Error al limpiar las sucursales" };

  // 2. Insertamos las nuevas (si hay alguna)
  if (branches.length > 0) {
    const { error: insertError } = await supabase.from("store_branches").insert(
      branches.map((branch) => ({
        store_id: storeId,
        name: branch.name,
        address: branch.address,
        phone: branch.phone,
        lat: branch.lat,
        lng: branch.lng,
      })),
    );

    if (insertError) return { error: "Error al guardar las sucursales" };
  }

  revalidateTag(`store-branches-${storeSlug}`, "max");
  revalidatePath(`/public/${storeSlug}`);
  await purgeCatalogCache(storeSlug);
  return { success: true };
};
