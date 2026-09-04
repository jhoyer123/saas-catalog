"use client";

import type { Control, FieldErrors, FieldValues, Path } from "react-hook-form";
import { FormCombobox } from "@/components/shared/FormCombobox";
import FormInput from "@/components/shared/InputForm";
import SectionCard from "./SectionCard";

interface ProductIdentitySectionProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  errors: FieldErrors<TFieldValues>;
  categoryOptions: { value: string; label: string }[];
  brandOptions: { value: string; label: string }[];
  isViewMode: boolean;
  hasVariants?: boolean;
}

export function ProductIdentitySection<TFieldValues extends FieldValues>({
  control,
  errors,
  categoryOptions,
  brandOptions,
  isViewMode,
  hasVariants,
}: ProductIdentitySectionProps<TFieldValues>) {
  return (
    <SectionCard
      title="Información general"
      description="Nombre, categoría, marca y código del producto."
    >
      <div className="grid gap-6 md:grid-cols-2">
        <FormInput
          label="Nombre"
          name={"name" as Path<TFieldValues>}
          control={control}
          errors={errors}
          inputProps={{ type: "text", placeholder: "Ej: Laptop Gamer" }}
          required
          readOnly={isViewMode}
        />

        <FormCombobox
          label="Categoría del producto"
          name={"category_id" as Path<TFieldValues>}
          control={control}
          options={categoryOptions}
          placeholder="Selecciona una categoría..."
          searchPlaceholder="Buscar categoría..."
          emptyMessage="Categoría no encontrada."
          readOnly={isViewMode}
          required
          emptyOptionLabel="Sin categoria"
        />

        {!hasVariants && (
          <FormInput
            label="Código SKU"
            name={"sku" as Path<TFieldValues>}
            control={control}
            errors={errors}
            inputProps={{ type: "text", placeholder: "PROD-001" }}
            readOnly={isViewMode}
            emptyOptionLabel="Sin código"
          />
        )}

        <div className={hasVariants ? "md:order-2" : "md:order-4"}>
          <FormCombobox
            label="Marca del producto"
            name={"brand_id" as Path<TFieldValues>}
            control={control}
            options={brandOptions}
            placeholder="Selecciona una marca..."
            searchPlaceholder="Buscar marca..."
            emptyMessage="Marca no encontrada."
            disabled={isViewMode}
            readOnly={isViewMode}
            allowClear={true}
            clearLabel="Sin marca"
            emptyOptionLabel="Sin marca"
          />
        </div>
      </div>
    </SectionCard>
  );
}
