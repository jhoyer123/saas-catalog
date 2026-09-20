import { createClient } from "@/lib/supabase/supabaseClient";
import type { OptionValueRow } from "../types";
import type { OptionValueForm } from "../schemas/optionValue.schema";
import { normalizeColorHexes } from "../lib/helpers/formatters";

const OPTION_VALUE_COLUMNS =
  "id, option_type_id, value, color_hexes, image_url, numeric_value, created_at, updated_at,unit";

export const listOptionValues = async (
  typeId: string,
): Promise<OptionValueRow[]> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("store_option_values")
    .select(OPTION_VALUE_COLUMNS)
    .eq("option_type_id", typeId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((item) => ({
    id: item.id,
    option_type_id: item.option_type_id,
    value: item.value,
    unit: item.unit ? item.unit : null,
    color_hexes: Array.isArray(item.color_hexes)
      ? normalizeColorHexes(item.color_hexes as string[])
      : null,
    image_url: item.image_url,
    numeric_value: item.numeric_value,
    created_at: item.created_at,
    updated_at: item.updated_at,
  }));
};

export const createOptionValue = async (
  typeId: string,
  valueData: OptionValueForm,
): Promise<OptionValueRow> => {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("No autenticado");

  const { data, error } = await supabase
    .from("store_option_values")
    .insert({
      option_type_id: typeId,
      ...valueData,
    })
    .select(OPTION_VALUE_COLUMNS)
    .single();

  if (error || !data) throw error;

  return {
    id: data.id,
    option_type_id: data.option_type_id,
    value: data.value,
    unit: data.unit ? data.unit : null,
    color_hexes: Array.isArray(data.color_hexes)
      ? normalizeColorHexes(data.color_hexes as string[])
      : null,
    image_url: data.image_url,
    numeric_value: data.numeric_value,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
};

export const updateOptionValue = async (
  valueId: string,
  valueData: OptionValueForm,
): Promise<OptionValueRow> => {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("No autenticado");

  const { data, error } = await supabase
    .from("store_option_values")
    .update({
      ...valueData,
    })
    .eq("id", valueId)
    .select(OPTION_VALUE_COLUMNS)
    .single();

  if (error || !data) throw error;

  return {
    id: data.id,
    option_type_id: data.option_type_id,
    value: data.value,
    unit: data.unit ? data.unit : null,
    color_hexes: Array.isArray(data.color_hexes)
      ? normalizeColorHexes(data.color_hexes as string[])
      : null,
    image_url: data.image_url,
    numeric_value: data.numeric_value,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
};

export const deleteOptionValue = async (valueId: string) => {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("No autenticado");

  const { error } = await supabase.rpc("delete_option_value", {
    p_value_id: valueId,
  });

  if (error) throw error;
};
