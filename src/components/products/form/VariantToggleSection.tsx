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
}

export function VariantToggleSection<TFieldValues extends FieldValues>({
  control,
  isViewMode,
}: VariantToggleSectionProps<TFieldValues>) {
  return (
    <SectionCard
      title="Opciones múltiples"
      description="Activa este bloque si el producto se venderá por variantes."
    >
      <div className="flex items-center justify-between gap-4 rounded-xl border p-4">
        <div>
          <Label>¿Este producto tiene opciones múltiples?</Label>
          <p className="text-sm text-muted-foreground">
            Tallas, colores, combinaciones o cualquier atributo que cambie SKU,
            precio o stock.
          </p>
        </div>
        <Controller
          name={"has_variants" as Path<TFieldValues>}
          control={control}
          render={({ field }) => (
            <Switch
              checked={field.value === true}
              onCheckedChange={field.onChange}
              disabled={isViewMode}
            />
          )}
        />
      </div>

      {false ? (
        <div className="mt-4 rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 text-sm text-blue-700">
          El producto ya quedará preparado para variantes. Después de guardarlo
          entrarás a edición para completar atributos, combinaciones e imágenes.
        </div>
      ) : null}
    </SectionCard>
  );
}
