import { useQuery } from "@tanstack/react-query";
import { getProductByIdAction } from "@/lib/actions/productActions";

/**
 * hook for get product by id
 * @param id
 * @returns
 */
export function useGetProductById(id: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductByIdAction(id),
    enabled: !!id, // solo ejecuta si hay id
  });
}
