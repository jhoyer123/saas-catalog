import { useQuery } from "@tanstack/react-query";
import { fetchBranches } from "@/lib/services/dashboard";
import { useSessionData } from "../auth/useSessionData";

/**
 * Hook para obtener las sucursales de la tienda.
 */
export const useGetBranches = () => {
  const { data: sessionData } = useSessionData();
  const storeId = sessionData?.store?.id;
  if (!storeId) {
    throw new Error("No se pudo obtener la información de la tienda");
  }
  return useQuery({
    queryKey: ["store-branches"],
    queryFn: () => fetchBranches(storeId!),
  });
};
