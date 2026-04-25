import { useState } from "react";
import { useToastPromise } from "../shared/useToastPromise";
import { useSaveBanners } from "./useSaveBanners";
import { uploadFile } from "@/lib/utils/storage";
import { useSessionData } from "../auth/useSessionData";

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
          if (!storeId) throw new Error("No se encontró el ID de la tienda");

          // 1. Subir archivos desde el cliente
          const imageUrls: string[] = [];
          for (const file of newFiles) {
            const url = await uploadFile("banners", storeId, "banners", file);
            imageUrls.push(url);
          }

          // 2. Guardar URLs y eliminar en DB via action
          await saveBannersDB({ imageUrls, imagesToDelete });

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
