import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProduct } from "@/lib/actions/productActions";
import { useSessionData } from "../auth/useSessionData";
import { ProductInputService } from "@/lib/schemas/product";

export function useCreateProduct() {
  const queryClient = useQueryClient();

  //get data session
  const { data: sessionData } = useSessionData();

  return useMutation({
    mutationFn: async (dataProducto: ProductInputService) => {
      const result = await createProduct(dataProducto, sessionData?.store?.id!);
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
