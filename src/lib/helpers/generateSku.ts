import type { VariantCombination } from '@/features/product/product-variants/types/types';

// Helper: sanitize and take initials (up to n chars) for a value string
function shortToken(value: string, n = 3) {
  const s = value
    .toString()
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, n)
    .toUpperCase();
  return s || 'X';
}

/**
 * Generate a SKU suggestion: productSlug + '-' + initials of each value in deterministic order.
 * The combination.values should be sorted by optionTypeId for determinism.
 */
export function generateSku(
  productSlug: string,
  combination: VariantCombination,
  valuesById: Record<string, { value: string } | undefined>,
): string {
  const sorted = [...combination.values].sort((a, b) =>
    a.optionTypeId.localeCompare(b.optionTypeId),
  );

  const parts = sorted.map((v) => {
    const meta = valuesById[v.optionValueId];
    const val = meta?.value ?? v.optionValueId;
    return shortToken(val, 3);
  });

  // Make slug safe: keep alphanumerics and hyphens
  const safeSlug = productSlug.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
  return `${safeSlug}-${parts.join('-')}`;
}
