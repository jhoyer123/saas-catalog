"use client";

import { Label } from "@/components/ui/label";
import { Controller } from "react-hook-form";

// Hook
import { useProductForm } from "@/hooks/products/useProductForm";

// Components
import RichTextEditor from "@/components/products/form/RichTextEditor";
import FormInput from "@/components/shared/InputForm";
import FormSelect from "@/components/shared/SelectForm";
import InputFile from "@/components/products/form/InputFile";
import { ProductCatalog } from "@/types/product.types";
import { CategorySimple } from "@/types/category.types";
//import { useEffect } from "react";
import { BrandOfForm } from "@/types/brand.types";
import { Plan } from "@/types/plan.types";

interface FormProductProps {
  mode: "create" | "update" | "view";
  initialData?: ProductCatalog;
  categories: CategorySimple[];
  brands: BrandOfForm[];
  plan?: Plan;
  onDirtyChange?: (isDirty: boolean) => void;
}

export default function FormProduct({
  mode,
  initialData,
  categories,
  brands,
  plan,
  //onDirtyChange,
}: FormProductProps) {
  const {
    register,
    control,
    handleSubmit,
    errors,
    setValue,
    isViewMode,
    categoryOptions,
    brandOptions,
    isPending,
    //isDirty,
  } = useProductForm({ mode, initialData, categories, brands });
  // Llamar a onFormChange cada vez que isDirty cambie
  /* useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]); */
  return (
    <>
      {/* Overlay de bloqueo */}
      {isPending && (
        <div className="fixed inset-0 z-9999 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 flex flex-col items-center gap-3 shadow-xl">
            <span className="text-sm text-gray-600">Procesando...</span>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="w-full mx-auto grid gap-6"
        id="product-form"
      >
        {/* Fila Nombre + Categoría */}
        <div className="grid md:grid-cols-2 gap-6">
          <FormInput
            label="Nombre"
            name="name"
            register={register}
            errors={errors}
            inputProps={{
              type: "text",
              placeholder: "Ej: Laptop Gamer",
              disabled: isViewMode,
            }}
            required={true}
          />

          <FormSelect
            label="Categoría"
            name="category_id"
            control={control}
            options={categoryOptions}
            placeholder="Zapatos, Electrónica..."
            errors={errors}
            disabled={isViewMode}
            required={true}
          />
        </div>

        {/* Fila 2: SKU + Marca + Precio */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="grid md:grid-cols-2 gap-6">
            <FormInput
              label="Código"
              name="sku"
              register={register}
              errors={errors}
              inputProps={{
                type: "text",
                placeholder: "PROD-00123",
                disabled: isViewMode,
              }}
            />

            <FormSelect
              label="Marca"
              name="brand_id"
              control={control}
              options={brandOptions}
              placeholder="Nike, Samsung..."
              errors={errors}
              disabled={isViewMode}
            />
          </div>

          <FormInput
            label="Precio"
            name="price"
            register={register}
            errors={errors}
            inputProps={{
              type: "number",
              step: "0.01",
              min: 0,
              placeholder: "0.00",
              disabled: isViewMode,
            }}
            required={true}
          />
        </div>

        {/* Descripción */}
        <div className="grid gap-2">
          <Label>
            Descripción<span className="text-red-500">*</span>
          </Label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <RichTextEditor
                value={field.value || ""}
                onChange={field.onChange}
                disabled={isViewMode}
              />
            )}
          />
          {errors.description && (
            <p className="text-sm text-red-500">
              {String(errors.description.message)}
            </p>
          )}
        </div>

        {/* Imágenes */}
        <div className="grid gap-2">
          <Label>
            Imágenes del producto<span className="text-red-500">*</span>
          </Label>
          <Controller
            name="images"
            control={control}
            render={({ field: { onChange, value, onBlur } }) => (
              <InputFile
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                error={errors.images?.message as string}
                maxFiles={plan?.max_images_per_product ?? 3}
                maxSizeMB={25}
                imgExisting={initialData?.images ?? []}
                setValue={setValue}
                disabled={isViewMode}
              />
            )}
          />
        </div>
      </form>
    </>
  );
}
