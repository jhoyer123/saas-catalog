import { useState } from "react";
import { useToastPromise } from "../shared/useToastPromise";
import { useCreateStore } from "@/hooks/store/useCreateStore";
import { useUpdateStore } from "@/hooks/store/useStoreUpdate";
import { deleteFile, uploadFile } from "@/lib/utils/storage";
import {
  revalidateStoreCache,
  updateStoreLogo,
} from "@/lib/actions/storeActions";
import type { StoreForm, StoreAction } from "@/lib/schemas/store";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

export function useHandleStoreActions() {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

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

  /**
   * Crea una tienda nueva y sube el logo si existe. Luego revalida la caché de la página de la tienda.
   * @param data - Datos de la tienda a crear.
   * @param onSuccess - Callback opcional a ejecutar después de la creación exitosa.
   * @returns void
   */
  const createStore = (data: StoreForm, onSuccess?: () => void) => {
    showPromise({
      promise: async () => {
        await withPending(async () => {
          const { logo, ...storeData } = data;

          // 1. Crear tienda sin logo
          const newStore = await create(storeData as StoreAction);

          // 2. Si hay logo, subirlo desde el cliente y actualizar
          if (logo instanceof File) {
            const responseUpload = await uploadFile({
              bucket: "stores",
              folder: `${newStore.id}/branding`,
              file: logo,
            });
            //update logo_url in the store
            await updateStoreLogo(newStore.id, responseUpload.path);
          }

          //revalidate cache of react-query
          queryClient.invalidateQueries({ queryKey: ["session-data"] });
          // revalidate cache of store page
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

  /**
   * Actualiza los datos de la tienda y sube un nuevo logo si se proporciona. Luego revalida la caché de la página de la tienda.
   * @param id
   * @param data
   * @param storeSlug
   * @param onSuccess
   */
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

          // guardamos el path viejo antes de pisarlo (si lo tenés disponible)
          const oldLogoPath = data.logo_url;

          // 1. Actualizar datos de la tienda
          await update({ id, data: storeData as StoreAction });

          // 2. Si hay logo nuevo, subirlo y actualizar
          if (logo instanceof File) {
            const responseUpload = await uploadFile({
              bucket: "stores",
              folder: `${id}/branding`,
              file: logo,
            });

            await updateStoreLogo(id, responseUpload.path);

            // 3. Borrar el logo viejo, sin que un fallo acá tumbe todo el flujo
            if (oldLogoPath) {
              try {
                await deleteFile("stores", oldLogoPath);
              } catch (err) {
                console.error("No se pudo eliminar el logo anterior:", err);
                // opcional: reportar a un servicio de logging, pero no re-lanzar
              }
            }
          }

          revalidateStoreCache(storeSlug);
          queryClient.invalidateQueries({ queryKey: ["session-data"] });

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
