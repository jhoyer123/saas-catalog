import { useState } from "react";
import { useToastPromise } from "../shared/useToastPromise";
import { useSaveBanners } from "./useSaveBanners";
import { uploadFile } from "@/lib/utils/storage";
import { useSessionData } from "../auth/useSessionData";
import { SUPABASE_PUBLIC_URL } from "@/constants/storage";

export function useHandleBannerActions() {
  const [isPending, setIsPending] = useState(false);
  const { showPromise } = useToastPromise();

  const { data: session } = useSessionData();
  const storeId = session?.store?.id;

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

  const saveBanners = (
    newFiles: File[],
    imagesToDelete: string[] = [],
    onSuccess?: () => void,
  ) => {
    showPromise({
      promise: async () => {
        await withPending(async () => {
          if (!storeId) {
            throw new Error("No se encontró el ID de la tienda");
          }

          // Subidas paralelas
          const uploadPromises = newFiles.map((file) =>
            uploadFile("banners", storeId, "banners", file),
          );

          const uploadResults = await Promise.allSettled(uploadPromises);

          // Validar subidas
          const imageUrls = uploadResults.map((result, index) => {
            if (result.status === "fulfilled") {
              return result.value.replace(SUPABASE_PUBLIC_URL, "");
            }
            throw new Error(
              `Error al subir imagen ${index + 1}: ${result.reason?.message || "Error desconocido"}`,
            );
          });

          // Guardar en DB
          await saveBannersDB({
            imageUrls,
            imagesToDelete,
          });

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
