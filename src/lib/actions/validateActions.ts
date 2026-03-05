"use server";

import { createClient } from "@/lib/supabase/supabaseServer";

export const getProductCount = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { data: store } = await supabase
    .from("stores")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!store) throw new Error("Tienda no encontrada");

  const { count } = await supabase
    .from("products")
    .select("id, name", { count: "exact", head: true })
    .eq("store_id", store.id);

  return count ?? 0;
};
