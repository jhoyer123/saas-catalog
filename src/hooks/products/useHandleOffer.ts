import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleOfferAction } from "@/lib/actions/productActions";
import type { ToggleOfferParams } from "@/lib/actions/productActions";

export const useToggleOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: ToggleOfferParams) => toggleOfferAction(params),

    onSuccess: () => {
      // Invalida la lista de productos para que se refresque
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};
