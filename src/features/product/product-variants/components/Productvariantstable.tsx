"use client";

import { useMemo } from "react";
import { RotateCcw, Trash2 } from "lucide-react";
import type { UseFieldArrayReturn, UseFormReturn } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import FormInput from "@/components/shared/InputForm";
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
import { Separator } from "@/components/ui/separator";

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
  onAttributeStructureChange?: (
    nextSelectedTypeIds: string[],
    nextValuesByType: Record<string, string[]>,
  ) => void;
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
  onAttributeStructureChange,
}: ProductVariantsTableProps) {
  const variantsError =
    form.formState.errors.variants?.root?.message ||
    (typeof form.formState.errors.variants?.message === "string"
      ? form.formState.errors.variants.message
      : null);
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

  const hasVisualAttribute = visualTypeIds.length > 0;

  // Funcion para quitar o restaurar una variante desde la tabla
  const handleToggleRemoved = (index: number, removed: boolean) => {
    if (!onToggleRemoved) return;

    // 1. Ejecutamos el cambio en el formulario (actualiza _removed y manualRemovedSigs)
    onToggleRemoved(index, removed);

    // 2. Leemos las variantes e imponemos manualmente el estado del índice editado
    // (para evitar desfasajes asíncronos en React Hook Form)
    const rawVariants = form.getValues("variants") || [];
    const updatedVariants = rawVariants.map((variant, idx) =>
      idx === index ? { ...variant, _removed: removed } : variant,
    );

    // 3. Filtramos solo las variantes que permanecen ACTIVAS
    const activeVariants = updatedVariants.filter((v) => !v._removed);

    // 4. Recalculamos qué valores por tipo siguen en uso
    const nextValuesByType: Record<string, string[]> = {};

    Object.entries(valuesByType).forEach(([typeId, currentValues]) => {
      // Obtenemos todos los IDs de valor que se usan en variantes activas para este tipo
      const usedValueIds = new Set(
        activeVariants.flatMap((v) =>
          v.option_values
            .filter((ov) => ov.option_type_id === typeId)
            .map((ov) => ov.option_value_id),
        ),
      );

      // Conservamos únicamente los valores que siguen estando en uso
      nextValuesByType[typeId] = currentValues.filter((valueId) =>
        usedValueIds.has(valueId),
      );
    });

    // 5. Verificamos si realmente algún valor se quedó sin variantes activas y fue removido
    const hasValueBeenDropped = Object.keys(valuesByType).some((typeId) => {
      const currentList = valuesByType[typeId] || [];
      const nextList = nextValuesByType[typeId] || [];
      return currentList.length !== nextList.length;
    });

    // 6. Si un valor quedó huérfano, notificamos al padre para destildarlo de los atributos
    if (hasValueBeenDropped && onAttributeStructureChange) {
      onAttributeStructureChange(selectedTypeIds, nextValuesByType);
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* Tabla */}
      <div className="w-full overflow-x-auto rounded-lg border bg-background shadow-sm">
        <div className="min-w-225 p-4 flex flex-col">
          {/* Encabezado de la sección */}
          <div className="space-y-1 pb-4">
            <h3 className="text-base font-semibold tracking-tight">
              Variantes del producto
            </h3>

            <p className="text-sm text-muted-foreground">
              {isReadOnly
                ? "Consulta el precio, código y disponibilidad de cada combinación."
                : "Configurá el precio, código y disponibilidad de cada combinación."}
            </p>
            {/* error de validación */}
            {variantsError && (
              <p className="text-sm font-medium text-red-500 mt-2">
                {variantsError as string}
              </p>
            )}
          </div>
          <Separator />
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {hasVisualAttribute && (
                  <TableHead className="w-20 whitespace-nowrap text-xs font-medium text-muted-foreground">
                    Imagen
                  </TableHead>
                )}

                <TableHead className="min-w-45 whitespace-nowrap text-xs font-medium text-muted-foreground">
                  Combinación
                </TableHead>

                <TableHead className="w-28 whitespace-nowrap text-xs font-medium text-muted-foreground">
                  Precio
                </TableHead>

                <TableHead className="w-28 whitespace-nowrap text-xs font-medium text-muted-foreground">
                  Precio de oferta
                </TableHead>

                <TableHead className="w-32 whitespace-nowrap text-xs font-medium text-muted-foreground">
                  Código SKU
                </TableHead>

                <TableHead className="w-24 whitespace-nowrap text-center text-xs font-medium text-muted-foreground">
                  Disponibilidad
                </TableHead>

                {!isReadOnly && (
                  <TableHead className="w-12 whitespace-nowrap" />
                )}
              </TableRow>
            </TableHeader>

            <TableBody>
              {variantsField.fields.map((field, index) => {
                const isRemoved = form.watch(`variants.${index}._removed`);
                const rowDisabled = isRemoved;
                const canRestore = validSignatures.has(
                  comboSignature(field.option_values),
                );

                return (
                  <TableRow
                    key={field._fieldId}
                    className={cn(
                      "align-middle",
                      isRemoved && "bg-muted/40 opacity-60",
                    )}
                  >
                    {hasVisualAttribute && (
                      <TableCell className="py-3">
                        <VariantImageCell
                          optionValues={field.option_values}
                          visualTypeIds={visualTypeIds}
                          imagesBySignature={imagesApi.state.bySignature}
                          generalGallery={imagesApi.state.general}
                          onOpenImagePicker={onOpenImagePicker}
                          readOnly={isReadOnly || rowDisabled}
                        />
                      </TableCell>
                    )}

                    <TableCell className="py-3">
                      <div className="flex max-w-md flex-wrap gap-1.5">
                        {field.option_values.map((ov) => (
                          <Badge
                            key={ov.option_type_id}
                            variant="secondary"
                            className="whitespace-nowrap px-2 py-0.5 text-xs font-normal"
                          >
                            {getTypeName(ov.option_type_id)}:{" "}
                            {getValueLabel(
                              ov.option_type_id,
                              ov.option_value_id,
                            )}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>

                    {/* Precio — obligatorio, muestra error si se intenta enviar vacío */}
                    <TableCell className="py-3">
                      <FormInput
                        name={`variants.${index}.price`}
                        control={form.control}
                        inputProps={{
                          type: "number",
                          step: "0.01",
                          disabled: rowDisabled,
                          placeholder: "0.00",
                        }}
                        readOnly={isReadOnly}
                      />
                    </TableCell>

                    {/* Precio oferta — completamente opcional, nunca obligatorio */}
                    <TableCell className="py-3">
                      <FormInput
                        name={`variants.${index}.offer_price`}
                        control={form.control}
                        inputProps={{
                          type: "number",
                          step: "0.01",
                          disabled: rowDisabled,
                          placeholder: "0.00",
                        }}
                        readOnly={isReadOnly}
                        emptyOptionLabel="Sin valor"
                      />
                    </TableCell>

                    {/* SKU — opcional */}
                    <TableCell className="py-3">
                      <FormInput
                        name={`variants.${index}.sku`}
                        control={form.control}
                        inputProps={{
                          disabled: rowDisabled,
                          placeholder: "PROD-001",
                        }}
                        readOnly={isReadOnly}
                        emptyOptionLabel="Sin código"
                      />
                    </TableCell>

                    <TableCell className="py-3 text-center">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <Switch
                          checked={form.watch(`variants.${index}.is_available`)}
                          disabled={isReadOnly || rowDisabled}
                          className="cursor-pointer"
                          title={
                            form.watch(`variants.${index}.is_available`)
                              ? "La variante está disponible"
                              : "La variante no está disponible"
                          }
                          onCheckedChange={(checked) => {
                            form.setValue(
                              `variants.${index}.is_available`,
                              checked,
                              {
                                shouldDirty: true,
                              },
                            );
                          }}
                        />

                        <span
                          className={cn(
                            "text-xs font-medium",
                            form.watch(`variants.${index}.is_available`)
                              ? rowDisabled
                                ? "text-muted-foreground"
                                : "text-green-600"
                              : "text-muted-foreground",
                          )}
                        >
                          {form.watch(`variants.${index}.is_available`)
                            ? "Disponible"
                            : "Agotado"}
                        </span>
                      </div>
                    </TableCell>

                    {!isReadOnly && (
                      <TableCell className="py-3 text-center">
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
                            onClick={() => handleToggleRemoved?.(index, false)}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            title="Quitar variante"
                            onClick={() => handleToggleRemoved?.(index, true)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
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
      </div>
    </div>
  );
}
