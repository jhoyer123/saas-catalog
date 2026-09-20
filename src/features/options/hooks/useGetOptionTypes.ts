import { useQuery } from "@tanstack/react-query";
import type { OptionTypeRow } from "../types";
import { listOptionTypes } from "../services/optionTypes.service";

export const useGetOptionTypes = (storeId: string) => {
  return useQuery<OptionTypeRow[]>({
    queryKey: ["option-types", storeId],
    queryFn: () => listOptionTypes(storeId),
    enabled: !!storeId,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 30,
  });
};
