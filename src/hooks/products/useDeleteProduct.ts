import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProductAction } from "@/lib/actions/productActions";
import { useSessionData } from "../auth/useSessionData";

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const { data: sessionData } = useSessionData();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteProductAction(id, sessionData?.store?.id!);
      if (result && typeof result === "object" && "error" in result) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
