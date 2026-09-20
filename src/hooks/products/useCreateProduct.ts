import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveProductFull } from "@/lib/services/productServices";

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
