import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCategory } from "@/lib/actions/categoryActions";
import type { CategoryForm } from "@/lib/schemas/category";
import { CreateCategoryInput } from "@/types/category.types";

/**
 * HOOK PARA CREAR CATEGORÍA
 *
 * Después de crear exitosamente:
 * 1. Invalida todas las queries de categorías paginadas
 * 2. React Query automáticamente refetch las páginas visibles
 * 3. La tabla se actualiza mostrando la nueva categoría
 */
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryInput) => createCategory(data),
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
