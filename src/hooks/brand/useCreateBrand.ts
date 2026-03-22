import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBrand } from "@/lib/actions/brandActions";
import { useSessionData } from "../auth/useSessionData";

/**
 * HOOK PARA CREAR MARCA
 */
export const useCreateBrand = () => {
  const queryClient = useQueryClient();
  const { data: sessionData } = useSessionData();
  const storeId = sessionData?.store?.id;
  const slugStore = sessionData?.store?.slug;

  return useMutation({
    mutationFn: async (name: string) => {
      const result = await createBrand(name, storeId!, slugStore!);
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
