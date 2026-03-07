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

  return useMutation({
    mutationFn: (data: StoreForm) => createStore(data, userId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session-data"] });
    },
  });
};
