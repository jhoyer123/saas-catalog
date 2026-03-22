"use client";

import { useMemo } from "react";
import { DataTableServer } from "@/components/shared/DataTableServer";
import { getBrandsColumns } from "./brands-columns";
import { fetchBrandsPaginated } from "@/lib/services/dashboard";
import type { BrandDashboard } from "@/types/brand.types";
import { Button } from "@/components/ui/button";
import { DeleteModal } from "@/components/shared/DeleteAlert";
import { useDeleteBrand } from "@/hooks/brand/useDeleteBrand";
import { useToastPromise } from "@/hooks/shared/useToastPromise";
import { useSessionData } from "@/hooks/auth/useSessionData";
import { DebouncedInput } from "@/components/shared/DebouncedInput";
import SkeletonTable from "@/components/shared/SkeletonTable";
import { ModalBrand } from "@/components/brands/ModalBrand";
import { useModalsBrand } from "@/hooks/brand/useModalsBrand";

export function BrandsTable() {
  const { data: sessionData, isPending } = useSessionData();
  const storeId = sessionData?.store?.id!;

  const { modalState, openModal, closeModal } = useModalsBrand();

  const { mutateAsync: removeBrand } = useDeleteBrand();
  const { showPromise } = useToastPromise();

  const handleDelete = (brand: BrandDashboard) => {
    showPromise({
      promise: async () => {
        await removeBrand(brand.id);
        closeModal();
      },
      messages: {
        loading: "Eliminando marca...",
        success: "Marca eliminada",
        error: (err: Error) => err.message,
      },
      richColors: true,
      position: "top-right",
      duration: 3000,
    });
  };

  const columns = useMemo(
    () => getBrandsColumns({ onOpenModal: openModal }),
    [openModal],
  );

  if (isPending || !storeId) return <SkeletonTable />;

  return (
    <>
      <div className="flex flex-col justify-between items-center gap-4 lg:flex-row">
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-bold tracking-tight font-poppins md:text-2xl">
            Lista de Marcas
          </h1>
          <p className="text-sm text-muted-foreground font-inter lg:text-md">
            Gestiona las marcas de tus productos
          </p>
        </div>
        <Button onClick={() => openModal("create", null)}>Agregar marca</Button>
      </div>

      <DataTableServer<BrandDashboard>
        toolbar={({ searchInput, setSearchInput }) => (
          <DebouncedInput
            valueDefault={searchInput}
            onChange={setSearchInput}
            placeholder="Buscar por nombre..."
          />
        )}
        columns={columns}
        fetchData={(params) => fetchBrandsPaginated(params, storeId)}
        queryKey="brands"
        searchKey="name"
        searchPlaceholder="Buscar marcas..."
        defaultSortBy="created_at"
      />

      <ModalBrand modalState={modalState} onClose={closeModal} />

      {modalState.mode === "delete" && modalState.brand && (
        <DeleteModal
          title="Eliminar marca"
          description={
            <>
              ¿Estás seguro de que deseas eliminar la marca{" "}
              <strong>{modalState.brand.name}</strong>? Esta acción no se puede
              deshacer.
            </>
          }
          open={modalState.open}
          onOpenChange={(open) => {
            if (!open) closeModal();
          }}
          onConfirm={() => handleDelete(modalState.brand!)}
        />
      )}
    </>
  );
}
