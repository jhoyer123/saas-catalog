import type {
  VariantCombination,
  VariantValueRef,
} from '@/features/product/product-variants/types/types';

/**
 * Generate cartesian product of selected values by option type.
 * Returns VariantCombination[] excluding any with signature present in existingSignatures.
 * The signature is deterministic: optionTypeId ascending, joined 'optionTypeId:optionValueId' by '|'.
 */
export function generateVariantCombinations(
  selectedValuesByType: Record<string, string[]>,
  existingSignatures: string[] = [],
  limit?: number,
): VariantCombination[] {
  const entries = Object.entries(selectedValuesByType).filter(([, vals]) =>
    Array.isArray(vals) && vals.length > 0,
  );

  if (entries.length === 0) return [];

  // Sort by optionTypeId to ensure deterministic order
  entries.sort(([a], [b]) => a.localeCompare(b));

  // Build cartesian product
  const combos: VariantValueRef[][] = [[]];

  for (const [optionTypeId, valueIds] of entries) {
    const next: VariantValueRef[][] = [];
    for (const acc of combos) {
      for (const valueId of valueIds) {
        next.push(
          acc.concat([{ optionTypeId, optionValueId: valueId } as VariantValueRef]),
        );
      }
    }
    combos.splice(0, combos.length, ...next);
    if (limit && combos.length > limit) {
      combos.splice(limit); // cut to limit early
      break;
    }
  }

  const result: VariantCombination[] = combos.map((values) => {
    const sortedValues = [...values].sort((left, right) =>
      left.optionTypeId.localeCompare(right.optionTypeId),
    );

    const signature = sortedValues
      .map((v) => `${v.optionTypeId}:${v.optionValueId}`)
      .join('|');

    return { values: sortedValues, signature };
  });

  // Exclude existing signatures
  const filtered = result.filter((c) => !existingSignatures.includes(c.signature));

  if (typeof limit === 'number') return filtered.slice(0, limit);
  return filtered;
}
