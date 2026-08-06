"use client";

import { useMemo } from "react";
import { Control, FieldErrors } from "react-hook-form";
import {
  FormCombobox,
  type ComboboxOption,
} from "@/components/shared/FormCombobox"; // O la ruta exacta de tu componente
import { UNIT_FAMILIES } from "@/features/options/lib/constants/units";
import type { OptionValueForm } from "../schemas/optionValue.schema";
import InputForm from "@/components/shared/InputForm";

interface Props {
  control: Control<OptionValueForm>;
  errors: FieldErrors<OptionValueForm>;
  disabled?: boolean;
}

export function OptionValueNumberField({ control, errors, disabled }: Props) {
  // Mapeamos la estructura de familias a las opciones que requiere FormCombobox
  const unitOptions: ComboboxOption[] = useMemo(() => {
    return Object.values(UNIT_FAMILIES).flatMap((family) =>
      Object.values(family.units).map((unit) => ({
        value: unit.symbol,
        label: `${unit.label}`,
      })),
    );
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
        {/* Input Numérico */}
        <InputForm
          control={control}
          name="displayNumber"
          label="Valor numérico"
          errors={errors}
          readOnly={disabled}
          inputProps={{ placeholder: "Ejl: 256", type: "number", step: "any" }}
          required={true}
        />

        {/* Combobox de Unidades usando tu componente FormCombobox */}
        <FormCombobox
          label="Unidad si aplica"
          name="original_unit"
          control={control}
          options={unitOptions}
          disabled={disabled}
          placeholder="Unidad..."
          searchPlaceholder="Buscar unidad..."
          emptyMessage="Sin unidades."
          readOnly={disabled}
          allowClear={true}
          clearLabel="Sin unidad"
        />
      </div>
    </div>
  );
}
