import { useMutation, useQueryClient } from "@tanstack/react-query";
//import { deleteProductAction } from "@/lib/services/productServices";
import { deleteProduct } from "@/lib/services/productServices";
import { useSessionData } from "../auth/useSessionData";

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  //get data session
  const { data: sessionData } = useSessionData();
  const storeId = sessionData?.store?.id;

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const result = await deleteProduct(id, storeId!);
      /* if (result && typeof result === "object" && "error" in result) {
        throw new Error(result.error);
      }
      return result; */
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
