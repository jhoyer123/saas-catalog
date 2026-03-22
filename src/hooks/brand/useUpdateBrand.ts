import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBrand } from "@/lib/actions/brandActions";
import { useSessionData } from "../auth/useSessionData";

type UpdateBrandPayload = { id: string; name: string };

/**
 * HOOK PARA ACTUALIZAR MARCA
 */
export const useUpdateBrand = () => {
  const queryClient = useQueryClient();
  const { data: sessionData } = useSessionData();
  const storeId = sessionData?.store?.id;
  const slugStore = sessionData?.store?.slug;

  return useMutation({
    mutationFn: async ({ id, name }: UpdateBrandPayload) => {
      const result = await updateBrand(id, name, storeId!, slugStore!);
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
