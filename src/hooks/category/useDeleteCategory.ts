import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCategory } from "@/lib/actions/categoryActions";
import { useSessionData } from "../auth/useSessionData";

/**
 * HOOK PARA ELIMINAR CATEGORÍA
 *
 * Después de eliminar exitosamente:
 * - Invalida el cache de categorías paginadas
 * - React Query refetch automáticamente
 * - La tabla se actualiza sin la categoría eliminada
 */
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  //get data session
  const { data: sessionData } = useSessionData();
  const storeId = sessionData?.store?.id;
  const slugStore = sessionData?.store?.slug;

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteCategory(id, storeId!, slugStore!);
      if (result && typeof result === "object" && "error" in result) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["categories"],
      });
      queryClient.invalidateQueries({
        queryKey: ["categories-no-page"],
      });
    },
  });
};
