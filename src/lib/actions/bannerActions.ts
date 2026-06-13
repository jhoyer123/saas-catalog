"use server";

import { createClient } from "@/lib/supabase/supabaseServer";
//import { uploadFile } from "@/lib/utils/storage";
import { revalidateTag, revalidatePath } from "next/cache";
import { purgeCatalogCache } from "../cloudflare/purgeCache";
import { cacheTag } from "../helpers/cacheKeys";

export async function saveBannersAction(
  storeId: string,
  imageUrls: string[], // nuevas URLs subidas desde el cliente
  imagesToDelete: string[], // URLs a eliminar (vacío en upload)
  storeSlug: string,
) {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("No autenticado");

  // Verificar que el usuario sea dueño de la tienda
  const { data: store } = await supabase
    .from("stores")
    .select("id")
    .eq("id", storeId)
    .eq("user_id", session.user.id)
    .single();

  if (!store) return { error: "No tienes permisos sobre esta tienda" };

  // 1. Eliminar (solo si hay algo)
  if (imagesToDelete.length > 0) {
    await supabase
      .from("store_banners")
      .delete()
      .in("image_url", imagesToDelete);

    /*  const paths = imagesToDelete.map((url) => {
      const pathname = new URL(url).pathname;
      return pathname.replace("/storage/v1/object/public/banners/", "");
    }); */

    const paths = imagesToDelete.map((url) => {
      if (url.startsWith("http")) {
        const pathname = new URL(url).pathname;
        return pathname.replace("/storage/v1/object/public/banners/", "");
      }
      return url.replace("banners/", "");
    });

    await supabase.storage.from("banners").remove(paths);
  }

  // 2. Insertar nuevas URLs
  const insertedIds: string[] = [];
  try {
    for (const urlImage of imageUrls) {
      const { data, error } = await supabase
        .from("store_banners")
        .insert({ store_id: storeId, image_url: urlImage })
        .select("id")
        .single();

      if (error) return { error: "Error al guardar el banner" };
      insertedIds.push(data.id);
    }
  } catch (error) {
    if (insertedIds.length > 0) {
      await supabase.from("store_banners").delete().in("id", insertedIds);
    }
    return { error: "Error al guardar los banners" };
  }

  //revalidateTag(`banners-${storeSlug}`, "max");
  revalidateTag(cacheTag("banners", storeSlug), "max");
  revalidatePath(`/public/${storeSlug}`);
  if (storeSlug) await purgeCatalogCache(storeSlug);
  return { success: true };
}
