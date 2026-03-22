import { useState } from "react";
import type { BrandDashboard } from "@/types/brand.types";

export type BrandModalMode = "create" | "edit" | "view" | "delete";

export interface ModalState {
  mode: BrandModalMode | null;
  brand: BrandDashboard | null;
  open: boolean;
}

const initialState: ModalState = {
  mode: null,
  brand: null,
  open: false,
};

export function useModalsBrand() {
  const [modalState, setModalState] = useState<ModalState>(initialState);

  const openModal = (mode: BrandModalMode, brand: BrandDashboard | null = null) => {
    setModalState({ mode, brand, open: true });
  };

  const closeModal = () => setModalState(initialState);

  return { modalState, openModal, closeModal };
}

export default useModalsBrand;
