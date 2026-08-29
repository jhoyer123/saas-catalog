"use client";

import { useEffect, useRef, useState } from "react";
import {
  useWatch,
  type UseFieldArrayReturn,
  type UseFormReturn,
} from "react-hook-form";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import type {
  StoreOptionType,
  StoreOptionValue,
} from "@/features/product/product-variants/services/optionsForVariants.service";
import type {
  ProductFormInput,
  ProductFormOutput,
} from "@/lib/schemas/productSchema";
import SectionCard from "@/components/products/form/SectionCard";

interface ProductVariantAttributesSectionProps {
  form: UseFormReturn<ProductFormInput, unknown, ProductFormOutput>;
  optionTypesField: UseFieldArrayReturn<
    ProductFormInput,
    "option_types",
    "_fieldId"
  >;
  storeOptionTypes: StoreOptionType[];
  isReadOnly: boolean;
  canEditAttributes: boolean;
  valuesByType: Record<string, string[]>;
  onValuesByTypeChange: (next: Record<string, string[]>) => void;
  onAttributeStructureChange?: (
    nextSelectedTypeIds: string[],
    nextValuesByType: Record<string, string[]>,
  ) => void;
  onVariantValuesChange?: (
    nextSelectedTypeIds: string[],
    nextValuesByType: Record<string, string[]>,
  ) => void;
  onVisualConfigurationChange?: (nextVisualTypeIds: string[]) => void;
}

export function ProductVariantAttributesSection({
  form,
  optionTypesField,
  storeOptionTypes,
  isReadOnly,
  canEditAttributes,
  valuesByType,
  onValuesByTypeChange,
  onAttributeStructureChange,
  onVariantValuesChange,
  onVisualConfigurationChange,
}: ProductVariantAttributesSectionProps) {
  const [attrPopoverOpen, setAttrPopoverOpen] = useState(false);
  const didAutoSelect = useRef(false);

  const hasError = !!form.formState.errors.option_types;
  const watchedOptionTypes = useWatch({
    control: form.control,
    name: "option_types",
  });
  const watchedVariants = useWatch({ control: form.control, name: "variants" });

  useEffect(() => {
    if (hasError) {
      form.trigger(["option_types", "variants"]);
    }
  }, [watchedOptionTypes, watchedVariants, hasError, form]);

  const selectedTypeIds = optionTypesField.fields.map((f) => f.option_type_id);
  const selectedTypes = storeOptionTypes.filter((t) =>
    selectedTypeIds.includes(t.id),
  );
  const availableTypes = storeOptionTypes.filter(
    (t) => !selectedTypeIds.includes(t.id),
  );

  function getVisualTypeIds(): string[] {
    return (form.getValues("option_types") ?? [])
      .filter((optionType) => optionType.is_visual)
      .map((optionType) => optionType.option_type_id);
  }

  useEffect(() => {
    if (
      !canEditAttributes ||
      didAutoSelect.current ||
      storeOptionTypes.length === 0
    )
      return;
    didAutoSelect.current = true;

    const defaults = storeOptionTypes.filter((t) => t.is_default_on_create);
    const addedDefaultTypeIds = defaults
      .filter(
        (type) =>
          !optionTypesField.fields.some(
            (field) => field.option_type_id === type.id,
          ),
      )
      .map((type) => type.id);

    defaults.forEach((type) => {
      const alreadyAdded = optionTypesField.fields.some(
        (f) => f.option_type_id === type.id,
      );
      if (!alreadyAdded) {
        optionTypesField.append({
          option_type_id: type.id,
          is_visual: type.is_visual_default,
        });
      }
    });

    const addedVisualDefaultTypeIds = defaults
      .filter(
        (type) =>
          type.is_visual_default && addedDefaultTypeIds.includes(type.id),
      )
      .map((type) => type.id);

    if (addedVisualDefaultTypeIds.length > 0) {
      onVisualConfigurationChange?.([
        ...getVisualTypeIds(),
        ...addedVisualDefaultTypeIds,
      ]);
    }
    if (addedDefaultTypeIds.length > 0) {
      onAttributeStructureChange?.(
        [...selectedTypeIds, ...addedDefaultTypeIds],
        valuesByType,
      );
    }
  }, [canEditAttributes, storeOptionTypes]);

  function addAttribute(type: StoreOptionType) {
    const nextValuesByType = {
      ...valuesByType,
      [type.id]: valuesByType[type.id] ?? [],
    };

    if (type.is_visual_default) {
      onVisualConfigurationChange?.([...getVisualTypeIds(), type.id]);
    }

    onValuesByTypeChange(nextValuesByType);
    onAttributeStructureChange?.(
      [...selectedTypeIds, type.id],
      nextValuesByType,
    );

    optionTypesField.append({
      option_type_id: type.id,
      is_visual: type.is_visual_default,
    });
    setAttrPopoverOpen(false);
  }

  function removeAttribute(typeId: string) {
    const idx = optionTypesField.fields.findIndex(
      (f) => f.option_type_id === typeId,
    );
    const removedWasVisual =
      idx >= 0 && form.getValues(`option_types.${idx}.is_visual`) === true;

    if (idx >= 0) optionTypesField.remove(idx);

    if (removedWasVisual) {
      onVisualConfigurationChange?.(
        getVisualTypeIds().filter((visualTypeId) => visualTypeId !== typeId),
      );
    }

    const nextValuesByType = { ...valuesByType };
    delete nextValuesByType[typeId];

    onValuesByTypeChange(nextValuesByType);
    onAttributeStructureChange?.(
      selectedTypeIds.filter((id) => id !== typeId),
      nextValuesByType,
    );
  }

  function toggleValue(typeId: string, valueId: string) {
    const current = valuesByType[typeId] ?? [];
    const nextValues = current.includes(valueId)
      ? current.filter((v) => v !== valueId)
      : [...current, valueId];

    const nextValuesByType = { ...valuesByType, [typeId]: nextValues };

    onValuesByTypeChange(nextValuesByType);
    onVariantValuesChange?.(selectedTypeIds, nextValuesByType);
  }

  return (
    <SectionCard
      title="Atributos y valores"
      description={
        isReadOnly
          ? "Consulta los atributos y valores asociados a este producto."
          : canEditAttributes
            ? "Seleccioná los atributos, como Talla o Color, y sus valores para generar las variantes del producto."
            : "Los atributos no se pueden modificar después de crear el producto. Solo podés agregar o quitar valores."
      }
    >
      <div className="space-y-5">
        {canEditAttributes && (
          <Popover open={attrPopoverOpen} onOpenChange={setAttrPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1"
              >
                + Agregar atributo
                <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0" align="start">
              <Command>
                <CommandInput placeholder="Buscar atributo..." />
                <CommandList className="max-h-60 overflow-y-auto">
                  <CommandEmpty>
                    {storeOptionTypes.length === 0
                      ? "Todavía no creaste atributos en tu tienda."
                      : "No se encontraron resultados."}
                  </CommandEmpty>
                  <CommandGroup>
                    {availableTypes.map((type) => (
                      <CommandItem
                        key={type.id}
                        value={type.name}
                        onSelect={() => addAttribute(type)}
                      >
                        {type.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}

        {form.formState.errors.option_types?.message && (
          <p className="text-sm font-medium text-red-500">
            {form.formState.errors.option_types.message as string}
          </p>
        )}

        {selectedTypes.map((type) => {
          const otIndex = optionTypesField.fields.findIndex(
            (f) => f.option_type_id === type.id,
          );
          // Leemos dinámicamente los IDs seleccionados desde props
          const selectedValueIds = valuesByType[type.id] ?? [];

          return (
            <div key={type.id} className="rounded-xl border p-4 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="font-medium text-sm">{type.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedValueIds.length === 0
                      ? "Seleccioná al menos un valor"
                      : `${selectedValueIds.length} valor(es) seleccionado(s)`}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                    <Checkbox
                      checked={form.watch(`option_types.${otIndex}.is_visual`)}
                      onCheckedChange={(checked) => {
                        const nextVisualTypeIds = getVisualTypeIds().filter(
                          (visualTypeId) => visualTypeId !== type.id,
                        );
                        if (checked) nextVisualTypeIds.push(type.id);
                        form.setValue(
                          `option_types.${otIndex}.is_visual`,
                          Boolean(checked),
                          { shouldDirty: true },
                        );
                        onVisualConfigurationChange?.(nextVisualTypeIds);
                      }}
                      disabled={!canEditAttributes}
                    />
                    Este atributo cambia la imagen del producto
                  </label>

                  {canEditAttributes && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => removeAttribute(type.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <OptionValuesPicker
                type={type}
                selectedValueIds={selectedValueIds}
                onToggle={(valueId) =>
                  !isReadOnly && toggleValue(type.id, valueId)
                }
                isReadOnly={isReadOnly}
              />
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

function OptionValuesPicker({
  type,
  selectedValueIds,
  onToggle,
  isReadOnly,
}: {
  type: StoreOptionType;
  selectedValueIds: string[];
  onToggle: (valueId: string) => void;
  isReadOnly: boolean;
}) {
  if (type.store_option_values.length === 0) {
    return (
      <p className="text-xs text-muted-foreground italic">
        Este atributo no tiene valores cargados todavía.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {type.store_option_values.map((value) => (
        <OptionValueChip
          key={value.id}
          type={type.input_type}
          value={value}
          // El chip se activa SOLO si su ID está en selectedValueIds
          active={selectedValueIds.includes(value.id)}
          disabled={isReadOnly}
          onClick={() => onToggle(value.id)}
        />
      ))}
    </div>
  );
}

function OptionValueChip({
  type,
  value,
  active,
  disabled,
  onClick,
}: {
  type: StoreOptionType["input_type"];
  value: StoreOptionValue;
  active: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-full border pl-2 pr-3 py-1.5 text-sm transition-colors select-none",
        disabled
          ? "cursor-not-allowed opacity-60"
          : "cursor-pointer hover:border-foreground/40",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-background text-foreground",
      )}
    >
      {active && <Check className="h-3.5 w-3.5" />}
      {type === "color" && <ColorSwatch hexes={value.color_hexes} />}
      {type === "image" &&
        (value.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value.image_url}
            alt={value.value}
            className="h-5 w-5 rounded object-cover"
          />
        ) : (
          <div className="h-5 w-5 rounded bg-muted" />
        ))}
      {value.value}
    </button>
  );
}

function ColorSwatch({ hexes }: { hexes: string[] | null }) {
  if (!hexes || hexes.length === 0) {
    return <div className="h-4 w-4 rounded-full border bg-muted" />;
  }
  if (hexes.length === 1) {
    return (
      <span
        className="h-4 w-4 rounded-full border"
        style={{ backgroundColor: hexes[0] }}
      />
    );
  }
  const step = 100 / hexes.length;
  const gradient = hexes
    .map((hex, i) => `${hex} ${i * step}% ${(i + 1) * step}%`)
    .join(", ");
  return (
    <span
      className="h-4 w-4 rounded-full border"
      style={{ background: `conic-gradient(${gradient})` }}
    />
  );
}
