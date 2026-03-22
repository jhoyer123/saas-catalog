// src/hooks/store/useCreateStore.ts
import {
  useMutation,
  useQueryClient,
  UseMutationResult,
} from "@tanstack/react-query";
import { createStore } from "@/lib/actions/storeActions";
import type { StoreForm } from "@/lib/schemas/store";
import { useSessionData } from "../auth/useSessionData";

/**
 * Hook para crear una tienda nueva.
 *
 * Solo necesita el userId del perfil autenticado.
 * El ID de la tienda se genera al insertar en la DB
 * (ver createStore en storeActions).
 */
export const useCreateStore = (): UseMutationResult<
  { id: string },
  Error,
  StoreForm
> => {
  const queryClient = useQueryClient();
  const { data } = useSessionData();
  const userId = data?.profile?.id;
  const slugStore = data?.store?.slug;

  return useMutation({
    mutationFn: async (data: StoreForm) => {
      const result = await createStore(data, userId!, slugStore!);
      if (result && typeof result === "object" && "error" in result) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session-data"] });
    },
  });
};
