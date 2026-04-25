// src/hooks/store/useStoreActions.ts
import { useState } from "react";
import { useToastPromise } from "../shared/useToastPromise";
import { useCreateStore } from "@/hooks/store/useCreateStore";
import { useUpdateStore } from "@/hooks/store/useStoreUpdate";
import { uploadFile } from "@/lib/utils/storage";
import {
  revalidateStoreCache,
  updateStoreLogo,
} from "@/lib/actions/storeActions";
import type { StoreForm, StoreAction } from "@/lib/schemas/store";
import { useRouter } from "next/navigation";

export function useHandleStoreActions() {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const { mutateAsync: create } = useCreateStore();
  const { mutateAsync: update } = useUpdateStore();
  const { showPromise } = useToastPromise();

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

  const createStore = (data: StoreForm, onSuccess?: () => void) => {
    showPromise({
      promise: async () => {
        await withPending(async () => {
          const { logo, ...storeData } = data;

          // 1. Crear tienda sin logo
          const newStore = await create(storeData as StoreAction);

          // 2. Si hay logo, subirlo desde el cliente y actualizar
          if (logo instanceof File) {
            const logoUrl = await uploadFile(
              "stores",
              newStore.id,
              "logo",
              logo,
              "main",
            );
            await updateStoreLogo(newStore.id, logoUrl);
          }

          onSuccess?.();
          router.push("/dashboard/panel");
        });
      },
      messages: {
        loading: "Creando tienda...",
        success: "Tienda creada exitosamente",
        error: (err) => err.message,
      },
      richColors: true,
      position: "top-right",
      duration: 3000,
    });
  };

  const updateStore = (
    id: string,
    data: StoreForm,
    storeSlug: string,
    onSuccess?: () => void,
  ) => {
    showPromise({
      promise: async () => {
        await withPending(async () => {
          const { logo, ...storeData } = data;

          // 1. Actualizar datos de la tienda
          await update({ id, data: storeData as StoreAction });

          // 2. Si hay logo nuevo, subirlo desde el cliente y actualizar
          if (logo instanceof File) {
            const logoUrl = await uploadFile(
              "stores",
              id,
              "logo",
              logo,
              "main",
            );
            await updateStoreLogo(id, logoUrl);
          }

          // revalidar caché
          await revalidateStoreCache(storeSlug);

          onSuccess?.();
        });
      },
      messages: {
        loading: "Actualizando tienda...",
        success: "Tienda actualizada",
        error: (err) => err.message,
      },
      richColors: true,
      position: "top-right",
      duration: 3000,
    });
  };

  return {
    createStore,
    updateStore,
    isPending,
  };
}
