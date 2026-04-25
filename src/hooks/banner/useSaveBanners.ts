import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveBannersAction } from "@/lib/actions/bannerActions";
import { useSessionData } from "../auth/useSessionData";

export const useSaveBanners = () => {
  const queryClient = useQueryClient();
  const { data } = useSessionData();
  const storeId = data?.store?.id;
  const slugStore = data?.store?.slug;

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
        slugStore!,
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
