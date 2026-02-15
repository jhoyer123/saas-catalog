import React from "react";

// Form
import type {
  FieldValues,
  Path,
  UseFormRegister,
  FieldErrors,
} from "react-hook-form";
import type { ComponentProps } from "react";

//ui components
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Eye, EyeClosed } from "lucide-react";

interface Props<T extends FieldValues> {
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  errors?: FieldErrors<T>;
  inputProps?: ComponentProps<"input">;
}

const InputPassword = <T extends FieldValues>({
  label,
  name,
  register,
  errors,
  inputProps,
}: Props<T>) => {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <div className="relative flex items-center justify-center">
        <Input
          id={name}
          {...register(name, {
            valueAsNumber: inputProps?.type === "number",
          })}
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          {...inputProps}
        />
        <button type="button" className="">
          <Eye
            className={`absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer ${showPassword ? "hidden" : "block"}`}
            onClick={() => setShowPassword(!showPassword)}
          />
        </button>
        <button type="button">
          <EyeClosed
            className={`absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer ${showPassword ? "block" : "hidden"}`}
            onClick={() => setShowPassword(!showPassword)}
          />
        </button>
      </div>
      {errors?.[name] && (
        <p className="text-sm text-red-500">{String(errors[name]?.message)}</p>
      )}
    </div>
  );
};

export default InputPassword;
