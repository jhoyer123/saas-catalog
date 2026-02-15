import { Label } from "@/components/ui/label";
import { Input as ShadInput } from "@/components/ui/input";
import type {
  FieldValues,
  Path,
  UseFormRegister,
  FieldErrors,
} from "react-hook-form";
import type { ComponentProps } from "react";

interface InputProps<T extends FieldValues> {
  label: string;
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
}: InputProps<T>) => {
  return (
    <div className="grid gap-2 w-full">
      <Label htmlFor={name}>{label}</Label>

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
