// src/lib/actions/authActions.ts
"use server";

import { createClient } from "@/lib/supabase/supabaseServer";

export const getSessionData = async () => {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const userId = session.user.id;

  // trae profile y store en paralelo
  const [{ data: profile }, { data: store }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase
      .from("stores")
      .select("*, plans(*)")
      .eq("user_id", userId)
      .single(),
  ]);

  return {
    profile,
    store, // null si no tiene tienda
    plan: store?.plans,
    hasStore: !!store,
  };
};
