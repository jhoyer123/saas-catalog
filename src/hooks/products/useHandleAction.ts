import {
  ProductInputClient,
  ProductInputClientUpdate,
} from "@/lib/schemas/product";
import {
  revalidateProductCache,
  type ToggleOfferParams,
} from "@/lib/actions/productActions";
import { useToastPromise } from "../shared/useToastPromise";
import { useCreateProduct } from "./useCreateProduct";
import { useDeleteProduct } from "./useDeleteProduct";
import { useUpdateProduct } from "./useUpdateProduct";
import { useToggleOffer } from "./useHandleOffer";
import { useState } from "react";

import { useRouter } from "next/navigation";
import { useToggleAvailableProduct } from "./useToogleAvailableProduct";
import { uploadFile } from "@/lib/utils/storage";
import { useSaveProductImages } from "./useSaveProductImages";

export function useProductActions() {
  const [isPending, setIsPending] = useState(false);

  const router = useRouter();

  const { mutateAsync: saveProductImages } = useSaveProductImages();
  const { mutateAsync: create } = useCreateProduct();
  const { mutateAsync: update } = useUpdateProduct();
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
   * Action Create Product Executed with Toast Notifications
   * @param data
   * @param onSuccess
   */
  const createProduct = (
    data: ProductInputClient,
    storeId: string,
    storeSlug: string,
    onSuccess?: () => void,
  ) => {
    showPromise({
      promise: async () => {
        await withPending(async () => {
          const { images, ...dataProducto } = data;
          const startTime = performance.now(); // ⏱️ START
          //Crear producto
          const productRes = await create(dataProducto);
          console.log(
            `⏱️ create(): ${((performance.now() - startTime) / 1000).toFixed(2)}s`,
          );
          const uploadPromises = images.map((file) =>
            uploadFile("products", storeId, productRes.id!, file),
          );
          const t2 = performance.now();
          const uploadResults = await Promise.allSettled(uploadPromises);
          console.log(
            `⏱️ uploads: ${((performance.now() - t2) / 1000).toFixed(2)}s`,
          );
          const t3 = performance.now();
          // Validar que TODAS las subidas fueron exitosas
          const imageUrls = uploadResults.map((result, index) => {
            if (result.status === "fulfilled") {
              return result.value;
            }
            throw new Error(
              `Error al subir imagen ${index + 1}: ${result.reason?.message || "Error desconocido"}`,
            );
          });

          //Guardar URLs en tabla
          await saveProductImages({ productId: productRes.id!, imageUrls });
          console.log(
            `⏱️ saveProductImages(): ${((performance.now() - t3) / 1000).toFixed(2)}s`,
          );
          const endTime = performance.now(); // ⏱️ END
          console.log(
            `⏱️ Flujo de negocio: ${((endTime - startTime) / 1000).toFixed(2)}s`,
          );

          //router.push("/dashboard/products");
          //revalidar cache
          revalidateProductCache(storeSlug, null);
          onSuccess?.();
        });
      },
      messages: {
        loading: "Creando producto...",
        success: "Producto creado exitosamente",
        error: (err) => err.message,
      },
      richColors: true,
      position: "top-right",
      duration: 3000,
    });
  };
  /* const createProduct = (
    data: ProductInputClient,
    storeId: string,
    storeSlug: string,
    onSuccess?: () => void,
  ) => {
    showPromise({
      promise: async () => {
        await withPending(async () => {
          const { images, ...dataProducto } = data;

          //Crear producto
          const productRes = await create(dataProducto);

          const uploadPromises = images.map((file) =>
            uploadFile("products", storeId, productRes.id!, file),
          );

          const uploadResults = await Promise.allSettled(uploadPromises);

          // Validar que TODAS las subidas fueron exitosas
          const imageUrls = uploadResults.map((result, index) => {
            if (result.status === "fulfilled") {
              return result.value;
            }
            throw new Error(
              `Error al subir imagen ${index + 1}: ${result.reason?.message || "Error desconocido"}`,
            );
          });

          //Guardar URLs en tabla
          await saveProductImages({ productId: productRes.id!, imageUrls });

          router.push("/dashboard/products");
          //revalidar cache
          await revalidateProductCache(storeSlug, null);
          onSuccess?.();
        });
      },
      messages: {
        loading: "Creando producto...",
        success: "Producto creado exitosamente",
        error: (err) => err.message,
      },
      richColors: true,
      position: "top-right",
      duration: 3000,
    });
  }; */

  /**
   * Action Update Product Executed with Toast Notifications
   * @param id
   * @param data
   * @param onSuccess
   */
  const updateProduct = (
    id: string,
    slugProd: string,
    data: ProductInputClientUpdate,
    storeId: string,
    storeSlug: string,
    onSuccess?: () => void,
  ) => {
    showPromise({
      promise: async () => {
        await withPending(async () => {
          const { images, ...dataProducto } = data;
          const dataProductoToUpdate = {
            ...dataProducto,
            thereAreNewImages: Boolean(images && images.length > 0),
          };

          //Actualizar producto (incluye eliminar imágenes viejas)
          await update({ id, slugProd, dataProducto: dataProductoToUpdate });

          //Subir imágenes nuevas si existen
          if (images && images.length > 0) {
            // ==================== NUEVO: Subir imágenes en PARALELO ====================
            // Usando Promise.allSettled para garantizar que si 1 falla, rechazamos todo
            const uploadPromises = images.map((file) =>
              uploadFile("products", storeId, id, file),
            );

            const uploadResults = await Promise.allSettled(uploadPromises);

            // Validar que TODAS las subidas fueron exitosas
            const imageUrls = uploadResults.map((result, index) => {
              if (result.status === "fulfilled") {
                return result.value;
              }
              throw new Error(
                `Error al subir imagen ${index + 1}: ${result.reason?.message || "Error desconocido"}`,
              );
            });
            // ================================================================================

            //Guardar URLs nuevas en tabla
            await saveProductImages({ productId: id, imageUrls, slugProd });
          }

          router.push("/dashboard/products");

          //revalidar cache
          revalidateProductCache(storeSlug, slugProd);

          onSuccess?.();
        });
      },
      messages: {
        loading: "Actualizando producto...",
        success: "Producto actualizado",
        error: (err) => err.message,
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
   */
  /*   const deleteProduct = (id: string, slugProd: string) => {
    showPromise({
      promise: () => remove({ id, slugProd }),
      messages: {
        loading: "Eliminando producto...",
        success: "Producto eliminado",
        error: (err) => err.message,
      },
      richColors: true,
      position: "top-right",
      duration: 3000,
    });
  }; */

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
    storeSlug?: string,
    onSuccess?: () => void,
  ) => {
    showPromise({
      promise: async () => {
        await withPending(async () => {
          await remove({ id, slugProd });

          // Revalidar caché si se proporciona el slug de la tienda
          if (storeSlug) {
            revalidateProductCache(storeSlug, slugProd);
          }

          onSuccess?.();
        });
      },
      messages: {
        loading: "Eliminando producto...",
        success: "Producto eliminado",
        error: (err) => err.message,
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
          await offerProduct({ slugProd, params });

          //revalidar cache
          revalidateProductCache(storeSlug, slugProd);

          onSuccess?.();
        });
      },
      messages: {
        loading: params.is_offer
          ? "Activando oferta..."
          : "Desactivando oferta...",
        success: params.is_offer ? "Oferta activada" : "Oferta desactivada",
        error: (err) => err.message,
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
          await toggleAvailableProduct({ id, slugProd, is_available });

          //revalidar cache
          revalidateProductCache(storeSlug, slugProd);

          onSuccess?.();
        });
      },
      messages: {
        loading: "Actualizando disponibilidad...",
        success: "Disponibilidad actualizada",
        error: (err) => err.message,
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
