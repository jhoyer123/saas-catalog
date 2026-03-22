import { fetchCategories } from "@/lib/services/dashboard";
import { useSessionData } from "../auth/useSessionData";
import { useQuery } from "@tanstack/react-query";

/**
 * hook for get categories without pagination
 */
export const useGetCategoryNoPage = () => {
  //get storeId from session data
  const { data } = useSessionData();

  return useQuery({
    queryKey: ["categories-no-page"],
    queryFn: () => fetchCategories(data?.store?.id!),
    enabled: !!data?.store?.id, // Solo ejecuta si tenemos el storeId;
    staleTime: 1000 * 60 * 5, // Los datos se consideran frescos por 5 minutos
    gcTime: 1000 * 60 * 30, // Mantener en caché por 30 minutos aunque no se usen
  });
};
