import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProduct } from "@/lib/actions/productActions";
import { useSessionData } from "../auth/useSessionData";
import { ProductInputServiceUpdate } from "@/lib/schemas/product";

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const { data: sessionData } = useSessionData();
  return useMutation({
    mutationFn: async ({
      id,
      dataProducto,
    }: {
      id: string;
      dataProducto: ProductInputServiceUpdate;
    }) => {
      const result = await updateProduct(
        id,
        dataProducto,
        sessionData?.store?.id!,
      );
      if (result && typeof result === "object" && "error" in result) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["products"] }),
        queryClient.invalidateQueries({ queryKey: ["product", variables.id] }),
      ]);
    },
  });
}
