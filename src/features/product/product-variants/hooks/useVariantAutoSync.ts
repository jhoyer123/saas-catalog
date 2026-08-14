// useVariantAutoSync.ts

import { useEffect, useRef, useState } from "react";
import type { UseFieldArrayReturn, UseFormReturn } from "react-hook-form";
import type {
  ProductFormInput,
  ProductFormOutput,
} from "@/lib/schemas/productSchema";
import {
  comboSignature,
  generateCombinations,
  visualSignature,
} from "@/features/product/product-variants/lib/generateCombinations";
import { useVariantImages } from "./useVariantImages";

type VariantValue = NonNullable<ProductFormInput["variants"]>[number];

interface Params {
  form: UseFormReturn<ProductFormInput, unknown, ProductFormOutput>;
  variantsField: UseFieldArrayReturn<ProductFormInput, "variants", "_fieldId">;
  selectedTypeIds: string[];
  visualTypeIds: string[]; // option_type_id de los marcados is_visual
  imagesApi: ReturnType<typeof useVariantImages>;
  valuesByType: Record<string, string[]>;
}

/**
 * Mantiene las variantes del form en coherencia con la selección de valores:
 * - Un valor que se destilda marca como `_removed` (apagadas) TODAS las
 *   variantes que lo usaban, sin destruir sus datos.
 * - Volver a tildarlo las restaura (borra `_removed`), salvo que el usuario
 *   las haya quitado a mano antes (el borrado manual gana).
 * - Se generan las combinaciones faltantes y se podan las galerías huérfanas.
 */
export function useVariantAutoSync({
  form,
  variantsField,
  selectedTypeIds,
  valuesByType,
  visualTypeIds,
  imagesApi,
}: Params) {
  // firmas que el usuario marcó como removidas A MANO desde la tabla
  const [manualRemovedSigs, setManualRemovedSigs] = useState<Set<string>>(
    new Set(),
  );
  const manualRemovedRef = useRef(manualRemovedSigs);
  manualRemovedRef.current = manualRemovedSigs;

  const depsKey = JSON.stringify({
    selectedTypeIds,
    valuesByType,
    visualTypeIds,
  });

  useEffect(() => {
    const combos = generateCombinations(selectedTypeIds, valuesByType);
    const validSignatures = new Set(combos.map(comboSignature));

    const currentVariants = form.getValues("variants") ?? [];

    // 1) combinaciones que faltan en el form -> se agregan
    const currentBySig = new Map(
      currentVariants.map((v) => [comboSignature(v.option_values), v]),
    );
    combos.forEach((combo) => {
      const sig = comboSignature(combo);
      if (currentBySig.has(sig)) return;

      variantsField.append({
        _localId: crypto.randomUUID(),
        price: 0,
        sku: "",
        offer_price: null,
        is_available: true,
        _removed: false,
        option_values: combo,
      });
    });

    // 2) variantes cuya combinación dejó de ser válida -> apagadas (_removed)
    //    y variantes apagadas cuya combinación volvió a ser válida -> restauradas
    //    (salvo borrado manual, que manda).
    currentVariants.forEach((v, idx) => {
      const sig = comboSignature(v.option_values);
      const isRemoved = v._removed === true;

      if (!validSignatures.has(sig) && !isRemoved) {
        variantsField.update(idx, { ...v, _removed: true });
      } else if (
        validSignatures.has(sig) &&
        isRemoved &&
        !manualRemovedRef.current.has(sig)
      ) {
        variantsField.update(idx, { ...v, _removed: false });
      }
    });

    // 3) prune de galerías cuya firma visual ya no está entre los combos válidos
    const activeSigs = new Set(
      combos
        .map((c) => visualSignature(c, visualTypeIds))
        .filter((s): s is string => s !== null),
    );
    imagesApi.pruneOrphaned(activeSigs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depsKey]);

  /**
   * Toggle manual de borrado desde la tabla. Registra la firma en el set de
   * removidos manuales para que el auto-sync no la restaure sola.
   */
  function toggleRemoved(index: number, removed: boolean) {
    const variant = form.getValues(`variants.${index}`) as
      | VariantValue
      | undefined;
    if (!variant) return;

    const sig = comboSignature(variant.option_values);
    setManualRemovedSigs((prev) => {
      const next = new Set(prev);
      if (removed) next.add(sig);
      else next.delete(sig);
      return next;
    });
    form.setValue(`variants.${index}._removed`, removed, {
      shouldDirty: true,
    });
  }

  return {
    toggleRemoved,
    manualRemovedSigs,
  };
}
