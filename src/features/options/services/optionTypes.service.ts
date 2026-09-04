import { createClient } from "@/lib/supabase/supabaseClient";
import type { OptionTypeRow, InputType } from "../types";
import type { OptionTypeForm } from "../schemas/optionType.schema";

interface RawOptionType {
  id: string;
  name: string;
  input_type: string;
  is_visual_default: boolean;
  is_default_on_create: boolean;
  sort_order: number;
  created_at: string;
  value_count: Array<{ count: number }>;
}

export const listOptionTypes = async (
  storeId: string,
): Promise<OptionTypeRow[]> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("store_option_types")
    .select(
      `
      id,
      name,
      input_type,
      is_visual_default,
      is_default_on_create,
      sort_order,
      created_at,
      value_count:store_option_values(count)
    `,
    )
    .eq("store_id", storeId)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as RawOptionType[]).map((item) => ({
    id: item.id,
    name: item.name,
    input_type: item.input_type as InputType,
    is_visual_default: item.is_visual_default,
    is_default_on_create: item.is_default_on_create,
    sort_order: item.sort_order,
    created_at: item.created_at,
    value_count: item.value_count?.[0]?.count ?? 0,
  }));
};

export const createOptionType = async (
  storeId: string,
  dataInput: OptionTypeForm,
) => {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("No autenticado");
  }

  const { data, error } = await supabase.from("store_option_types").insert({
    store_id: storeId,
    name: dataInput.name,
    input_type: dataInput.input_type,
    is_visual_default: dataInput.is_visual_default,
    is_default_on_create: dataInput.is_default_on_create,
  });

  if (error) throw error;

  return data;
};

export const updateOptionType = async (
  typeId: string,
  dataInput: OptionTypeForm,
  storeId: string,
) => {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("No autenticado"); // <-- Debe lanzar el error, no retornarlo
  }

  const updateData: Record<string, unknown> = {
    name: dataInput.name,
    input_type: dataInput.input_type,
    is_visual_default: dataInput.is_visual_default,
    is_default_on_create: dataInput.is_default_on_create,
  };

  const { data, error } = await supabase
    .from("store_option_types")
    .update(updateData)
    .eq("id", typeId)
    .eq("store_id", storeId);

  if (error) throw error;

  return data;
};

export const reorderOptionTypes = async (orderedIds: string[]) => {
  const supabase = createClient();

  // Llamamos a la función RPC que creamos en la base de datos
  const { error } = await supabase.rpc("reorder_option_types", {
    ordered_ids: orderedIds,
  });

  if (error) throw error;
};

export const deleteOptionType = async (typeId: string, storeId: string) => {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("No autenticado");
  }

  const { error } = await supabase.rpc("delete_option_type", {
    p_type_id: typeId,
    p_store_id: storeId,
  });

  if (error) throw error;
};
