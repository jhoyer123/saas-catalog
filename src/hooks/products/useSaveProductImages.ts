import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveProductImages } from "@/lib/actions/productActions"; // ajusta el path
import { useSessionData } from "../auth/useSessionData";

interface SaveProductImagesParams {
  productId: string;
  imageUrls: string[];
}

export const useSaveProductImages = () => {
  const queryClient = useQueryClient();

  //get data session
  const { data: sessionData } = useSessionData();
  const slugStore = sessionData?.store?.slug;

  return useMutation({
    mutationFn: async ({ productId, imageUrls }: SaveProductImagesParams) => {
      const result = await saveProductImages(productId, imageUrls, slugStore!);
      if (result && typeof result === "object" && "error" in result) {
        throw new Error(result.error);
      }
      return result;
    },

    onSuccess: (data) => {
      if (data.error) return;
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },

    onError: (error) => {
      console.error("Error al guardar imágenes:", error);
    },
  });
};
