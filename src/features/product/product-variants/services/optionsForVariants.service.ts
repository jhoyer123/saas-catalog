import { createClient } from "@/lib/supabase/supabaseClient";
import { normalizeColorHexes } from "@/features/options/lib/helpers/formatters";

export interface StoreOptionValue {
  id: string;
  option_type_id: string;
  value: string;
  color_hexes: string[] | null;
  image_url: string | null;
}

export interface StoreOptionType {
  id: string;
  name: string;
  input_type: "text" | "color" | "image" | "number";
  is_visual_default: boolean;
  is_default_on_create: boolean;
  store_option_values: StoreOptionValue[];
}

export const listOptionTypesAndValuesForProductVariant = async (
  storeId: string,
): Promise<StoreOptionType[]> => {
  const supabase = createClient();
  const { data: storeOptionTypes, error } = await supabase
    .from("store_option_types")
    .select(
      "id, name, input_type, is_visual_default, is_default_on_create, store_option_values(id, option_type_id, value, color_hexes, image_url)",
    )
    .eq("store_id", storeId)
    .order("sort_order");

  if (error) throw new Error(error.message);

  return storeOptionTypes.map((optionType) => ({
    id: optionType.id,
    name: optionType.name,
    input_type: optionType.input_type as "text" | "color" | "image" | "number",
    is_visual_default: optionType.is_visual_default,
    is_default_on_create: optionType.is_default_on_create,
    store_option_values: optionType.store_option_values.map(
      (value: StoreOptionValue) => ({
        id: value.id,
        value: value.value,
        image_url: value.image_url,
        color_hexes: Array.isArray(value.color_hexes)
          ? normalizeColorHexes(value.color_hexes as string[])
          : null,
        option_type_id: value.option_type_id,
      }),
    ),
  }));
};
