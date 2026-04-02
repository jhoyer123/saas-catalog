import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleOfferAction } from "@/lib/actions/productActions";
import type { ToggleOfferParams } from "@/lib/actions/productActions";
import { useSessionData } from "../auth/useSessionData";

export const useToggleOffer = () => {
  const queryClient = useQueryClient();

  //get data session
  const { data: sessionData } = useSessionData();
  const slugStore = sessionData?.store?.slug;

  return useMutation({
    mutationFn: async ({
      slugProd,
      params,
    }: {
      slugProd: string;
      params: ToggleOfferParams;
    }) => {
      const result = await toggleOfferAction(slugProd, params, slugStore!);
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
