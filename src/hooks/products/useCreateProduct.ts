import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProduct } from "@/lib/actions/productActions";
import { useSessionData } from "../auth/useSessionData";
import { ProductInputService } from "@/lib/schemas/product";

import { useRouter } from "next/navigation";

export function useCreateProduct() {
  const queryClient = useQueryClient();

  //get data session
  const { data: sessionData } = useSessionData();
  const router = useRouter();

  return useMutation({
    mutationFn: (dataProducto: ProductInputService) =>
      createProduct(
        dataProducto,
        sessionData?.store?.id!,
        sessionData?.profile?.id!,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      router.push("/dashboard/products");
    },
  });
}
