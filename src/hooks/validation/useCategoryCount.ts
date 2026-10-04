import { fetchCategoryCount } from "@/lib/services/dashboard";
import { useQuery } from "@tanstack/react-query";

export const useCategoryCount = (storeId: string | null) => {
  return useQuery({
    queryKey: ["category-count", storeId],
    queryFn: () => fetchCategoryCount(storeId!),
    enabled: !!storeId,
  });
};