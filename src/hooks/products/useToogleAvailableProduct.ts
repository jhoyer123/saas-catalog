import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleAvailableAction } from "@/lib/services/productServices";
import { useSessionData } from "../auth/useSessionData";

export function useToggleAvailableProduct() {
  const queryClient = useQueryClient();

  //get data session
  const { data: sessionData } = useSessionData();
  const storeId = sessionData?.store?.id;

  return useMutation({
    mutationFn: ({
      id,
      is_available,
    }: {
      id: string;
      is_available: boolean;
    }) => toggleAvailableAction(id, is_available, storeId!),
    onSuccess: () => {
      // Invalida la lista de productos para que se refresque
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
