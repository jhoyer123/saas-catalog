"use client";

import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";

import FormInput from "@/components/shared/InputForm";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { settingsSchema, type SettingsForm } from "@/lib/schemas/settings";
import { OverlayProcess } from "../shared/OverlayProcess";

const emptyBranch = {
  name: "",
  address: "",
  phone: "",
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
    formState: { errors, isDirty, isSubmitting },
  } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      branches: defaultValues?.branches?.length
        ? defaultValues.branches
        : [emptyBranch],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "branches",
  });

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

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
        className="w-full mx-auto space-y-3"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => append(emptyBranch)}
            disabled={disabled}
            className="shrink-0"
          >
            <Plus className="h-4 w-4" />
            Agregar sucursal
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="flex h-full flex-col rounded-xl border bg-background p-4 shadow-sm"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-medium leading-tight">
                    Sucursal {index + 1}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Datos visibles en el catálogo.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                  disabled={disabled || fields.length === 1}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Quitar
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  label="Nombre"
                  name={`branches.${index}.name`}
                  register={register}
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
                  register={register}
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
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={disabled || !isDirty}>
            {disabled ? "Guardando..." : submitLabel}
          </Button>
        </div>
      </form>
    </>
  );
};
