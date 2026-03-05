import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCategory } from "@/lib/actions/categoryActions";
import type { CategoryForm } from "@/lib/schemas/category";

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

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryForm }) =>
      updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["categories"] 
      });
    },
  });
};
