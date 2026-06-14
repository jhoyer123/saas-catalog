import { useQuery } from "@tanstack/react-query";
import { fetchSocialLinks } from "@/lib/services/dashboard";
import { useSessionData } from "../auth/useSessionData";

/**
 * Hook para obtener las redes sociales de la tienda.
 */
export const useGetSocialLinks = () => {
  const { data: sessionData } = useSessionData();
  const storeId = sessionData?.store?.id;
  return useQuery({
    queryKey: ["store-social-links"],
    queryFn: () => fetchSocialLinks(storeId!),
    enabled: !!storeId,
  });
};
