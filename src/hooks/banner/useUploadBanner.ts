import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadBannersAction } from "@/lib/actions/bannerActions";
import { useSessionData } from "../auth/useSessionData";

export function useUploadBanner() {
  const queryClient = useQueryClient();
  const { data: session } = useSessionData();
  const storeId = session?.store?.id;
  const slugStore = session?.store?.slug;

  return useMutation({
    mutationFn: async (files: File[]) => {
      // Validación de seguridad antes de ejecutar la acción
      if (!storeId) throw new Error("No se encontró el ID de la tienda");
      const result = await uploadBannersAction(storeId, files, slugStore!);
      if (result && typeof result === "object" && "error" in result) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      // Sintaxis correcta para v5
      queryClient.invalidateQueries({
        queryKey: ["storeBanners"],
      });
    },
  });
}
