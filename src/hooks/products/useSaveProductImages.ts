import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveProductImages } from "@/lib/actions/productActions"; // ajusta el path
import { useSessionData } from "../auth/useSessionData";

interface SaveProductImagesParams {
  productId: string;
  imageUrls: string[];
  slugProd?: string;
}

export const useSaveProductImages = () => {
  const queryClient = useQueryClient();

  //get data session
  const { data: sessionData } = useSessionData();
  const slugStore = sessionData?.store?.slug;

  return useMutation({
    mutationFn: async ({
      productId,
      imageUrls,
      slugProd,
    }: SaveProductImagesParams) => {
      const result = await saveProductImages(
        productId,
        imageUrls,
        slugStore!,
        slugProd,
      );
      if (result && typeof result === "object" && "error" in result) {
        throw new Error(result.error);
      }
      return result;
    },

    /*  onSuccess: (data) => {
      if (data.error) return;
      queryClient.invalidateQueries({ queryKey: ["products"] });
    }, */

    onSuccess: async (_data, variables) => {
      const invalidations = [
        queryClient.invalidateQueries({ queryKey: ["products"] }),
        queryClient.invalidateQueries({
          queryKey: ["product", variables.productId],
        }), // 👈 FIX
      ];

      await Promise.all(invalidations);
    },

    onError: (error) => {
      console.error("Error al guardar imágenes:", error);
    },
  });
};
