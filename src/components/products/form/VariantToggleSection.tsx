"use client";

import { Controller, Path, Control, FieldValues } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import SectionCard from "./SectionCard";

interface VariantToggleSectionProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  isViewMode: boolean;
  isCreateMode: boolean;
  hasVariants: boolean;
  onHasVariantsChange?: (hasVariants: boolean) => void;
}

export function VariantToggleSection<TFieldValues extends FieldValues>({
  control,
  isViewMode,
  hasVariants,
  onHasVariantsChange,
}: VariantToggleSectionProps<TFieldValues>) {
  return (
    <SectionCard
      title="Variantes"
      description={
        isViewMode
          ? hasVariants
            ? "Este producto tiene variantes."
            : "Este producto no tiene variantes."
          : "Activa esta opción si el producto tiene diferentes versiones."
      }
    >
      <Controller
        name={"has_variants" as Path<TFieldValues>}
        control={control}
        render={({ field }) => (
          <Switch
            checked={field.value === true}
            onCheckedChange={(checked) => {
              const hasVariants = Boolean(checked);
              field.onChange(hasVariants);
              onHasVariantsChange?.(hasVariants);
            }}
            disabled={isViewMode}
          />
        )}
      />
    </SectionCard>
  );
}
