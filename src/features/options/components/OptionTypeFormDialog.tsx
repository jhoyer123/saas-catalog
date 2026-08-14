"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import FormInput from "@/components/shared/InputForm";
import {
  optionTypeSchema,
  type OptionTypeForm,
} from "../schemas/optionType.schema";
import type { ModalState } from "../hooks/useModals";
import { useToastPromise } from "@/hooks/shared/useToastPromise";
import {
  useCreateOptionType,
  useUpdateOptionType,
} from "../hooks/useOptionTypeMutations";
import { useEffect, useState } from "react";
import { normalizeText } from "../lib/helpers/formatters";

interface Props {
  modalState: ModalState;
  onClose: () => void;
}

const INPUT_TYPE_OPTIONS = [
  { value: "text", label: "Texto" },
  { value: "color", label: "Color" },
  { value: "image", label: "Imagen" },
  { value: "number", label: "Número" },
];

export function OptionTypeFormDialog({ modalState, onClose }: Props) {
  const isEditing = modalState.mode === "edit";
  const optionType = modalState.optionType;
  const hasValues = (optionType?.value_count ?? 0) > 0;

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<OptionTypeForm>({
    resolver: zodResolver(optionTypeSchema),
    defaultValues: {
      name: optionType?.name ?? "",
      input_type: optionType?.input_type ?? "text",
      is_visual_default: optionType?.is_visual_default ?? false,
      is_default_on_create: optionType?.is_default_on_create ?? false,
    },
  });

  useEffect(() => {
    if (modalState.open) {
      reset({
        name: optionType?.name ?? "",
        input_type: optionType?.input_type ?? "text",
        is_visual_default: optionType?.is_visual_default ?? false,
      });
    }
  }, [modalState.open, optionType, reset]);

  const { showPromise } = useToastPromise();
  const createType = useCreateOptionType();
  const updateType = useUpdateOptionType();
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    setIsPending(createType.isPending || updateType.isPending);
  }, [createType.isPending, updateType.isPending]);

  const onSubmit = (data: OptionTypeForm) => {
    data.name = normalizeText(data.name);

    const promise = isEditing
      ? updateType.mutateAsync({ id: optionType!.id, dataInput: data })
      : createType.mutateAsync(data);

    showPromise({
      promise: promise.then(() => onClose()),
      messages: {
        loading: isEditing ? "Actualizando atributo..." : "Creando atributo...",
        success: isEditing ? "Atributo actualizado" : "Atributo creado",
        error: (err: Error) => err.message,
      },
      richColors: true,
      position: "top-right",
      duration: 4000,
    });
  };

  if (!modalState.open || !modalState.mode) return null;

  const title = isEditing ? "Editar atributo" : "Crear atributo";
  const description = isEditing
    ? "Modifica los datos del atributo."
    : "Define un nuevo tipo de atributo para tus productos.";

  return (
    <Dialog
      open={modalState.open}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form
          id="option-type-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <FormInput
            label="Nombre"
            name="name"
            control={control}
            inputProps={{
              placeholder: "Talla, Color, Material...",
              disabled: isPending,
            }}
            errors={errors}
            required
          />

          <div className="grid gap-2 w-full">
            <Label htmlFor="input_type">
              Tipo de entrada <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="input_type"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isEditing && hasValues}
                >
                  {/* Agregado w-full al Trigger para que ocupe todo el ancho */}
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {INPUT_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {isEditing && hasValues && (
              <p className="text-xs text-muted-foreground">
                No se puede cambiar el tipo porque el atributo ya tiene valores
                creados.
              </p>
            )}
            {errors.input_type && (
              <p className="text-sm text-red-500">
                {String(errors.input_type.message)}
              </p>
            )}
          </div>

          {/* Ajuste de padding (p-3 a p-4) para móviles */}
          <div className="flex items-start gap-3 rounded-lg border p-3 sm:p-4 mt-4">
            <Controller
              name="is_default_on_create"
              control={control}
              render={({ field }) => (
                <>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isPending}
                    id="is_default_on_create"
                    className="mt-0.5 sm:mt-1 shrink-0"
                  />
                  <div className="flex flex-col gap-1">
                    <Label
                      htmlFor="is_default_on_create"
                      className="cursor-pointer text-sm sm:text-base font-medium leading-tight"
                    >
                      Agregar automáticamente a nuevos productos
                    </Label>
                    <p className="text-xs sm:text-[0.8rem] text-muted-foreground leading-relaxed">
                      Ideal para atributos frecuentes (ej. Talla, Material).
                      Aparecerá listo para usarse cada vez que crees un producto
                      con variantes.
                    </p>
                  </div>
                </>
              )}
            />
          </div>

          <div className="flex items-start gap-3 rounded-lg border p-3 sm:p-4 mt-4">
            <Controller
              name="is_visual_default"
              control={control}
              render={({ field }) => (
                <>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isPending}
                    id="is_visual_default"
                    className="mt-0.5 sm:mt-1 shrink-0"
                  />
                  <div className="flex flex-col gap-1">
                    <Label
                      htmlFor="is_visual_default"
                      className="cursor-pointer text-sm sm:text-base font-medium leading-tight"
                    >
                      Este atributo cambia las fotos del producto
                    </Label>
                    <p className="text-xs sm:text-[0.8rem] text-muted-foreground leading-relaxed">
                      Recomendado para "Color" o "Modelo". Al activarlo, la
                      galería de imágenes del catálogo mostrará solo las fotos
                      de la opción elegida.
                    </p>
                  </div>
                </>
              )}
            />
          </div>
        </form>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isPending}>
              Cancelar
            </Button>
          </DialogClose>
          <Button type="submit" form="option-type-form" disabled={isPending}>
            {isEditing ? "Guardar cambios" : "Crear atributo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
