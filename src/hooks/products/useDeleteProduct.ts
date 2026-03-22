import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProductAction } from "@/lib/actions/productActions";
import { useSessionData } from "../auth/useSessionData";
import { ProductCatalog } from "@/types/product.types";

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  //get data session
  const { data: sessionData } = useSessionData();
  const storeId = sessionData?.store?.id;
  const slugStore = sessionData?.store?.slug;

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteProductAction(id, storeId!, slugStore!);
      if (result && typeof result === "object" && "error" in result) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: (_data, _id, _context) => {
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: ["products"] }),
        queryClient.invalidateQueries({ queryKey: ["brands"] }),
        queryClient.invalidateQueries({ queryKey: ["categories"] }),
      ]);
    },
  });
}
