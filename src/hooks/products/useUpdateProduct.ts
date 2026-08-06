import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProduct } from "@/lib/services/productServices";
import { ProductInputServiceUpdate } from "@/lib/schemas/product";
import { ProductCatalog } from "@/types/product.types";

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      dataProducto,
    }: {
      id: string;
      dataProducto: ProductInputServiceUpdate;
    }) => {
      const result = await updateProduct(id, dataProducto);
      if (result && typeof result === "object" && "error" in result) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: async (_data, variables) => {
      const prev = queryClient.getQueryData<ProductCatalog>([
        "product",
        variables.id,
      ]);
      const next = variables.dataProducto;

      const invalidations = [
        // siempre se invalida el producto y la lista
        //queryClient.invalidateQueries({ queryKey: ["products"] }),
        //queryClient.invalidateQueries({ queryKey: ["product", variables.id] }),
      ];
      //invalidar solo si no hay nuevas imagenes
      if (!variables.dataProducto.thereAreNewImages) {
        //console.log("No hay imágenes, invalidando detalle y catálogo");
        invalidations.push(
          queryClient.invalidateQueries({ queryKey: ["products"] }),
        );
        invalidations.push(
          queryClient.invalidateQueries({
            queryKey: ["product", variables.id],
          }),
        );
      }

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
