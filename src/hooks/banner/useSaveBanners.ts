import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveBannersAction } from "@/lib/services/bannerServices";
import { useSessionData } from "../auth/useSessionData";

export const useSaveBanners = () => {
  const queryClient = useQueryClient();
  const { data } = useSessionData();
  const storeId = data?.store?.id;

  return useMutation({
    mutationFn: async ({
      imageUrls,
      imagesToDelete,
    }: {
      imageUrls: string[];
      imagesToDelete: string[];
    }) => {
      if (!storeId) throw new Error("No se encontró el ID de la tienda");
      const result = await saveBannersAction(
        storeId,
        imageUrls,
        imagesToDelete,
      );
      if (result && typeof result === "object" && "error" in result) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["storeBanners"] });
    },
  });
};
