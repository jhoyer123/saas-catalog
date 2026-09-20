import { useQuery } from "@tanstack/react-query";
import { listOptionValues } from "../services/optionValues.service";
import type { OptionValueRow } from "../types";

export const useGetOptionValues = (typeId: string | null) => {
  return useQuery<OptionValueRow[]>({
    queryKey: ["option-values", typeId],
    queryFn: () => listOptionValues(typeId!),
    enabled: !!typeId,
    //staleTime: 1000 * 60 * 5,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 30,
  });
};
