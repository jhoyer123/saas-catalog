// src/hooks/store/useUpdateStore.ts
import {
  useMutation,
  useQueryClient,
  UseMutationResult,
} from "@tanstack/react-query";
import { updateStore } from "@/lib/actions/storeActions";
import type { StoreForm } from "@/lib/schemas/store";

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

  return useMutation({
    mutationFn: ({ id, data }: UpdateStoreInput) => updateStore(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session-data"] });
    },
  });
};
