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
import FormBrand from "@/components/brands/FormBrand";
import type { BrandModalMode } from "@/hooks/brand/useModalsBrand";
import type { BrandDashboard } from "@/types/brand.types";
import { useEffect, useState } from "react";

type FormMode = Exclude<BrandModalMode, "delete">;

const MODAL_CONFIG: Record<
  FormMode,
  { title: string; description: string; submitLabel: string | null }
> = {
  create: {
    title: "Crear marca",
    description: "Llena el formulario para crear una nueva marca.",
    submitLabel: "Crear marca",
  },
  edit: {
    title: "Editar marca",
    description: "Edita los datos de la marca.",
    submitLabel: "Guardar cambios",
  },
  view: {
    title: "Detalle de marca",
    description: "Información de la marca seleccionada.",
    submitLabel: null,
  },
};

interface Props {
  modalState: {
    mode: BrandModalMode | null;
    brand: BrandDashboard | null;
    open: boolean;
  };
  onClose: () => void;
}

export function ModalBrand({ modalState, onClose }: Props) {
  const [isDirty, setIsDirty] = useState(false);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (!modalState.open) setIsDirty(false);
  }, [modalState.open]);

  const isEditing = modalState.mode === "edit";

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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{config.title}</DialogTitle>
            <DialogDescription>{config.description}</DialogDescription>
          </DialogHeader>

          <FormBrand
            defaultValues={modalState.brand ?? undefined}
            setOpen={onClose}
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

            {config.submitLabel && (
              <Button
                type="submit"
                form="brand-form"
                disabled={(isEditing && !isDirty) || isPending}
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

export default ModalBrand;
