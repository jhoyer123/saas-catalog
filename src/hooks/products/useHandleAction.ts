import {
  ProductInputService,
  ProductInputServiceUpdate,
} from "@/lib/schemas/product";
import type { ToggleOfferParams } from "@/lib/actions/productActions";
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
  /* const createProduct = (data: ProductInputService, onSuccess?: () => void) => {
    showPromise({
      promise: async () => {
        await withPending(async () => {
          await create(data);
          router.push("/dashboard/products");
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

  // useProductActions.ts

  const createProduct = (
    data: ProductInputService,
    storeId: string,
    onSuccess?: () => void,
  ) => {
    showPromise({
      promise: async () => {
        await withPending(async () => {
          // 1. Crear producto
          const productRes = await create(data);

          // 2. Subir imágenes al storage
          const imageUrls: string[] = [];
          for (const file of data.images) {
            const url = await uploadFile(
              "products",
              storeId,
              productRes.id!,
              file,
            );
            imageUrls.push(url);
          }

          // 3. Guardar URLs en tabla
          await saveProductImages({ productId: productRes.id!, imageUrls });

          router.push("/dashboard/products");
          //onSuccess?.();
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
  const updateProduct = (
    id: string,
    slugProd: string,
    data: ProductInputServiceUpdate,
    onSuccess?: () => void,
  ) => {
    showPromise({
      promise: async () => {
        await withPending(async () => {
          await update({ id, slugProd, dataProducto: data });
          router.push("/dashboard/products");
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
  const deleteProduct = (id: string, slugProd: string) => {
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
  };

  const toggleOffer = (
    slugProd: string,
    params: ToggleOfferParams,
    onSuccess?: () => void,
  ) => {
    showPromise({
      promise: async () => {
        await withPending(async () => {
          await offerProduct({ slugProd, params });
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

  const toggleAvailable = (
    id: string,
    slugProd: string,
    is_available: boolean,
    onSuccess?: () => void,
  ) => {
    showPromise({
      promise: async () => {
        await withPending(async () => {
          await toggleAvailableProduct({ id, slugProd, is_available });
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
