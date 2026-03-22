import { useQuery } from "@tanstack/react-query";
import { fetchBrands } from "@/lib/services/dashboard";
import { useSessionData } from "../auth/useSessionData";

/**
 * HOOK PARA OBTENER TODAS LAS MARCAS SIN PAGINACIÓN
 */
export const useGetBrandsNoPage = () => {
  const { data } = useSessionData();
  const storeId = data?.store?.id;
  return useQuery({
    queryKey: ["brands-no-page"],
    queryFn: () => fetchBrands(storeId!),
    enabled: !!storeId,
    staleTime: 1000 * 60 * 5, // Los datos se consideran frescos por 5 minutos
    gcTime: 1000 * 60 * 30, // Mantener en caché por 30 minutos aunque no se usen
  });
};
