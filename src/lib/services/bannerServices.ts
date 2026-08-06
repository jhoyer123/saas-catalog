import { createClient } from "@/lib/supabase/supabaseClient";
import { deleteFile } from "@/lib/utils/storage";

export async function saveBannersAction(
  storeId: string,
  imageUrls: string[], // nuevas URLs subidas desde el cliente (ya están en storage)
  imagesToDelete: string[], // URLs a eliminar (vacío en upload)
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

  // 1. Eliminar: SIEMPRE primero la base de datos, y solo después storage.
  if (imagesToDelete.length > 0) {
    const { error: deleteDbError } = await supabase
      .from("store_banners")
      .delete()
      .in("image_url", imagesToDelete);

    if (deleteDbError) {
      return { error: "Error al eliminar los banners de la base de datos" };
    }

    try {
      await deleteFile("stores", imagesToDelete);
    } catch (err) {
      // No abortamos el flujo: la base de datos ya quedó consistente.
      // Solo dejamos registro de que quedaron huérfanos en storage.
      console.error("Error eliminando archivos de storage (huérfanos):", err);
    }
  }

  // 2. Insertar nuevas URLs.
  if (imageUrls.length > 0) {
    const { error: insertError } = await supabase
      .from("store_banners")
      .insert(imageUrls.map((image_url) => ({ store_id: storeId, image_url })));

    if (insertError) {
      try {
        await deleteFile("stores", imageUrls);
      } catch (cleanupErr) {
        console.error(
          "Error limpiando archivos huérfanos tras fallo de insert:",
          cleanupErr,
        );
      }
      return { error: "Error al guardar los banners" };
    }
  }
}
