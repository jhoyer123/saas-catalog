import { useQuery } from "@tanstack/react-query";
import { fetchProductById } from "@/lib/services/dashboard";

/**
 * hook for get product by id
 * @param id
 * @returns
 */
export function useGetProductById(id: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProductById(id),
    enabled: !!id, // solo ejecuta si hay id
  });
}
