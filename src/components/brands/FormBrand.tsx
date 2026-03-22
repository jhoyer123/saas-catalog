"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BrandSchema, type BrandForm } from "@/lib/schemas/brand";
import type { BrandDashboard } from "@/types/brand.types";
import FormInput from "@/components/shared/InputForm";
import { useToastPromise } from "@/hooks/shared/useToastPromise";
import { useCreateBrand } from "@/hooks/brand/useCreateBrand";
import { useUpdateBrand } from "@/hooks/brand/useUpdateBrand";
import { useEffect } from "react";

interface Props {
  defaultValues?: BrandDashboard | null;
  setOpen: () => void;
  readOnly?: boolean;
  onDirtyChange?: (isDirty: boolean) => void;
  onPendingChange?: (isPending: boolean) => void;
}

const Form = ({
  defaultValues,
  setOpen,
  readOnly = false,
  onDirtyChange,
  onPendingChange,
}: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<BrandForm>({
    resolver: zodResolver(BrandSchema),
    defaultValues: {
      name: defaultValues?.name || "",
    },
  });

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const { showPromise } = useToastPromise();
  const createBrand = useCreateBrand();
  const updateBrand = useUpdateBrand();

  const isEditing = !!defaultValues;

  const onSubmit = (data: BrandForm) => {
    const promise = isEditing
      ? updateBrand.mutateAsync({ id: defaultValues!.id, name: data.name })
      : createBrand.mutateAsync(data.name);

    showPromise({
      promise,
      messages: {
        loading: isEditing ? "Actualizando..." : "Creando...",
        success: isEditing ? "Marca actualizada" : "Marca creada",
        error: (err: Error) => err.message,
      },
      position: "top-right",
      duration: 4000,
    });

    promise.then(() => setOpen());
  };

  useEffect(() => {
    onPendingChange?.(createBrand.isPending || updateBrand.isPending);
  }, [createBrand.isPending, updateBrand.isPending, onPendingChange]);

  return (
    <>
      <form
        id="brand-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormInput
          label="Nombre"
          name="name"
          register={register}
          inputProps={{ placeholder: "Nike, Adidas...", disabled: readOnly }}
          errors={errors}
          required={true}
        />
      </form>
    </>
  );
};

export default Form;
