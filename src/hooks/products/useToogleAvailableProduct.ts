import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleAvailableAction } from "@/lib/actions/productActions";
import { useSessionData } from "../auth/useSessionData";

export function useToggleAvailableProduct() {
  const queryClient = useQueryClient();

  //get data session
  const { data: sessionData } = useSessionData();
  const storeId = sessionData?.store?.id;
  const slugStore = sessionData?.store?.slug;

  return useMutation({
    mutationFn: async ({
      id,
      slugProd,
      is_available,
    }: {
      id: string;
      slugProd: string;
      is_available: boolean;
    }) => {
      if (!storeId || !slugStore) {
        throw new Error("No se pudo obtener la información de la tienda");
      }
      const result = await toggleAvailableAction(
        id,
        slugProd,
        is_available,
        storeId!,
        slugStore!,
      );
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
}
