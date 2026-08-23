"use client";

import { useMemo } from "react";
import { RotateCcw, Trash2 } from "lucide-react";
import type { UseFieldArrayReturn, UseFormReturn } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { StoreOptionType } from "@/features/product/product-variants/services/optionsForVariants.service";
import type {
  ProductFormInput,
  ProductFormOutput,
} from "@/lib/schemas/productSchema";
import { NO_VISUAL_KEY } from "../types/types";
import {
  comboSignature,
  generateCombinations,
} from "../lib/generateCombinations";
import { VariantImageCell } from "./VariantImageCell";
import { useVariantImages } from "../hooks/useVariantImages";

export { NO_VISUAL_KEY };

interface ProductVariantsTableProps {
  form: UseFormReturn<ProductFormInput, unknown, ProductFormOutput>;
  variantsField: UseFieldArrayReturn<ProductFormInput, "variants", "_fieldId">;
  storeOptionTypes: StoreOptionType[];
  isReadOnly: boolean;
  imagesApi: ReturnType<typeof useVariantImages>;
  onOpenImagePicker: (signatureKey: string) => void;
  selectedTypeIds: string[];
  visualTypeIds: string[];
  valuesByType: Record<string, string[]>;
  onToggleRemoved?: (index: number, removed: boolean) => void;
}

export function ProductVariantsTable({
  form,
  variantsField,
  storeOptionTypes,
  isReadOnly,
  imagesApi,
  onOpenImagePicker,
  selectedTypeIds,
  visualTypeIds,
  valuesByType,
  onToggleRemoved,
}: ProductVariantsTableProps) {
  const isSubmitted = form.formState.isSubmitted;

  // firmas de combinación que siguen siendo válidas con la selección actual de
  // valores. Si una fila está removida pero su firma NO está acá, fue removida
  // porque se destildó un valor -> no se puede restaurar desde la tabla (solo
  // volviendo a tildar el valor).
  const validSignatures = useMemo(
    () =>
      new Set(
        generateCombinations(selectedTypeIds, valuesByType).map(comboSignature),
      ),
    [selectedTypeIds, valuesByType],
  );

  function getTypeName(typeId: string) {
    return storeOptionTypes.find((t) => t.id === typeId)?.name ?? "?";
  }
  function getValueLabel(typeId: string, valueId: string) {
    const type = storeOptionTypes.find((t) => t.id === typeId);
    return (
      type?.store_option_values.find((v) => v.id === valueId)?.value ?? "?"
    );
  }

  if (variantsField.fields.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">
        Seleccioná valores en los atributos de arriba para generar las
        variantes.
      </p>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16 whitespace-nowrap">Imagen</TableHead>
            <TableHead className="min-w-45 whitespace-nowrap">
              Combinación
            </TableHead>
            <TableHead className="w-28 whitespace-nowrap">Precio</TableHead>
            <TableHead className="w-28 whitespace-nowrap">
              Precio oferta
            </TableHead>
            <TableHead className="w-32 whitespace-nowrap">SKU</TableHead>
            <TableHead className="w-24 whitespace-nowrap text-center">
              Disponible
            </TableHead>
            {!isReadOnly && <TableHead className="w-12 whitespace-nowrap" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {variantsField.fields.map((field, index) => {
            const isRemoved = form.watch(`variants.${index}._removed`);
            const rowDisabled = isReadOnly || isRemoved;
            const canRestore = validSignatures.has(
              comboSignature(field.option_values),
            );

            return (
              <TableRow
                key={field._fieldId}
                className={cn(isRemoved && "bg-muted/50 opacity-60")}
              >
                <TableCell>
                  <VariantImageCell
                    optionValues={field.option_values}
                    visualTypeIds={visualTypeIds}
                    imagesBySignature={imagesApi.state.bySignature}
                    generalGallery={imagesApi.state.general}
                    onOpenImagePicker={onOpenImagePicker}
                  />
                </TableCell>

                <TableCell className="whitespace-nowrap">
                  <div className="flex flex-wrap gap-1">
                    {field.option_values.map((ov) => (
                      <Badge
                        key={ov.option_type_id}
                        variant="secondary"
                        className="text-xs"
                      >
                        {getTypeName(ov.option_type_id)}:{" "}
                        {getValueLabel(ov.option_type_id, ov.option_value_id)}
                      </Badge>
                    ))}
                  </div>
                </TableCell>

                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    disabled={rowDisabled}
                    {...form.register(`variants.${index}.price`, {
                      valueAsNumber: true,
                    })}
                  />
                  {isSubmitted &&
                    form.formState.errors.variants?.[index]?.price && (
                      <p className="mt-1 text-xs text-red-500">
                        {
                          form.formState.errors.variants[index]?.price
                            ?.message as string
                        }
                      </p>
                    )}
                </TableCell>

                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    disabled={rowDisabled}
                    {...form.register(`variants.${index}.offer_price`, {
                      valueAsNumber: true,
                    })}
                  />
                </TableCell>

                <TableCell>
                  <Input
                    disabled={rowDisabled}
                    {...form.register(`variants.${index}.sku`)}
                  />
                </TableCell>

                <TableCell className="text-center">
                  <Switch
                    checked={form.watch(`variants.${index}.is_available`)}
                    disabled={rowDisabled}
                    onCheckedChange={(checked) => {
                      form.setValue(
                        `variants.${index}.is_available`,
                        checked,
                        { shouldDirty: true },
                      );
                    }}
                  />
                </TableCell>

                {!isReadOnly && (
                  <TableCell className="text-center">
                    {isRemoved ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={!canRestore}
                        title={
                          canRestore
                            ? "Restaurar variante"
                            : "Esta variante se quita por un valor deseleccionado. Volvé a tildar el valor para restaurarla."
                        }
                        onClick={() => onToggleRemoved?.(index, false)}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        title="Quitar variante"
                        onClick={() => onToggleRemoved?.(index, true)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
