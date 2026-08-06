import { useState } from "react";
import type { OptionTypeRow, OptionValueRow } from "../types";

export type OptionTypeModalMode = "create" | "edit";

export interface ModalState {
  mode: OptionTypeModalMode | null;
  optionType: OptionTypeRow | null;
  open: boolean;
}

const initialState: ModalState = {
  mode: null,
  optionType: null,
  open: false,
};

export function useModalsOptionType() {
  const [modalState, setModalState] = useState<ModalState>(initialState);

  const openModal = (
    mode: OptionTypeModalMode,
    optionType: OptionTypeRow | null = null,
  ) => {
    setModalState({ mode, optionType, open: true });
  };

  const closeModal = () => setModalState(initialState);

  return { modalState, openModal, closeModal };
}

export type OptionValueModalMode = "create" | "edit";

export interface OptionValueModalState {
  mode: OptionValueModalMode | null;
  optionValue: OptionValueRow | null;
  open: boolean;
}

const initialValueState: OptionValueModalState = {
  mode: null,
  optionValue: null,
  open: false,
};

export function useModalsOptionValue() {
  const [modalState, setModalState] =
    useState<OptionValueModalState>(initialValueState);

  const openModal = (
    mode: OptionValueModalMode,
    optionValue: OptionValueRow | null = null,
  ) => {
    setModalState({ mode, optionValue, open: true });
  };

  const closeModal = () => setModalState(initialValueState);

  return { modalState, openModal, closeModal };
}
