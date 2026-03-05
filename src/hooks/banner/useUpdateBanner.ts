import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBannersAction } from "@/lib/actions/bannerActions";
import { useSessionData } from "../auth/useSessionData";

/**
 * hook for updating banner images.
 */

export const useUpdateBanner = () => {
  const queryClient = useQueryClient();

  //get store id
  const { data } = useSessionData();
  const storeId = data?.store?.id;

  return useMutation({
    mutationFn: async ({
      newFiles,
      imagesToDelete,
    }: {
      newFiles: File[];
      imagesToDelete: string[];
    }) => {
      if (!storeId) throw new Error("No se encontró el ID de la tienda");
      return updateBannersAction({
        storeId,
        newFiles,
        imagesToDelete,
      });
    },
    onSuccess: () => {
      // Invalidar la consulta de banners para refetch automático
      queryClient.invalidateQueries({
        queryKey: ["storeBanners"],
      });
    },
  });
};
