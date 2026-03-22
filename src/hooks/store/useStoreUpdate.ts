// src/hooks/store/useUpdateStore.ts
import {
  useMutation,
  useQueryClient,
  UseMutationResult,
} from "@tanstack/react-query";
import { updateStore } from "@/lib/actions/storeActions";
import type { StoreForm } from "@/lib/schemas/store";
import { useSessionData } from "../auth/useSessionData";

interface UpdateStoreInput {
  id: string;
  data: StoreForm;
}

export const useUpdateStore = (): UseMutationResult<
  null,
  Error,
  UpdateStoreInput
> => {
  const queryClient = useQueryClient();
  const { data } = useSessionData();
  const userId = data?.profile?.id;
  const slugStore = data?.store?.slug;

  return useMutation({
    mutationFn: async ({ id, data }: UpdateStoreInput) => {
      const result = await updateStore(id, data, slugStore!);
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
