import { ProductVariant } from "@/types/product.types";

export function findVariant(
  variants: ProductVariant[],
  selected: Record<string, string>,
  optionTypeIds?: string[],
): ProductVariant | undefined {
  const keys = Object.keys(selected);
  if (keys.length === 0 || (optionTypeIds && keys.length !== optionTypeIds.length)) {
    return undefined;
  }
  return variants.find((v) =>
    (optionTypeIds ?? keys).every((key) => v.option_values[key] === selected[key]),
  );
}

export function buildVisualSignature(
  selected: Record<string, string>,
  visualOptionTypeIds: string[],
): string | undefined {
  if (
    visualOptionTypeIds.length === 0 ||
    visualOptionTypeIds.some((id) => !selected[id])
  ) {
    return undefined;
  }

  return [...visualOptionTypeIds]
    .sort()
    .map((id) => selected[id])
    .join("|");
}
