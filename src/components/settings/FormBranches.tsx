"use client";

import { useEffect } from "react";
import {
  useFieldArray,
  useForm,
  useWatch,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";

import FormInput from "@/components/shared/InputForm";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { settingsSchema, type SettingsForm } from "@/lib/schemas/settings";
import { OverlayProcess } from "../shared/OverlayProcess";
import { BranchLocationPicker } from "./branch-map/BranchLocationPicker";

const emptyBranch = {
  name: "",
  address: "",
  phone: "",
  lat: undefined,
  lng: undefined,
};

type BranchCardProps = {
  index: number;
  control: Control<SettingsForm>;
  register: UseFormRegister<SettingsForm>;
  errors: FieldErrors<SettingsForm>;
  disabled: boolean;
  remove: (index: number) => void;
  onLocationChange: (
    index: number,
    location: { lat: number; lng: number },
  ) => void;
};

const BranchCard = ({
  index,
  control,
  register,
  errors,
  disabled,
  remove,
  onLocationChange,
}: BranchCardProps) => {
  const branch = useWatch({
    control,
    name: `branches.${index}`,
  });

  return (
    <div className="flex h-full flex-col rounded-xl border bg-background p-2 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-row items-center justify-center">
        <div className="min-w-0 flex-1">
          <h3 className="font-medium leading-tight">Sucursal {index + 1}</h3>
          <p className="text-sm text-muted-foreground">
            Datos visibles en el catálogo.
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => remove(index)}
          disabled={disabled}
          className="text-destructive flex flex-col items-center justify-center bg-destructive/20 p-2 border border-input w-auto h-auto"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormInput
          label="Nombre"
          name={`branches.${index}.name`}
          control={control}
          errors={errors}
          inputProps={{
            placeholder: "Sucursal Centro",
            disabled,
          }}
          required
        />

        <FormInput
          label="Teléfono"
          name={`branches.${index}.phone`}
          control={control}
          errors={errors}
          inputProps={{
            placeholder: "+503 2222 2222",
            disabled,
          }}
          required
        />
      </div>

      <div className="mt-4 grid gap-2">
        <Label htmlFor={`branches.${index}.address`}>
          Dirección<span className="text-red-500">*</span>
        </Label>
        <textarea
          id={`branches.${index}.address`}
          {...register(`branches.${index}.address`)}
          placeholder="Dirección completa de la sucursal"
          disabled={disabled}
          rows={2}
          className="file:text-foreground resize-none placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
        />
        {errors.branches?.[index]?.address && (
          <p className="text-sm text-red-500">
            {errors.branches[index]?.address?.message}
          </p>
        )}
      </div>

      <div className="mt-4 grid gap-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Ubicación</p>
            <p className="text-xs text-muted-foreground">
              Haz clic en el mapa para fijar la ubicación.
            </p>
          </div>
          <p className="text-xs text-muted-foreground sm:text-right wrap-break-word">
            {branch?.lat != null && branch?.lng != null
              ? `${branch.lat.toFixed(6)}, ${branch.lng.toFixed(6)}`
              : "Sin ubicación seleccionada"}
          </p>
        </div>

        <BranchLocationPicker
          latitude={branch?.lat}
          longitude={branch?.lng}
          address={branch?.address}
          disabled={disabled}
          onChange={(location) => onLocationChange(index, location)}
        />
      </div>
    </div>
  );
};

interface Props {
  defaultValues?: SettingsForm;
  onSubmit: (data: SettingsForm) => void | Promise<void>;
  submitLabel?: string;
  readOnly?: boolean;
  onDirtyChange?: (isDirty: boolean) => void;
  isPending?: boolean;
}

export const FormBranches = ({
  defaultValues,
  onSubmit,
  submitLabel = "Guardar cambios",
  readOnly = false,
  onDirtyChange,
  isPending = false,
}: Props) => {
  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      branches: defaultValues?.branches ?? [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "branches",
  });

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const updateBranchLocation = (
    index: number,
    location: { lat: number; lng: number },
  ) => {
    setValue(`branches.${index}.lat`, location.lat, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    setValue(`branches.${index}.lng`, location.lng, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const handleFormSubmit = async (data: SettingsForm) => {
    await onSubmit(data);
    reset(data);
  };

  const disabled = readOnly || isPending || isSubmitting;

  return (
    <>
      {isPending && <OverlayProcess />}
      <form
        id="settings-form"
        onSubmit={handleSubmit(handleFormSubmit)}
        className="mx-auto w-full space-y-4"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => append(emptyBranch)}
            disabled={disabled}
            className="w-full shrink-0 sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Agregar sucursal
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {fields.map((field, index) => (
            <BranchCard
              key={field.id}
              index={index}
              control={control}
              register={register}
              errors={errors}
              disabled={disabled}
              remove={remove}
              onLocationChange={updateBranchLocation}
            />
          ))}
        </div>

        <div className="flex justify-stretch sm:justify-end">
          <Button type="submit" disabled={disabled || !isDirty}>
            {disabled ? "Guardando..." : submitLabel}
          </Button>
        </div>
      </form>
    </>
  );
};
