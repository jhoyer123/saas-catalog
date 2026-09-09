import { useState } from "react";
import { useToastPromise } from "../shared/useToastPromise";
import { useSaveBanners } from "./useSaveBanners";
import { useSessionData } from "../auth/useSessionData";
import { deleteFile, uploadMultipleFiles } from "@/lib/utils/storage";
import { revalidateBannersCacheAction } from "@/lib/actions/bannerActions";

export function useHandleBannerActions() {
  const [isPending, setIsPending] = useState(false);
  const { showPromise } = useToastPromise();

  const { data: session } = useSessionData();
  const storeId = session?.store?.id;
  const slugStore = session?.store?.slug;

  const { mutateAsync: saveBannersDB } = useSaveBanners();

  const withPending = async (fn: () => Promise<void>) => {
    if (isPending)
      throw new Error("Hay una operación en curso. Intenta nuevamente.");
    setIsPending(true);
    try {
      await fn();
    } finally {
      setIsPending(false);
    }
  };

  /**
   * Guarda los banners en la base de datos.
   * @param newFiles
   * @param imagesToDelete
   * @param onSuccess
   */
  const saveBanners = (
    newFiles: File[],
    imagesToDelete: string[] = [],
    onSuccess?: () => void,
  ) => {
    showPromise({
      promise: async () => {
        await withPending(async () => {
          if (!storeId) throw new Error("No se encontró el ID de la tienda");

          // 1. Subir archivos desde el cliente.
          const { successes } = await uploadMultipleFiles(
            { bucket: "stores", folder: `${storeId}/banners` },
            newFiles,
          );

          // Las URLs se guardan como paths relativos, tal cual los devuelve
          // uploadMultipleFiles (sin transformar publicUrl).
          const imageUrls = successes.map((s) => s.path);

          // 2. Guardar paths y eliminar en DB via action.
          // Recién acá, con todos los archivos subidos con éxito, tocamos la DB.
          //await saveBannersDB({ imageUrls, imagesToDelete });
          try {
            await saveBannersDB({ imageUrls, imagesToDelete });
          } catch (dbError) {
            // Si la DB falla, borramos las imágenes recién subidas para no dejar basura en el bucket
            if (imageUrls.length > 0) {
              await deleteFile("stores", imageUrls).catch((cleanupError) => {
                console.error(
                  "Error al limpiar archivos en Storage:",
                  cleanupError,
                );
              });
            }
            throw dbError; // Re-lanzamos el error para que useToastPromise muestre la notificación
          }

          //revalidar cache y purgar cache de Cloudflare.
          revalidateBannersCacheAction(slugStore!);

          onSuccess?.();
        });
      },
      messages: {
        loading: "Guardando banners...",
        success: "Banners guardados exitosamente",
        error: (err) => err.message,
      },
      richColors: true,
      position: "top-right",
      duration: 3000,
    });
  };

  return {
    saveBanners,
    isPending,
  };
}
