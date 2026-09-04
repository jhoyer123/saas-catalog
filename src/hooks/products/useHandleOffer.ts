import { useMutation, useQueryClient } from "@tanstack/react-query";
//import { toggleOfferAction } from "@/lib/actions/productActions";
import { toggleOfferAction } from "@/lib/services/productServices";
import type { ToggleOfferParams } from "@/lib/services/productServices";
import { useSessionData } from "../auth/useSessionData";

export const useToggleOffer = () => {
  const queryClient = useQueryClient();

  //get data session
  const { data: sessionData } = useSessionData();
  const slugStore = sessionData?.store?.slug;

  return useMutation({
    mutationFn: ({ params }: { params: ToggleOfferParams }) =>
      toggleOfferAction(params),
    onSuccess: () => {
      // Invalida la lista de productos para que se refresque
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};
