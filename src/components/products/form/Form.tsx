// components/products/form/FormProduct.tsx
"use client";

import { Label } from "@/components/ui/label";
import type { Category } from "@/types/category.types";
import type { ProductType } from "@/types/product.types";
import { Controller } from "react-hook-form";
import { useMemo } from "react";

// Hook
import { useProductForm } from "@/hooks/products/useProductForm";

// Types
import type {
  ProductInputService,
  ProductInputServiceUpdate,
} from "@/lib/schemas/product";

// Components
import RichTextEditor from "@/components/products/form/RichTextEditor";
import FormInput from "@/components/shared/InputForm";
import FormSelect from "@/components/shared/SelectForm";
import InputFile from "@/components/products/form/InputFile";

// ============================================
// TYPES
// ============================================

interface FormProductProps {
  categories: Category[];
  mode: "create" | "update" | "view";
  initialData?: ProductType;
  onSubmit?: (data: ProductInputService | ProductInputServiceUpdate) => void;
}

// ============================================
// COMPONENTE
// ============================================

export default function FormProduct({
  categories,
  mode,
  initialData,
  onSubmit,
}: FormProductProps) {
  const { register, control, handleSubmit, errors, setValue, isViewMode } =
    useProductForm({ mode, initialData, onSubmit });

  const categoryOptions = useMemo(
    () => categories.map((cat) => ({ value: cat.id, label: cat.name })),
    [categories],
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full mx-auto grid gap-6"
      id="product-form"
    >
      {/* Fila 1: Nombre + Categoría */}
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
        />

        <FormSelect
          label="Categoría"
          name="category_id"
          control={control}
          options={categoryOptions}
          placeholder="Categoría"
          errors={errors}
          disabled={isViewMode}
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

          <FormInput
            label="Marca"
            name="brand"
            register={register}
            errors={errors}
            inputProps={{
              type: "text",
              disabled: isViewMode,
              placeholder: "Samsung",
            }}
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
        />
      </div>

      {/* Descripción */}
      <div className="grid gap-2">
        <Label>Descripción</Label>
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
        <Label>Imágenes del producto</Label>
        <Controller
          name="images"
          control={control}
          render={({ field: { onChange, value, onBlur } }) => (
            <InputFile
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              error={errors.images?.message as string}
              maxFiles={5}
              maxSizeMB={5}
              imgExisting={initialData?.imageExisting}
              setValue={setValue}
              disabled={isViewMode}
            />
          )}
        />
      </div>
    </form>
  );
}
