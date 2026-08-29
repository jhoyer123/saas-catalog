import { Label } from "@/components/ui/label";
import { Input as ShadInput } from "@/components/ui/input";
import {
  Controller,
  type Control,
  type FieldErrors,
  type FieldValues,
  type Path,
} from "react-hook-form";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

interface InputProps<T extends FieldValues> {
  /** Texto del label. Si no se proporciona, no se renderiza. */
  label?: string;

  /** Indica si el campo es obligatorio. */
  required?: boolean;

  /** Nombre del campo dentro del formulario. */
  name: Path<T>;

  /** Control de React Hook Form. */
  control: Control<T>;

  /** Errores del formulario. */
  errors?: FieldErrors<T>;

  /** Props adicionales para el input nativo. */
  inputProps?: ComponentProps<"input">;

  /** Activa el modo de solo lectura. */
  readOnly?: boolean;

  /** Texto mostrado cuando el campo está vacío y es de solo lectura. */
  emptyOptionLabel?: string;
}

const FormInput = <T extends FieldValues>({
  label,
  name,
  control,
  inputProps,
  required = false,
  readOnly = false,
  emptyOptionLabel = "Sin opción",
}: InputProps<T>) => {
  const isNumber = inputProps?.type === "number";

  return (
    <div className="grid w-full gap-2">
      {label && (
        <Label htmlFor={name}>
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
      )}

      <Controller
        name={name}
        control={control}
        render={({
          field: { onChange, onBlur, value, ref },
          fieldState: { error },
        }) => (
          <>
            {readOnly && isNumber ? (
              <ShadInput
                id={name}
                ref={ref}
                autoComplete="off"
                type="text"
                readOnly
                value={value ? value : emptyOptionLabel}
                className={cn(
                  "read-only:cursor-default",
                  "read-only:opacity-100",
                  value === undefined ||
                    value === null ||
                    value === "" ||
                    value === 0
                    ? "text-muted-foreground"
                    : undefined,
                  inputProps?.className,
                )}
              />
            ) : (
              <ShadInput
                id={name}
                ref={ref}
                autoComplete="off"
                readOnly={readOnly}
                {...inputProps}
                value={value ? value : readOnly ? emptyOptionLabel : ""}
                onBlur={onBlur}
                onChange={(e) => {
                  // Manejo estricto para type="number"
                  // sin depender de valueAsNumber.
                  if (isNumber) {
                    const val = e.target.value;

                    onChange(val === "" ? "" : Number(val));
                    return;
                  }

                  onChange(e.target.value);
                }}
                className={cn(
                  "[&::-webkit-outer-spin-button]:appearance-none",
                  "[&::-webkit-inner-spin-button]:appearance-none",
                  inputProps?.className,
                  readOnly && !value && "text-muted-foreground",
                )}
              />
            )}

            {error && (
              <p className="text-sm font-medium text-red-500">
                {String(error.message)}
              </p>
            )}
          </>
        )}
      />
    </div>
  );
};

export default FormInput;
