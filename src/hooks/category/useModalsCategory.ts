import { useState } from "react";
import type { Category } from "@/types/category.types";

// Los 3 modos posibles del modal de categorías
export type CategoryModalMode = "create" | "edit" | "view" | "delete";

// Estado que describe el modal en cualquier momento
export interface ModalState {
  mode: CategoryModalMode | null;
  category: Category | null;
  open: boolean;
}

// Estado inicial: cerrado, sin modo ni categoría
const initialState: ModalState = {
  mode: null,
  category: null,
  open: false,
};

/**
 * Hook que centraliza el estado del modal de categorías.
 * El componente que lo use solo necesita llamar a openModal/closeModal —
 * no sabe nada de useState ni de la estructura del estado interno.
 */
export function useModalsCategory() {
  const [modalState, setModalState] = useState<ModalState>(initialState);

  // Abre el modal en el modo indicado, con la categoría (si aplica)
  // Para "create": category = null
  // Para "edit" / "view": category = la categoría seleccionada
  const openModal = (mode: CategoryModalMode, category: Category | null = null) => {
    setModalState({ mode, category, open: true });
  };

  // Cierra el modal y resetea todo al estado inicial
  const closeModal = () => {
    setModalState(initialState);
  };

  return {
    modalState,
    openModal,
    closeModal,
  };
}
