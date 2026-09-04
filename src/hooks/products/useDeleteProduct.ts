import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProduct } from "@/lib/services/productServices";
import { useSessionData } from "../auth/useSessionData";

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const { data: sessionData } = useSessionData();
  const storeId = sessionData?.store?.id;

  return useMutation({
    mutationFn: ({ id }: { id: string }) => deleteProduct(id, storeId!),
    onSuccess: (_data, _id, _context) => {
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: ["products"] }),
        queryClient.invalidateQueries({ queryKey: ["brands"] }),
        queryClient.invalidateQueries({ queryKey: ["categories"] }),
      ]);
    },
  });
}
