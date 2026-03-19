"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Form from "@/components/categories/Form";
import type { CategoryModalMode } from "@/hooks/category/useModalsCategory";
import type { Category } from "@/types/category.types";
import { useEffect, useState } from "react";

// ModalCategory solo maneja create / edit / view
// El modo "delete" lo maneja DeleteModal por separado (igual que en productos)
type FormMode = Exclude<CategoryModalMode, "delete">;

// Textos del modal por modo — tabla de lookup para evitar condicionales repetidos
const MODAL_CONFIG: Record<
  FormMode,
  { title: string; description: string; submitLabel: string | null }
> = {
  create: {
    title: "Crear categoría",
    description: "Llena el formulario para crear una nueva categoría.",
    submitLabel: "Crear categoría",
  },
  edit: {
    title: "Editar categoría",
    description: "Edita los datos de la categoría.",
    submitLabel: "Guardar cambios",
  },
  view: {
    title: "Detalle de categoría",
    description: "Información de la categoría seleccionada.",
    submitLabel: null, // en modo view NO hay botón de submit
  },
};

// Recibe el estado del modal desde useModalsCategory (igual que ModalProduct)
interface Props {
  modalState: {
    mode: CategoryModalMode | null;
    category: Category | null;
    open: boolean;
  };
  onClose: () => void;
}

export function ModalCategory({ modalState, onClose }: Props) {
  const [isDirty, setIsDirty] = useState(false);
  const [isPending, setIsPending] = useState(false);
  // Resetea isDirty cada vez que el modal abre/cierra
  useEffect(() => {
    if (!modalState.open) setIsDirty(false);
  }, [modalState.open]);

  const isEditing = modalState.mode === "edit";

  // Solo renderiza para los modos de formulario (no delete)
  if (!modalState.mode || modalState.mode === "delete") return null;

  const config = MODAL_CONFIG[modalState.mode as FormMode];

  return (
    <>
      {isPending && (
        <div className="fixed inset-0 z-9999 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 flex flex-col items-center gap-3 shadow-xl">
            <span className="text-sm text-gray-600">Procesando...</span>
          </div>
        </div>
      )}
      <Dialog
        open={modalState.open}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{config.title}</DialogTitle>
            <DialogDescription>{config.description}</DialogDescription>
          </DialogHeader>

          {/* readOnly=true solo en modo view — el form se deshabilita */}
          <Form
            setOpen={onClose}
            defaultValues={modalState.category ?? undefined}
            readOnly={modalState.mode === "view"}
            onDirtyChange={setIsDirty}
            onPendingChange={setIsPending}
          />

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isPending}>
                {modalState.mode === "view" ? "Cerrar" : "Cancelar"}
              </Button>
            </DialogClose>

            {/* Solo create y edit muestran botón de guardar */}
            {config.submitLabel && (
              <Button
                type="submit"
                form="category-form"
                disabled={isEditing && !isDirty || isPending}
              >
                {config.submitLabel}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
