"use client";

import { useState } from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type ComboboxOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

interface FormComboboxProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  options: ComboboxOption[];
  label: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  allowClear?: boolean;
  clearLabel?: string;
  emptyOptionLabel?: string;
}

export function FormCombobox<TFieldValues extends FieldValues>({
  name,
  control,
  options,
  label,
  required,
  disabled = false,
  readOnly = false,
  placeholder = "Seleccionar opción...",
  searchPlaceholder = "Buscar...",
  emptyMessage = "No se encontraron resultados.",
  className,
  allowClear = false,
  clearLabel = "Limpiar",
  emptyOptionLabel = "Sin opción",
}: FormComboboxProps<TFieldValues>) {
  const [open, setOpen] = useState(false);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const selectedOption = options.find((o) => o.value === field.value);

        return (
          <div className={cn("grid gap-2 w-full", className)}>
            <Label htmlFor={name}>
              {label}
              {required && <span className="text-red-500">*</span>}
            </Label>

            {readOnly ? (
              <Input
                id={name}
                value={selectedOption?.label ?? emptyOptionLabel}
                placeholder={placeholder}
                readOnly
                className={cn(
                  "w-full font-normal",
                  !selectedOption && "text-muted-foreground",
                )}
              />
            ) : (
              <Popover modal={true} open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    disabled={disabled || field.disabled}
                    className={cn(
                      "w-full justify-between font-normal",
                      !field.value && "text-muted-foreground",
                    )}
                  >
                    {selectedOption ? selectedOption.label : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent
                  className="p-0"
                  style={{ width: "var(--radix-popover-trigger-width)" }}
                  align="start"
                >
                  <Command>
                    <CommandInput placeholder={searchPlaceholder} />

                    <CommandList className="max-h-60 overflow-y-auto">
                      <CommandEmpty>{emptyMessage}</CommandEmpty>

                      <CommandGroup>
                        {allowClear && (
                          <CommandItem
                            value={clearLabel}
                            onSelect={() => {
                              field.onChange(undefined);
                              setOpen(false);
                            }}
                            className="text-muted-foreground"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                field.value == null
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            {clearLabel}
                          </CommandItem>
                        )}

                        {options.map((option) => (
                          <CommandItem
                            key={option.value}
                            value={option.label}
                            disabled={option.disabled}
                            onSelect={() => {
                              field.onChange(option.value);
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                option.value === field.value
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            {option.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}

            {fieldState.error && (
              <p className="text-sm text-red-500 font-medium">
                {fieldState.error.message}
              </p>
            )}
          </div>
        );
      }}
    />
  );
}
