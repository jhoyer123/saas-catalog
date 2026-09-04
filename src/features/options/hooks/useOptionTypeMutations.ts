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
    mutationFn: (dataInput: OptionTypeForm) =>
      createOptionType(storeId!, dataInput),
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
    mutationFn: ({
      id,
      dataInput,
    }: {
      id: string;
      dataInput: OptionTypeForm;
    }) => updateOptionType(id, dataInput, storeId!),
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
    mutationFn: (typeId: string) => deleteOptionType(typeId, storeId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [OPTION_TYPES_KEY] });
    },
  });
};

export const useReorderOptionTypes = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderedIds: string[]) => reorderOptionTypes(orderedIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [OPTION_TYPES_KEY] });
    },
  });
};
