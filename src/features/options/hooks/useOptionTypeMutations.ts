import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSessionData } from "@/hooks/auth/useSessionData";
import {
  createOptionType,
  updateOptionType,
  deleteOptionType,
  reorderOptionTypes,
} from "../services/optionTypes.service";
import type { OptionTypeForm } from "../schemas/optionType.schema";

const OPTION_TYPES_KEY = "option-types";

export const useCreateOptionType = () => {
  const queryClient = useQueryClient();
  const { data: sessionData } = useSessionData();
  const storeId = sessionData?.store?.id;

  return useMutation({
    mutationFn: async (dataInput: OptionTypeForm) => {
      const result = await createOptionType(storeId!, dataInput);
      if (result && typeof result === "object" && "error" in result) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [OPTION_TYPES_KEY] });
    },
  });
};

export const useUpdateOptionType = () => {
  const queryClient = useQueryClient();
  const { data: sessionData } = useSessionData();
  const storeId = sessionData?.store?.id;

  return useMutation({
    mutationFn: async ({
      id,
      dataInput,
    }: {
      id: string;
      dataInput: OptionTypeForm;
    }) => {
      const result = await updateOptionType(id, dataInput, storeId!);
      if (result && typeof result === "object" && "error" in result) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [OPTION_TYPES_KEY] });
    },
  });
};

export const useDeleteOptionType = () => {
  const queryClient = useQueryClient();
  const { data: sessionData } = useSessionData();
  const storeId = sessionData?.store?.id;

  return useMutation({
    mutationFn: async (typeId: string) => {
      const result = await deleteOptionType(typeId, storeId!);
      if (result && typeof result === "object" && "error" in result) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [OPTION_TYPES_KEY] });
    },
  });
};

export const useReorderOptionTypes = () => {
  const queryClient = useQueryClient();
  const { data: sessionData } = useSessionData();
  const storeId = sessionData?.store?.id;

  return useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const result = await reorderOptionTypes(orderedIds);
      if (result && typeof result === "object" && "error" in result) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [OPTION_TYPES_KEY] });
    },
  });
};
