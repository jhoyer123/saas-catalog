import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveBranches } from "@/lib/actions/settingActions";
import { useSessionData } from "../auth/useSessionData";

/**
 * Hook para guardar las sucursales de la tienda.
 */
type Branch = {
  name: string;
  address: string;
  phone: string;
  lat?: number;
  lng?: number;
};

export const useSaveBranches = () => {
  const queryClient = useQueryClient();

  //get data session
  const { data: sessionData } = useSessionData();
  const storeId = sessionData?.store?.id;
  const slugStore = sessionData?.store?.slug;

  return useMutation({
    mutationFn: async ({ branches }: { branches: Branch[] }) => {
      if (!storeId || !slugStore) {
        throw new Error("No se pudo obtener la información de la tienda");
      }
      const result = await saveBranches(storeId!, branches, slugStore!);
      if (result && typeof result === "object" && "error" in result) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-branches"] });
    },
  });
};
