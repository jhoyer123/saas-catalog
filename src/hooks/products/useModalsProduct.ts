import { useState } from "react";
import type { ProductCatalog } from "@/types/product.types";

export type ModalType = "delete" | "offer";

interface ModalState {
  type: ModalType | null;
  product: ProductCatalog | null;
  open: boolean;
}

const initialState: ModalState = {
  type: null,
  product: null,
  open: false,
};

export function useModalsProduct() {
  const [modalState, setModalState] = useState<ModalState>(initialState);

  const openModal = (type: ModalType, product: ProductCatalog) => {
    setModalState({ type, product, open: true });
  };

  const closeModal = () => {
    setModalState(initialState);
  };

  return {
    modalState,
    openModal,
    closeModal,
  };
}

