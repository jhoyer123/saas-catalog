import { useQuery } from "@tanstack/react-query";
import { fetchBanners } from "@/lib/services/dashboard";
import { useSessionData } from "../auth/useSessionData";

/**
 * get banner images for the store. Returns an array of image URLs.
 */
export const useGetBanner = () => {
  //get store id from session
  const { data } = useSessionData();
  const storeId = data?.store?.id;

  return useQuery({
    queryKey: ["storeBanners"],
    queryFn: async () => {
      if (!storeId) throw new Error("No se encontró el ID de la tienda");
      return fetchBanners(storeId);
    },
    enabled: !!storeId, // Solo ejecutar si storeId está disponible
  });
};
