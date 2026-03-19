import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleOfferAction } from "@/lib/actions/productActions";
import type { ToggleOfferParams } from "@/lib/actions/productActions";

export const useToggleOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: ToggleOfferParams) => {
      const result = await toggleOfferAction(params);
      if (result && typeof result === "object" && "error" in result) {
        throw new Error(result.error);
      }
      return result;
    },

    onSuccess: () => {
      // Invalida la lista de productos para que se refresque
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};
