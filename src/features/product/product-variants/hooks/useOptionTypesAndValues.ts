import { useQuery } from "@tanstack/react-query";
import { listOptionTypesAndValuesForProductVariant } from "@/features/product/product-variants/services/optionsForVariants.service";
import { useSessionData } from "@/hooks/auth/useSessionData";

export function useOptionTypesForProduct() {
  const { data: sessionData } = useSessionData();
  const storeId = sessionData?.store?.id;

  return useQuery({
    queryKey: ["option-types-for-product", storeId] as const,
    queryFn: () => listOptionTypesAndValuesForProductVariant(storeId!),
    enabled: !!storeId,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 30,
  });
}
