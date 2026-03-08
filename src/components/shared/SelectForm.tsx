import { Controller, type FieldValues, type Path } from "react-hook-form";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import type { Control, FieldErrors } from "react-hook-form";

interface SelectOption {
  value: string;
  label: string;
}

interface FormSelectProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  control: Control<T>;
  options: SelectOption[];
  placeholder?: string;
  errors?: FieldErrors<T>;
  disabled?: boolean;
  required?: boolean;
}

export default function SelectForm<T extends FieldValues>({
  label,
  name,
  control,
  options,
  placeholder = "Selecciona una opción",
  errors,
  disabled = false,
  required = false,
}: FormSelectProps<T>) {
  return (
    <div className="grid gap-2 w-full">
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>

      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select
            value={String(field.value ?? "")}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <SelectTrigger className="w-full overflow-hidden">
              <div className="flex-1 text-left truncate">
                <SelectValue placeholder={placeholder} />
              </div>
            </SelectTrigger>
            <SelectContent
              className="w-(--radix-select-trigger-width)"
              position="popper"
            >
              {options.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="whitespace-normal wrap-break-word"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />

      {errors?.[name] && (
        <p className="text-sm text-red-500">{String(errors[name]?.message)}</p>
      )}
    </div>
  );
}
