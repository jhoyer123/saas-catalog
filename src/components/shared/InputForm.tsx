/* import { Label } from "@/components/ui/label";
import { Input as ShadInput } from "@/components/ui/input";
import type {
  FieldValues,
  Path,
  UseFormRegister,
  FieldErrors,
} from "react-hook-form";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

interface InputProps<T extends FieldValues> {
  label: string;
  required?: boolean;
  name: Path<T>;
  register: UseFormRegister<T>;
  errors?: FieldErrors<T>;
  inputProps?: ComponentProps<"input">;
}

const FormInput = <T extends FieldValues>({
  label,
  name,
  register,
  errors,
  inputProps,
  required = false,
}: InputProps<T>) => {
  return (
    <div className="grid gap-2 w-full">
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>

      <ShadInput
        id={name}
        {...register(name, {
          valueAsNumber: inputProps?.type === "number",
        })}
        {...inputProps}
        className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />

      {errors?.[name] && (
        <p className="text-sm text-red-500">{String(errors[name]?.message)}</p>
      )}
    </div>
  );
};

export default FormInput;
 */
import { Label } from "@/components/ui/label";
import { Input as ShadInput } from "@/components/ui/input";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
  type FieldErrors,
} from "react-hook-form";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

interface InputProps<T extends FieldValues> {
  label: string;
  required?: boolean;
  name: Path<T>;
  control: Control<T>; // Reemplazamos register por control
  errors?: FieldErrors<T>;
  inputProps?: ComponentProps<"input">;
}

const FormInput = <T extends FieldValues>({
  label,
  name,
  control,
  errors,
  inputProps,
  required = false,
}: InputProps<T>) => {
  return (
    <div className="grid gap-2 w-full">
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>

      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, onBlur, value, ref } }) => (
          <ShadInput
            id={name}
            ref={ref}
            autoComplete="off"
            {...inputProps}
            // Esto fuerza al input a ser un componente controlado
            value={value ?? ""}
            onBlur={onBlur}
            onChange={(e) => {
              // Manejo estricto para type="number" sin depender de valueAsNumber
              if (inputProps?.type === "number") {
                const val = e.target.value;
                onChange(val === "" ? "" : Number(val));
              } else {
                onChange(e.target.value);
              }
            }}
            className={cn(
              "[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
              inputProps?.className,
            )}
          />
        )}
      />

      {errors?.[name] && (
        <p className="text-sm text-red-500">{String(errors[name]?.message)}</p>
      )}
    </div>
  );
};

export default FormInput;
