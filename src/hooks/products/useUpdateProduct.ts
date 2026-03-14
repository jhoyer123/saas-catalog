import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProduct } from "@/lib/actions/productActions";
import { useSessionData } from "../auth/useSessionData";
import { ProductInputServiceUpdate } from "@/lib/schemas/product";

import { useRouter } from "next/navigation";

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const { data: sessionData } = useSessionData();
  const router = useRouter();
  return useMutation({
    mutationFn: ({
      id,
      dataProducto,
    }: {
      id: string;
      dataProducto: ProductInputServiceUpdate;
    }) => updateProduct(id, dataProducto, sessionData?.store?.id!),
    /* onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
      router.push("/dashboard/products");
    }, */
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["products"] }),
        queryClient.invalidateQueries({ queryKey: ["product", variables.id] }),
      ]);
      router.push("/dashboard/products");
    },
  });
}
