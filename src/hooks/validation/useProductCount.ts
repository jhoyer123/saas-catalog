import { fetchProductCount } from "@/lib/services/dashboard";
import { useQuery } from "@tanstack/react-query";

export const useProductCount = (storeId: string | null) => {
  return useQuery({
    queryKey: ["product-count", storeId],
    queryFn: () => fetchProductCount(storeId!),
    enabled: !!storeId,
  });
};
