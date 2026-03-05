// src/lib/actions/authActions.ts
"use server";

import { createClient } from "@/lib/supabase/supabaseServer";

export const getSessionData = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // trae profile y store en paralelo
  const [{ data: profile }, { data: store }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("stores")
      .select("*, plans(*)")
      .eq("user_id", user.id)
      .single(),
  ]);

  return {
    profile,
    store, // null si no tiene tienda
    plan: store?.plans,
    hasStore: !!store,
  };
};
