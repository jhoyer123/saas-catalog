import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProductAction } from "@/lib/actions/productActions";
import { useSessionData } from "../auth/useSessionData";

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const { data: sessionData } = useSessionData();

  return useMutation({
    mutationFn: (id: string) =>
      deleteProductAction(id, sessionData?.store?.id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
