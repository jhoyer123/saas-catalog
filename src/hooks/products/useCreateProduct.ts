import { useMutation, useQueryClient } from "@tanstack/react-query";
//import { createProduct } from "@/lib/services/productServices";
import { saveProductFull } from "@/lib/services/productServices";
import { useSessionData } from "../auth/useSessionData";
import { ProductInputService } from "@/lib/schemas/product";
import type { ProductVariantDraft } from "@/features/product/product-variants/types/types";

/* export function useCreateProduct() {
  const queryClient = useQueryClient();

  //get data session
  const { data: sessionData } = useSessionData();
  const storeId = sessionData?.store?.id;

  return useMutation({
    mutationFn: async ({ dataProducto, variantDraft }: { dataProducto: ProductInputService; variantDraft?: ProductVariantDraft }) => {
      if (!storeId) {
        throw new Error("No se encontró el ID de la tienda en la sesión.");
      }
      const result = await createProduct(
        dataProducto, storeId!, variantDraft,
      );
      if (result && typeof result === "object" && "error" in result) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: (_data, variables) => {
      const invalidations = [
        //queryClient.invalidateQueries({ queryKey: ["products"] }),
        queryClient.invalidateQueries({ queryKey: ["categories"] }),
      ];
      // solo invalida brands si el producto se creó con marca
      if (variables.dataProducto.brand_id) {
        invalidations.push(
          queryClient.invalidateQueries({ queryKey: ["brands"] }),
        );
      }

      return Promise.all(invalidations);
    },
  });
} */

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveProductFull,
    onSuccess: (_data, variables) => {
      const invalidations = [
        queryClient.invalidateQueries({ queryKey: ["products"] }),
        queryClient.invalidateQueries({ queryKey: ["categories"] }),
      ];
      // solo invalida brands si el producto se creó con marca
      if (variables.payload.brand_id) {
        invalidations.push(
          queryClient.invalidateQueries({ queryKey: ["brands"] }),
        );
      }

      return Promise.all(invalidations);
    },
  });
}
