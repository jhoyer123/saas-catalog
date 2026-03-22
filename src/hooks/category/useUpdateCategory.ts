import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCategory } from "@/lib/actions/categoryActions";
import type { CategoryForm } from "@/lib/schemas/category";
import { useSessionData } from "../auth/useSessionData";

/**
 * 🎣 HOOK PARA ACTUALIZAR CATEGORÍA
 *
 * Después de actualizar exitosamente:
 * - Invalida el cache de categorías paginadas
 * - React Query refetch automáticamente
 * - La tabla muestra los datos actualizados
 */
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  //get data session
  const { data: sessionData } = useSessionData();
  const slugStore = sessionData?.store?.slug;

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CategoryForm }) => {
      const result = await updateCategory(id, data, slugStore!);
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
