import { useQuery } from "@tanstack/react-query";
import { getBannersAction } from "@/lib/actions/bannerActions";
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
      return getBannersAction(storeId);
    },
    enabled: !!storeId, // Solo ejecutar si storeId está disponible
  });
};
