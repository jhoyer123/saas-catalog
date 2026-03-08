"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CategorySchema, type CategoryForm } from "@/lib/schemas/category";
import type { Category } from "@/types/category.types";
import FormInput from "@/components/shared/InputForm";
import { Label } from "@/components/ui/label";
import { useToastPromise } from "@/hooks/shared/useToastPromise";
import { useCreateCategory } from "@/hooks/category/useCreateCategory";
import { useUpdateCategory } from "@/hooks/category/useUpdateCategory";
import { useSessionData } from "@/hooks/auth/useSessionData";

interface Props {
  defaultValues?: Category;
  setOpen: () => void;
  // cuando es true, los campos son solo lectura (modo "view")
  readOnly?: boolean;
}

const Form = ({ defaultValues, setOpen, readOnly = false }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryForm>({
    resolver: zodResolver(CategorySchema),
    defaultValues: {
      name: defaultValues?.name || "",
      description: defaultValues?.description || "",
    },
  });

  // create update
  const { showPromise } = useToastPromise();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const { data: sessionData } = useSessionData();

  const isEditing = !!defaultValues;

  const onSubmit = (data: CategoryForm) => {
    const promise = isEditing
      ? updateCategory.mutateAsync({ id: defaultValues.id, data })
      : createCategory.mutateAsync({
          ...data,
          store_id: sessionData?.store?.id!,
        });

    showPromise({
      promise,
      messages: {
        loading: isEditing ? "Actualizando..." : "Creando...",
        success: isEditing ? "Categoría actualizada" : "Categoría creada",
        error: (err) => err.message,
      },
      position: "top-right",
      duration: 4000,
    });

    setOpen();
  };

  return (
    <form
      id="category-form"
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
    >
      {/* Nombre */}
      <FormInput
        label="Nombre"
        name="name"
        register={register}
        inputProps={{ placeholder: "Chamarras", disabled: readOnly }}
        errors={errors}
        required={true}
      />

      {/* descripción */}
      <div className="grid gap-2">
        <Label className="font-medium text-sm">Descripción</Label>
        <textarea
          id="description"
          {...register("description")}
          placeholder="Descripción de la categoría"
          // deshabilitamos el textarea en modo solo lectura
          disabled={readOnly}
          className="file:text-foreground resize-none placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
          rows={4}
        ></textarea>
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">
            {errors.description.message}
          </p>
        )}
      </div>
    </form>
  );
};

export default Form;
