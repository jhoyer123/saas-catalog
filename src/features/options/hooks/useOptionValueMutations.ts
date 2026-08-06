import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createOptionValue,
  updateOptionValue,
  deleteOptionValue,
} from "../services/optionValues.service";
import type { OptionValueForm } from "../schemas/optionValue.schema";

const OPTION_VALUES_KEY = "option-values";
const OPTION_TYPES_KEY = "option-types";

export const useCreateOptionValue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      typeId,
      dataInput,
    }: {
      typeId: string;
      dataInput: OptionValueForm;
    }) => {
      return createOptionValue(typeId, dataInput);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [OPTION_VALUES_KEY, variables.typeId],
      });
      queryClient.invalidateQueries({ queryKey: [OPTION_TYPES_KEY] });
    },
  });
};

export const useUpdateOptionValue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      valueId,
      dataInput,
    }: {
      valueId: string;
      dataInput: OptionValueForm;
      typeId: string;
    }) => {
      return updateOptionValue(valueId, dataInput);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [OPTION_VALUES_KEY, variables.typeId],
      });
      queryClient.invalidateQueries({ queryKey: [OPTION_TYPES_KEY] });
    },
  });
};

export const useDeleteOptionValue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ valueId }: { valueId: string; typeId: string }) => {
      return deleteOptionValue(valueId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [OPTION_VALUES_KEY, variables.typeId],
      });
      queryClient.invalidateQueries({ queryKey: [OPTION_TYPES_KEY] });
    },
  });
};
