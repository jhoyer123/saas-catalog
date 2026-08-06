import { createClient } from "@/lib/supabase/supabaseClient";
import type { OptionTypeRow, InputType } from "../types";
import type { OptionTypeForm } from "../schemas/optionType.schema";

interface RawOptionType {
  id: string;
  name: string;
  input_type: string;
  is_visual_default: boolean;
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
  if (!session) return { error: "No autenticado" };

  const { data, error } = await supabase.from("store_option_types").insert({
    store_id: storeId,
    name: dataInput.name,
    input_type: dataInput.input_type,
    is_visual_default: dataInput.is_visual_default,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Ya existe un atributo con ese nombre en tu tienda" };
    }
    return { error: "Error al crear el atributo" };
  }

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
  if (!session) return { error: "No autenticado" };

  const updateData: Record<string, unknown> = {
    name: dataInput.name,
    input_type: dataInput.input_type,
    is_visual_default: dataInput.is_visual_default,
  };

  const { data, error } = await supabase
    .from("store_option_types")
    .update(updateData)
    .eq("id", typeId)
    .eq("store_id", storeId);

  if (error) {
    if (error.code === "23505") {
      return { error: "Ya existe un atributo con ese nombre en tu tienda" };
    }
    return { error: "Error al actualizar el atributo" };
  }

  return data;
};

export const reorderOptionTypes = async (orderedIds: string[]) => {
  const supabase = createClient();

  // Llamamos a la función RPC que creamos en la base de datos
  const { error } = await supabase.rpc("reorder_option_types", {
    ordered_ids: orderedIds,
  });

  if (error) {
    console.error("Error original de Supabase:", error);
    return { error: "Error al reordenar los atributos" };
  }

  console.log("Atributos reordenados correctamente");
  return { success: true };
};

export const deleteOptionType = async (typeId: string, storeId: string) => {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { error: "No autenticado" };

  const { error } = await supabase.rpc("delete_option_type", {
    p_type_id: typeId,
    p_store_id: storeId,
  });

  if (error) {
    if (error.code === "P0001") {
      return { error: error.message };
    }
    return { error: "Error al eliminar el atributo" };
  }
};
