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
  const slugStore = data?.store?.slug;

  return useMutation({
    mutationFn: async ({
      newFiles,
      imagesToDelete,
    }: {
      newFiles: File[];
      imagesToDelete: string[];
    }) => {
      if (!storeId) throw new Error("No se encontró el ID de la tienda");
      const result = await updateBannersAction(
        {
          storeId,
          newFiles,
          imagesToDelete,
        },
        slugStore!,
      );
      if (result && typeof result === "object" && "error" in result) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      // Invalidar la consulta de banners para refetch automático
      queryClient.invalidateQueries({
        queryKey: ["storeBanners"],
      });
    },
  });
};
