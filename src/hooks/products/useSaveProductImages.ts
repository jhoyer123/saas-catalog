import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveProductImages } from "@/lib/services/productServices";

interface SaveProductImagesParams {
  productId: string;
  imageUrls: string[];
}

export const useSaveProductImages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, imageUrls }: SaveProductImagesParams) => {
      const result = await saveProductImages(productId, imageUrls);
      if (result && typeof result === "object" && "error" in result) {
        throw new Error(result.error);
      }
      return result;
    },

    onSuccess: async (_data, variables) => {
      const invalidations = [
        queryClient.invalidateQueries({ queryKey: ["products"] }),
        queryClient.invalidateQueries({
          queryKey: ["product", variables.productId],
        }),
      ];

      await Promise.all(invalidations);
    },

    onError: (error) => {
      console.error("Error al guardar imágenes:", error);
    },
  });
};
