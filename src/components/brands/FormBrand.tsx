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
import { revalidateBrandsCache } from "@/lib/actions/brandActions";
import { useSessionData } from "@/hooks/auth/useSessionData";

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
    control,
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
  const { data: sessionData, isPending: isSessionPending } = useSessionData();
  const storeSlug = sessionData?.store?.slug;
  const isEditing = !!defaultValues;

  /* const onSubmit = (data: BrandForm) => {
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
      richColors: true,
      position: "top-right",
      duration: 4000,
    });

    promise.then(() => setOpen());
    revalidateBrandsCache(sessionData?.store?.slug!);
  }; */
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
      richColors: true,
      position: "top-right",
      duration: 4000,
    });

    promise.then(() => {
      setOpen();

      if (storeSlug) {
        revalidateBrandsCache(storeSlug);
      }
    });
  };

  useEffect(() => {
    onPendingChange?.(createBrand.isPending || updateBrand.isPending);
  }, [createBrand.isPending, updateBrand.isPending, onPendingChange]);

  if (isSessionPending || !storeSlug)
    return <div className="h-40 animate-pulse rounded-md bg-muted" />;

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
          //register={register}
          control={control}
          inputProps={{ placeholder: "Nike, Adidas...", disabled: readOnly }}
          errors={errors}
          required={true}
        />
      </form>
    </>
  );
};

export default Form;
