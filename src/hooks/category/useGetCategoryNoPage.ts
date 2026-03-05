import { getCategories } from "@/lib/actions/categoryActions";
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
    queryFn: () => getCategories(data?.store?.id!),
    enabled: !!data?.store?.id, // Solo ejecuta si tenemos el storeId;
  });
};
