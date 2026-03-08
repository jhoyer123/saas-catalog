"use client";

import { useMemo } from "react";
import { ProductCatalog } from "@/types/product.types";
//table
import { createProductsColumns } from "./products-columns";
import { DataTableServer } from "@/components/shared/DataTableServer";
import { fetchProductsPaginated } from "@/lib/services/dashboard";
import { useSessionData } from "@/hooks/auth/useSessionData";
import { useModalsProduct } from "@/hooks/products/useModalsProduct";
import ModalProduct from "@/components/products/modal/ModalProduct";
import { useProductActions } from "@/hooks/products/useHandleAction";
import { DebouncedInput } from "@/components/shared/DebouncedInput";
import SkeletonTable from "@/components/shared/SkeletonTable";

export function ProductsTable() {
  //storeid for get products
  const { data: sessionData, isPending } = useSessionData();
  const storeId = sessionData?.store?.id!;
  //hook modals for products with state and functions to open and close
  const { modalState, openModal, closeModal } = useModalsProduct();

  //hooks de acciones
  const { deleteProduct, toggleOffer } = useProductActions();

  //columns for products table
  const columns = useMemo(
    () => createProductsColumns({ onOpenModal: openModal }),
    [openModal],
  );

  if (isPending || !storeId) {
    return <SkeletonTable />;
  }

  return (
    <>
      <DataTableServer<ProductCatalog>
        columns={columns}
        fetchData={(params) => fetchProductsPaginated(storeId, params)}
        toolbar={({ searchInput, setSearchInput }) => (
          <DebouncedInput
            valueDefault={searchInput}
            onChange={setSearchInput}
            placeholder="Buscar por nombre..."
          />
        )}
        queryKey="products"
        searchKey="name"
        searchPlaceholder="Buscar productos..."
        defaultSortBy="created_at"
      />

      <ModalProduct
        modalState={modalState}
        onClose={closeModal}
        onConfirmDelete={(product) => deleteProduct(product.id)}
        onConfirmOffer={() => toggleOffer}
      />
    </>
  );
}
