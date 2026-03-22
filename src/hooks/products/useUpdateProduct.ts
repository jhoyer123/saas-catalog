import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProduct } from "@/lib/actions/productActions";
import { useSessionData } from "../auth/useSessionData";
import { ProductInputServiceUpdate } from "@/lib/schemas/product";
import { ProductCatalog } from "@/types/product.types";

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  //get data session
  const { data: sessionData } = useSessionData();
  const storeId = sessionData?.store?.id;
  const slugStore = sessionData?.store?.slug;
  return useMutation({
    mutationFn: async ({
      id,
      dataProducto,
    }: {
      id: string;
      dataProducto: ProductInputServiceUpdate;
    }) => {
      const result = await updateProduct(
        id,
        dataProducto,
        storeId!,
        slugStore!,
      );
      if (result && typeof result === "object" && "error" in result) {
        throw new Error(result.error);
      }
      return result;
    },
    /* onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["products"] }),
        queryClient.invalidateQueries({ queryKey: ["product", variables.id] }),
        queryClient.invalidateQueries({ queryKey: ["categories-paginated"] }),
        queryClient.invalidateQueries({ queryKey: ["brands-paginated"] }),
      ]);
    }, */
    onSuccess: async (_data, variables) => {
      const prev = queryClient.getQueryData<ProductCatalog>([
        "product",
        variables.id,
      ]);
      const next = variables.dataProducto;

      const invalidations = [
        // siempre se invalida el producto y la lista
        queryClient.invalidateQueries({ queryKey: ["products"] }),
        queryClient.invalidateQueries({ queryKey: ["product", variables.id] }),
      ];

      // solo si cambió la categoría
      if (prev?.category_id !== next.category_id) {
        invalidations.push(
          queryClient.invalidateQueries({ queryKey: ["categories"] }),
        );
      }

      // solo si cambió la marca
      if (prev?.brand_id !== next.brand_id) {
        invalidations.push(
          queryClient.invalidateQueries({ queryKey: ["brands"] }),
        );
      }

      await Promise.all(invalidations);
    },
  });
}
