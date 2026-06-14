// src/hooks/store/useUpdateStore.ts
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { updateStore } from "@/lib/actions/storeActions";
import type { StoreAction } from "@/lib/schemas/store";

interface UpdateStoreInput {
  id: string;
  data: StoreAction;
}

export const useUpdateStore = (): UseMutationResult<
  null,
  Error,
  UpdateStoreInput
> => {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: StoreAction }) => {
      const result = await updateStore(id, data);
      if (result && typeof result === "object" && "error" in result) {
        throw new Error(result.error);
      }
      return result;
    },
  });
};
