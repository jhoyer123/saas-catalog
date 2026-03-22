import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteBrand } from "@/lib/actions/brandActions";
import { useSessionData } from "../auth/useSessionData";

/**
 * HOOK PARA ELIMINAR MARCA
 */
export const useDeleteBrand = () => {
  const queryClient = useQueryClient();
  const { data: sessionData } = useSessionData();
  const storeId = sessionData?.store?.id;
  const slugStore = sessionData?.store?.slug;

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteBrand(id, storeId!, slugStore!);
      if (result && typeof result === "object" && "error" in result) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      queryClient.invalidateQueries({ queryKey: ["brands-no-page"] });
    },
  });
};
