"use client";

import { useMemo } from "react";
import { DataTableServer } from "@/components/shared/DataTableServer";
import { getCategoriesColumns } from "./categories-columns";
import { getCategoriesPaginate } from "@/lib/actions/categoryActions";
import { Category } from "@/types/category.types";
import { useModalsCategory } from "@/hooks/category/useModalsCategory";
import { ModalCategory } from "@/components/categories/ModalCategory";
import { DeleteModal } from "@/components/shared/DeleteAlert";
import { Button } from "@/components/ui/button";
import { useDeleteCategory } from "@/hooks/category/useDeleteCategory";
import { useToastPromise } from "@/hooks/shared/useToastPromise";

/**
 * CategoriesTable — self-contained, igual que ProductsTable.
 *
 * Maneja internamente:
 *   - El estado de todos los modales (create / edit / view / delete)
 *   - El botón de agregar categoría
 *   - Los modales: ModalCategory (formulario) + DeleteModal
 *
 * La página solo renderiza <CategoriesTable /> y el título.
 */
export function CategoriesTable() {
  // ║ Estado de modales (hook propio, no viene de afuera)
  const { modalState, openModal, closeModal } = useModalsCategory();

  // ║ Acciones
  const { mutateAsync: removeCategory } = useDeleteCategory();
  const { showPromise } = useToastPromise();

  // Eliminar con toast — mismo patrón que useProductActions
  const handleDelete = (category: Category) => {
    showPromise({
      promise: async () => {
        await removeCategory(category.id);
        closeModal();
      },
      messages: {
        loading: "Eliminando categoría...",
        success: "Categoría eliminada",
        error: (err) => err.message,
      },
      richColors: true,
      position: "top-right",
      duration: 3000,
    });
  };

  // ║ Columnas memoizadas — se reconstruyen solo si cambia openModal
  const columns = useMemo(
    () => getCategoriesColumns({ onOpenModal: openModal }),
    [openModal],
  );

  return (
    <>
      {/* Botón para crear — abre el modal en modo "create" */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categorías</h1>
          <p className="text-muted-foreground">
            Gestiona las categorías de tus productos
          </p>
        </div>
        <Button onClick={() => openModal("create", null)}>
          Agregar categoría
        </Button>
      </div>

      <DataTableServer<Category>
        columns={columns}
        fetchData={getCategoriesPaginate}
        queryKey="categories"
        searchKey="name"
        searchPlaceholder="Buscar categorías..."
        defaultSortBy="created_at"
      />

      {/* Modal de formulario: create / edit / view */}
      <ModalCategory modalState={modalState} onClose={closeModal} />

      {/* Modal de confirmación de borrado */}
      {modalState.mode === "delete" && modalState.category && (
        <DeleteModal
          title="Eliminar categoría"
          description={
            <>
              ¿Estás seguro de que deseas eliminar la categoría{" "}
              <strong>{modalState.category.name}</strong>? Esta acción no se
              puede deshacer.
            </>
          }
          open={modalState.open}
          onOpenChange={(open) => {
            if (!open) closeModal();
          }}
          onConfirm={() => handleDelete(modalState.category!)}
        />
      )}
    </>
  );
}
