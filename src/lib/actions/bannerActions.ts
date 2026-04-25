"use server";

import { createClient } from "@/lib/supabase/supabaseServer";
import { uploadFile } from "@/lib/utils/storage";
import { revalidateTag, revalidatePath } from "next/cache";
import { purgeCatalogCache } from "../cloudflare/purgeCache";

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

    const paths = imagesToDelete.map((url) => {
      const pathname = new URL(url).pathname;
      return pathname.replace("/storage/v1/object/public/banners/", "");
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

  revalidateTag(`banners-${storeSlug}`, "max");
  revalidatePath(`/public/${storeSlug}`);
  if (storeSlug) await purgeCatalogCache(storeSlug);
  return { success: true };
}

// ─── Subir nuevos banners
export async function uploadBannersAction(
  storeId: string,
  files: File[],
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

  const insertedIds: string[] = [];

  try {
    for (const file of files) {
      const urlImage = await uploadFile("banners", storeId, "banners", file);

      const { data, error } = await supabase
        .from("store_banners")
        .insert({ store_id: storeId, image_url: urlImage })
        .select("id")
        .single();

      if (error) {
        console.error("uploadBannersAction DB ERROR:", error);
        return { error: "Error al guardar el banner en la base de datos" };
      }

      insertedIds.push(data.id);
    }
  } catch (error) {
    // Rollback: borrar los registros que alcanzaron a insertarse
    if (insertedIds.length > 0) {
      await supabase.from("store_banners").delete().in("id", insertedIds);
    }
    throw error;
  }

  revalidateTag(`banners-${storeSlug}`, "max");
  revalidatePath(`/public/${storeSlug}`);
  if (storeSlug) {
    await purgeCatalogCache(storeSlug);
  }
  return { success: true, count: insertedIds.length };
}

export interface UpdateBannersParams {
  storeId: string;
  newFiles: File[];
  imagesToDelete: string[];
}

//update banners
/* export async function updateBannersAction(
  dataFiles: UpdateBannersParams,
  storeSlug: string,
) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { error: "No autenticado" };

  // Verificar que el usuario sea dueño de la tienda
  const { data: store } = await supabase
    .from("stores")
    .select("id")
    .eq("id", dataFiles.storeId)
    .eq("user_id", session.user.id)
    .single();

  if (!store) {
    console.error(
      "updateBannersAction ERROR: Usuario no autorizado para esta tienda",
    );
    return { error: "No tienes permisos sobre esta tienda" };
  }

  //Eliminar imágenes marcadas
  if (dataFiles.imagesToDelete?.length! > 0) {
    //Eliminar registros en DB
    const { error: dbError } = await supabase
      .from("store_banners")
      .delete()
      .in("image_url", dataFiles.imagesToDelete!);

    if (dbError) {
      console.error("updateBannersAction DB ERROR:", dbError);
      return { error: "Error al eliminar el banner de la base de datos" };
    }

    //Eliminar archivos del bucket
    const paths = dataFiles.imagesToDelete!.map((url: string) => {
      const pathname = new URL(url).pathname;
      return pathname.replace("/storage/v1/object/public/banners/", "");
    });

    const { error: storageError } = await supabase.storage
      .from("banners")
      .remove(paths);

    if (storageError) {
      console.error("updateBannersAction Storage ERROR:", storageError);
      return { error: `Error al eliminar el banner: ${storageError.message}` };
    }
  }

  // ─── 2. Subir nuevos banners (misma lógica que upload)
  const insertedIds: string[] = [];

  try {
    for (const file of dataFiles.newFiles) {
      const urlImage = await uploadFile(
        "banners",
        dataFiles.storeId,
        "banners",
        file,
      );

      const { data, error } = await supabase
        .from("store_banners")
        .insert({ store_id: dataFiles.storeId, image_url: urlImage })
        .select("id")
        .single();

      if (error) {
        console.error("updateBannersAction DB ERROR:", error);
        return { error: "Error al guardar el banner en la base de datos" };
      }

      insertedIds.push(data.id);
    }
  } catch (error) {
    // Rollback solo de los nuevos inserts
    if (insertedIds.length > 0) {
      await supabase.from("store_banners").delete().in("id", insertedIds);
    }
    throw error;
  }

  revalidateTag(`banners-${storeSlug}`, "max");
  revalidatePath(`/public/${storeSlug}`);
  if (storeSlug) {
    await purgeCatalogCache(storeSlug);
  }
  return { success: true };
} */
export async function updateBannersAction(
  dataFiles: UpdateBannersParams,
  storeSlug: string,
) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { error: "No autenticado" };

  // Verificar que el usuario sea dueño de la tienda
  const { data: store } = await supabase
    .from("stores")
    .select("id")
    .eq("id", dataFiles.storeId)
    .eq("user_id", session.user.id)
    .single();

  if (!store) {
    console.error(
      "updateBannersAction ERROR: Usuario no autorizado para esta tienda",
    );
    return { error: "No tienes permisos sobre esta tienda" };
  }

  //Eliminar imágenes marcadas
  if (dataFiles.imagesToDelete?.length! > 0) {
    //Eliminar registros en DB
    const { error: dbError } = await supabase
      .from("store_banners")
      .delete()
      .in("image_url", dataFiles.imagesToDelete!);

    if (dbError) {
      console.error("updateBannersAction DB ERROR:", dbError);
      return { error: "Error al eliminar el banner de la base de datos" };
    }

    //Eliminar archivos del bucket
    const paths = dataFiles.imagesToDelete!.map((url: string) => {
      const pathname = new URL(url).pathname;
      return pathname.replace("/storage/v1/object/public/banners/", "");
    });

    const { error: storageError } = await supabase.storage
      .from("banners")
      .remove(paths);

    if (storageError) {
      console.error("updateBannersAction Storage ERROR:", storageError);
      return { error: `Error al eliminar el banner: ${storageError.message}` };
    }
  }

  // ─── 2. Subir nuevos banners (misma lógica que upload)
  const insertedIds: string[] = [];

  try {
    for (const file of dataFiles.newFiles) {
      const urlImage = await uploadFile(
        "banners",
        dataFiles.storeId,
        "banners",
        file,
      );

      const { data, error } = await supabase
        .from("store_banners")
        .insert({ store_id: dataFiles.storeId, image_url: urlImage })
        .select("id")
        .single();

      if (error) {
        console.error("updateBannersAction DB ERROR:", error);
        return { error: "Error al guardar el banner en la base de datos" };
      }

      insertedIds.push(data.id);
    }
  } catch (error) {
    // Rollback solo de los nuevos inserts
    if (insertedIds.length > 0) {
      await supabase.from("store_banners").delete().in("id", insertedIds);
    }
    throw error;
  }

  revalidateTag(`banners-${storeSlug}`, "max");
  revalidatePath(`/public/${storeSlug}`);
  if (storeSlug) {
    await purgeCatalogCache(storeSlug);
  }
  return { success: true };
}
