import {
  ProductInputClient,
  ProductInputClientUpdate,
} from "@/lib/schemas/product";
import { revalidateProductCache } from "@/lib/actions/productActions";
import { type ToggleOfferParams } from "@/lib/services/productServices";
import { useToastPromise } from "../shared/useToastPromise";
import { useCreateProduct } from "./useCreateProduct";
import { useDeleteProduct } from "./useDeleteProduct";
import { useUpdateProduct } from "./useUpdateProduct";
import { useToggleOffer } from "./useHandleOffer";
import { useState } from "react";

import { useRouter } from "next/navigation";
import { useToggleAvailableProduct } from "./useToogleAvailableProduct";
import {
  deleteFile,
  deleteFolder,
  uploadMultipleFiles,
} from "@/lib/utils/storage";
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
          //AQUI HAY DUDAS
          //Subir imágenes en paralelo (si existen)
          const uploadPromises = images.map((file) =>
            uploadFile("products", storeId, productRes.id!, file),
          );
          // Esperar a que todas las subidas terminen (exitosas o no)
          const uploadResults = await Promise.allSettled(uploadPromises);
          // Validar que TODAS las subidas fueron exitosas
          const imageUrls = uploadResults.map((result, index) => {
            if (result.status === "fulfilled") {
              return result.value.replace(STORAGE_PREV_VALUE, "");
            }
            throw new Error(
              `Error al subir imagen ${index + 1}: ${result.reason?.message || "Error desconocido"}`,
            );
          });
          //HASTA QUI LAS DUDAS 
          //Guardar URLs en tabla
          await saveProductImages({ productId: productRes.id!, imageUrls });

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
  }; */
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

          // 1) Crear producto — si falla, se corta todo acá (sin cambios)
          const productRes = await create(dataProducto);
          const productFolder = `${storeId}/products/${productRes.id}`;

          // 2) Subir imágenes — no importa si alguna falla, seguimos con las que sí subieron
          const { successes: uploaded, errors: uploadErrors } =
            await uploadMultipleFiles(
              { bucket: "stores", folder: productFolder },
              images,
            );

          if (uploadErrors.length > 0) {
            console.error(
              "Algunas imágenes no se pudieron subir:",
              uploadErrors,
            );
          }

          // Si ninguna imagen se subió, no tiene sentido llamar a saveProductImages
          if (uploaded.length > 0) {
            const imageUrls = uploaded.map((img) => img.path);

            // 3) Guardar URLs en DB (un solo insert). Si falla, borramos la carpeta completa.
            const { error: saveError } = await saveProductImages({
              productId: productRes.id,
              imageUrls,
            });

            if (saveError) {
              await deleteFolder("stores", productFolder).catch(
                (cleanupErr) => {
                  console.error(
                    "Fallo limpieza de storage tras error de DB:",
                    cleanupErr,
                  );
                },
              );
              throw new Error(saveError);
            }
          }

          // revalidar cache
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

  /**
   * Action Update Product Executed with Toast Notifications
   * @param id
   * @param data
   * @param onSuccess
   */
  /*  const updateProduct = (
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
            // Usando Promise.allSettled para garantizar que si 1 falla, rechazamos todo
            const uploadPromises = images.map((file) =>
              uploadFile("products", storeId, id, file),
            );
            // Esperar a que todas las subidas terminen (exitosas o no)
            const uploadResults = await Promise.allSettled(uploadPromises);
            // Validar que TODAS las subidas fueron exitosas
            const imageUrls = uploadResults.map((result, index) => {
              if (result.status === "fulfilled") {
                return result.value.replace(STORAGE_PREV_VALUE, "");
              }
              throw new Error(
                `Error al subir imagen ${index + 1}: ${result.reason?.message || "Error desconocido"}`,
              );
            });
            //Guardar URLs nuevas en tabla
            await saveProductImages({ productId: id, imageUrls, slugProd });
          }
          //revalidar cache y navegar a listado
          router.push("/dashboard/products");
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
  }; */
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
          await update({ id, dataProducto: dataProductoToUpdate });
          // Paso 2: si hay imágenes nuevas, subirlas
          if (images && images?.length > 0) {
            const productFolder = `${storeId}/products/${id}`;
            const { successes, errors } = await uploadMultipleFiles(
              { bucket: "stores", folder: productFolder },
              images,
            );

            if (errors.length > 0) {
              console.error(
                "Algunas imágenes no se subieron (update):",
                errors,
              );
            }

            if (successes.length > 0) {
              const imageUrls = successes.map((r) => r.path);

              // Paso 3: guardar las nuevas URLs (insert, no reemplaza las existentes)
              try {
                await saveProductImages({ productId: id, imageUrls });
              } catch (dbError) {
                await deleteFile(
                  "stores",
                  successes.map((r) => r.path),
                ).catch((cleanupErr) => {
                  console.error(
                    "Fallo limpieza tras error de DB (update):",
                    cleanupErr,
                  );
                });
                throw dbError;
              }
            }
          }
          // revalidar cache
          router.push("/dashboard/products");
          revalidateProductCache(storeSlug, slugProd);
          onSuccess?.();
        });
      },
      messages: {
        loading: "Actualizando producto...",
        success: "Producto actualizado exitosamente",
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
          revalidateProductCache(storeSlug, slugProd);
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
          // cambiar estado de oferta
          await offerProduct({ slugProd, params });
          // revalidar cache
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
          // cambiar disponibilidad
          await toggleAvailableProduct({ id, slugProd, is_available });
          // revalidar cache
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
