"use server";

import { createClient } from "@/lib/supabase/supabaseServer";
import { uploadFile, deleteFile } from "@/lib/utils/storage";

// ─── Subir nuevos banners
export async function uploadBannersAction(storeId: string, files: File[]) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  // Verificar que el usuario sea dueño de la tienda
  const { data: store } = await supabase
    .from("stores")
    .select("id")
    .eq("id", storeId)
    .eq("user_id", user.id)
    .single();

  if (!store) throw new Error("No tienes permisos sobre esta tienda");

  const insertedIds: string[] = [];

  try {
    for (const file of files) {
      const urlImage = await uploadFile("banners", storeId, "banners", file);

      const { data, error } = await supabase
        .from("store_banners")
        .insert({ store_id: storeId, image_url: urlImage })
        .select("id")
        .single();

      if (error) throw new Error(error.message);

      insertedIds.push(data.id);
    }
  } catch (error) {
    // Rollback: borrar los registros que alcanzaron a insertarse
    if (insertedIds.length > 0) {
      await supabase.from("store_banners").delete().in("id", insertedIds);
    }
    throw error;
  }

  return { success: true, count: insertedIds.length };
}

export interface UpdateBannersParams {
  storeId: string;
  newFiles: File[];
  imagesToDelete: string[];
}

//update banners
export async function updateBannersAction(dataFiles: UpdateBannersParams) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  // Verificar que el usuario sea dueño de la tienda
  const { data: store } = await supabase
    .from("stores")
    .select("id")
    .eq("id", dataFiles.storeId)
    .eq("user_id", user.id)
    .single();

  if (!store) throw new Error("No tienes permisos sobre esta tienda");

  //Eliminar imágenes marcadas
  if (dataFiles.imagesToDelete?.length! > 0) {
    //Eliminar registros en DB
    const { error: dbError } = await supabase
      .from("store_banners")
      .delete()
      .in("image_url", dataFiles.imagesToDelete!);

    if (dbError) throw new Error(dbError.message);

    //Eliminar archivos del bucket
    const paths = dataFiles.imagesToDelete!.map((url: string) => {
      const pathname = new URL(url).pathname;
      return pathname.replace("/storage/v1/object/public/banners/", "");
    });

    const { error: storageError } = await supabase.storage
      .from("banners")
      .remove(paths);

    if (storageError) throw new Error(storageError.message);
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

      if (error) throw new Error(error.message);

      insertedIds.push(data.id);
    }
  } catch (error) {
    // Rollback solo de los nuevos inserts
    if (insertedIds.length > 0) {
      await supabase.from("store_banners").delete().in("id", insertedIds);
    }
    throw error;
  }

  return { success: true };
}

//get Banners
export async function getBannersAction(storeId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  // Verificar que el usuario sea dueño de la tienda
  const { data: store } = await supabase
    .from("stores")
    .select("id")
    .eq("id", storeId)
    .eq("user_id", user.id)
    .single();

  if (!store) throw new Error("No tienes permisos sobre esta tienda");

  const { data, error } = await supabase
    .from("store_banners")
    .select("image_url")
    .eq("store_id", storeId);

  if (error) throw new Error(error.message);

  return data.map((item) => item.image_url);
}
