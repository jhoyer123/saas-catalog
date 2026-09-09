import { revalidateProductCache } from "@/lib/actions/productActions";
import {
  SaveProductPayload,
  SaveProductResult,
  type ToggleOfferParams,
} from "@/lib/services/productServices";
import { useToastPromise } from "../shared/useToastPromise";
import { useCreateProduct } from "./useCreateProduct";
import { useDeleteProduct } from "./useDeleteProduct";
import { useToggleOffer } from "./useHandleOffer";
import { useState } from "react";

import { useRouter } from "next/navigation";
import { useToggleAvailableProduct } from "./useToogleAvailableProduct";
import {
  deleteFile,
  deleteFolder,
  uploadProductImagesGrouped,
} from "@/lib/utils/storage";
import type { ImagesState } from "@/features/product/product-variants/types/types";
import { ProductFormOutput } from "@/lib/schemas/productSchema";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "@/features/options/lib/errors/getErrorMessage";

export function useHandleProduct() {
  const [isPending, setIsPending] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  // const { mutateAsync: saveProductImages } = useSaveProductImages();
  const { mutateAsync: saveProductFull } = useCreateProduct();
  // const { mutateAsync: update } = useUpdateProduct();
  const { mutateAsync: remove } = useDeleteProduct();
  const { mutateAsync: offerProduct } = useToggleOffer();
  const { mutateAsync: toggleAvailableProduct } = useToggleAvailableProduct();

  const { showPromise } = useToastPromise();

  const withPending = async (fn: () => Promise<void>) => {
    if (isPending) {
      throw new Error("Hay una operacion en curso. Intenta nuevamente.");
    }
    setIsPending(true);
    try {
      await fn();
    } finally {
      setIsPending(false);
    }
  };

  /**
   * Crea o actualiza producto (RPC unificada) + sube imágenes nuevas antes.
   * @param data          datos del form (sin imágenes)
   * @param imagesState   { general:{newFiles}, bySignature:{sig:{newFiles}} } del hook de imágenes
   * @param productId     si viene, es edit; si no, se genera acá (create)
   */
  const createProduct = (
    data: ProductFormOutput,
    imagesState: ImagesState,
    storeId: string,
    storeSlug: string,
    onSuccess?: () => void,
  ) => {
    showPromise({
      promise: async () => {
        await withPending(async () => {
          const {
            product_images,
            product_existing_images,
            imageToDelete,
            variants,
            ...rest
          } = data;

          const productId = crypto.randomUUID();
          const productFolder = `${storeId}/products/${productId}`;

          // subir SOLO archivos nuevos, agrupados por firma (uploadMultipleFiles ya sube directo desde el cliente)
          const uploadResult = await uploadProductImagesGrouped({
            storeId,
            productId,
            general: { newFiles: product_images },
            bySignature: Object.fromEntries(
              Object.entries(imagesState.bySignature).map(([sig, g]) => [
                sig,
                { newFiles: g.newFiles },
              ]),
            ),
          });

          const uploadErrors = [
            ...uploadResult.general.errors,
            ...Object.values(uploadResult.bySignature).flatMap((r) => r.errors),
          ];
          if (uploadErrors.length > 0) {
            toast.warning(
              `${uploadErrors.length} imagen(es) no se pudieron subir`,
            );
          }

          const payload: SaveProductPayload = {
            ...rest,
            variants: variants.filter((v) => !v._removed),
            images: {
              general: uploadResult.general.successes.map((r) => r),
              bySignature: Object.fromEntries(
                Object.entries(uploadResult.bySignature)
                  .filter(([, r]) => r.successes.length > 0)
                  .map(([sig, r]) => [sig, r.successes.map((s) => s)]),
              ),
            },
            imageToDelete: imagesState.deletedIds,
          };

          let result: SaveProductResult;
          try {
            result = await saveProductFull({ storeId, productId, payload });
          } catch (err) {
            await deleteFolder("stores", productFolder).catch(() => {});
            throw err;
          }

          await revalidateProductCache(storeSlug, null);

          onSuccess?.();
        });
      },
      messages: {
        loading: "Creando producto...",
        success: "Producto creado",
        error: (err) => getErrorMessage(err),
      },
      richColors: true,
      position: "top-right",
      duration: 3000,
    });
  };

  /**
   * Action Update Product Executed with Toast Notifications
   * @param id
   * @param data
   * @param onSuccess
   */
  const updateProduct = (
    data: ProductFormOutput,
    imagesState: ImagesState,
    storeId: string,
    storeSlug: string,
    productId: string,
    productSlug: string,
    onSuccess?: () => void,
  ) => {
    showPromise({
      promise: async () => {
        await withPending(async () => {
          const {
            product_images,
            product_existing_images,
            imageToDelete,
            variants,
            ...rest
          } = data;

          const uploadResult = await uploadProductImagesGrouped({
            storeId,
            productId,
            general: { newFiles: product_images },
            bySignature: Object.fromEntries(
              Object.entries(imagesState.bySignature).map(([sig, g]) => [
                sig,
                { newFiles: g.newFiles },
              ]),
            ),
          });

          const uploadErrors = [
            ...uploadResult.general.errors,
            ...Object.values(uploadResult.bySignature).flatMap((r) => r.errors),
          ];
          if (uploadErrors.length > 0) {
            toast.warning(
              `${uploadErrors.length} imagen(es) no se pudieron subir`,
            );
          }

          const payload: SaveProductPayload = {
            ...rest,
            variants: variants.filter((v) => !v._removed),
            images: {
              general: uploadResult.general.successes.map((r) => r),
              bySignature: Object.fromEntries(
                Object.entries(uploadResult.bySignature)
                  .filter(([, r]) => r.successes.length > 0)
                  .map(([sig, r]) => [sig, r.successes.map((s) => s)]),
              ),
            },
            // unión de ambas fuentes: generales (del form) + por firma (del hook de imágenes)
            imageToDelete: [...imageToDelete, ...imagesState.deletedIds],
          };

          let result: SaveProductResult;
          try {
            result = await saveProductFull({ storeId, productId, payload });
          } catch (err) {
            const uploadedPaths = [
              ...uploadResult.general.successes,
              ...Object.values(uploadResult.bySignature).flatMap(
                (r) => r.successes,
              ),
            ];
            if (uploadedPaths.length > 0) {
              await deleteFile("stores", uploadedPaths).catch(() => {});
            }
            throw err;
          }

          if (result.deleted_image_urls.length > 0) {
            await deleteFile("stores", result.deleted_image_urls).catch((err) =>
              console.error("Fallo limpieza de imágenes eliminadas:", err),
            );
          }

          await queryClient.invalidateQueries({
            queryKey: ["product", productId],
          });
          await revalidateProductCache(storeSlug, productSlug);

          router.push(`/dashboard/products`);
          //onSuccess?.();
        });
      },
      messages: {
        loading: "Actualizando producto...",
        success: "Producto actualizado",
        error: (err) => getErrorMessage(err),
      },
      richColors: true,
      position: "top-right",
      duration: 3000,
    });
  };

  /**
   * Action Delete Product Executed with Toast Notifications
   * @param id
   * @param slugProd
   * @param storeSlug (Opcional) Para revalidar caché
   * @param onSuccess (Opcional) Callback de éxito
   */
  const deleteProduct = (
    id: string,
    slugProd: string,
    storeSlug: string,
    onSuccess?: () => void,
  ) => {
    showPromise({
      promise: async () => {
        await withPending(async () => {
          // Eliminar producto en la db
          await remove({ id });
          // Revalidar cache
          await revalidateProductCache(storeSlug, slugProd);
          onSuccess?.();
        });
      },
      messages: {
        loading: "Eliminando producto...",
        success: "Producto eliminado",
        error: (err) => getErrorMessage(err),
      },
      richColors: true,
      position: "top-right",
      duration: 3000,
    });
  };

  /**
   * Action for activate offer in product
   * @param slugProd
   * @param params
   * @param onSuccess
   */
  const toggleOffer = (
    slugProd: string,
    params: ToggleOfferParams,
    storeSlug: string,
    onSuccess?: () => void,
  ) => {
    showPromise({
      promise: async () => {
        await withPending(async () => {
          // cambiar estado de oferta
          await offerProduct({ params });
          // revalidar cache
          await revalidateProductCache(storeSlug, slugProd);
          onSuccess?.();
        });
      },
      messages: {
        loading: params.is_offer
          ? "Activando oferta..."
          : "Desactivando oferta...",
        success: params.is_offer ? "Oferta activada" : "Oferta desactivada",
        error: (err) => getErrorMessage(err),
      },
      richColors: true,
      position: "top-right",
      duration: 3000,
    });
  };

  /**
   * Action for toggling product availability
   * @param id
   * @param slugProd
   * @param is_available
   * @param onSuccess
   */
  const toggleAvailable = (
    id: string,
    slugProd: string,
    is_available: boolean,
    storeSlug: string,
    onSuccess?: () => void,
  ) => {
    showPromise({
      promise: async () => {
        await withPending(async () => {
          // cambiar disponibilidad
          await toggleAvailableProduct({ id, is_available });
          // revalidar cache
          await revalidateProductCache(storeSlug, slugProd);
          onSuccess?.();
        });
      },
      messages: {
        loading: "Actualizando disponibilidad...",
        success: "Disponibilidad actualizada",
        error: (err) => getErrorMessage(err),
      },
      richColors: true,
      position: "top-right",
      duration: 3000,
    });
  };

  return {
    createProduct,
    updateProduct,
    deleteProduct,
    toggleOffer,
    toggleAvailable,
    isPending,
  };
}
