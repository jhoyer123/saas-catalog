import {
  ProductDetailCatalog,
  ProductOptionType,
  ProductOptionValue,
  ProductVariant,
} from "@/types/product.types";

export type RawProductRow = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  has_variants: boolean;
  is_offer: boolean;
  offer_price: number | null;
  offer_start: string | null;
  offer_end: string | null;
  is_available: boolean;
  slug: string;
  brand_id: string | null;
  category_id: string;
  images: {
    image_url: string;
    display_order: number;
    visual_signature: string | null;
  }[];
  option_types: {
    is_visual: boolean;
    option_type: { id: string; name: string; input_type: string };
  }[];
  variants: {
    id: string;
    sku: string | null;
    price: number;
    offer_price: number | null;
    stock: number;
    is_available: boolean;
    option_signature: string;
    values: {
      option_type_id: string;
      option_value: {
        id: string;
        value: string;
        image_url: string | null;
        color_hexes: string[] | null;
        unit: string | null;
      };
    }[];
  }[];
};

export function mapToProductDetailCatalog(
  raw: RawProductRow,
): ProductDetailCatalog {
  const generalImages: string[] = [];
  const imagesBySignature = new Map<string, string[]>();

  for (const img of [...raw.images].sort(
    (a, b) => a.display_order - b.display_order,
  )) {
    if (img.visual_signature) {
      const arr = imagesBySignature.get(img.visual_signature) ?? [];
      arr.push(img.image_url);
      imagesBySignature.set(img.visual_signature, arr);
    } else {
      generalImages.push(img.image_url);
    }
  }

  // 1. Variantes -> formato liviano para UI (lookup O(1) por option_type_id)
  const variants: ProductVariant[] = raw.variants.map((v) => ({
    id: v.id,
    sku: v.sku,
    price: v.price,
    offer_price: v.offer_price,
    stock: v.stock,
    is_available: v.is_available,
    option_signature: v.option_signature,
    option_values: Object.fromEntries(
      v.values.map((val) => [val.option_type_id, val.option_value.id]),
    ),
  }));

  // 2. Deduplicar valores por option_type (para pintar selectores: swatches, botones talla, etc)
  const valuesByType = new Map<string, Map<string, ProductOptionValue>>();
  for (const v of raw.variants) {
    for (const val of v.values) {
      if (!valuesByType.has(val.option_type_id))
        valuesByType.set(val.option_type_id, new Map());
      valuesByType.get(val.option_type_id)!.set(val.option_value.id, {
        id: val.option_value.id,
        value: val.option_value.value,
        image_url: val.option_value.image_url,
        color_hexes: val.option_value.color_hexes,
        unit: val.option_value.unit,
        images: undefined,
      });
    }
  }

  const option_types: ProductOptionType[] = raw.option_types.map((ot) => ({
    id: ot.option_type.id,
    name: ot.option_type.name,
    input_type: ot.option_type.input_type as ProductOptionType["input_type"],
    is_visual: ot.is_visual,
    values: Array.from(valuesByType.get(ot.option_type.id)?.values() ?? []),
  }));

  return {
    id: raw.id,
    name: raw.name,
    description: raw.description ?? "",
    price: raw.price,
    has_variants: raw.has_variants,
    is_offer: raw.is_offer,
    offer_price: raw.offer_price,
    offer_start: raw.offer_start,
    offer_end: raw.offer_end,
    is_available: raw.is_available,
    slug: raw.slug,
    images: generalImages.length
      ? generalImages
      : (Array.from(imagesBySignature.values())[0] ?? []),
    brand_id: raw.brand_id ?? null,
    category_id: raw.category_id,
    option_types,
    variants,
    visual_images_by_signature: Object.fromEntries(imagesBySignature),
  };
}
