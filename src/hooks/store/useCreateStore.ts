// src/hooks/store/useCreateStore.ts
import {
  useMutation,
  useQueryClient,
  UseMutationResult,
} from "@tanstack/react-query";
import { createStore } from "@/lib/actions/storeActions";
import type { StoreForm } from "@/lib/schemas/store";
import { useSessionData } from "../auth/useSessionData";

export const useCreateStore = (): UseMutationResult<null, Error, StoreForm> => {
  const queryClient = useQueryClient();

  //get store id from session data
  const { data } = useSessionData();
  const storeId = data?.store?.id;

  return useMutation({
    mutationFn: (data: StoreForm) => createStore(data, storeId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session-data"] });
    },
  });
};
