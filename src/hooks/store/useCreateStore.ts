// src/hooks/store/useCreateStore.ts
import {
  useMutation,
  useQueryClient,
  UseMutationResult,
} from "@tanstack/react-query";
import { createStore } from "@/lib/actions/storeActions";
import type { StoreAction, StoreForm } from "@/lib/schemas/store";
import { useSessionData } from "../auth/useSessionData";

export const useCreateStore = (): UseMutationResult<
  { id: string },
  Error,
  StoreForm
> => {
  const { data } = useSessionData();
  const userId = data?.profile?.id;

  return useMutation({
    mutationFn: async (data: StoreAction) => {
      const result = await createStore(data, userId!);
      if (result && typeof result === "object" && "error" in result) {
        throw new Error(result.error);
      }
      return result;
    },
  });
};
